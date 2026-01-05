import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Evolving Lab OS',
    short_name: 'EvolvingLab',
    description: 'Neural Productivity System',
    start_url: '/',
    display: 'standalone', // This removes the browser bar
    background_color: '#020617', // Matches your slate-950 background
    theme_color: '#020617',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}