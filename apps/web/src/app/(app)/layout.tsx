import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-container-low">
      <Sidebar className="hidden md:flex" />

      <div className="md:pl-64">
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className="relative pt-16 bg-surface-container-low min-h-screen focus:outline-none"
        >
          <div className="w-full px-space-lg py-space-lg">{children}</div>
        </main>
      </div>
    </div>
  );
}
