import { AppShell } from "@/ui/AppShell";
import "@/styles/app.css";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
