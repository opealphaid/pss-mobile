"use client";

import { useState } from "react";
import { IoTicketOutline, IoSearch } from "react-icons/io5";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function TicketListInfo({ tickets }: { tickets: any[] }) {
    const [busqueda, setBusqueda] = useState("");

    const ticketsFiltrados = tickets.filter((ticket) =>
        ticket.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        ticket.id.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="relative w-full max-w-md mb-2">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                    placeholder="Buscar tickets..."
                    className="pl-10"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>
            {ticketsFiltrados.map((ticket) => (
                <div key={ticket.id} className="border border-gray-300 rounded p-2 bg-white hover:shadow-md transition-all">
                    <div className="flex items-start">
                        <IoTicketOutline className="text-yellow-600 mt-1 mr-2" />
                        <div className="flex-1">
                            <Link
                                href={`/ticketInfo/${ticket.id}`}
                                className="text-sm font-semibold text-firstColor hover:underline hover:text-blue-600"
                            >
                                #{ticket.id.slice(0, 4)} {ticket.titulo}
                            </Link>
                            <p className="text-xs text-gray-600 mt-0.5">
                                Último cambio:{" "}
                                {ticket.fechaUltimoCambio
                                    ? new Date(ticket.fechaUltimoCambio).toLocaleString()
                                    : "N/A"}
                            </p>
                            <p className="text-xs text-gray-600">
                                Solicitante: {ticket.solicitante?.nombre || "N/A"}
                            </p>
                            <div className="flex items-center text-xs text-gray-600 space-x-2 mt-0.5">
                                <span className="border border-yellow-400 bg-yellow-100 text-yellow-800 rounded px-1 py-0.5">
                                    Prioridad: {ticket.prioridad?.nombre || "N/A"}
                                </span>
                                <span className="border border-blue-400 bg-blue-100 text-blue-800 rounded px-1 py-0.5">
                                    Estado: {ticket.estado}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
