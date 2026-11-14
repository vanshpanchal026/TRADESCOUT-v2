"use client";

import React from "react";
import NotesAndFilings from "./NotesAndFilings";

interface NotesTabProps {
  symbol: string;
  companyName?: string | null;
}

export function NotesTab({ symbol, companyName }: NotesTabProps) {
  return <NotesAndFilings symbol={symbol} companyName={companyName} />;
}

export default NotesTab;
