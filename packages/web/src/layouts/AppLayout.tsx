import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { MobileNav, Sidebar } from "../components/layout/Sidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-950 lg:h-screen lg:overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
        <Header />
        <MobileNav />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
