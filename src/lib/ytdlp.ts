import { spawn } from 'node:child_process';
import { PassThrough, Readable } from 'node:stream';

const curatedSites = [
  'YouTube',
  'Facebook',
  'Instagram',
  'TikTok',
  'Twitter/X',
  'Vimeo',
  'Dailymotion',
  'Twitch',
  'SoundCloud',
  'Reddit',
  'LinkedIn Learning',
  'Bandcamp'
];

function ytdlpBin() {
  return process.env.YTDLP_BIN || 'yt-dlp';
}

function timeoutMs() {
  return Number(process.env.YTDLP_TIMEOUT_MS || 60_000);
}

function cleanYtdlpError(stderr: string, fallback = 'Download failed. Please try another public video URL.'): string {
  const compact = stderr
    .split('\n')
    .map((line) => line.replace(/^ERROR:\s*/i, '').trim())
    .filter(Boolean)
    .slice(-3)
    .join(' ')
    .replace(/\s+/g, ' ')
    .slice(0, 500);

  if (!compact) return fallback;

  if (/private|unavailable|copyright|sign in|login|not available|blocked|403|forbidden|members-only|age/i.test(compact)) {
    return `Download failed: this video is restricted, private, unavailable, or blocked by the source platform. Details: ${compact}`;
  }

  if (/file is larger than max-filesize|max-filesize|larger than/i.test(compact)) {
    return `Download failed: video file is too large for this server limit. Details: ${compact}`;
  }

  return `Download failed: ${compact}`;
}

export type VideoInfo = {
  id?: string;
  title?: string;
  duration?: number;
  durationString?: string;
  thumbnail?: string;
  uploader?: string;
  webpageUrl?: string;
  extractor?: string;
  formats: Array<{
    formatId?: string;
    ext?: string;
    resolution?: string;
    height?: number;
    fps?: number;
    filesize?: number;
    note?: string;
  }>;
};

function runYtdlp(args: string[], timeout = timeoutMs()): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(ytdlpBin(), args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      finish(() => reject(new Error('yt-dlp timed out. Please try a smaller public video or try again later.')));
    }, timeout);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', (error) => finish(() => reject(error)));
    child.on('close', (code) => {
      finish(() => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(cleanYtdlpError(stderr, `yt-dlp exited with code ${code}`)));
      });
    });
  });
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const { stdout } = await runYtdlp([
    '--dump-json',
    '--no-playlist',
    '--no-warnings',
    '--ignore-config',
    '--socket-timeout',
    '20',
    url
  ]);

  const data = JSON.parse(stdout);
  const formats = Array.isArray(data.formats)
    ? data.formats
        .filter((format: Record<string, unknown>) => format.format_id)
        .slice(-30)
        .map((format: Record<string, unknown>) => ({
          formatId: String(format.format_id || ''),
          ext: typeof format.ext === 'string' ? format.ext : undefined,
          resolution: typeof format.resolution === 'string' ? format.resolution : undefined,
          height: typeof format.height === 'number' ? format.height : undefined,
          fps: typeof format.fps === 'number' ? format.fps : undefined,
          filesize: typeof format.filesize === 'number' ? format.filesize : undefined,
          note: typeof format.format_note === 'string' ? format.format_note : undefined
        }))
    : [];

  return {
    id: data.id,
    title: data.title,
    duration: data.duration,
    durationString: data.duration_string,
    thumbnail: data.thumbnail,
    uploader: data.uploader,
    webpageUrl: data.webpage_url,
    extractor: data.extractor,
    formats
  };
}

export function streamDownload(url: string, type: 'video' | 'audio', format?: string) {
  const maxFileSize = process.env.YTDLP_MAX_FILESIZE || '2G';
  const selectedFormat =
    format ||
    (type === 'audio'
      ? 'bestaudio[ext=m4a]/bestaudio/best'
      : 'best[ext=mp4][vcodec!=none][acodec!=none]/best[ext=mp4]/best[vcodec!=none][acodec!=none]/best');

  const args = [
    '--no-playlist',
    '--no-warnings',
    '--ignore-config',
    '--restrict-filenames',
    '--socket-timeout',
    '20',
    '--max-filesize',
    maxFileSize,
    '-f',
    selectedFormat,
    '-o',
    '-',
    url
  ];

  const child = spawn(ytdlpBin(), args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  const output = new PassThrough();
  let stderr = '';
  let gotData = false;
  let settled = false;

  const ready = new Promise<void>((resolve, reject) => {
    const startupTimeout = setTimeout(() => {
      child.kill('SIGTERM');
      if (!settled) {
        settled = true;
        output.destroy(new Error('Download startup timed out. Please try again later.'));
        reject(new Error('Download startup timed out. Please try again later.'));
      }
    }, Math.min(timeoutMs(), 45_000));

    const resolveReady = () => {
      if (settled) return;
      settled = true;
      clearTimeout(startupTimeout);
      resolve();
    };

    const rejectReady = (error: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(startupTimeout);
      output.destroy(error);
      reject(error);
    };

    child.stdout.on('data', (chunk: Buffer) => {
      gotData = true;
      output.write(chunk);
      resolveReady();
    });

    child.stdout.on('end', () => {
      output.end();
    });

    child.stdout.on('error', (error) => {
      output.destroy(error);
      rejectReady(error);
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
      if (process.env.NODE_ENV !== 'production') console.warn(`[yt-dlp] ${chunk}`);
    });

    child.on('error', (error) => rejectReady(error));

    child.on('close', (code) => {
      if (!gotData) {
        rejectReady(new Error(cleanYtdlpError(stderr, code === 0 ? 'No downloadable data was returned.' : `yt-dlp exited with code ${code}`)));
        return;
      }

      if (code && code !== 0) {
        output.destroy(new Error(cleanYtdlpError(stderr)));
        return;
      }

      output.end();
    });
  });

  return {
    stream: output as Readable,
    process: child,
    ready,
    contentType: type === 'audio' ? 'audio/mp4' : 'video/mp4',
    extension: type === 'audio' ? 'm4a' : 'mp4'
  };
}

let cachedSites: string[] | null = null;
let cachedAt = 0;

export async function listSupportedSites(): Promise<string[]> {
  const now = Date.now();
  if (cachedSites && now - cachedAt < 1000 * 60 * 60 * 24) return cachedSites;

  try {
    const { stdout } = await runYtdlp(['--list-extractors'], 20_000);
    cachedSites = stdout
      .split('\n')
      .map((site) => site.trim())
      .filter(Boolean)
      .slice(0, 1500);
    cachedAt = now;
    return cachedSites;
  } catch {
    return curatedSites;
  }
}

export function safeFilename(title: string | undefined, extension: string) {
  const base = (title || 'download')
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
    .toLowerCase();
  return `${base || 'download'}.${extension}`;
}
