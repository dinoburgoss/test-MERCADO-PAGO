export const metadata = {
  title: 'Demo API',
  description: 'API route test',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
