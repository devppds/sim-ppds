import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardGroupRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
