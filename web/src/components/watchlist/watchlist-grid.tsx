"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
  Search,
  Star,
  Trash2,
} from "lucide-react";

import { Sparkline } from "@/components/scanner/sparkline";
import { WatchlistItem } from "./types";
import { getAuthHeaders } from "@/lib/auth";

interface WatchlistGridProps {
  items: WatchlistItem[];
  watchlistId: string;
  onItemRemoved: (symbol: string) => void;
}

export function WatchlistGrid({ items, watchlistId, onItemRemoved }: WatchlistGridProps) {
  const router = useRouter();
  const [data, setData] = useState<WatchlistItem[]>(items);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "change_pct", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [favouriteSymbols, setFavouriteSymbols] = useState<Set<string>>(new Set());

  // Keep internal table data in sync with prop updates
  useEffect(() => {
    setData(items);
  }, [items]);

  // Load user favourites
  useEffect(() => {
    let isMounted = true;
    async function loadFavs() {
      try {
        const res = await fetch("/api/favourites", { headers: getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && Array.isArray(json.favourites)) {
            setFavouriteSymbols(new Set(json.favourites));
          }
        }
      } catch {
        // ignore
      }
    }
    loadFavs();

    const handleUserChange = () => {
      loadFavs();
    };
    window.addEventListener("ts-user-changed", handleUserChange);

    return () => {
      isMounted = false;
      window.removeEventListener("ts-user-changed", handleUserChange);
    };
  }, []);

  // Toggle Favourite helper
  const handleToggleFav = async (symbol: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/favourites/${symbol}/toggle`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setFavouriteSymbols((prev) => {
          const next = new Set(prev);
          if (json.is_favourite) next.add(symbol);
          else next.delete(symbol);
          return next;
        });
      }
    } catch {
      // ignore
    }
  };

  // Remove item helper without blocking window.confirm popup
  const handleRemove = React.useCallback(
    async (symbol: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const res = await fetch(`/api/watchlists/${watchlistId}/items/${symbol}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          onItemRemoved(symbol);
        }
      } catch {
        // ignore
      }
    },
    [watchlistId, onItemRemoved]
  );

  const columns = useMemo<ColumnDef<WatchlistItem>[]>(
    () => [
      {
        id: "star",
        header: () => <span className="sr-only">Star</span>,
        cell: ({ row }) => {
          const sym = row.original.symbol;
          const isFav = favouriteSymbols.has(sym);
          return (
            <button
              onClick={(e) => handleToggleFav(sym, e)}
              className="p-1 hover:scale-125 transition-transform"
              title={isFav ? "Starred (Click to remove)" : "Click to Star"}
            >
              <Star
                className={`h-4 w-4 ${
                  isFav
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                    : "text-slate-600 hover:text-amber-400/80"
                }`}
              />
            </button>
          );
        },
      },
      {
        accessorKey: "symbol",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-slate-200 hover:text-cyan-400 transition-colors"
          >
            Symbol
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3 text-cyan-400" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3 text-cyan-400" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const sym = row.original.symbol;
          const name = row.original.name || row.original.company_name;
          return (
            <div>
              <div className="font-mono font-bold tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors">
                {sym}
              </div>
              {name && (
                <div className="max-w-[160px] truncate text-[11px] text-slate-400">
                  {name}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "cmp",
        accessorFn: (row) => row.cmp ?? 0,
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-end w-full gap-1 font-semibold text-slate-200 hover:text-cyan-400 transition-colors"
          >
            CMP (₹)
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3 text-cyan-400" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3 text-cyan-400" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = Number(getValue());
          return (
            <div className="text-right font-mono font-semibold text-slate-100">
              ₹{val ? val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
            </div>
          );
        },
      },
      {
        id: "change_pct",
        accessorFn: (row) => row.change_pct ?? row.day_change ?? 0,
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-end w-full gap-1 font-semibold text-slate-200 hover:text-cyan-400 transition-colors"
          >
            1D %
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3 text-cyan-400" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3 text-cyan-400" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = Number(getValue());
          const isUp = val >= 0;
          return (
            <div className="flex justify-end">
              <span
                className={`inline-flex items-center font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  isUp
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                {isUp ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`}
              </span>
            </div>
          );
        },
      },
      {
        id: "sparkline",
        header: () => <div className="text-center font-semibold text-slate-200">20D Trend</div>,
        cell: ({ row }) => {
          const spark = row.original.sparkline || [];
          const isUp = row.original.change_pct >= 0;
          return (
            <div className="flex justify-center items-center py-1">
              <Sparkline data={spark} width={76} height={22} isPositive={isUp} />
            </div>
          );
        },
      },
      {
        id: "rsi",
        accessorFn: (row) => row.rsi ?? 50,
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-end w-full gap-1 font-semibold text-slate-200 hover:text-cyan-400 transition-colors"
          >
            RSI (14)
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3 text-cyan-400" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3 text-cyan-400" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = Number(getValue());
          return (
            <div className="text-right font-mono text-xs text-slate-300">
              {val ? val.toFixed(1) : "—"}
            </div>
          );
        },
      },
      {
        id: "rs_rating",
        accessorFn: (row) => row.rs_rating ?? 50,
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-end w-full gap-1 font-semibold text-slate-200 hover:text-cyan-400 transition-colors"
          >
            RS Rating
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3 text-cyan-400" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3 text-cyan-400" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = Number(getValue());
          const isLeader = val >= 80;
          return (
            <div className="flex justify-end">
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  isLeader
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-extrabold"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {val || 50}
              </span>
            </div>
          );
        },
      },
      {
        id: "stage",
        accessorFn: (row) => row.stage ?? 2,
        header: "Stage",
        cell: ({ row }) => {
          const st = row.original.stage || 2;
          const label = row.original.stage_name || `Stage ${st}`;
          const isSt2 = st === 2;
          return (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                isSt2
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              {label}
            </span>
          );
        },
      },
      {
        id: "from_52w_high",
        accessorFn: (row) => row.from_52w_high ?? 0,
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-end w-full gap-1 font-semibold text-slate-200 hover:text-cyan-400 transition-colors"
          >
            52W High %
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3 text-cyan-400" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3 text-cyan-400" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = Number(getValue());
          return (
            <div className="text-right font-mono text-xs text-slate-400">
              {val ? `${val.toFixed(1)}%` : "—"}
            </div>
          );
        },
      },
      {
        id: "notes",
        header: "Notes",
        cell: ({ row }) => {
          const noteText = row.original.notes;
          return (
            <div
              className="max-w-[140px] truncate text-xs text-slate-400 italic"
              title={noteText || ""}
            >
              {noteText || "—"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const sym = row.original.symbol;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/stock/${sym}`);
                }}
                className="p-1.5 rounded text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                title="Open Stock View"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => handleRemove(sym, e)}
                className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Remove from Watchlist"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        },
      },
    ],
    [favouriteSymbols, router, handleRemove]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  const rows = table.getRowModel().rows;

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, rows.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const activeRow = rows[selectedIndex];
        if (activeRow) {
          router.push(`/stock/${activeRow.original.symbol}`);
        }
      } else if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        const activeRow = rows[selectedIndex];
        if (activeRow) {
          handleToggleFav(activeRow.original.symbol);
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const activeRow = rows[selectedIndex];
        if (activeRow) {
          fetch(`/api/watchlists/${watchlistId}/items/${activeRow.original.symbol}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          }).then(() => onItemRemoved(activeRow.original.symbol));
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rows, selectedIndex, router, watchlistId, onItemRemoved]);

  return (
    <div className="w-full space-y-3">
      {/* Search and shortcut helper bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter stocks in watchlist..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 transition-all font-mono"
          />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>Shortcuts:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ↑ / ↓
          </kbd>{" "}
          <span>Select</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Enter
          </kbd>{" "}
          <span>Chart</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            W
          </kbd>{" "}
          <span>Star</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Del
          </kbd>{" "}
          <span>Remove</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="relative overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-lg backdrop-blur-md">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-800 bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="py-2.5 px-3 select-none whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center text-slate-500 text-xs">
                  {items.length === 0
                    ? "This watchlist is currently empty. Use the search bar above to add stock symbols."
                    : "No symbols match your filter."}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const isSelected = idx === selectedIndex;
                const sym = row.original.symbol;

                return (
                  <tr
                    key={row.id}
                    onClick={() => {
                      setSelectedIndex(idx);
                      router.push(`/stock/${sym}`);
                    }}
                    className={`cursor-pointer transition-colors group ${
                      isSelected
                        ? "bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/30"
                        : "hover:bg-slate-900/60"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-2.5 px-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
