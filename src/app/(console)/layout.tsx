import { ConsoleShell } from "@/components/layout/console-shell";
import { ToastProvider } from "@/components/ui/toast";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConsoleShell>{children}</ConsoleShell>
    </ToastProvider>
  );
}
