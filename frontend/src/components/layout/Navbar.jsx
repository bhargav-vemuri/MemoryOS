"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Search", href: "/search" },
    { name: "Timeline", href: "/timeline" },
    { name: "Graph", href: "/graph" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 glass-panel">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-bold tracking-tight text-white">
            MemoryOS
          </span>
        </Link>
        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive ? "text-white font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/upload"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors ml-4"
          >
            Upload
          </Link>
        </div>
      </div>
    </nav>
  );
}
