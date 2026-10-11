
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

const isDev = process.env.NODE_ENV === 'development';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  trailingSlash: 'never',
  // En desarrollo local (npm run dev) no usamos el adaptador de Netlify para evitar el error de Deno.
  // En producción (Netlify), se cargará automáticamente.
  adapter: isDev ? undefined : netlify(),
  vite: {
    plugins: [tailwindcss()]
  }
});