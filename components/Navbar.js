"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight hover:opacity-75 transition">
          audrey
        </Link>
        <div>
          {!session ? (
            <Button asChild variant="default">
              <Link href="/auth/signUp">Register</Link>
            </Button>
          ) : (
            <div className="flex flex-col gap-0.5">
              <Link href="/dashboard">  <h1 className="font-semibold tracking-tight">Dashboard</h1></Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}