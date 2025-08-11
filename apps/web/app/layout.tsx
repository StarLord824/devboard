import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frontend",
  description: "Generated on Turborepo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body >
        {children}
      </body>
    </html>
  );
}
