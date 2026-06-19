import { useState } from "react";

export default function SPPChart({ data = [] }: { data?: any[] }) {
  const [isYearly, setIsYearly] = useState(false);
  
  const displayData = data.length > 0 ? data : [
    { label: "Syawal", value: 0 },
    { label: "Maulid", value: 0 },
    { label: "Rajab", value: 0 },
  ];

  const yearlyData = [
    { label: "2024", value: 0 },
    { label: "2025", value: 0 },
    { label: "2026", value: 0 },
  ];

  const currentData = isYearly ? yearlyData : displayData;
  const max = Math.max(...currentData.map((d: any) => d.value), 100);

  return (
    <div className="fade-up fade-up-5 lg:col-span-2 bg-white rounded-xl border border-slate-100 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-black text-text-main tracking-tight">Penerimaan SPP</h2>
          <p className="text-[10px] font-bold text-text-sub uppercase tracking-widest mt-0.5">
            {isYearly ? 'Rekapitulasi 3 Tahun Terakhir' : 'Rekapitulasi 6 Bulan Terakhir'}
          </p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
          <button 
            onClick={() => setIsYearly(false)}
            className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest ${
              !isYearly ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Bulanan
          </button>
          <button 
            onClick={() => setIsYearly(true)}
            className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest ${
              isYearly ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Tahunan
          </button>
        </div>
      </div>

      {/* Bars */}
      <div
        className="flex items-end gap-3 sm:gap-6 h-48 px-2"
        role="img"
        aria-label="Grafik penerimaan SPP"
      >
        {currentData.map((d: any) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
              <span className={`text-[10px] font-black transition-colors ${pct > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                {d.value}%
              </span>
              <div
                className="w-full bg-slate-50 rounded-t-2xl relative overflow-hidden transition-all group-hover:bg-slate-100"
                style={{ height: 160 }}
              >
                <div
                  className={`chart-bar absolute bottom-0 w-full rounded-t-2xl transition-all duration-700 bg-linear-to-t ${
                    isYearly ? 'from-indigo-600 to-indigo-400' : 'from-emerald-600 to-emerald-400'
                  }`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-text-sub uppercase tracking-widest mt-1">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
