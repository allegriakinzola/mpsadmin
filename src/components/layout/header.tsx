"use client";

import { useSession } from "@/lib/auth-client";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="hidden md:flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Bienvenue, {session?.user?.name || "Admin"}
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">{session?.user?.email}</span>
      </div>
    </header>
  );
}
