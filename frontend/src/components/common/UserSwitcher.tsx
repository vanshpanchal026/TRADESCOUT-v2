"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { getActiveUserProfile, UserProfile } from "@/lib/auth";

export function UserSwitcher() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Synchronize profile state safely after client mount to prevent SSR hydration mismatch
    setProfile(getActiveUserProfile());

    const handleUserChanged = () => {
      setProfile(getActiveUserProfile());
    };

    window.addEventListener("ts-user-changed", handleUserChanged);
    return () => {
      window.removeEventListener("ts-user-changed", handleUserChanged);
    };
  }, []);

  const plan = profile ? profile.plan : "Free";

  return (
    <Link
      href="/account"
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border bg-card/60 hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-xs group"
      title="Account Settings"
    >
      <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground font-bold flex items-center justify-center text-xs transition-colors">
        <User className="h-3.5 w-3.5" />
      </div>
      <div className="hidden sm:flex flex-col items-start text-left leading-tight">
        <span className="font-semibold text-foreground text-xs">
          Account
        </span>
        <span
          className="text-[10px] text-muted-foreground font-mono"
          suppressHydrationWarning
        >
          {plan}
        </span>
      </div>
    </Link>
  );
}

export default UserSwitcher;
