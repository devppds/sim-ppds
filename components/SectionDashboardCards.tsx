import React from 'react';

export type CardColorTheme = 'blue' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate' | 'teal' | 'green' | 'violet' | 'cyan' | 'orange';

export interface DashboardCardConfig {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  colorTheme: CardColorTheme;
}

interface SectionDashboardCardsProps {
  cards: DashboardCardConfig[];
}

const colorMap: Record<CardColorTheme, { bg: string; text: string; bgHover: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', bgHover: 'hover:bg-blue-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', bgHover: 'hover:bg-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', bgHover: 'hover:bg-amber-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', bgHover: 'hover:bg-indigo-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', bgHover: 'hover:bg-rose-100' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', bgHover: 'hover:bg-slate-100' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', bgHover: 'hover:bg-teal-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', bgHover: 'hover:bg-green-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', bgHover: 'hover:bg-violet-100' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', bgHover: 'hover:bg-cyan-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', bgHover: 'hover:bg-orange-100' },
};

export default function SectionDashboardCards({ cards }: SectionDashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card, idx) => {
        const theme = colorMap[card.colorTheme] || colorMap.slate;
        
        return (
          <div 
            key={idx} 
            className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition-colors">
                {card.title}
              </p>
              <h3 className={`text-2xl font-black mt-2 ${theme.text}`}>
                {card.value}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider group-hover:text-slate-500 transition-colors">
                {card.description}
              </p>
            </div>
            <div className={`w-14 h-14 ${theme.bg} ${theme.text} rounded-2xl flex items-center justify-center font-bold shadow-inner ${theme.bgHover} transition-colors duration-300`}>
              {card.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
}
