"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

const navLinks = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#architecture", label: "Architecture" },
  { href: "#demo", label: "Demo" },
];

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="ms-container flex h-[48px] items-center justify-between">
        <Link href="/" className="shrink-0">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-0 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-[13px] text-[#424242] transition-colors hover:text-[#0078d4] dark:text-[#d2d0ce] dark:hover:text-[#4da6ff]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-sm px-3 text-[13px] font-normal text-[#424242] dark:text-[#d2d0ce]"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="sm"
              className="h-8 rounded-sm bg-[#0078d4] px-4 text-[13px] font-semibold hover:bg-[#106ebe] dark:bg-[#4da6ff] dark:text-[#1b1a19] dark:hover:bg-[#3d96ef]"
            >
              Open dashboard
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
