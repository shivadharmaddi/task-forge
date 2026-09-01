"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";
import { useAuth } from "@/components/providers";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@taskforge.dev");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const router = useRouter();
  const { refresh } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      refresh();
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Use the demo account below.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-[#0078d4] lg:flex lg:flex-col lg:justify-center lg:px-16">
        <Logo size="lg" showText />
        <h1 className="mt-8 text-3xl font-semibold text-white">
          Distributed job processing
        </h1>
        <p className="mt-4 max-w-md text-base text-white/90">
          Monitor queues, workers, and job lifecycles from a single operational dashboard.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="mb-8 lg:hidden">
          <Logo size="lg" />
        </div>

        <div className="w-full max-w-[400px]">
          <h2 className="text-2xl font-semibold text-foreground">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Access the TaskForge demo workspace
          </p>

          <div className="mt-6 border border-border bg-[#f0f6fc] p-4 dark:bg-[#004578]/20">
            <p className="text-sm font-semibold text-[#0078d4] dark:text-[#4da6ff]">
              Demo workspace
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              No account required.
            </p>
            <div className="mt-2 font-mono text-xs text-foreground">
              <p>demo@taskforge.dev</p>
              <p>demo123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 rounded-sm"
              />
            </div>
            {error && <p className="text-sm text-[#d13438]">{error}</p>}
            <Button
              type="submit"
              className="h-9 w-full rounded-sm bg-[#0078d4] font-semibold hover:bg-[#106ebe] dark:bg-[#4da6ff] dark:text-[#1b1a19]"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="text-[#0078d4] hover:underline dark:text-[#4da6ff]">
              Back to homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
