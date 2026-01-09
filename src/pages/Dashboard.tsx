import { useState } from "react";
import { CheckCircle2, Circle, Play, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PlatformManager } from "@/components/PlatformManager";
import { cn } from "@/lib/utils";

type Platform = {
    id: string;
    name: string;
    category: string;
    status: "active" | "error" | "pending";
};

const PLATFORMS: Platform[] = [
    { id: "endesa", name: "ENDESA", category: "⚡ Electricidad", status: "active" },
    { id: "aguas_bcn", name: "Aguas de Barcelona", category: "💧 Agua", status: "active" },
    { id: "prosegur", name: "PROSEGUR", category: "🛡️ Seguridad", status: "active" },
    { id: "iberdrola_luz", name: "IBERDROLA Luz", category: "⚡ Electricidad", status: "active" },
    { id: "iberdrola_gas", name: "IBERDROLA Gas", category: "🔥 Gas", status: "active" },
    { id: "jazztel", name: "JAZZTEL", category: "🌐 Telecom", status: "active" },
    { id: "energia_xxi", name: "EnergiaXXI", category: "⚡ Electricidad", status: "error" },
    { id: "vodafone", name: "VODAFONE", category: "🌐 Telecom", status: "active" },
];

export default function Dashboard() {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [activePlatform, setActivePlatform] = useState<Platform | null>(null);

    const togglePlatform = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening detail when clicking checkbox
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const toggleAll = () => {
        if (selected.size === PLATFORMS.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(PLATFORMS.map((p) => p.id)));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Descarga de Facturas</h1>
                    <p className="text-muted-foreground mt-1">
                        Selecciona las plataformas para iniciar la descarga.
                        <br />
                        <span className="text-sm opacity-80">Haz clic en una tarjeta para gestionar sus usuarios.</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={toggleAll}>
                        {selected.size === PLATFORMS.length ? "Deseleccionar todo" : "Seleccionar todo"}
                    </Button>
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                        disabled={selected.size === 0}
                    >
                        <Play className="mr-2 h-5 w-5 fill-current" />
                        Iniciar Descargas ({selected.size})
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {PLATFORMS.map((platform) => (
                    <Sheet key={platform.id}>
                        <SheetTrigger asChild>
                            <div className="group cursor-pointer" onClick={() => setActivePlatform(platform)}>
                                <Card className={cn(
                                    "relative overflow-hidden transition-all duration-300 border-2",
                                    selected.has(platform.id)
                                        ? "border-primary bg-blue-50/50 shadow-md"
                                        : "border-transparent hover:border-gray-200 hover:shadow-lg"
                                )}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold transition-colors",
                                                selected.has(platform.id) ? "bg-primary text-white" : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary"
                                            )}>
                                                {platform.name.charAt(0)}
                                            </div>
                                            <div
                                                onClick={(e) => togglePlatform(platform.id, e)}
                                                className="hover:scale-110 transition-transform"
                                                role="button"
                                            >
                                                {selected.has(platform.id)
                                                    ? <CheckCircle2 className="h-7 w-7 text-primary fill-blue-100" />
                                                    : <Circle className="h-7 w-7 text-gray-300 hover:text-gray-400" />
                                                }
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-primary transition-colors pr-6 truncate">
                                            {platform.name}
                                        </h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className={cn(
                                                    "text-xs font-normal border",
                                                    platform.category.includes("Electricidad") && "bg-yellow-50 text-yellow-700 border-yellow-200",
                                                    platform.category.includes("Agua") && "bg-blue-50 text-blue-700 border-blue-200",
                                                    platform.category.includes("Gas") && "bg-orange-50 text-orange-700 border-orange-200",
                                                    platform.category.includes("Telecom") && "bg-purple-50 text-purple-700 border-purple-200",
                                                    platform.category.includes("Seguridad") && "bg-slate-50 text-slate-700 border-slate-200",
                                                )}>
                                                    {platform.category}
                                                </Badge>
                                                {platform.status === 'error' && <Badge variant="destructive" className="text-xs">Error</Badge>}
                                            </div>
                                            <Settings2 className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px]">
                            {activePlatform && <PlatformManager platformId={activePlatform.id} platformName={activePlatform.name} />}
                        </SheetContent>
                    </Sheet>
                ))}
            </div>
        </div>
    );
}
