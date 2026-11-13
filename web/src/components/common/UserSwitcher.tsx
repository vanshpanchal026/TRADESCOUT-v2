"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Shield, User, UserCheck } from "lucide-react";
import { PRESET_USERS, getActiveUserId, setActiveUserId, UserProfile } from "@/lib/auth";

export function UserSwitcher() {
  const [activeUser, setActiveUser] = useState<UserProfile>(PRESET_USERS[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [customId, setCustomId] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentId = getActiveUserId();
    const found = PRESET_USERS.find((u) => u.id === currentId);
    if (found) {
      setActiveUser(found);
    } else {
      setActiveUser({
        id: currentId,
        name: `User ${currentId.slice(0, 6)}...`,
        role: "pro",
        plan: "Pro",
        avatarText: "CU",
      });
    }

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ userId: string }>;
      const id = customEvent.detail?.userId || getActiveUserId();
      const match = PRESET_USERS.find((u) => u.id === id);
      if (match) {
        setActiveUser(match);
      } else {
        setActiveUser({
          id,
          name: `User ${id.slice(0, 6)}...`,
          role: "pro",
          plan: "Pro",
          avatarText: "CU",
        });
      }
    };

    window.addEventListener("ts-user-changed", handler);
    return () => window.removeEventListener("ts-user-changed", handler);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (user: UserProfile) => {
    setActiveUserId(user.id);
    setActiveUser(user);
    setIsOpen(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customId.trim();
    if (trimmed) {
      setActiveUserId(trimmed);
      setActiveUser({
        id: trimmed,
        name: `Custom (${trimmed.slice(0, 6)}...)`,
        role: "pro",
        plan: "Pro",
        avatarText: "CU",
      });
      setCustomId("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-card/60 hover:bg-muted text-xs font-medium text-foreground transition-all shadow-sm"
        title="Switch Multi-Tenant User Identity"
      >
        <div className="h-5 w-5 rounded-md bg-accent/20 text-accent font-bold flex items-center justify-center text-[10px]">
          {activeUser.avatarText}
        </div>
        <div className="hidden sm:flex flex-col items-start text-left leading-tight">
          <span className="font-semibold text-foreground text-[11px] truncate max-w-[100px]">
            {activeUser.name}
          </span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-mono">
            <span className="h-1 w-1 rounded-full bg-bull"></span>
            {activeUser.plan}
          </span>
        </div>
        <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 border-b border-border/60 mb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-accent" />
                Multi-Tenant User Isolation
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-bull/10 text-bull font-bold">
                10k Scale
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Watchlists, drawing layers, and private notes are strictly partitioned per identity.
            </p>
          </div>

          <div className="space-y-1">
            {PRESET_USERS.map((user) => {
              const isSelected = user.id === activeUser.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? "bg-accent/15 text-accent font-semibold border border-accent/20"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.avatarText}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-[11px]">{user.name}</span>
                      <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[140px]">
                        {user.id}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-accent" />}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleApplyCustom} className="mt-2 pt-2 border-t border-border/60">
            <label className="text-[10px] text-muted-foreground block mb-1">
              Connect Custom User ID / UUID:
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="00000000-0000-..."
                className="flex-1 px-2 py-1 text-[11px] font-mono rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                className="px-2 py-1 text-[11px] font-semibold rounded-md bg-accent text-white hover:bg-accent/90"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserSwitcher;
