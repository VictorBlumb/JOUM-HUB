import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background font-sans text-foreground">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-72 fixed inset-y-0 left-0 z-40">
                <Sidebar className="h-full" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:pl-72 transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </main>
            </div>
        </div>
    );
}
