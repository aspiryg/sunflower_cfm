import { PublicNavbar } from "@/ui/PublicNavbar";
import { PublicFooter } from "@/ui/PublicFooter";
import "@/styles/public.css";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-shell">
      <PublicNavbar />
      <main className="public-shell__main">{children}</main>
      <PublicFooter />
    </div>
  );
}
