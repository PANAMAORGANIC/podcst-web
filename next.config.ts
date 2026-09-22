import type { NextConfig } from 'next';

const catalogTrace = [
  './data/catalog.json.gz',
  './data/sources/**/*',
  './data/for-you/**/*',
];

const config: NextConfig = {
  output: 'standalone',
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  outputFileTracingIncludes: {
    '*': catalogTrace,
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default config;
