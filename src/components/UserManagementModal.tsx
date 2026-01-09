import { useState, useMemo, useEffect } from "react";
import { Plus, Trash, User, Search, Play, CircleOff, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    type RowSelectionState
} from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
// New Imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Import Constants from Dashboard (Assuming they are exported, strictly we should move to shared file but importing from Dashboard works if cyclic dep handled, or duplicate)
// To avoid circular dependency issues if Dashboard imports UserManagementModal, it's safer to redefine or accept props.
// But Dashboard passes 'users'. UserManagementModal doesn't strictly need to know the global list of companies if we derive it?
// Requirement says "4 Secciones". Let's define them here too or pass as props. 
// Passing as props is cleaner but I'll define locally for speed as they are constant.
const COMPANIES = [
    "JOUM DESARROLLOS S.L.",
    "NOMADA DESARROLLOS S.L.",
    "ROCENARRO S.S.",
    "FICHIMA BUSINESS S.L."
] as const;

export interface PlatformUser {
    id: string;
    username: string;
    password?: string;
    company: string; // New Field
    lastSync: string;
    status: "active" | "error" | "inactive";
    active: boolean;
    luz?: boolean;
    gas?: boolean;
}

interface UserManagementModalProps {
    platformId: string | null;
    platformName: string;
    isOpen: boolean;
    onClose: () => void;
    users: PlatformUser[];
    onUpdateUsers: (users: PlatformUser[]) => void;
}

export function UserManagementModal({ platformId, platformName, isOpen, onClose, users, onUpdateUsers }: UserManagementModalProps) {
    const [globalFilter, setGlobalFilter] = useState("");

    // Add User Modal State
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserCompany, setNewUserCompany] = useState<string>("JOUM DESARROLLOS S.L.");
    const [showPassword, setShowPassword] = useState(false);

    // View State
    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(COMPANIES[0]);

    // Check Mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // --- Actions ---
    const handleAddUser = () => {
        if (!newUserEmail || !newUserPassword || !newUserCompany) return;
        const newUser: PlatformUser = {
            id: Math.random().toString(36).substr(2, 9),
            username: newUserEmail,
            password: newUserPassword,
            company: newUserCompany,
            lastSync: "Nunca",
            status: "active",
            active: true,
            luz: platformId === 'iberdrola',
            gas: false
        };
        onUpdateUsers([...users, newUser]);

        // Reset and close
        setNewUserEmail("");
        setNewUserPassword("");
        setShowPassword(false);
        setIsAddUserOpen(false);
        setActiveTab(newUserCompany); // Switch to the tab where user was added
    };

    // --- Table Component (Reusable) ---
    // We need a separate component or just render logic because each tab needs its own selection state? 
    // Or we share selection? If we share selection, deleting selected might cross tabs. 
    // Let's implement a sub-component for the UserTable to handle selection PER tab or Global. 
    // Global selection is easier to manage 'delete all selected'. 
    // BUT rendering requires filtering. 

    // Simplification: We will filter 'users' based on 'activeTab' and render the table.
    // Selection state needs to be persistent across tabs? Or clear on tab switch?
    // Clearing on tab switch is safer for UX to avoid accidental deletes.

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // Filter users for the current tab
    const currentTabUsers = useMemo(() => {
        return users.filter(u => u.company === activeTab);
    }, [users, activeTab]);

    const handleUpdateTabUsers = (updatedTabUsers: PlatformUser[]) => {
        // Merge updated tab users back into main users list
        const otherUsers = users.filter(u => u.company !== activeTab);
        onUpdateUsers([...otherUsers, ...updatedTabUsers]);
    };

    const handleDeleteSelected = () => {
        const selectedIds = Object.keys(rowSelection);
        const remainingTabUsers = currentTabUsers.filter(user => !rowSelection[user.id] && !selectedIds.includes(user.id));
        handleUpdateTabUsers(remainingTabUsers);
        setRowSelection({});
    };

    const handleToggleStatus = (activate: boolean) => {
        const selectedIds = new Set(Object.keys(rowSelection));
        const updatedTabUsers = currentTabUsers.map(user => {
            if (selectedIds.has(user.id)) {
                return { ...user, active: activate, status: activate ? "active" : "inactive" };
            }
            return user;
        });
        // Fixing type 'string' not assignable to 'active'|'inactive' etc if strictly typed?
        // status is "active"|"inactive"|"error".
        handleUpdateTabUsers(updatedTabUsers as PlatformUser[]);
        setRowSelection({});
    };

    const updateSingleUser = (id: string, updates: Partial<PlatformUser>) => {
        onUpdateUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    const columns = useMemo<ColumnDef<PlatformUser>[]>(() => {
        const baseCols: ColumnDef<PlatformUser>[] = [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "username",
                header: "Usuario / Email",
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-blue-50">
                            <AvatarFallback className="text-primary text-xs">
                                {row.original.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">{row.original.username}</span>
                            <span className="text-xs text-muted-foreground">Sync: {row.original.lastSync}</span>
                        </div>
                    </div>
                )
            },
        ];

        if (platformId === 'iberdrola') {
            baseCols.push({
                id: "services",
                header: "Servicios",
                cell: ({ row }) => (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={row.original.luz}
                                onCheckedChange={(c) => updateSingleUser(row.original.id, { luz: c })}
                                id={`luz-${row.original.id}`}
                            />
                            <label htmlFor={`luz-${row.original.id}`} className="text-sm flex items-center gap-1 cursor-pointer">⚡ Luz</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={row.original.gas}
                                onCheckedChange={(c) => updateSingleUser(row.original.id, { gas: c })}
                                id={`gas-${row.original.id}`}
                            />
                            <label htmlFor={`gas-${row.original.id}`} className="text-sm flex items-center gap-1 cursor-pointer">🔥 Gas</label>
                        </div>
                    </div>
                )
            });
            baseCols.push({
                accessorKey: "active",
                header: "Estado",
                cell: ({ row }) => (
                    <Badge
                        variant="outline"
                        className={cn("cursor-pointer select-none", row.original.active ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-600 border-slate-200")}
                        onClick={() => updateSingleUser(row.original.id, { active: !row.original.active })}
                    >
                        {row.original.active ? "Activo" : "Inactivo"}
                    </Badge>
                )
            });

        } else {
            baseCols.push({
                accessorKey: "active",
                header: "Estado",
                cell: ({ row }) => (
                    <Badge
                        variant="outline"
                        className={cn("cursor-pointer select-none", row.original.active ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-600 border-slate-200")}
                        onClick={() => updateSingleUser(row.original.id, { active: !row.original.active })}
                    >
                        {row.original.active ? "Activo" : "Inactivo"}
                    </Badge>
                )
            });
        }

        return baseCols;
    }, [platformId, users]); // Dependency on 'users' ensures updateSingleUser has latest closure

    const table = useReactTable({
        data: currentTabUsers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getRowId: row => row.id,
    });

    // Clear selection when changing tabs to avoid confusion
    useEffect(() => {
        setRowSelection({});
    }, [activeTab]);

    const selectedCount = Object.keys(rowSelection).length;

    const renderTableToolbarAndContent = () => (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filtrar por email..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Button onClick={() => setIsAddUserOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Añadir Usuario
                    </Button>
                </div>

                {/* Active Selection Actions */}
                {selectedCount > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-md text-sm animate-in fade-in slide-in-from-top-2">
                        <span className="font-medium px-2">{selectedCount} seleccionados</span>
                        <div className="h-4 w-px bg-gray-300 mx-2" />
                        <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDeleteSelected}>
                            <Trash className="h-3.5 w-3.5 mr-1.5" /> Eliminar
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8" onClick={() => handleToggleStatus(true)}>
                            <Play className="h-3.5 w-3.5 mr-1.5" /> Activar
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900" onClick={() => handleToggleStatus(false)}>
                            <CircleOff className="h-3.5 w-3.5 mr-1.5" /> Desactivar
                        </Button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto border rounded-md min-h-[300px]">
                {currentTabUsers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                        <User className="h-10 w-10 opacity-20 mb-2" />
                        <p>No hay usuarios en esta sección.</p>
                        <Button variant="link" className="mt-2" onClick={() => setIsAddUserOpen(true)}>+ Añadir primer usuario</Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-[900px] h-[750px] flex flex-col">
                    <DialogHeader className="mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-primary font-bold text-lg">
                                {platformName.charAt(0)}
                            </div>
                            <div>
                                <DialogTitle>Gestión de Usuarios - {platformName}</DialogTitle>
                                <DialogDescription>
                                    Gestiona los usuarios por Razón Social.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {isMobile ? (
                        <div className="flex-1 overflow-auto">
                            <Accordion type="single" collapsible value={activeTab} onValueChange={setActiveTab}>
                                {COMPANIES.map(company => (
                                    <AccordionItem key={company} value={company}>
                                        <AccordionTrigger>{company} ({users.filter(u => u.company === company).length})</AccordionTrigger>
                                        <AccordionContent>
                                            {/* Needed to set activeTab for logic to work? 
                                                 Yes, but Accordion renders all items? 
                                                 In Accordion, usually we render content inside the item. 
                                                 We need to update 'activeTab' when opening. 
                                                 Or just render logic inside safely.
                                                 Current `renderTableToolbarAndContent` relies on `activeTab`.
                                                 So we must ensure activeTab matches the Accordion Item.
                                             */}
                                            <div className="pb-4">
                                                {/* We are rendering the SAME table instance for the active tab. 
                                                     This might be efficient. */}
                                                {renderTableToolbarAndContent()}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                            <TabsList className="mb-4 w-full justify-start overflow-x-auto">
                                {COMPANIES.map(company => (
                                    <TabsTrigger key={company} value={company}>
                                        {company.replace(" S.L.", "").replace(" S.S.", "")}
                                        <Badge variant="secondary" className="ml-2 h-5 text-[10px] px-1.5">
                                            {users.filter(u => u.company === company).length}
                                        </Badge>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <TabsContent value={activeTab} className="flex-1 flex flex-col overflow-hidden mt-0">
                                {renderTableToolbarAndContent()}
                            </TabsContent>
                        </Tabs>
                    )}

                </DialogContent>
            </Dialog>

            {/* ADD USER MODAL */}
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
                        <DialogDescription>
                            Configura las credenciales y la Razón Social.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">

                        {/* Company Select */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="company" className="text-right">
                                Razón Social
                            </Label>
                            <div className="col-span-3">
                                <Select value={newUserCompany} onValueChange={setNewUserCompany}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona empresa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COMPANIES.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                                Usuario
                            </Label>
                            <Input
                                id="username"
                                placeholder="Email o Usuario"
                                className="col-span-3"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Contraseña
                            </Label>
                            <div className="col-span-3 relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pr-10"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddUser} disabled={!newUserEmail || !newUserPassword || !newUserCompany}>Añadir Usuario</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
