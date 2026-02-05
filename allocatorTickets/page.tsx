"use client";
import Header from "@/components/commons/header";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import TicketList from "@/components/admin/ticketList";
import TicketTable from "@/components/admin/ticketTable";
import TicketKanban from "@/components/admin/ticketKanban";
import { FaListUl, FaTableCells } from "react-icons/fa6";
import { PiKanbanFill } from "react-icons/pi";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import ModalCreateTicket from "@/components/layouts/ModalCreateTicket";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FilterX } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { IoSearch } from "react-icons/io5";
import ModalCreateTicketClient from "@/components/layouts/modalCreateTicketClient";
import AsyncSelect from 'react-select/async';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AllocatorTicketsPage() {
    const [vista, setVista] = useState("lista");
    const [estadoSeleccionado, setEstadoSeleccionado] = useState("EN_PROGRESO");
    const [tickets, setTickets] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalClientOpen, setIsModalClientOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [tipoTicket, setTipoTicket] = useState<"normal" | "foi">("normal");

    const [filtros, setFiltros] = useState({
        titulo: null as string | null,
        ingenieroid: null as string | null,
        categoriaid: null as string | null,
        prioridadId: "" as string,
        solicitanteid: null as string | null,
        ciudadid: null as string | null,
        estado: null as string | null,
        fechaApertura: null as string | null,
        fechaCierre: null as string | null,
        tipoCliente: null as string | null,
    });

    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [ingenieros, setIngenieros] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [prioridades, setPrioridades] = useState<any[]>([]);
    const [solicitantes, setSolicitantes] = useState<any[]>([]);
    const [ciudades, setCiudades] = useState<any[]>([]);

    const estados = [
        "Todos",
        "ABIERTO",
        "ACEPTADO",
        "ASIGNADO",
        "EN_PROGRESO",
        "RESUELTO",
        "ESCALADO",
        "ON_HOLD",
        "FABRICANTE",
    ];

    useEffect(() => {
        const role = Cookies.get("userRole");
        setUserRole(role || null);
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const ingenierosRes = await fetch(`${PATH_URL_BACKEND}/usuario/without/CLIENTE`);
                const ingenierosData = await ingenierosRes.json();
                setIngenieros(ingenierosData);

                const categoriasRes = await fetch(`${PATH_URL_BACKEND}/categorias`);
                const categoriasData = await categoriasRes.json();
                setCategorias(categoriasData);

                const prioridadesRes = await fetch(`${PATH_URL_BACKEND}/prioridades`);
                const prioridadesData = await prioridadesRes.json();
                setPrioridades(prioridadesData);

                const solicitantesRes = await fetch(`${PATH_URL_BACKEND}/usuario/all-users`);
                const solicitantesData = await solicitantesRes.json();
                setSolicitantes(solicitantesData);

                const ciudadesRes = await fetch(`${PATH_URL_BACKEND}/ciudad`);
                const ciudadesData = await ciudadesRes.json();
                setCiudades(ciudadesData);
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
            }
        };

        fetchInitialData();
    }, []);

    const fetchTickets = async () => {
        try {
            const supervisorId = Cookies.get("userId");
            if (!supervisorId) throw new Error("No se encontró el userId en las cookies");

            const body = {
                ...filtros,
                prioridadId: filtros.prioridadId ? Number(filtros.prioridadId) : null,
                estado: estadoSeleccionado === "Todos" ? null : estadoSeleccionado,
                ...(tipoTicket === "normal" && { tipoCliente: filtros.tipoCliente || null }),
            };

            const endpoint = tipoTicket === "normal"
                ? `${PATH_URL_BACKEND}/tickets/normal/sin-rol-filter/${supervisorId}`
                : `${PATH_URL_BACKEND}/tickets/foi/sin-rol-filter/${supervisorId}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error("Error al obtener tickets");

            const data = await response.json();
            const sortedTickets = data.sort((a: any, b: any) => {
                const dateA = new Date(a.fechaCreacion).getTime();
                const dateB = new Date(b.fechaCreacion).getTime();
                return dateB - dateA;
            });

            setTickets(sortedTickets);
        } catch (error) {
            console.error("Error al obtener tickets:", error);
        }
    };

    const limpiarFiltros = () => {
        setFiltros({
            titulo: null,
            ingenieroid: null,
            categoriaid: null,
            prioridadId: "",
            solicitanteid: null,
            ciudadid: null,
            estado: null,
            fechaApertura: null,
            fechaCierre: null,
            tipoCliente: null,
        });
        setEstadoSeleccionado("Todos");
    };

    const cambiarTipoTicket = (nuevoTipo: "normal" | "foi") => {
        setTipoTicket(nuevoTipo);
        limpiarFiltros();
    };

    useEffect(() => {
        fetchTickets();
    }, [filtros, estadoSeleccionado, tipoTicket]);

    const buscarSolicitantes = (inputValue: string) => {
        return new Promise<any[]>((resolve) => {
            setTimeout(() => {
                const filtered = solicitantes.filter(solicitante =>
                    `${solicitante.nombre} ${solicitante.apellidos}`.toLowerCase().includes(inputValue.toLowerCase()) ||
                    solicitante.email.toLowerCase().includes(inputValue.toLowerCase()))
                    .map(solicitante => ({
                        value: solicitante.id,
                        label: `${solicitante.nombre} ${solicitante.apellidos} (${solicitante.email})`
                    }));
                resolve(filtered);
            }, 300);
        });
    };

    const buscarIngenieros = (inputValue: string) => {
        return new Promise<any[]>((resolve) => {
            setTimeout(() => {
                const filtered = ingenieros.filter(ingeniero =>
                    `${ingeniero.nombre} ${ingeniero.apellidos}`.toLowerCase().includes(inputValue.toLowerCase()) ||
                    ingeniero.email.toLowerCase().includes(inputValue.toLowerCase()))
                    .map(ingeniero => ({
                        value: ingeniero.id,
                        label: `${ingeniero.nombre} ${ingeniero.apellidos} (${ingeniero.email})`
                    }));
                resolve(filtered);
            }, 300);
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-fifthColor">
            <Header />
            <main className="p-6 flex-1">
                <h1 className="text-2xl font-bold text-[#002B5B] mb-4">Gestión de tickets</h1>

                <Tabs defaultValue="normal" className="mb-6" onValueChange={(value) => cambiarTipoTicket(value as "normal" | "foi")}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="normal">Tickets normales</TabsTrigger>
                        <TabsTrigger value="foi">Tickets FOI</TabsTrigger>
                    </TabsList>

                    <TabsContent value="normal">
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex flex-wrap justify-between items-center gap-4 w-full">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <Input
                                            placeholder="Buscar tickets por título..."
                                            className="pl-10"
                                            value={filtros.titulo || ''}
                                            onChange={(e) => setFiltros({ ...filtros, titulo: e.target.value || null })}
                                        />
                                    </div>
                                    <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
                                        {mostrarFiltros ? "Ocultar filtros" : "Filtros avanzados"}
                                    </Button>
                                    {(filtros.ingenieroid || filtros.categoriaid || filtros.prioridadId ||
                                        filtros.solicitanteid || filtros.ciudadid || filtros.fechaApertura ||
                                        filtros.fechaCierre 
                                        || filtros.tipoCliente 
                                        ) && (
                                            <Button
                                                variant="ghost"
                                                onClick={limpiarFiltros}
                                                className="text-red-500"
                                            >
                                                <FilterX className="mr-2 h-4 w-4" />
                                                Limpiar filtros
                                            </Button>
                                        )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="capitalize">
                                                {estadoSeleccionado.toLowerCase().replaceAll("_", " ")}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {estados.map((estado) => (
                                                <DropdownMenuItem key={estado} onClick={() => setEstadoSeleccionado(estado)}>
                                                    {estado.toLowerCase().replaceAll("_", " ")}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant={vista === "tabla" ? "default" : "outline"} onClick={() => setVista("tabla")}>
                                        <FaTableCells className="mr-2" /> Tabla
                                    </Button>
                                    <Button variant={vista === "lista" ? "default" : "outline"} onClick={() => setVista("lista")}>
                                        <FaListUl className="mr-2" /> Lista
                                    </Button>
                                    <Button variant={vista === "kanban" ? "default" : "outline"} onClick={() => setVista("kanban")}>
                                        <PiKanbanFill className="mr-2" /> Kanban
                                    </Button>
                                </div>
                            </div>

                            {mostrarFiltros && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-md border">
                                    <div>
                                        <Label>Tipo de cliente</Label>
                                        <Select
                                            value={filtros.tipoCliente ?? undefined}
                                            onValueChange={(value) =>
                                                setFiltros({ ...filtros, tipoCliente: value === "all" ? null : value })
                                            }
                                        >
                                            <SelectTrigger><SelectValue placeholder="Seleccione tipo" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los tipos</SelectItem>
                                                <SelectItem value="INTERNO">Interno</SelectItem>
                                                <SelectItem value="EXTERNO">Externo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div> 

                                    <div>
                                        <Label>Ingeniero asignado</Label>
                                        <AsyncSelect
                                            cacheOptions
                                            defaultOptions={ingenieros.map(ingeniero => ({
                                                value: ingeniero.id,
                                                label: `${ingeniero.nombre} ${ingeniero.apellidos}`
                                            }))}
                                            loadOptions={buscarIngenieros}
                                            onChange={(selected) => setFiltros({
                                                ...filtros,
                                                ingenieroid: selected?.value || null
                                            })}
                                            placeholder="Buscar ingeniero..."
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            value={filtros.ingenieroid ? {
                                                value: filtros.ingenieroid,
                                                label: ingenieros.find(i => i.id === filtros.ingenieroid)?.nombre || 'Seleccionado'
                                            } : null}
                                            isClearable
                                        />
                                    </div>

                                    <div>
                                        <Label>Categoría</Label>
                                        <Select
                                            value={filtros.categoriaid ?? undefined}
                                            onValueChange={(value) =>
                                                setFiltros({ ...filtros, categoriaid: value === "all" ? null : value })
                                            }
                                        >
                                            <SelectTrigger><SelectValue placeholder="Seleccione categoría" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las categorías</SelectItem>
                                                {categorias.map((c) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Prioridad</Label>
                                        <Select
                                            value={filtros.prioridadId ?? undefined}
                                            onValueChange={(value) =>
                                                setFiltros({ ...filtros, prioridadId: value === "all" ? "" : value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione prioridad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las prioridades</SelectItem>
                                                {prioridades.map((p) => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                        {p.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Solicitante</Label>
                                        <AsyncSelect
                                            cacheOptions
                                            defaultOptions={solicitantes.map(solicitante => ({
                                                value: solicitante.id,
                                                label: `${solicitante.nombre} ${solicitante.apellidos}`
                                            }))}
                                            loadOptions={buscarSolicitantes}
                                            onChange={(selected) => setFiltros({
                                                ...filtros,
                                                solicitanteid: selected?.value || null
                                            })}
                                            placeholder="Buscar solicitante..."
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            value={filtros.solicitanteid ? {
                                                value: filtros.solicitanteid,
                                                label: solicitantes.find(s => s.id === filtros.solicitanteid)?.nombre || 'Seleccionado'
                                            } : null}
                                            isClearable
                                        />
                                    </div>

                                    <div>
                                        <Label>Ciudad</Label>
                                        <Select
                                            value={filtros.ciudadid ?? undefined}
                                            onValueChange={(value) =>
                                                setFiltros({ ...filtros, ciudadid: value === "all" ? null : value })
                                            }
                                        >
                                            <SelectTrigger><SelectValue placeholder="Seleccione ciudad" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las ciudades</SelectItem>
                                                {ciudades.map((c) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.nombre} ({c.regional})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Fecha de apertura desde</Label>
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !filtros.fechaApertura && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {filtros.fechaApertura
                                                            ? format(new Date(filtros.fechaApertura), "PPP")
                                                            : <span>Seleccione fecha</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={filtros.fechaApertura ? new Date(filtros.fechaApertura) : undefined}
                                                        onSelect={(date) => {
                                                            if (!date) {
                                                                setFiltros({ ...filtros, fechaApertura: null });
                                                                return;
                                                            }
                                                            const actual = filtros.fechaApertura ? new Date(filtros.fechaApertura) : null;
                                                            const value = actual && isSameDay(actual, date) ? null : date.toISOString();
                                                            setFiltros({ ...filtros, fechaApertura: value });
                                                        }}
                                                        initialFocus
                                                    />
                                                    {filtros.fechaApertura && (
                                                        <div className="border-t p-2">
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full"
                                                                onClick={() => setFiltros({ ...filtros, fechaApertura: null })}
                                                            >
                                                                <FilterX className="mr-2 h-4 w-4" />
                                                                Borrar fecha
                                                            </Button>
                                                        </div>
                                                    )}
                                                </PopoverContent>
                                            </Popover>
                                            {filtros.fechaApertura && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Limpiar fecha"
                                                    onClick={() => setFiltros({ ...filtros, fechaApertura: null })}
                                                    className="h-9 w-9"
                                                >
                                                    <FilterX className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Fecha de cierre hasta</Label>
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !filtros.fechaCierre && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {filtros.fechaCierre
                                                            ? format(new Date(filtros.fechaCierre), "PPP")
                                                            : <span>Seleccione fecha</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={filtros.fechaCierre ? new Date(filtros.fechaCierre) : undefined}
                                                        onSelect={(date) => {
                                                            if (!date) {
                                                                setFiltros({ ...filtros, fechaCierre: null });
                                                                return;
                                                            }
                                                            const actual = filtros.fechaCierre ? new Date(filtros.fechaCierre) : null;
                                                            const value = actual && isSameDay(actual, date) ? null : date.toISOString();
                                                            setFiltros({ ...filtros, fechaCierre: value });
                                                        }}
                                                        initialFocus
                                                    />
                                                    {filtros.fechaCierre && (
                                                        <div className="border-t p-2">
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full"
                                                                onClick={() => setFiltros({ ...filtros, fechaCierre: null })}
                                                            >
                                                                <FilterX className="mr-2 h-4 w-4" />
                                                                Borrar fecha
                                                            </Button>
                                                        </div>
                                                    )}
                                                </PopoverContent>
                                            </Popover>
                                            {filtros.fechaCierre && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Limpiar fecha"
                                                    onClick={() => setFiltros({ ...filtros, fechaCierre: null })}
                                                    className="h-9 w-9"
                                                >
                                                    <FilterX className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="foi">
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex flex-wrap justify-between items-center gap-4 w-full">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <Input
                                            placeholder="Buscar tickets FOI por título..."
                                            className="pl-10"
                                            value={filtros.titulo || ''}
                                            onChange={(e) => setFiltros({ ...filtros, titulo: e.target.value || null })}
                                        />
                                    </div>
                                    <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
                                        {mostrarFiltros ? "Ocultar filtros" : "Filtros avanzados"}
                                    </Button>
                                    {(filtros.ingenieroid || filtros.categoriaid || filtros.prioridadId ||
                                        filtros.solicitanteid || filtros.ciudadid || filtros.fechaApertura ||
                                        filtros.fechaCierre) && (
                                            <Button
                                                variant="ghost"
                                                onClick={limpiarFiltros}
                                                className="text-red-500"
                                            >
                                                <FilterX className="mr-2 h-4 w-4" />
                                                Limpiar filtros
                                            </Button>
                                        )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="capitalize">
                                                {estadoSeleccionado.toLowerCase().replaceAll("_", " ")}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {estados.map((estado) => (
                                                <DropdownMenuItem key={estado} onClick={() => setEstadoSeleccionado(estado)}>
                                                    {estado.toLowerCase().replaceAll("_", " ")}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="justify-right">
                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-firstColor text-white hover:bg-secondColor transition-colors font-bold"
                                    >
                                        Crear Ticket
                                    </Button>
                                    {userRole && ["SUPERADMIN", "ASIGNADOR", "TECNICO"].includes(userRole) && (
                                        <button
                                            onClick={() => setIsModalClientOpen(true)}
                                            className="ml-2 px-4 py-2 bg-firstColor text-white rounded-md hover:bg-secondColor transition-colors font-bold"
                                        >
                                            Crear Ticket para Cliente
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant={vista === "tabla" ? "default" : "outline"} onClick={() => setVista("tabla")}>
                                        <FaTableCells className="mr-2" /> Tabla
                                    </Button>
                                    <Button variant={vista === "lista" ? "default" : "outline"} onClick={() => setVista("lista")}>
                                        <FaListUl className="mr-2" /> Lista
                                    </Button>
                                    <Button variant={vista === "kanban" ? "default" : "outline"} onClick={() => setVista("kanban")}>
                                        <PiKanbanFill className="mr-2" /> Kanban
                                    </Button>
                                </div>
                            </div>

                            {mostrarFiltros && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-md border">
                                    {/* Filtros de FOI - NO incluye tipo de cliente */}
                                    <div>
                                        <Label>Ingeniero asignado</Label>
                                        <AsyncSelect
                                            cacheOptions
                                            defaultOptions={ingenieros.map(ingeniero => ({
                                                value: ingeniero.id,
                                                label: `${ingeniero.nombre} ${ingeniero.apellidos}`
                                            }))}
                                            loadOptions={buscarIngenieros}
                                            onChange={(selected) => setFiltros({
                                                ...filtros,
                                                ingenieroid: selected?.value || null
                                            })}
                                            placeholder="Buscar ingeniero..."
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            value={filtros.ingenieroid ? {
                                                value: filtros.ingenieroid,
                                                label: ingenieros.find(i => i.id === filtros.ingenieroid)?.nombre || 'Seleccionado'
                                            } : null}
                                            isClearable
                                        />
                                    </div>

                                    <div>
                                        <Label>Categoría</Label>
                                        <Select
                                            value={filtros.categoriaid ?? undefined}
                                            onValueChange={(value) =>
                                                setFiltros({ ...filtros, categoriaid: value === "all" ? null : value })
                                            }
                                        >
                                            <SelectTrigger><SelectValue placeholder="Seleccione categoría" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las categorías</SelectItem>
                                                {categorias.map((c) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Solicitante</Label>
                                        <AsyncSelect
                                            cacheOptions
                                            defaultOptions={solicitantes.map(solicitante => ({
                                                value: solicitante.id,
                                                label: `${solicitante.nombre} ${solicitante.apellidos}`
                                            }))}
                                            loadOptions={buscarSolicitantes}
                                            onChange={(selected) => setFiltros({
                                                ...filtros,
                                                solicitanteid: selected?.value || null
                                            })}
                                            placeholder="Buscar solicitante..."
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            value={filtros.solicitanteid ? {
                                                value: filtros.solicitanteid,
                                                label: solicitantes.find(s => s.id === filtros.solicitanteid)?.nombre || 'Seleccionado'
                                            } : null}
                                            isClearable
                                        />
                                    </div>

                                    <div>
                                        <Label>Ciudad</Label>
                                        <Select
                                            value={filtros.ciudadid ?? undefined}
                                            onValueChange={(value) =>
                                                setFiltros({ ...filtros, ciudadid: value === "all" ? null : value })
                                            }
                                        >
                                            <SelectTrigger><SelectValue placeholder="Seleccione ciudad" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las ciudades</SelectItem>
                                                {ciudades.map((c) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.nombre} ({c.regional})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Fecha de apertura desde</Label>
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !filtros.fechaApertura && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {filtros.fechaApertura
                                                            ? format(new Date(filtros.fechaApertura), "PPP")
                                                            : <span>Seleccione fecha</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={filtros.fechaApertura ? new Date(filtros.fechaApertura) : undefined}
                                                        onSelect={(date) => {
                                                            if (!date) {
                                                                setFiltros({ ...filtros, fechaApertura: null });
                                                                return;
                                                            }
                                                            const actual = filtros.fechaApertura ? new Date(filtros.fechaApertura) : null;
                                                            const value = actual && isSameDay(actual, date) ? null : date.toISOString();
                                                            setFiltros({ ...filtros, fechaApertura: value });
                                                        }}
                                                        initialFocus
                                                    />
                                                    {filtros.fechaApertura && (
                                                        <div className="border-t p-2">
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full"
                                                                onClick={() => setFiltros({ ...filtros, fechaApertura: null })}
                                                            >
                                                                <FilterX className="mr-2 h-4 w-4" />
                                                                Borrar fecha
                                                            </Button>
                                                        </div>
                                                    )}
                                                </PopoverContent>
                                            </Popover>
                                            {filtros.fechaApertura && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Limpiar fecha"
                                                    onClick={() => setFiltros({ ...filtros, fechaApertura: null })}
                                                    className="h-9 w-9"
                                                >
                                                    <FilterX className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Fecha de cierre hasta</Label>
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !filtros.fechaCierre && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {filtros.fechaCierre
                                                            ? format(new Date(filtros.fechaCierre), "PPP")
                                                            : <span>Seleccione fecha</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={filtros.fechaCierre ? new Date(filtros.fechaCierre) : undefined}
                                                        onSelect={(date) => {
                                                            if (!date) {
                                                                setFiltros({ ...filtros, fechaCierre: null });
                                                                return;
                                                            }
                                                            const actual = filtros.fechaCierre ? new Date(filtros.fechaCierre) : null;
                                                            const value = actual && isSameDay(actual, date) ? null : date.toISOString();
                                                            setFiltros({ ...filtros, fechaCierre: value });
                                                        }}
                                                        initialFocus
                                                    />
                                                    {filtros.fechaCierre && (
                                                        <div className="border-t p-2">
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full"
                                                                onClick={() => setFiltros({ ...filtros, fechaCierre: null })}
                                                            >
                                                                <FilterX className="mr-2 h-4 w-4" />
                                                                Borrar fecha
                                                            </Button>
                                                        </div>
                                                    )}
                                                </PopoverContent>
                                            </Popover>
                                            {filtros.fechaCierre && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Limpiar fecha"
                                                    onClick={() => setFiltros({ ...filtros, fechaCierre: null })}
                                                    className="h-9 w-9"
                                                >
                                                    <FilterX className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {vista === "lista" && <TicketList tickets={tickets} fetchTickets={fetchTickets} />}
                {vista === "tabla" && <TicketTable tickets={tickets} fetchTickets={fetchTickets} />}
                {vista === "kanban" && <TicketKanban tickets={tickets} fetchTickets={fetchTickets} />}
            </main>

            <ModalCreateTicket
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={() => {
                    fetchTickets();
                }}
            />
            <ModalCreateTicketClient
                isOpen={isModalClientOpen}
                onClose={() => setIsModalClientOpen(false)}
                onSubmit={() => {
                    fetchTickets();
                }}
            />
        </div>
    );
}