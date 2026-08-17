import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DocuFlip — Baca PDF Seperti Buku Nyata',
    short_name: 'DocuFlip',
    description: 'Aplikasi web interaktif untuk membaca PDF dengan efek flipbook realistis',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#6366F1',
    icons: [
      {
        src: '/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
