"use client";

import React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { getActiveUserProfile } from "@/lib/auth";

export function UserSwitcher() {
  const profile = getActiveUserProfile();

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
        <span className="text-[10px] text-muted-foreground font-mono">
          {profile.plan || "Free"}
        </span>
      </div>
    </Link>
  );
}

export default UserSwitcher;
