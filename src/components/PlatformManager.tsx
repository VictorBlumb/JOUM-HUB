import { useState } from "react";
import { Plus, Trash, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PlatformUser {
    id: string;
    username: string;
    lastSync: string;
    status: "active" | "error";
}

// Mock data generator
const MOCK_USERS: Record<string, PlatformUser[]> = {
    "endesa": [
        { id: "1", username: "facturacion@empresa.com", lastSync: "Hace 2 horas", status: "active" },
        { id: "2", username: "admin.suministros", lastSync: "Hace 1 día", status: "error" }
    ],
    "iberdrola": [
        { id: "3", username: "oficina.central", lastSync: "Hace 5 mins", status: "active" }
    ]
};

export function PlatformManager({ platformId, platformName }: { platformId: string, platformName: string }) {
    const [users, setUsers] = useState<PlatformUser[]>(MOCK_USERS[platformId] || []);
    const [newUser, setNewUser] = useState("");

    const handleAddUser = () => {
        if (!newUser) return;
        setUsers([...users, {
            id: Math.random().toString(),
            username: newUser,
            lastSync: "Nunca",
            status: "active"
        }]);
        setNewUser("");
    };

    const handleDelete = (id: string) => {
        setUsers(users.filter(u => u.id !== id));
    };

    return (
        <div className="h-full flex flex-col">
            <SheetHeader className="mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-primary font-bold text-lg">
                        {platformName.charAt(0)}
                    </div>
                    <div>
                        <SheetTitle>Usuarios {platformName}</SheetTitle>
                        <SheetDescription>Gestiona las credenciales de acceso para {platformName}.</SheetDescription>
                    </div>
                </div>
            </SheetHeader>

            <div className="flex gap-2 mb-6">
                <Input
                    placeholder="Nuevo usuario / email"
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                    className="flex-1"
                />
                <Button onClick={handleAddUser} disabled={!newUser}>
                    <Plus className="h-4 w-4 mr-2" /> Añadir
                </Button>
            </div>

            <div className="flex-1 overflow-auto -mx-6 px-6">
                {users.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                        <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No hay usuarios configurados.</p>
                        <p className="text-sm">Añade uno para empezar a descargar.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="group">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 bg-blue-50">
                                                <AvatarFallback className="text-primary text-xs">
                                                    {user.username.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span>{user.username}</span>
                                                <span className="text-xs text-muted-foreground">Sync: {user.lastSync}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'active' ? 'outline' : 'destructive'} className={user.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : ""}>
                                            {user.status === 'active' ? "Conectado" : "Error"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(user.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className="mt-auto pt-6 border-t">
                <div className="bg-blue-50 rounded-lg p-4 flex gap-3 text-sm text-blue-900">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                    <p>Las credenciales se almacenan de forma segura y encriptada. El sistema solo las usa para la descarga automática.</p>
                </div>
            </div>
        </div>
    );
}
