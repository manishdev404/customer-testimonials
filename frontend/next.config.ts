import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Testimonial images are uploaded as compressed data URLs, so Server Action
    // and Route Handler payloads can exceed the conservative default.
    serverActions: { bodySizeLimit: '12mb' },
  },
};

export default nextConfig;
