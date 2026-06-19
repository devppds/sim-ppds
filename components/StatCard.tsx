"use client";

interface StatCardProps {
  iconBg: string;
  iconColor: string;
  iconSvgPath: string;
  badge: string;
  badgeColor: string;
  value: string;
  label: string;
  delay?: number;
}

export default function StatCard({
  iconBg,
  iconColor,
  iconSvgPath,
  badge,
  badgeColor,
  value,
  label,
  delay = 1,
}: StatCardProps) {
  return (
    <div
      className={`fade-up fade-up-${delay} bg-white rounded-xl p-4 sm:p-5 border border-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconColor}
            dangerouslySetInnerHTML={{ __html: iconSvgPath }}
          />
        </div>
        <span
          className={`text-[11px] font-semibold ${badgeColor} px-2 py-0.5 rounded-full`}
        >
          {badge}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-[#1e293b]">
        {value}
      </div>
      <div className="text-xs text-[#64748b] mt-1">{label}</div>
    </div>
  );
}
