import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Play, Zap, Flame, Globe, Droplet, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserManagementModal, type PlatformUser } from "@/components/UserManagementModal";

type PlatformId = "endesa" | "iberdrola" | "jazztel" | "vodafone" | "aguas_bcn" | "prosegur" | "energia_xxi";

interface PlatformState {
    enabled: boolean;
}

const DEFAULT_STATES: Record<PlatformId, PlatformState> = {
    endesa: { enabled: false },
    iberdrola: { enabled: false },
    jazztel: { enabled: false },
    vodafone: { enabled: false },
    aguas_bcn: { enabled: false },
    prosegur: { enabled: false },
    energia_xxi: { enabled: false },
};

export const COMPANIES = [
    "JOUM DESARROLLOS S.L.",
    "NOMADA DESARROLLOS S.L.",
    "ROCENARRO S.S.",
    "FICHIMA BUSINESS S.L."
] as const;

export type CompanyName = typeof COMPANIES[number];

const MOCK_USERS_DATA: Record<PlatformId, PlatformUser[]> = {
    "endesa": [
        { id: "1", username: "user1@joum.es", company: "JOUM DESARROLLOS S.L.", lastSync: "Hace 2 horas", status: "active", active: true },
        { id: "2", username: "user2@joum.es", company: "JOUM DESARROLLOS S.L.", lastSync: "Hace 1 día", status: "error", active: false },
        { id: "101", username: "nomada1@emp.es", company: "NOMADA DESARROLLOS S.L.", lastSync: "Hace 30 mins", status: "active", active: true },
        { id: "102", username: "rocenarro@ss.es", company: "ROCENARRO S.S.", lastSync: "Hace 2 días", status: "active", active: true },
        { id: "103", username: "fichima@business.es", company: "FICHIMA BUSINESS S.L.", lastSync: "Hace 1 semana", status: "active", active: true }
    ],
    "iberdrola": [
        { id: "3", username: "oficina.joum", company: "JOUM DESARROLLOS S.L.", lastSync: "Hace 5 mins", status: "active", active: true, luz: true, gas: false },
        { id: "4", username: "nave.nomada", company: "NOMADA DESARROLLOS S.L.", lastSync: "Hace 1 hora", status: "active", active: true, luz: true, gas: true }
    ],
    "jazztel": [],
    "vodafone": [
        { id: "5", username: "flota.movil", company: "JOUM DESARROLLOS S.L.", lastSync: "Hace 30 mins", status: "active", active: true }
    ],
    "aguas_bcn": [
        { id: "6", username: "suministro.agua", company: "FICHIMA BUSINESS S.L.", lastSync: "Hace 2 días", status: "active", active: true }
    ],
    "prosegur": [],
    "energia_xxi": []
};

export default function Dashboard() {
    // State for Toggles
    const [platformStates, setPlatformStates] = useState<Record<PlatformId, PlatformState>>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("platformStates");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return { ...DEFAULT_STATES, ...parsed };
                } catch (e) {
                    console.error("Failed to parse platform states", e);
                    return DEFAULT_STATES;
                }
            }
        }
        return DEFAULT_STATES;
    });

    // State for Users (Centralized)
    const [platformUsers, setPlatformUsers] = useState<Record<PlatformId, PlatformUser[]>>(MOCK_USERS_DATA);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [activePlatform, setActivePlatform] = useState<{ id: PlatformId; name: string } | null>(null);

    // Persist Platform States
    useEffect(() => {
        localStorage.setItem("platformStates", JSON.stringify(platformStates));
    }, [platformStates]);

    const togglePlatform = (id: PlatformId) => {
        setPlatformStates(prev => {
            const current = prev[id] || { enabled: false };
            return {
                ...prev,
                [id]: { ...current, enabled: !current.enabled }
            };
        });
    };

    const openModal = (id: PlatformId, name: string) => {
        setActivePlatform({ id, name });
        setModalOpen(true);
    };



    // Helper: Get Per-Company Stats
    const getCompanyStats = (id: PlatformId) => {
        const users = platformUsers[id] || [];
        const stats = COMPANIES.map(company => {
            const companyUsers = users.filter(u => u.company === company);
            const active = companyUsers.filter(u => u.active).length;
            const total = companyUsers.length;
            return { company, active, total };
        });
        const totalActive = users.filter(u => u.active).length;
        const totalUsers = users.length;
        return { stats, totalActive, totalUsers };
    };

    // Helper: Count active platforms selected to enable "Procesar Facturas"
    const getActivePlatformCount = () => {
        return Object.values(platformStates).filter(s => s.enabled).length;
    };

    const handleUpdateUsers = (users: PlatformUser[]) => {
        if (activePlatform) {
            setPlatformUsers(prev => ({
                ...prev,
                [activePlatform.id]: users
            }));
        }
    };

    const CompanyStatsList = ({ id }: { id: PlatformId }) => {
        const { stats, totalActive, totalUsers } = getCompanyStats(id);

        // Filter to show only companies with users OR show simplified view?
        // User requested:
        // JOUM DESARROLLOS (8/12 activos)
        // ...
        // Total: 11/20 activos
        // We will show all for now, or maybe filter if 0? 
        // Let's show companies that have at least 1 user, or if none, show "Sin usuarios".

        const hasUsers = totalUsers > 0;
        const activeCompanies = stats.filter(s => s.total > 0);

        if (!hasUsers) {
            return (
                <div className="flex items-center justify-between text-sm font-medium bg-white/50 p-2 rounded-lg border border-dashed border-gray-200 text-gray-400">
                    <span>Sin usuarios</span>
                    <Badge variant="secondary" className="bg-white">0</Badge>
                </div>
            );
        }

        return (
            <div className="space-y-1.5 mt-2 bg-white/50 p-2 rounded-lg border border-dashed border-gray-200">
                {activeCompanies.map(stat => (
                    <div key={stat.company} className="flex justify-between text-xs text-gray-600">
                        <span className="truncate max-w-[140px]" title={stat.company}>{stat.company.replace(" S.L.", "").replace(" S.S.", "")}</span>
                        <span className="font-medium text-gray-800">{stat.active}/{stat.total}</span>
                    </div>
                ))}
                <div className="border-t border-gray-200 mt-1 pt-1 flex justify-between text-xs font-bold text-gray-800">
                    <span>Total</span>
                    <span>{totalActive}/{totalUsers} activos</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-10">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Gestiona tus plataformas</h1>
                    <p className="text-muted-foreground mt-1">
                        Activa los servicios y configura los usuarios para la descarga automática.
                    </p>
                </div>
                <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                    disabled={getActivePlatformCount() === 0}
                >
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Procesar Facturas
                </Button>
            </div>

            {/* GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {/* 1. ENDESA */}
                <Card
                    className={cn(
                        "group relative overflow-hidden transition-all duration-300 border-2 cursor-pointer hover:shadow-lg",
                        platformStates.endesa.enabled ? "border-primary bg-blue-50/30" : "border-transparent hover:border-blue-100"
                    )}
                    onClick={() => openModal("endesa", "ENDESA")}
                >
                    <div className="absolute top-0 right-0 p-4">
                        <div
                            onClick={(e) => { e.stopPropagation(); togglePlatform("endesa"); }}
                            className="transition-transform hover:scale-110"
                        >
                            {platformStates.endesa.enabled
                                ? <CheckCircle2 className="h-8 w-8 text-primary fill-blue-100" />
                                : <Circle className="h-8 w-8 text-gray-300 hover:text-gray-400" />
                            }
                        </div>
                    </div>
                    <CardContent className="p-6 pt-8">
                        <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-blue-200 shadow-md">
                            E
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 mb-1">ENDESA</h3>
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Electricidad
                        </p>

                        <CompanyStatsList id="endesa" />
                    </CardContent>
                </Card>

                {/* 2. IBERDROLA */}
                <Card
                    className={cn(
                        "group relative overflow-hidden transition-all duration-300 border-2 cursor-pointer hover:shadow-lg",
                        platformStates.iberdrola.enabled
                            ? "border-green-600 bg-green-50/30"
                            : "border-transparent hover:border-green-100"
                    )}
                    onClick={() => openModal("iberdrola", "IBERDROLA")}
                >
                    <div className="absolute top-0 right-0 p-4">
                        <div
                            onClick={(e) => { e.stopPropagation(); togglePlatform("iberdrola"); }}
                            className="transition-transform hover:scale-110"
                        >
                            {platformStates.iberdrola.enabled
                                ? <CheckCircle2 className="h-8 w-8 text-green-600 fill-green-100" />
                                : <Circle className="h-8 w-8 text-gray-300 hover:text-gray-400" />
                            }
                        </div>
                    </div>
                    <CardContent className="p-6 pt-8">
                        <div className="h-14 w-14 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-green-200 shadow-md">
                            I
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 mb-2">IBERDROLA</h3>

                        <div className="flex flex-col gap-1 mb-4">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Zap className="h-3 w-3" /> Electricidad
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Flame className="h-3 w-3" /> Gas
                            </p>
                        </div>

                        <CompanyStatsList id="iberdrola" />
                    </CardContent>
                </Card>

                {/* 3. JAZZTEL */}
                <Card
                    className={cn(
                        "group relative overflow-hidden transition-all duration-300 border-2 cursor-pointer hover:shadow-lg",
                        platformStates.jazztel.enabled ? "border-purple-500 bg-purple-50/30" : "border-transparent hover:border-purple-100"
                    )}
                    onClick={() => openModal("jazztel", "JAZZTEL")}
                >
                    <div className="absolute top-0 right-0 p-4">
                        <div
                            onClick={(e) => { e.stopPropagation(); togglePlatform("jazztel"); }}
                            className="transition-transform hover:scale-110"
                        >
                            {platformStates.jazztel.enabled
                                ? <CheckCircle2 className="h-8 w-8 text-purple-600 fill-purple-100" />
                                : <Circle className="h-8 w-8 text-gray-300 hover:text-gray-400" />
                            }
                        </div>
                    </div>
                    <CardContent className="p-6 pt-8">
                        <div className="h-14 w-14 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-purple-200 shadow-md">
                            J
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 mb-1">JAZZTEL</h3>
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                            <Globe className="h-3 w-3" /> Telecomunicaciones
                        </p>

                        <CompanyStatsList id="jazztel" />
                    </CardContent>
                </Card>

                {/* 4. VODAFONE */}
                <Card
                    className={cn(
                        "group relative overflow-hidden transition-all duration-300 border-2 cursor-pointer hover:shadow-lg",
                        platformStates.vodafone.enabled ? "border-red-500 bg-red-50/30" : "border-transparent hover:border-red-100"
                    )}
                    onClick={() => openModal("vodafone", "VODAFONE")}
                >
                    <div className="absolute top-0 right-0 p-4">
                        <div
                            onClick={(e) => { e.stopPropagation(); togglePlatform("vodafone"); }}
                            className="transition-transform hover:scale-110"
                        >
                            {platformStates.vodafone.enabled
                                ? <CheckCircle2 className="h-8 w-8 text-red-600 fill-red-100" />
                                : <Circle className="h-8 w-8 text-gray-300 hover:text-gray-400" />
                            }
                        </div>
                    </div>
                    <CardContent className="p-6 pt-8">
                        <div className="h-14 w-14 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-red-200 shadow-md">
                            V
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 mb-1">VODAFONE</h3>
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                            <Smartphone className="h-3 w-3" /> Telecomunicaciones
                        </p>

                        <CompanyStatsList id="vodafone" />
                    </CardContent>
                </Card>

                {/* 5. AGUAS BCN */}
                <Card
                    className={cn(
                        "group relative overflow-hidden transition-all duration-300 border-2 cursor-pointer hover:shadow-lg",
                        platformStates.aguas_bcn.enabled ? "border-cyan-500 bg-cyan-50/30" : "border-transparent hover:border-cyan-100"
                    )}
                    onClick={() => openModal("aguas_bcn", "AGUAS DE BARCELONA")}
                >
                    <div className="absolute top-0 right-0 p-4">
                        <div
                            onClick={(e) => { e.stopPropagation(); togglePlatform("aguas_bcn"); }}
                            className="transition-transform hover:scale-110"
                        >
                            {platformStates.aguas_bcn.enabled
                                ? <CheckCircle2 className="h-8 w-8 text-cyan-600 fill-cyan-100" />
                                : <Circle className="h-8 w-8 text-gray-300 hover:text-gray-400" />
                            }
                        </div>
                    </div>
                    <CardContent className="p-6 pt-8">
                        <div className="h-14 w-14 rounded-xl bg-cyan-500 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-cyan-200 shadow-md">
                            A
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 mb-1 truncate" title="Aguas de Barcelona">Aguas BCN</h3>
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                            <Droplet className="h-3 w-3" /> Agua
                        </p>

                        <CompanyStatsList id="aguas_bcn" />
                    </CardContent>
                </Card>

                {/* 6. PROSEGUR */}
                <Card
                    className={cn(
                        "group relative overflow-hidden transition-all duration-300 border-2 cursor-pointer hover:shadow-lg",
                        platformStates.prosegur.enabled ? "border-yellow-500 bg-yellow-50/30" : "border-transparent hover:border-yellow-100"
                    )}
                    onClick={() => openModal("prosegur", "PROSEGUR")}
                >
                    <div className="absolute top-0 right-0 p-4">
                        <div
                            onClick={(e) => { e.stopPropagation(); togglePlatform("prosegur"); }}
                            className="transition-transform hover:scale-110"
                        >
                            {platformStates.prosegur.enabled
                                ? <CheckCircle2 className="h-8 w-8 text-yellow-600 fill-yellow-100" />
                                : <Circle className="h-8 w-8 text-gray-300 hover:text-gray-400" />
                            }
                        </div>
                    </div>
                    <CardContent className="p-6 pt-8">
                        <div className="h-14 w-14 rounded-xl bg-yellow-400 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-yellow-200 shadow-md">
                            P
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 mb-1">PROSEGUR</h3>
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Seguridad
                        </p>

                        <CompanyStatsList id="prosegur" />
                    </CardContent>
                </Card>

                {/* 7. ENERGIA XXI */}
                <Card
                    className={cn(
                        "group relative overflow-hidden transition-all duration-300 border-2 cursor-pointer hover:shadow-lg",
                        platformStates.energia_xxi.enabled ? "border-pink-500 bg-pink-50/30" : "border-transparent hover:border-pink-100"
                    )}
                    onClick={() => openModal("energia_xxi", "ENERGÍA XXI")}
                >
                    <div className="absolute top-0 right-0 p-4">
                        <div
                            onClick={(e) => { e.stopPropagation(); togglePlatform("energia_xxi"); }}
                            className="transition-transform hover:scale-110"
                        >
                            {platformStates.energia_xxi.enabled
                                ? <CheckCircle2 className="h-8 w-8 text-pink-600 fill-pink-100" />
                                : <Circle className="h-8 w-8 text-gray-300 hover:text-gray-400" />
                            }
                        </div>
                    </div>
                    <CardContent className="p-6 pt-8">
                        <div className="h-14 w-14 rounded-xl bg-pink-500 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-pink-200 shadow-md">
                            E
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 mb-1">ENERGÍA XXI</h3>
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Electricidad
                        </p>

                        <CompanyStatsList id="energia_xxi" />
                    </CardContent>
                </Card>

            </div>

            <UserManagementModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                platformId={activePlatform?.id || null}
                platformName={activePlatform?.name || ""}
                users={activePlatform ? (platformUsers[activePlatform.id] || []) : []}
                onUpdateUsers={handleUpdateUsers}
            />
        </div>
    );
}
