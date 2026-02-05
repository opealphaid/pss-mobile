"use client";

import { Card } from "@/components/ui/card";
import { FaPlay, FaCheck } from "react-icons/fa";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { useEffect, useState } from "react";
import { MdAssignmentInd } from "react-icons/md";
import ModalAssignTechnician from "@/components/layouts/modalAssignTechnician";
import { RiFileEditFill } from "react-icons/ri";
import ModalEditTicket from "@/components/layouts/modalEditTicket";
import ModalTransferTicket from "@/components/layouts/modalTransferTicket";
import { FaPeopleArrows } from "react-icons/fa";
import ModalTicketSurvey from "@/components/layouts/ModalTicketSurvey";
import { FcSurvey } from "react-icons/fc";
import { FaEye } from "react-icons/fa";
import ModalSurveyAnswer from "@/components/layouts/ModalSurveyAnswer";
import ModalAssignContract from "../../layouts/modalAssignContract";
import { SiGoogletasks } from "react-icons/si";
import { TbArrowAutofitContentFilled } from "react-icons/tb";
import ModalAssignTechnicianFoi from "@/components/FOI/modalAssignTechnicianFoi";
import ModalEditTicketFoi from "@/components/FOI/modalEditTicketFoi";
import ModalTransferTicketFoi from "@/components/FOI/modalTransferTicketFoi";

export default function TicketProperties({ ticket, fetchTicket }: { ticket: any, fetchTicket: () => void }) {
    const userRole = Cookies.get("userRole");
    const userId = Cookies.get("userId");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [ticketToEdit, setTicketToEdit] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [showSurveyButton, setShowSurveyButton] = useState(false);
    const [isSurveyAnswerModalOpen, setIsSurveyAnswerModalOpen] = useState(false);
    const [showSurveyAnswerButton, setShowSurveyAnswerButton] = useState(false);
    const [isTransferFoiModalOpen, setIsTransferFoiModalOpen] = useState(false);
    const [coSupervisores, setCoSupervisores] = useState<any[]>([]);
    const [puedeAutoasignarse, setPuedeAutoasignarse] = useState(false);
    const [defaultTecnicoId, setDefaultTecnicoId] = useState<string | null>(null);
    const [isEditFoiModalOpen, setIsEditFoiModalOpen] = useState(false);
    const [isFoiModalOpen, setIsFoiModalOpen] = useState(false);

    const esTicketFOI = (ticket: any) => {
        return ticket.formulario === "FOI-NSI-OO5";
    };

    const openFoiModal = (ticket: any) => {
        setSelectedTicket(ticket);
        setIsFoiModalOpen(true);
    };

    useEffect(() => {
        if (userRole === "TECNICO") {
            fetch(`${PATH_URL_BACKEND}/co-supervisores`)
                .then((res) => res.json())
                .then((data) => {
                    setCoSupervisores(data);
                    const coincide = data.includes(userId);
                    setPuedeAutoasignarse(coincide);
                })
                .catch((err) => {
                    Swal.fire("Error", "No se pudieron obtener los co-supervisores", "error");
                });
        }
    }, [userRole]);

    const autoasignarseTicket = async (ticket: any) => {
        const confirm = await Swal.fire({
            title: "¿Deseas autoasignarte este ticket?",
            text: "Esta acción lo asignará directamente a ti.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, autoasignarme",
            cancelButtonText: "Cancelar",
        });

        if (!confirm.isConfirmed) return;

        try {
            if (ticket.estado === "ABIERTO") {
                const supervisorId = Cookies.get("userId");
                const subcategoriaId = ticket.subcategoria?.id;
                const res = await fetch(`${PATH_URL_BACKEND}/grupo/pertenece-a/${supervisorId}`);
                if (!res.ok) throw new Error("Error al obtener grupos");

                const grupos = await res.json();
                const grupoMatch = grupos.find(grupo =>
                    grupo.subcategoriaList?.some(sub => sub.id === subcategoriaId)
                );
                if (!grupoMatch) throw new Error("No hay grupo compatible");

                const aceptar = await fetch(
                    `${PATH_URL_BACKEND}/tickets/tickets/${ticket.id}/aceptar?idSupervisor=${supervisorId}&idGrupo=${grupoMatch.id}`,
                    { method: "PUT", headers: { Accept: "text/plain" } }
                );
                if (!aceptar.ok) throw new Error("No se pudo aceptar el ticket");
            }

            const asignar = await fetch(
                `${PATH_URL_BACKEND}/tickets/${ticket.id}/asignar?tecnicoId=${userId}`,
                { method: "PUT" }
            );
            if (!asignar.ok) throw new Error("No se pudo autoasignar el ticket");

            const data = await asignar.json();
            Swal.fire(
                "Asignado",
                `Te asignaste correctamente al ticket "${data.titulo}".`,
                "success"
            );
            fetchTicket();

        } catch (error: any) {
            console.error("Error en autoasignación:", error);
            Swal.fire("Error", error.message || "Ocurrió un error", "error");
        }
    };

    const openModal = (ticket: any) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const [isAssignContractModalOpen, setIsAssignContractModalOpen] = useState(false);

    useEffect(() => {
        const checkSurveyConditions = async () => {
            if (ticket.estado === "RESUELTO" && ticket.solicitante?.id === userId) {
                try {
                    const response = await fetch(
                        `${PATH_URL_BACKEND}/tickets/survey-completed/${ticket.id}`
                    );

                    if (response.ok) {
                        const isCompleted = await response.json();
                        setShowSurveyButton(!isCompleted);
                    }
                } catch (error) {
                    console.error("Error al verificar estado de encuesta:", error);
                    setShowSurveyButton(false);
                }
            } else {
                setShowSurveyButton(false);
            }
        };

        checkSurveyConditions();
    }, [ticket, userId]);

    useEffect(() => {
        const checkSurveyConditions = async () => {
            if (ticket.estado === "RESUELTO" && ticket.solicitante?.id === userId) {
                try {
                    const response = await fetch(
                        `${PATH_URL_BACKEND}/tickets/survey-completed/${ticket.id}`
                    );

                    if (response.ok) {
                        const isCompleted = await response.json();
                        setShowSurveyButton(!isCompleted);
                    }
                } catch (error) {
                    console.error("Error al verificar estado de encuesta:", error);
                    setShowSurveyButton(false);
                }
            } else {
                setShowSurveyButton(false);
            }

            if ((userRole === "ASIGNADOR" || userRole === "SUPERADMIN") && ticket.estado === "RESUELTO") {
                try {
                    const response = await fetch(
                        `${PATH_URL_BACKEND}/tickets/survey-completed/${ticket.id}`
                    );

                    if (response.ok) {
                        const isCompleted = await response.json();
                        setShowSurveyAnswerButton(isCompleted);
                    }
                } catch (error) {
                    console.error("Error al verificar estado de encuesta:", error);
                    setShowSurveyAnswerButton(false);
                }
            } else {
                setShowSurveyAnswerButton(false);
            }
        };

        checkSurveyConditions();
    }, [ticket, userId, userRole]);

    const iniciarTicket = async (ticketId: string, titulo: string) => {
        const confirmacion = await Swal.fire({
            title: "¿Estás seguro?",
            text: `¿Deseas iniciar el trabajo en el ticket "${titulo}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, iniciar",
            cancelButtonText: "Cancelar",
        });

        if (!confirmacion.isConfirmed) return;

        Swal.fire({
            title: "Procesando...",
            text: "Iniciando el ticket...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const response = await fetch(
                `${PATH_URL_BACKEND}/tickets/${ticketId}/en-progreso?ticketId=${ticketId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Error al iniciar el ticket");
            }

            Swal.fire({
                title: "Éxito",
                text: "Ticket iniciado correctamente",
                icon: "success",
            });

            fetchTicket();
        } catch (error) {
            console.error("Error al iniciar ticket:", error);
            Swal.fire({
                title: "Error",
                text: error instanceof Error ? error.message : "Ocurrió un error inesperado",
                icon: "error",
            });
        }
    };

    const marcarComoResuelto = async (ticketId: string, titulo: string) => {
        const confirmacion = await Swal.fire({
            title: "¿Estás seguro?",
            text: `¿Deseas marcar como resuelto el ticket "${titulo}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, completar",
            cancelButtonText: "Cancelar",
        });

        if (!confirmacion.isConfirmed) return;

        Swal.fire({
            title: "Procesando...",
            text: "Marcando ticket como resuelto...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const response = await fetch(
                `${PATH_URL_BACKEND}/tickets/${ticketId}/resuelto?ticketId=${ticketId}&tecnicoId=${userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Error al marcar el ticket como resuelto");
            }

            Swal.fire({
                title: "Éxito",
                text: "Ticket marcado como resuelto correctamente",
                icon: "success",
            });

            fetchTicket();
        } catch (error: any) {
            console.error("Error al marcar ticket como resuelto:", error);
            Swal.fire({
                title: "Error",
                text: error.message || "Ocurrió un error inesperado",
                icon: "error",
            });
        }
    };

    const handleAceptar = async (ticket) => {
        const userRole = Cookies.get("userRole");
        const supervisorId = Cookies.get("userId");
        const subcategoriaId = ticket.subcategoria?.id;

        if (!subcategoriaId) {
            Swal.fire("Error", "Este ticket no tiene subcategoría definida", "error");
            return;
        }

        if (userRole === "SUPERADMIN") {
            try {
                const res = await fetch(`${PATH_URL_BACKEND}/grupo/por-subcategoria/${subcategoriaId}`);
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "No se pudieron obtener los grupos para esta subcategoría");
                }
                const grupos = await res.json();

                if (!grupos.length) {
                    Swal.fire("Error", "No hay grupos disponibles para esta subcategoría", "error");
                    return;
                }

                const { value: selectedGrupoId } = await Swal.fire({
                    title: "Seleccionar grupo",
                    input: "select",
                    inputOptions: grupos.reduce((acc, grupo) => {
                        acc[grupo.id] = `${grupo.nombre} - ${grupo.regional}`;
                        return acc;
                    }, {}),
                    inputPlaceholder: "Selecciona un grupo",
                    showCancelButton: true,
                    confirmButtonText: "Aceptar ticket",
                    cancelButtonText: "Cancelar"
                });

                if (!selectedGrupoId) return;

                Swal.fire({
                    title: "Procesando...",
                    text: "Aceptando el ticket...",
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });

                const responseAceptar = await fetch(
                    `${PATH_URL_BACKEND}/tickets/tickets/${ticket.id}/aceptar?idSupervisor=${supervisorId}&idGrupo=${selectedGrupoId}`,
                    {
                        method: "PUT",
                        headers: { 'Accept': 'text/plain' },
                    }
                );

                if (!responseAceptar.ok) {
                    const errorText = await responseAceptar.text();
                    throw new Error(errorText || "No se pudo aceptar el ticket");
                }

                const successMessage = await responseAceptar.text();
                Swal.fire("Éxito", successMessage || "Ticket aceptado correctamente", "success");
                fetchTicket();
            } catch (error: any) {
                console.error("Error al aceptar ticket (SUPERADMIN):", error);
                Swal.fire("Error", error.message || "Error desconocido", "error");
            }
        } else if (userRole === "ASIGNADOR" || userRole === "TECNICO") {
            const confirmacion = await Swal.fire({
                title: "¿Estás seguro?",
                text: `¿Quieres aceptar el ticket "${ticket.titulo}" solicitado por "${ticket.solicitante?.nombre}"?`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, aceptar",
                cancelButtonText: "Cancelar",
            });

            if (!confirmacion.isConfirmed) return;

            try {
                const responseGrupos = await fetch(`${PATH_URL_BACKEND}/grupo/pertenece-a/${supervisorId}`);
                if (!responseGrupos.ok) {
                    const text = await responseGrupos.text();
                    throw new Error(text || "Error al obtener grupos del supervisor");
                }

                const grupos = await responseGrupos.json();
                const { value: selectedGrupoId } = await Swal.fire({
                    title: "Seleccionar grupo para atender este ticket",
                    input: "select",
                    inputOptions: grupos.reduce((acc, grupo) => {
                        acc[grupo.id] = `${grupo.nombre} - ${grupo.regional}`;
                        return acc;
                    }, {}),
                    inputPlaceholder: "Selecciona un grupo",
                    showCancelButton: true,
                    confirmButtonText: "Aceptar ticket",
                    cancelButtonText: "Cancelar"
                });

                if (!selectedGrupoId) return;

                Swal.fire({
                    title: "Procesando...",
                    text: "Aceptando el ticket...",
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });

                const responseAceptar = await fetch(
                    `${PATH_URL_BACKEND}/tickets/tickets/${ticket.id}/aceptar?idSupervisor=${supervisorId}&idGrupo=${selectedGrupoId}`,
                    {
                        method: "PUT",
                        headers: { 'Accept': 'text/plain' },
                    }
                );

                if (!responseAceptar.ok) {
                    const errorText = await responseAceptar.text();
                    throw new Error(errorText || "No se pudo aceptar el ticket");
                }

                const successMessage = await responseAceptar.text();
                Swal.fire("Éxito", successMessage || "Ticket aceptado correctamente", "success");
                fetchTicket();
            } catch (error: any) {
                console.error("Error al aceptar ticket (ASIGNADOR o TECNICO):", error);
                Swal.fire("Error", error.message || "Error desconocido", "error");
            }
        }
    };

    return (
        <div className="bg-white rounded-md p-4 shadow-md">
            {((userRole === "TECNICO" && (ticket.estado === "ASIGNADO" || ticket.estado === "EN_PROGRESO" || ticket.estado === "ESCALADO")) ||
                (userRole === "ASIGNADOR" && ticket.estado === "ABIERTO") ||
                ((userRole === "ASIGNADOR" || userRole === "SUPERADMIN") && ticket.estado !== "ABIERTO" && !ticket.tecnicoAsignado) ||
                (["TECNICO", "ASIGNADOR", "SUPERADMIN"].includes(userRole) && ticket.estado === "ASIGNADO") || (userRole != "CLIENTE" && ticket.estado === "EN_PROGRESO") ||
                ((userRole === "SUPERADMIN" || userRole === "ASIGNADOR" || userRole === "TECNICO") && ticket.estado !== "RESUELTO") ||
                (userRole === "TECNICO" && ["ACEPTADO", "ABIERTO"].includes(ticket.estado) && puedeAutoasignarse)
            ) && (
                    <>
                        <h3 className="text-lg font-semibold text-[#002B5B] mb-3">Acciones</h3>
                        <div className="flex flex-wrap gap-2 mb-4">

                            {userRole !== "CLIENTE" && (ticket.estado === "ASIGNADO") && (
                                <button
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-lg"
                                    onClick={() => iniciarTicket(ticket.id, ticket.titulo)}
                                >
                                    <FaPlay size={28} /> Iniciar atención
                                </button>
                            )}

                            {userRole !== "CLIENTE" && ticket.estado === "EN_PROGRESO" && (
                                <button
                                    className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors text-lg"
                                    onClick={() => marcarComoResuelto(ticket.id, ticket.titulo)}
                                >
                                    <FaCheck size={28} /> Finalizar atención
                                </button>
                            )}

                            {esTicketFOI(ticket) && ticket.estado === "ABIERTO" && (
                                <>
                                    {(userRole === "ASIGNADOR" || userRole === "SUPERADMIN") && (
                                        <button
                                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors text-lg"
                                            title="Asignar Técnico FOI"
                                            onClick={() => openFoiModal(ticket)}
                                        >
                                            <MdAssignmentInd size={28} /> Asignar Técnico FOI
                                        </button>
                                    )}
                                </>
                            )}

                            {!esTicketFOI(ticket) && (
                                <>
                                    {(userRole === "ASIGNADOR" || userRole === "SUPERADMIN" || userRole === "TECNICO") &&
                                        ticket.estado === "ABIERTO" && (
                                            <button
                                                className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors text-lg"
                                                title="Aceptar ticket"
                                                onClick={() => handleAceptar(ticket)}
                                            >
                                                <IoIosCheckmarkCircle size={28} /> Aceptar Ticket
                                            </button>
                                        )}

                                    {(userRole === "ASIGNADOR" || userRole === "SUPERADMIN") &&
                                        ticket.estado !== "ABIERTO" &&
                                        !ticket.tecnicoAsignado && (
                                            <button
                                                className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors text-lg"
                                                title="Asignar Ingeniero"
                                                onClick={() => openModal(ticket)}
                                            >
                                                <MdAssignmentInd size={28} /> Asignar Ingeniero
                                            </button>
                                        )}
                                </>
                            )}

                            {(userRole === "ASIGNADOR" || userRole === "SUPERADMIN" || userRole === "TECNICO" ) && ticket.estado !== "RESUELTO" && (                                <button
                                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors text-lg"
                                    title="Editar ticket"
                                    onClick={() => {
                                        setTicketToEdit(ticket);
                                        if (ticket.formulario === "FOI-NSI-OO5") {
                                            setIsEditFoiModalOpen(true);
                                        } else {
                                            setIsEditModalOpen(true);
                                        }
                                    }}
                                >
                                    <RiFileEditFill size={28} /> Editar Ticket
                                </button>
                            )}

                            {["TECNICO", "ASIGNADOR", "SUPERADMIN"].includes(userRole) && ticket.estado === "ASIGNADO" && (
                                <button
                                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors text-lg"
                                    title="Traspasar ticket"
                                    onClick={() => {
                                        setSelectedTicket(ticket);
                                        if (ticket.formulario === "FOI-NSI-OO5") {
                                            setIsTransferFoiModalOpen(true);
                                        } else {
                                            setIsTransferModalOpen(true);
                                        }
                                    }}
                                >
                                    <FaPeopleArrows size={28} /> Transferir Ticket
                                </button>
                            )}

                            {userRole === "TECNICO" && ["ACEPTADO", "ABIERTO"].includes(ticket.estado) && puedeAutoasignarse && (
                                <button
                                    className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors text-lg"
                                    title="Autoasignarme"
                                    onClick={() => autoasignarseTicket(ticket)}
                                >
                                    <MdAssignmentInd size={28} /> Autoasignarme
                                </button>
                            )}

                            {userRole === "TECNICO" && ticket.estado === "ACEPTADO" && puedeAutoasignarse && (
                                <button
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-lg"
                                    title="Asignar a otro ingeniero"
                                    onClick={() => {
                                        setSelectedTicket(ticket);
                                        setDefaultTecnicoId(null);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <TbArrowAutofitContentFilled size={28} /> Asignar a otro ingeniero
                                </button>
                            )}

                        </div>
                        {/* {userRole === "SUPERADMIN" && ticket.estado !== "RESUELTO" && (
                            <div className="w-full">
                                <button
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors text-lg"
                                    title="Asignar contrato"
                                    onClick={() => {
                                        setSelectedTicket(ticket);
                                        setIsAssignContractModalOpen(true);
                                    }}
                                >
                                    <MdAssignmentInd size={28} /> Asignar contrato
                                </button>
                            </div>
                        )} */}
                    </>
                )}


            <div className="flex flex-wrap gap-2 mb-4">
                {showSurveyButton && (
                    <button
                        className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-400 transition-colors text-lg"
                        onClick={() => setIsSurveyModalOpen(true)}
                    >
                        <FcSurvey size={20} />
                        Responder Encuesta
                    </button>
                )}

                {showSurveyAnswerButton && (
                    <button
                        className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-400 transition-colors text-lg"
                        onClick={() => setIsSurveyAnswerModalOpen(true)}
                    >
                        <FaEye size={16} />
                        Ver Respuestas Encuesta
                    </button>
                )}
            </div>

            {ticket.tecnicoAsignado?.id === userId && (
                <div className="flex items-center text-emerald-600 gap-1 mt-1 text-sm">
                    <SiGoogletasks />
                    <span className="font-medium">Asignado a ti</span>
                </div>
            )}

            {esTicketFOI(ticket) && (
                <div className="mb-3">
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        Ticket FOI
                    </span>
                </div>
            )}

            <h3 className="text-lg font-semibold text-[#002B5B] mb-3">Propiedades</h3>
            <div className="text-sm text-gray-700 space-y-2">
                <div className="break-words">
                    <strong>Estado:</strong> 
                    <span className="ml-2">{ticket.estado}</span>
                </div>
                
                <div className="break-words">
                    <strong>Prioridad:</strong> 
                    <span className="ml-2">{ticket.prioridad?.nombre || "N/A"}</span>
                </div>
                
                <div className="break-words">
                    <strong>Grupo:</strong> 
                    <span className="ml-2">{ticket.grupo || "N/A"}</span>
                </div>
                
                <div className="break-words">
                    <strong>Ingeniero:</strong>{" "}
                    <span className="ml-2">
                        {ticket.tecnicoAsignado?.nombre && ticket.tecnicoAsignado?.apellidos
                            ? `${ticket.tecnicoAsignado.nombre} ${ticket.tecnicoAsignado.apellidos}`
                            : "N/A"}
                    </span>
                </div>
                
                <div className="break-words">
                    <strong>Cuenta:</strong> 
                    <span className="ml-2">{ticket.solicitante?.empresa || "N/A"}</span>
                </div>
                
                <div className="break-words">
                    <strong>Departamento solicitante:</strong> 
                    <span className="ml-2">{ticket.solicitante?.departamento || "N/A"}</span>
                </div>
                
                <div className="break-words">
                    <strong>Fecha creación:</strong> 
                    <span className="ml-2">{new Date(ticket.fechaCreacion).toLocaleString("es-BO")}</span>
                </div>
                
                <div className="break-words">
                    <strong>Última actualización:</strong> 
                    <span className="ml-2">{new Date(ticket.fechaUltimoCambio).toLocaleString("es-BO")}</span>
                </div>
                
                <div className="break-words">
                    <strong>Categoría:</strong> 
                    <span className="ml-2">{ticket.categoria?.nombre || "N/A"}</span>
                </div>
                
                <div className="break-words">
                    <strong>Subcategoría:</strong> 
                    <span className="ml-2">{ticket.subcategoria?.nombre || "N/A"}</span>
                </div>
                
                <div className="break-words">
                    <strong>Nro de Contrato:</strong> 
                    <span className="ml-2">{ticket.nroContrato || "N/A"}</span>
                </div>
                
                {esTicketFOI(ticket) && (
                    <div className="break-words">
                        <strong>Formulario:</strong> 
                        <span className="ml-2">{ticket.formulario || "N/A"}</span>
                    </div>
                )}
                
                {esTicketFOI(ticket) && (
                <div className="break-words">
                    <strong>Link Sharepoint:</strong> 
                    {ticket.linkSharepoint && ticket.linkSharepoint !== "N/A" ? (
                        <a 
                            href={ticket.linkSharepoint} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800 underline break-all block"
                        >
                            {ticket.linkSharepoint}
                        </a>
                    ) : (
                        <span className="ml-2">N/A</span>
                    )}
                </div>
                )}
            </div>

            <div className="mt-6">
                <h4 className="text-md font-semibold text-[#002B5B] mb-2">Solicitante</h4>
                <Card className="p-3 space-y-1 break-words">
                    <p><strong>Nombre:</strong> {ticket.solicitante?.nombre} {ticket.solicitante?.apellidoPaterno}</p>
                    <p><strong>Empresa:</strong> {ticket.solicitante?.empresa}</p>
                    <p className="break-all"><strong>Email:</strong> {ticket.solicitante?.email}</p>
                    <p><strong>Rol:</strong> {ticket.solicitante?.rol}</p>
                    <p><strong>Departamento:</strong> {ticket.solicitante?.departamento?.nombre || "N/A"}</p>
                </Card>
            </div>

            <ModalAssignTechnician
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                ticket={selectedTicket}
                fetchTickets={fetchTicket}
            />

            <ModalEditTicket
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                ticket={ticketToEdit}
                fetchTickets={fetchTicket}
            />
            <ModalTransferTicket
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                ticket={selectedTicket}
                fetchTickets={fetchTicket}
            />
            <ModalTicketSurvey
                isOpen={isSurveyModalOpen}
                onClose={() => setIsSurveyModalOpen(false)}
                ticketId={ticket.id}
                onSurveyComplete={() => {
                    fetchTicket();
                    setShowSurveyButton(false);
                }}
            />
            <ModalSurveyAnswer
                isOpen={isSurveyAnswerModalOpen}
                onClose={() => setIsSurveyAnswerModalOpen(false)}
                ticketId={ticket.id}
            />

            <ModalAssignContract
                isOpen={isAssignContractModalOpen}
                onClose={() => setIsAssignContractModalOpen(false)}
                ticket={selectedTicket}
            />

            <ModalEditTicketFoi
                isOpen={isEditFoiModalOpen}
                onClose={() => setIsEditFoiModalOpen(false)}
                ticket={ticketToEdit}
                fetchTickets={fetchTicket}
            />

            <ModalTransferTicketFoi
                isOpen={isTransferFoiModalOpen}
                onClose={() => setIsTransferFoiModalOpen(false)}
                ticket={selectedTicket}
                fetchTickets={fetchTicket}
            />

            <ModalAssignTechnicianFoi
                isOpen={isFoiModalOpen}
                onClose={() => setIsFoiModalOpen(false)}
                ticket={selectedTicket}
                fetchTickets={fetchTicket}
            />
        </div>
    );
}