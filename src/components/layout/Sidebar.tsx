import { cn } from "@/lib/utils";
import { FileText, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className={cn("flex flex-col h-full border-r bg-card py-6", className)}>
            <div className="px-6 mb-8 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                    J
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                    JOUM HUB
                </span>
            </div>

            <div className="flex-1 px-4 space-y-2">
                <NavButton icon={<LayoutDashboard />} label="Descarga Facturas" active />
                <NavButton icon={<FileText />} label="Historial" />
            </div>

            <div className="px-4 mt-auto space-y-2">
                <NavButton icon={<Settings />} label="Configuración" />
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="mr-3 h-5 w-5" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}

function NavButton({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Button
            variant={active ? "secondary" : "ghost"}
            className={cn(
                "w-full justify-start text-base font-medium transition-all duration-200",
                active ? "bg-blue-50 text-blue-700 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
        >
            <span className={cn("mr-3 h-5 w-5", active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")}>
                {icon}
            </span>
            {label}
        </Button>
    )
}
