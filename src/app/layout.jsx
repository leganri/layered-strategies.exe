export const metadata = {
  title: "Brand Discovery — Layered",
  description: "Proprietary brand strategy instrument by Layered Studio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
