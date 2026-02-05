"use client";
import { useEffect, useState } from "react";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { FaUserCircle } from "react-icons/fa";
import {
    FaUserPlus, FaShareSquare, FaReply, FaEnvelope, FaExchangeAlt,
    FaCheckCircle, FaEdit, FaSyncAlt, FaTrash, FaBell, FaSignInAlt,
    FaSignOutAlt, FaKey, FaPaperPlane, FaExclamationTriangle, FaCommentDots,
    FaThumbsUp, FaThumbsDown, FaClipboardCheck, FaSpinner, FaClipboardList,
    FaCheckDouble, FaArrowsAltH, FaCheck
} from "react-icons/fa";
import { IconType } from "react-icons";

interface Evento {
    id: string;
    ticketId: string;
    ticketTitulo: string;
    tipoEvento: string;
    descripcion: string;
    usuarioId: string;
    usuarioNombre: string;
    fechaEvento: string;
}

export default function TicketHistoricEvents() {
    const { id } = useParams();
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    const iconosPorTipo: Record<string, IconType> = {
        CREACION: FaUserPlus,
        ASIGNACION: FaShareSquare,
        RESPUESTA_INICIAL: FaReply,
        EN_PROGRESO: FaSpinner,
        MENSAJE: FaCommentDots,
        TRANSFERENCIA: FaExchangeAlt,
        CIERRE: FaCheckCircle,
        MODIFICACION: FaEdit,
        ACTUALIZACION: FaSyncAlt,
        ELIMINACION: FaTrash,
        TICKET_NOTIFICADO: FaBell,
        LOGIN_OK: FaSignInAlt,
        LOGIN_FAILED: FaSignOutAlt,
        RESET_PASSWORD: FaKey,
        CORREO_SEND: FaPaperPlane,
        MAILSEND_EXCEPTION: FaExclamationTriangle,
        MAILAUTH_EXCEPTION: FaExclamationTriangle,
        MESAGGIN_EXCEPTION: FaExclamationTriangle,
        EXCEPTION: FaExclamationTriangle,
        SOLICITUD_APROBACION: FaClipboardCheck,
        SOLICITUD_APROBADA: FaThumbsUp,
        SOLICITUD_RECHAZADA: FaThumbsDown,
        ENCUESTA_ENVIADA: FaClipboardList,
        ENCUESTA_COMPLETADA: FaCheckDouble,
        CAMBIO_DE_ESTADO: FaArrowsAltH,
        ACEPTADO: FaCheck
    };

    const coloresPorTipo: Record<string, string> = {
        CREACION: "text-blue-500",
        ASIGNACION: "text-indigo-500",
        RESPUESTA_INICIAL: "text-emerald-500",
        EN_PROGRESO: "text-amber-500",
        MENSAJE: "text-cyan-500",
        TRANSFERENCIA: "text-purple-500",
        CIERRE: "text-green-500",
        MODIFICACION: "text-yellow-500",
        ACTUALIZACION: "text-orange-500",
        ELIMINACION: "text-red-500",
        TICKET_NOTIFICADO: "text-pink-500",
        LOGIN_OK: "text-green-500",
        LOGIN_FAILED: "text-red-400",
        RESET_PASSWORD: "text-sky-500",
        CORREO_SEND: "text-teal-500",
        MAILSEND_EXCEPTION: "text-rose-500",
        MAILAUTH_EXCEPTION: "text-rose-500",
        MESAGGIN_EXCEPTION: "text-rose-500",
        EXCEPTION: "text-rose-500",
        SOLICITUD_APROBACION: "text-blue-600",
        SOLICITUD_APROBADA: "text-green-500",
        SOLICITUD_RECHAZADA: "text-red-500",
        ENCUESTA_ENVIADA: "text-violet-500",
        ENCUESTA_COMPLETADA: "text-green-600",
        CAMBIO_DE_ESTADO: "text-blue-400",
        ACEPTADO: "text-emerald-400"
    };

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                const res = await fetch(`${PATH_URL_BACKEND}/historico-ticket/${id}`);
                if (!res.ok) throw new Error("Error al obtener el historial");
                const data = await res.json();
                setEventos(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEventos();
    }, [id]);

    if (loading) return <p>Cargando historial...</p>;
    if (eventos.length === 0) return <p>No hay eventos registrados para este ticket.</p>;

    return (
        <div className="space-y-4">
            {eventos.map((evento) => {
                const IconComponent = iconosPorTipo[evento.tipoEvento];
                const colorClase = coloresPorTipo[evento.tipoEvento];

                return (
                    <div key={evento.id} className="bg-white p-4 rounded-md shadow-sm border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-primary flex items-center gap-2">
                                {IconComponent && (
                                    <IconComponent className={`text-lg ${colorClase}`} />
                                )}
                                {evento.tipoEvento.replaceAll("_", " ")}
                            </span>
                            <span className="text-xs text-gray-500">
                                {new Date(evento.fechaEvento).toLocaleString("es-BO")}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{evento.descripcion}</p>
                        <div className="flex items-center text-sm text-gray-600">
                            <FaUserCircle className="mr-2 text-xl text-gray-500" />
                            <span>{evento.usuarioNombre}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}