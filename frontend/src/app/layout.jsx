import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MemoryOS | Digital Memory Reconstruction",
  description: "An AI-powered semantic operating system for reconstructing human digital memory and contextual intelligence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
