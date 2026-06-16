import type { Metadata, Viewport } from 'next';
import './globals.css';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'VidSaaS';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${appName} - Multi Platform Video Downloader API`,
    template: `%s | ${appName}`
  },
  description: 'A clean SaaS platform and REST API for compliant video/audio metadata and downloads powered by yt-dlp and FFmpeg.',
  keywords: ['video downloader API', 'yt-dlp SaaS', 'FFmpeg', 'YouTube downloader API', 'Instagram video downloader'],
  openGraph: {
    title: `${appName} - Video Downloader SaaS`,
    description: 'Fast video/audio download API with API keys, rate limiting and usage analytics.',
    url: appUrl,
    siteName: appName,
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
