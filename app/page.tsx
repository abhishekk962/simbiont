import Image from "next/image";
import { MuseoModerno } from "next/font/google";
import "./globals.css";
  
const museoModerno = MuseoModerno({
  variable: "--font-museo-moderno",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24`}
    >
      <h1 className={`text-4xl font-bold ${museoModerno.className} font-medium`}>simbiont</h1>
      <p className="mt-4 text-lg">A creative intelligence canvas.</p>
    </main>
  );
}
