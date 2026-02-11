"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

export function useUserRole() {
  const { data: session } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!session?.user?.id) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/role");
        if (response.ok) {
          const data = await response.json();
          setRole(data.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRole();
  }, [session?.user?.id]);

  return { role, isLoading, isAdmin: role === "admin" };
}
