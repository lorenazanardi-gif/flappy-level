import React from 'react';

export const metadata = {
  title: 'Flappy Level',
  description: 'Flappy Bird com login e progressão de nível',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
