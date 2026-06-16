import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';

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
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('yt-dlp timed out. Please try a smaller video or later.'));
    }, timeout);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || `yt-dlp exited with code ${code}`));
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
      : 'best[ext=mp4][vcodec!=none][acodec!=none]/best[ext=mp4]/best');

  const args = [
    '--no-playlist',
    '--no-warnings',
    '--ignore-config',
    '--restrict-filenames',
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

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    if (process.env.NODE_ENV !== 'production') console.warn(`[yt-dlp] ${chunk}`);
  });

  return {
    stream: child.stdout as Readable,
    process: child,
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
