"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Zap,
  SlidersHorizontal,
  BarChart3,
  Star,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const mobileNavItems = [
    { name: "Warm-up", href: "/warmup", icon: Activity },
    { name: "Intraday", href: "/intraday", icon: Zap },
    { name: "Scanners", href: "/scanners", icon: SlidersHorizontal },
    { name: "Breadth", href: "/markets", icon: BarChart3 },
    { name: "Watchlist", href: "/watchlists", icon: Star },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#141420]/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 select-none">
      {mobileNavItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
              active
                ? "bg-primary text-white font-semibold shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[10px] mt-0.5 leading-none">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export const BottomNav = MobileNav;
export default MobileNav;
