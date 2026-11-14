"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  PlayCircle,
  BookOpen,
  Mail,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  FileText,
} from "lucide-react";

interface HelpMenuProps {
  onReplayTour: () => void;
}

export function HelpMenu({ onReplayTour }: HelpMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl transition-all ${
          isOpen
            ? "bg-primary text-white shadow-md shadow-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title="Help & Support"
        aria-label="Help & Support"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute left-14 bottom-0 z-50 w-72 rounded-2xl border border-border bg-card shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-border/70 mb-1">
            <h3 className="text-xs font-semibold text-foreground">Help & Resources</h3>
            <p className="text-[11px] text-muted-foreground">Scan The Charts / TRADESCOUT Terminal</p>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                onReplayTour();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <PlayCircle className="h-4 w-4 text-primary" />
                <span>Replay welcome tour</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            <Link
              href="/warmup"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Documentation & Guides</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>Contact Customer Support</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <div className="my-1 border-t border-border/70" />

            <Link
              href="/disclaimer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span>SEBI & Legal Disclosures</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              href="/terms"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Terms of Service</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>

          <div className="mt-2 pt-2 border-t border-border/70 px-3 py-1 bg-muted/40 rounded-xl">
            <span className="text-[10px] text-muted-foreground block text-center">
              support@scanthecharts.com • Punjab, India
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpMenu;
