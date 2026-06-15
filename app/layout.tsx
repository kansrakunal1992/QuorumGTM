import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quorum — Judgment Operating System",
  description: "For founders, executives, and operators navigating high-stakes decisions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
