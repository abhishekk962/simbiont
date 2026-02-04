import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css";

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "simbiont",
  description: "A creative intelligence canvas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${leagueSpartan.className} antialiased bg-(--background-color)`}
      >
        <Auth0Provider>
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}