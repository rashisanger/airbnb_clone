"use client";

import { useEffect, useState } from "react";
import { login, getMe, becomeHost } from "@/lib/api";

interface HostGuardProps {
  children: React.ReactNode;
}

export default function HostGuard({
  children,
}: HostGuardProps) {
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    async function initializeUser() {
      try {
        let userId = localStorage.getItem("userId");

        console.log("Current userId:", userId);

        // First visit: create/login demo user
        if (!userId) {
          console.log("Logging in demo user...");

          const user = await login("emma@example.com");

          console.log("Login response:", user);

          localStorage.setItem(
            "userId",
            String(user.id)
          );

          localStorage.setItem(
            "user",
            JSON.stringify(user)
          );

          userId = String(user.id);

          console.log(
            "Saved userId:",
            localStorage.getItem("userId")
          );
        }

        const currentUser = await getMe(
          Number(userId)
        );

        console.log("Current user:", currentUser);

        if (currentUser.role === "host") {
          setIsHost(true);
        } else {
          setIsHost(false);
        }
      } catch (error) {
        console.error(
          "HostGuard error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    initializeUser();
  }, []);

  async function handleBecomeHost() {
    try {
      const userId = Number(
        localStorage.getItem("userId")
      );

      const result = await becomeHost(userId);

      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      setIsHost(true);
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF385C]" />
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold">
            Become a host
          </h1>

          <p className="mt-3 text-gray-500">
            Share your space with guests and start
            hosting.
          </p>

          <button
            onClick={handleBecomeHost}
            className="mt-6 rounded-xl bg-[#FF385C] px-6 py-3 font-semibold text-white"
          >
            Become a host
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}