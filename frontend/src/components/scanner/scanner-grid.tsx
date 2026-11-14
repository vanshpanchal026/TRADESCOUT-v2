"use client";

import { useEffect, useMemo, useState } from "react";
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
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";

import { ScannerStock, ScannerMetadata } from "@/lib/types";
import { Sparkline } from "./sparkline";
import { PaywallBlurBanner, BlurredPlaceholderRows } from "./paywall-blur";
import { getAuthHeaders } from "@/lib/auth";

interface ScannerGridProps {
  initialStocks: ScannerStock[];
  metadata: ScannerMetadata;
}

export function ScannerGrid({ initialStocks, metadata }: ScannerGridProps) {
  const router = useRouter();
  const [data, setData] = useState<ScannerStock[]>(initialStocks);
  const [currentMetadata, setCurrentMetadata] = useState<ScannerMetadata>(metadata);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "rs_rating", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Synchronize state if SSR props update
  useEffect(() => {
    setData(initialStocks);
    setCurrentMetadata(metadata);
  }, [initialStocks, metadata]);

  // Re-fetch on mount and whenever active user identity changes (Pro unlocking)
  useEffect(() => {
    let isMounted = true;

    async function fetchFreshCandidates() {
      try {
        const slug =
          metadata.slug ||
          (typeof window !== "undefined"
            ? window.location.pathname.split("/").filter(Boolean).pop()
            : "");
        if (!slug) return;

        const res = await fetch(`/api/scanners/${slug}`, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) return;
        const json = await res.json();
        if (!isMounted) return;

        const candidateList: ScannerStock[] = json.data || json.results || [];
        const resMeta = json.metadata || {};
        const isTruncated =
          resMeta.is_truncated !== undefined
            ? resMeta.is_truncated
            : json.is_truncated !== undefined
            ? json.is_truncated
            : false;

        setData(candidateList);
        setCurrentMetadata((prev) => ({
          ...prev,
          ...resMeta,
          is_truncated: isTruncated,
          total_matches: resMeta.total_matches ?? json.total_results ?? candidateList.length,
          returned: candidateList.length,
        }));
      } catch (err) {
        console.error("Failed to re-fetch scanner candidates:", err);
      }
    }

    fetchFreshCandidates();

    const handleUserChange = () => {
      fetchFreshCandidates();
    };

    window.addEventListener("ts-user-changed", handleUserChange);
    return () => {
      isMounted = false;
      window.removeEventListener("ts-user-changed", handleUserChange);
    };
  }, [metadata.slug]);

  const columns = useMemo<ColumnDef<ScannerStock>[]>(
    () => [
      {
        accessorKey: "symbol",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors"
          >
            Symbol
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const sym = row.original.symbol;
          return (
            <div className="font-bold tracking-tight text-foreground hover:text-primary transition-colors">
              {sym}
            </div>
          );
        },
      },
      {
        id: "name",
        accessorFn: (row) => row.name || row.company_name || row.symbol,
        header: "Name",
        cell: ({ getValue }) => (
          <div className="max-w-[180px] truncate text-xs text-muted-foreground sm:max-w-[220px]">
            {String(getValue() || "—")}
          </div>
        ),
      },
      {
        id: "cmp",
        accessorFn: (row) => row.cmp ?? row.close ?? 0,
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-end w-full gap-1 font-semibold text-foreground hover:text-primary transition-colors"
          >
            CMP (₹)
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = Number(getValue());
          return (
            <div className="text-right font-mono font-medium text-foreground">
              ₹{val ? val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
            </div>
          );
        },
      },
      {
        id: "day_change",
        accessorFn: (row) => row.day_change ?? row.change_pct ?? 0,
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-end w-full gap-1 font-semibold text-foreground hover:text-primary transition-colors"
          >
            Day %
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = Number(getValue());
          const isUp = val >= 0;
          return (
            <div
              className={`text-right font-mono font-semibold ${
                isUp ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {isUp ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`}
            </div>
          );
        },
      },
      {
        id: "sparkline",
        header: () => <div className="text-center">20D Trend</div>,
        cell: ({ row }) => {
          const chg = row.original.day_change ?? row.original.change_pct ?? 0;
          return (
            <div className="flex justify-center">
              <Sparkline
                data={row.original.sparkline}
                width={70}
                height={22}
                isPositive={chg >= 0}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "rvol",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-end w-full gap-1 font-semibold text-foreground hover:text-primary transition-colors"
          >
            RVOL
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = Number(getValue());
          const highlight = val >= 2.0;
          return (
            <div
              className={`text-right font-mono text-xs ${
                highlight ? "font-bold text-amber-500" : "text-muted-foreground"
              }`}
            >
              {val ? `${val.toFixed(2)}x` : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "rs_rating",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-end w-full gap-1 font-semibold text-foreground hover:text-primary transition-colors"
          >
            RS Rating
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = Number(getValue());
          const isTopTier = val >= 80;
          return (
            <div className="flex justify-end">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${
                  isTopTier
                    ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                    : "text-muted-foreground"
                }`}
              >
                {val || "—"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "stage",
        header: () => <div className="text-center">Stage</div>,
        cell: ({ getValue }) => {
          const st = Number(getValue());
          let color = "bg-muted text-muted-foreground";
          if (st === 2) color = "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30";
          else if (st === 4) color = "bg-rose-500/15 text-rose-500";
          else if (st === 1) color = "bg-blue-500/15 text-blue-500";
          else if (st === 3) color = "bg-amber-500/15 text-amber-500";

          return (
            <div className="flex justify-center">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${color}`}>
                Stage {st || "—"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "sma_50",
        header: () => <div className="text-right">50 SMA</div>,
        cell: ({ getValue }) => {
          const val = Number(getValue());
          return (
            <div className="text-right font-mono text-xs text-muted-foreground">
              {val ? `₹${val.toFixed(2)}` : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "sma_200",
        header: () => <div className="text-right">200 SMA</div>,
        cell: ({ getValue }) => {
          const val = Number(getValue());
          return (
            <div className="text-right font-mono text-xs text-muted-foreground">
              {val ? `₹${val.toFixed(2)}` : "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "from_52w_high",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-end w-full gap-1 font-semibold text-foreground hover:text-primary transition-colors"
          >
            52W High %
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = Number(getValue());
          return (
            <div className="text-right font-mono text-xs text-muted-foreground">
              {val ? `${val.toFixed(1)}%` : "—"}
            </div>
          );
        },
      },
    ],
    []
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
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rows, selectedIndex, router]);

  return (
    <div className="w-full space-y-4">
      {/* Search and summary ribbon */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search symbol, company name (<10ms)..."
            className="h-10 w-full rounded-lg border border-border bg-background/80 pl-9 pr-4 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{rows.length}</strong> of{" "}
            <strong className="text-foreground">{currentMetadata.total_matches}</strong> candidates
          </span>
          <span className="h-3 w-px bg-border" />
          <span>EOD: {currentMetadata.last_updated}</span>
        </div>
      </div>

      {/* Main Table Container with Sticky Frozen Columns */}
      <div className="relative overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                {headerGroup.headers.map((header) => {
                  const isSymbol = header.column.id === "symbol";
                  const isCmp = header.column.id === "cmp";

                  return (
                    <th
                      key={header.id}
                      className={`py-3 px-4 select-none whitespace-nowrap ${
                        isSymbol
                          ? "sticky left-0 z-30 bg-muted backdrop-blur shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                          : isCmp
                          ? "sticky left-[110px] z-30 bg-muted backdrop-blur shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                          : ""
                      }`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-border/60">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  No candidates match the current filter criteria.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const isSelected = idx === selectedIndex;

                return (
                  <tr
                    key={row.id}
                    onClick={() => {
                      setSelectedIndex(idx);
                      router.push(`/stock/${row.original.symbol}`);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/10 ring-1 ring-inset ring-primary/40"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isSymbol = cell.column.id === "symbol";
                      const isCmp = cell.column.id === "cmp";

                      return (
                        <td
                          key={cell.id}
                          className={`py-3 px-4 whitespace-nowrap ${
                            isSymbol
                              ? "sticky left-0 z-20 bg-card font-semibold shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                              : isCmp
                              ? "sticky left-[110px] z-20 bg-card shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                              : ""
                          }`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}

            {/* Freemium Paywall: Render rows 11+ blurred for guests */}
            {currentMetadata.is_truncated && <BlurredPlaceholderRows />}
          </tbody>
        </table>
      </div>

      {/* Freemium Lock Banner if truncated */}
      {currentMetadata.is_truncated && <PaywallBlurBanner totalMatches={currentMetadata.total_matches} />}
    </div>
  );
}
