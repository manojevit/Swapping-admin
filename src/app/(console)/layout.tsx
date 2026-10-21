import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ToastProvider } from "@/components/ui/toast";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas">
        <Sidebar />
        <div className="pl-[244px]">
          <Topbar />
          <main className="mx-auto max-w-[1600px] px-6 py-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
