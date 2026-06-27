// Simple localStorage-backed CRUD layer for CSSD records.
// Keyed by table name; each row has an `id` (uuid) plus arbitrary fields.

export type Row = Record<string, any> & { id: string };

const PREFIX = "cssd:";

function read(table: string): Row[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PREFIX + table);
    return raw ? (JSON.parse(raw) as Row[]) : [];
  } catch {
    return [];
  }
}

function write(table: string, rows: Row[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFIX + table, JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent("cssd:change", { detail: { table } }));
}

export const db = {
  list(table: string): Row[] {
    return read(table);
  },
  insert(table: string, row: Omit<Row, "id"> & { id?: string }): Row {
    const rows = read(table);
    const newRow: Row = { ...row, id: row.id ?? crypto.randomUUID() };
    rows.unshift(newRow);
    write(table, rows);
    return newRow;
  },
  update(table: string, id: string, patch: Partial<Row>): Row | null {
    const rows = read(table);
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return null;
    rows[i] = { ...rows[i], ...patch, id };
    write(table, rows);
    return rows[i];
  },
  remove(table: string, id: string) {
    write(
      table,
      read(table).filter((r) => r.id !== id),
    );
  },
  clear(table: string) {
    write(table, []);
  },
};

import { useEffect, useState } from "react";

export function useTable(table: string): Row[] {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    setRows(read(table));
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d || d.table === table) setRows(read(table));
    };
    const sh = () => setRows(read(table));
    window.addEventListener("cssd:change", handler);
    window.addEventListener("storage", sh);
    return () => {
      window.removeEventListener("cssd:change", handler);
      window.removeEventListener("storage", sh);
    };
  }, [table]);
  return rows;
}

export function nextLoadNumber(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const prefix = `CSSD-${y}${m}${d}-`;
  const existing = read("sterilization_load")
    .map((r) => String(r.loadNumber ?? ""))
    .filter((n) => n.startsWith(prefix));
  const max = existing
    .map((n) => parseInt(n.slice(prefix.length), 10))
    .filter((n) => !isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return prefix + String(max + 1).padStart(3, "0");
}

export function addDays(dateStr: string, days: number): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function addYears(dateStr: string, years: number): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}
