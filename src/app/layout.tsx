import "./globals.css";

export const metadata = {
  title: "Nigeria Dating",
  description: "Dating site focused on Nigeria"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
