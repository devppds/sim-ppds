import DashboardLayout from "@/components/DashboardLayout";
import { Construction } from "lucide-react";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <DashboardLayout>
      <div className="fade-up fade-up-1 flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
          <Construction className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1e293b] mb-2">{title}</h1>
        <p className="text-sm text-[#64748b] max-w-sm">
          Halaman ini sedang dalam pengembangan. Fitur akan segera tersedia.
        </p>
      </div>
    </DashboardLayout>
  );
}
