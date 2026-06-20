"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

interface Santri {
  id: number;
  name: string;
  nisn: string;
  kelas: string;
  asrama?: string;
}

interface SearchableSantriSelectProps {
  santriList: Santri[];
  selectedId: string | number;
  onChange: (id: string) => void;
  placeholder?: string;
  accentColor?: string; // e.g., 'rose', 'blue', 'emerald', 'amber', 'indigo', 'violet'
}

export default function SearchableSantriSelect({
  santriList,
  selectedId,
  onChange,
  placeholder = "Cari & pilih santri...",
  accentColor = "indigo"
}: SearchableSantriSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Session checks for role-based restrictions
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then((data: any) => {
        if (data.success && data.session) {
          setSession(data.session);
        }
      })
      .catch(e => console.error("Session fetch error", e))
      .finally(() => setSessionLoading(false));
  }, []);

  const hasFullAccess = useMemo(() => {
    if (sessionLoading || !session) return false;
    const level = session.role_level;
    const role = (session.role || "").toUpperCase();
    return level === 'SEKRETARIAT' || 
      level === 'VIEW_ALL' || 
      level === 'ROOT' || 
      role.includes("SEKRETARIS") || 
      role.includes("SEKRETARIAT") ||
      role === "DEVELOPER" ||
      role === "MUDIR" ||
      role.includes("SUPER");
  }, [session, sessionLoading]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSantri = santriList.find(s => s.id.toString() === selectedId.toString());

  const filtered = santriList.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.nisn && s.nisn.includes(search)) ||
    (s.kelas && s.kelas.toLowerCase().includes(search.toLowerCase()))
  );

  const accentStyles = {
    rose: "focus:border-rose-500 focus:ring-rose-500/20 text-rose-600 bg-rose-50 border-rose-200",
    blue: "focus:border-blue-500 focus:ring-blue-500/20 text-blue-600 bg-blue-50 border-blue-200",
    emerald: "focus:border-emerald-500 focus:ring-emerald-500/20 text-emerald-600 bg-emerald-50 border-emerald-200",
    amber: "focus:border-amber-500 focus:ring-amber-500/20 text-amber-600 bg-amber-50 border-amber-200",
    indigo: "focus:border-indigo-500 focus:ring-indigo-500/20 text-indigo-600 bg-indigo-50 border-indigo-200",
    violet: "focus:border-violet-500 focus:ring-violet-500/20 text-violet-600 bg-violet-50 border-violet-200",
  }[accentColor] || "focus:border-indigo-500 focus:ring-indigo-500/20 text-indigo-600 bg-indigo-50 border-indigo-200";

  const getBorderActiveStyle = () => {
    switch (accentColor) {
      case "rose": return "focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500/50";
      case "blue": return "focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50";
      case "emerald": return "focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50";
      case "amber": return "focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/50";
      case "violet": return "focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/50";
      default: return "focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50";
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white flex justify-between items-center cursor-pointer hover:border-slate-300 transition-all select-none ${getBorderActiveStyle()}`}
      >
        {selectedSantri ? (
          <span className="text-slate-800 font-bold text-sm">
            {selectedSantri.name} <span className="text-xs font-normal text-slate-400">({selectedSantri.kelas})</span>
          </span>
        ) : (
          <span className="text-slate-400 font-bold text-sm">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-150 rounded-2xl shadow-2xl z-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama, NISN, atau kelas..."
              className="w-full bg-transparent border-none outline-hidden text-xs py-1 font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {(!hasFullAccess && search.trim().length < 2) ? (
              <div className="p-4 text-center text-xs text-slate-400 font-bold">
                Ketik minimal 2 karakter untuk mencari...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-bold">
                Santri tidak ditemukan
              </div>
            ) : (
              filtered.map(s => {
                const isSelected = s.id.toString() === selectedId.toString();
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      onChange(s.id.toString());
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`px-4 py-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors text-slate-700 ${
                      isSelected ? "bg-slate-50/70" : ""
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-xs ${isSelected ? "text-slate-800 font-extrabold" : "font-bold text-slate-700"}`}>
                        {s.name}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        NISN: {s.nisn} | Kelas: {s.kelas} {s.asrama ? `| Asrama: ${s.asrama}` : ""}
                      </span>
                    </div>
                    {isSelected && (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${accentStyles}`}>
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

