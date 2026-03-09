import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "final-year | VLSI Question Bank",
  description: "VLSI Question Bank for final year students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body>
        <div className="bg-blob-1" />
        <div className="bg-blob-2" />
        {children}
      </body>
    </html>
  );
}
