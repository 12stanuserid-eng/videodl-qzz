import { safeFilename, type VideoInfo } from './ytdlp';

type TeraboxListItem = {
  isdir?: string | number;
  server_filename?: string;
  size?: string | number;
  dlink?: string;
  path?: string;
  thumbs?: { url1?: string; url2?: string; url3?: string; icon?: string };
};

type TeraboxFile = {
  fileName: string;
  downloadUrl: string;
  sizeBytes: number;
  thumbnail?: string;
  sourceUrl: string;
};

const teraboxHostParts = [
  'terabox',
  '1024tera',
  'terasharelink',
  'teraboxapp',
  'teraboxlink',
  '4funbox',
  'mirrobox',
  'nephobox',
  'freeterabox'
];

function teraboxCookie() {
  const value = process.env.TERABOX_COOKIE?.trim();
  if (!value) return '';
  return value.startsWith('ndus=') || value.includes(';') ? value : `ndus=${value}`;
}

function headers(referer?: string) {
  const cookie = teraboxCookie();
  return {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    ...(referer ? { Referer: referer } : {}),
    ...(cookie ? { Cookie: cookie } : {})
  };
}

function findBetween(str: string, start: string, end: string) {
  const startIndex = str.indexOf(start);
  if (startIndex < 0) return '';
  const contentStart = startIndex + start.length;
  const endIndex = str.indexOf(end, contentStart);
  if (endIndex < 0) return '';
  return str.slice(contentStart, endIndex);
}

export function isTeraboxUrl(input: string) {
  try {
    const host = new URL(input).hostname.toLowerCase();
    return teraboxHostParts.some((part) => host.includes(part));
  } catch {
    return false;
  }
}

function extractSurl(input: string) {
  const parsed = new URL(input);
  const fromQuery = parsed.searchParams.get('surl');
  if (fromQuery) return fromQuery;

  const match = parsed.pathname.match(/\/s\/([^/?#]+)/i);
  if (!match) return '';
  const raw = decodeURIComponent(match[1]);
  return raw.startsWith('1') ? raw.slice(1) : raw;
}

function cleanTeraboxError(extra?: string) {
  const suffix = extra ? ` Details: ${extra}` : '';
  return `TeraBox download failed. Please use a valid public TeraBox share link. Some TeraBox links require verification/login cookies and cannot be downloaded anonymously.${suffix}`;
}

async function resolveFinalUrl(input: string) {
  const parsed = new URL(input);
  let surl = extractSurl(input);

  try {
    const response = await fetch(input, { headers: headers(), redirect: 'follow', signal: AbortSignal.timeout(20_000) });
    if (response.url) {
      const finalSurl = extractSurl(response.url);
      if (finalSurl) surl = finalSurl;
      return { finalUrl: response.url, surl };
    }
  } catch {
    // Fall back to canonical URL below.
  }

  if (!surl) throw new Error(cleanTeraboxError('No share id found in URL.'));
  const origin = parsed.hostname.includes('terabox.com') ? 'https://www.terabox.com' : 'https://www.1024tera.com';
  return { finalUrl: `${origin}/sharing/link?surl=${encodeURIComponent(surl)}`, surl };
}

async function fetchListForOrigin(origin: string, finalUrl: string, surl: string, dir?: string) {
  const pageResponse = await fetch(finalUrl, { headers: headers(finalUrl), signal: AbortSignal.timeout(20_000) });
  const text = await pageResponse.text();
  const jsToken = findBetween(text, 'fn%28%22', '%22%29');
  const logid = findBetween(text, 'dp-logid=', '&');

  const params = new URLSearchParams({
    app_id: '250528',
    web: '1',
    channel: 'dubox',
    clienttype: '0',
    jsToken,
    page: '1',
    num: '100',
    by: 'name',
    order: 'asc',
    site_referer: finalUrl,
    shorturl: surl
  });
  if (logid) params.set('dp-logid', logid);
  if (dir) params.set('dir', dir);
  else params.set('root', '1');

  const apiResponse = await fetch(`${origin}/share/list?${params.toString()}`, {
    headers: headers(finalUrl),
    signal: AbortSignal.timeout(20_000)
  });
  const data = await apiResponse.json();
  return data as { errno?: number; code?: number; errmsg?: string; list?: TeraboxListItem[] };
}

function firstDownloadable(list: TeraboxListItem[] | undefined) {
  return list?.find((item) => String(item.isdir || '0') !== '1' && item.dlink) || null;
}

export async function getTeraboxFile(input: string): Promise<TeraboxFile> {
  const { finalUrl, surl } = await resolveFinalUrl(input);
  if (!surl) throw new Error(cleanTeraboxError('No share id found in URL.'));

  const finalOrigin = new URL(finalUrl).origin;
  const origins = Array.from(new Set([finalOrigin, 'https://www.1024tera.com', 'https://www.terabox.com', 'https://www.1024terabox.com']));
  let lastError = '';

  for (const origin of origins) {
    try {
      const rootData = await fetchListForOrigin(origin, finalUrl, surl);
      if (rootData.errno && rootData.errno !== 0) {
        lastError = rootData.errmsg || `errno ${rootData.errno}`;
        continue;
      }
      if (rootData.code) {
        lastError = rootData.errmsg || `code ${rootData.code}`;
        continue;
      }

      let file = firstDownloadable(rootData.list);
      const folder = rootData.list?.find((item) => String(item.isdir || '0') === '1' && item.path);
      if (!file && folder?.path) {
        const folderData = await fetchListForOrigin(origin, finalUrl, surl, folder.path);
        file = firstDownloadable(folderData.list);
        if (!file && (folderData.errno || folderData.code)) lastError = folderData.errmsg || `errno ${folderData.errno || folderData.code}`;
      }

      if (file?.dlink) {
        return {
          fileName: file.server_filename || 'terabox-download.mp4',
          downloadUrl: file.dlink,
          sizeBytes: Number(file.size || 0),
          thumbnail: file.thumbs?.url3 || file.thumbs?.url2 || file.thumbs?.url1 || file.thumbs?.icon,
          sourceUrl: finalUrl
        };
      }

      lastError = 'No downloadable file found. If this is a folder, choose a direct file share link.';
    } catch (error) {
      lastError = (error as Error).message;
    }
  }

  throw new Error(cleanTeraboxError(lastError));
}

export async function getTeraboxInfo(input: string): Promise<VideoInfo> {
  const file = await getTeraboxFile(input);
  return {
    id: file.sourceUrl,
    title: file.fileName,
    thumbnail: file.thumbnail,
    webpageUrl: file.sourceUrl,
    extractor: 'terabox-custom',
    formats: [
      {
        formatId: 'terabox-direct',
        ext: file.fileName.split('.').pop() || 'mp4',
        filesize: file.sizeBytes,
        note: 'Direct TeraBox file'
      }
    ]
  };
}

export async function createTeraboxResponse(input: string, type: 'video' | 'audio') {
  const file = await getTeraboxFile(input);
  const upstream = await fetch(file.downloadUrl, {
    headers: headers(file.sourceUrl),
    signal: AbortSignal.timeout(45_000)
  });

  if (!upstream.ok || !upstream.body) {
    throw new Error(cleanTeraboxError(`Direct file request failed with HTTP ${upstream.status}.`));
  }

  const extension = file.fileName.split('.').pop() || (type === 'audio' ? 'm4a' : 'mp4');
  const contentType = upstream.headers.get('content-type') || (type === 'audio' ? 'audio/mp4' : 'video/mp4');
  return new Response(upstream.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${safeFilename(file.fileName.replace(/\.[^.]+$/, ''), extension)}"`,
      'Cache-Control': 'no-store'
    }
  });
}
