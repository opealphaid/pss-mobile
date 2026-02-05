"use client";

import Header from "../components/commons/header";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from 'next-intl';

export default function CustomerTicket() {
    const t = useTranslations('customerTicket');
    const [vista, setVista] = useState("lista");
    const [estadoSeleccionado, setEstadoSeleccionado] = useState("EN_PROGRESO");
    const [tickets, setTickets] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [tipoTicket, setTipoTicket] = useState<"normal" | "foi">("normal");
    const [showTabs, setShowTabs] = useState(false);
    const [filtros, setFiltros] = useState({
        titulo: null as string | null,
        categoriaid: null as string | null,
        prioridadId: "" as string,
        ciudadid: null as string | null,
        estado: null as string | null,
        fechaApertura: null as string | null,
        fechaCierre: null as string | null
    });
    const [categorias, setCategorias] = useState<any[]>([]);
    const [prioridades, setPrioridades] = useState<any[]>([]);
    const [ciudades, setCiudades] = useState<any[]>([]);

    const estados = [
        "Todos",
        "ABIERTO",
        "ACEPTADO",
        "ASIGNADO",
        "EN_PROGRESO",
        "RESUELTO",
    ];

    useEffect(() => {
        const userEmail = Cookies.get("email");
        if (userEmail && userEmail.endsWith("@alphasys.com.bo")) {
            setShowTabs(true);
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const categoriasRes = await fetch(`${PATH_URL_BACKEND}/categorias`);
                const categoriasData = await categoriasRes.json();
                setCategorias(categoriasData);

                const prioridadesRes = await fetch(`${PATH_URL_BACKEND}/prioridades`);
                const prioridadesData = await prioridadesRes.json();
                setPrioridades(prioridadesData);

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
            const userId = Cookies.get("userId");
            if (!userId) throw new Error("No se encontró el ID del usuario en cookies");

            const body = {
                ...filtros,
                prioridadId: tipoTicket === "normal" && filtros.prioridadId ? Number(filtros.prioridadId) : null,
                estado: estadoSeleccionado === "Todos" ? null : estadoSeleccionado
            };

            if (tipoTicket === "foi") {
                delete body.prioridadId;
            }

            const endpoint = tipoTicket === "normal"
                ? `${PATH_URL_BACKEND}/tickets/normal/cliente-filter/${userId}`
                : `${PATH_URL_BACKEND}/tickets/foi/cliente-filter/${userId}`;

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
            categoriaid: null,
            prioridadId: "",
            ciudadid: null,
            estado: null,
            fechaApertura: null,
            fechaCierre: null
        });
        setEstadoSeleccionado("Todos");
    };

    const cambiarTipoTicket = (nuevoTipo: "normal" | "foi") => {
        // Limpiar filtros al cambiar de tab
        limpiarFiltros();
        setTipoTicket(nuevoTipo);
    };

    useEffect(() => {
        fetchTickets();
    }, [filtros, estadoSeleccionado, tipoTicket]);

    return (
        <div className="flex flex-col min-h-screen bg-fifthColor">
            <Header />
            <main className="p-6 flex-1">
                <h1 className="text-2xl font-bold text-[#002B5B] mb-4">{t('title')}</h1>

                {/* Tabs para seleccionar tipo de ticket */}
                {showTabs && (
                    <Tabs value={tipoTicket} onValueChange={(value) => cambiarTipoTicket(value as "normal" | "foi")} className="mb-4">
                        <TabsList>
                            <TabsTrigger value="normal">{t('normalTickets')}</TabsTrigger>
                            <TabsTrigger value="foi">{t('foiTickets')}</TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}

                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-wrap justify-between items-center gap-4 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder={t('searchPlaceholder')}
                                    className="pl-10"
                                    value={filtros.titulo || ''}
                                    onChange={(e) => setFiltros({ ...filtros, titulo: e.target.value || null })}
                                />
                            </div>

                            <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
                                {mostrarFiltros ? t('hideFilters') : t('advancedFilters')}
                            </Button>

                            {(filtros.categoriaid || filtros.prioridadId ||
                                filtros.ciudadid || filtros.fechaApertura || filtros.fechaCierre) && (
                                    <Button variant="ghost" onClick={limpiarFiltros} className="text-red-500">
                                        <FilterX className="mr-2 h-4 w-4" />
                                        {t('clearFilters')}
                                    </Button>
                                )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="capitalize">
                                        {estadoSeleccionado === "Todos" ? t('all') :
                                         estadoSeleccionado === "ABIERTO" ? t('open') :
                                         estadoSeleccionado === "ACEPTADO" ? t('accepted') :
                                         estadoSeleccionado === "ASIGNADO" ? t('assigned') :
                                         estadoSeleccionado === "EN_PROGRESO" ? t('inProgress') :
                                         estadoSeleccionado === "RESUELTO" ? t('resolved') :
                                         estadoSeleccionado.toLowerCase().replaceAll("_", " ")}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setEstadoSeleccionado("Todos")}>
                                        {t('all')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEstadoSeleccionado("ABIERTO")}>
                                        {t('open')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEstadoSeleccionado("ACEPTADO")}>
                                        {t('accepted')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEstadoSeleccionado("ASIGNADO")}>
                                        {t('assigned')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEstadoSeleccionado("EN_PROGRESO")}>
                                        {t('inProgress')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEstadoSeleccionado("RESUELTO")}>
                                        {t('resolved')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-firstColor text-white hover:bg-secondColor transition-colors font-bold"
                            >
                                Crear Ticket
                            </Button> */}
                        </div>

                        <div className="flex gap-2">
                            <Button variant={vista === "tabla" ? "default" : "outline"} onClick={() => setVista("tabla")}>
                                <FaTableCells className="mr-2" /> {t('table')}
                            </Button>
                            <Button variant={vista === "lista" ? "default" : "outline"} onClick={() => setVista("lista")}>
                                <FaListUl className="mr-2" /> {t('list')}
                            </Button>
                        </div>
                    </div>

                    {mostrarFiltros && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-md border">
                            <div>
                                <Label>{t('category')}</Label>
                                <Select
                                    value={filtros.categoriaid ?? undefined}
                                    onValueChange={(value) =>
                                        setFiltros({ ...filtros, categoriaid: value === "all" ? null : value })
                                    }
                                >
                                    <SelectTrigger><SelectValue placeholder={t('selectCategory')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('allCategories')}</SelectItem>
                                        {categorias.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Ocultar select de prioridad para tickets FOI */}
                            {tipoTicket === "normal" && (
                                <div>
                                    <Label>{t('priority')}</Label>
                                    <Select
                                        value={filtros.prioridadId ?? undefined}
                                        onValueChange={(value) =>
                                            setFiltros({ ...filtros, prioridadId: value === "all" ? "" : value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectPriority')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('allPriorities')}</SelectItem>
                                            {prioridades.map((p) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div>
                                <Label>{t('city')}</Label>
                                <Select
                                    value={filtros.ciudadid ?? undefined}
                                    onValueChange={(value) =>
                                        setFiltros({ ...filtros, ciudadid: value === "all" ? null : value })
                                    }
                                >
                                    <SelectTrigger><SelectValue placeholder={t('selectCity')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('allCities')}</SelectItem>
                                        {ciudades.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.nombre} ({c.regional})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>{t('openDateFrom')}</Label>
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
                                                    : <span>{t('selectDate')}</span>}
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
                                                        {t('clearDate')}
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
                                <Label>{t('closeDateUntil')}</Label>
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
                                                    : <span>{t('selectDate')}</span>}
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
                                                        {t('clearDate')}
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
        </div>
    );
}