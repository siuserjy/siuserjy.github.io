// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://siuserxiaowei.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  security: {
    checkOrigin: false
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
