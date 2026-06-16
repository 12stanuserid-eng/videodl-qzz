import net from 'node:net';

const blockedHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    a === 127 ||
    a === 0
  );
}

function isPrivateIpv6(hostname: string): boolean {
  const value = hostname.toLowerCase();
  return value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe80:');
}

export function normalizeAndValidateUrl(input: string): string {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    throw new Error('Invalid URL. Please provide a full http(s) video URL.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http(s) URLs are supported.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (blockedHosts.has(hostname)) {
    throw new Error('Local/private URLs are not allowed.');
  }

  const ipVersion = net.isIP(hostname);
  if (ipVersion === 4 && isPrivateIpv4(hostname)) {
    throw new Error('Private IPv4 URLs are not allowed.');
  }
  if (ipVersion === 6 && isPrivateIpv6(hostname)) {
    throw new Error('Private IPv6 URLs are not allowed.');
  }

  parsed.hash = '';
  return parsed.toString();
}
