"use client";

import { useEffect, useState } from "react";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import Swal from "sweetalert2";
import { MdOutlineTaskAlt, MdCheck, MdClose, MdEdit } from "react-icons/md";
import ModalRegistryWorkByTicket from "@/components/layouts/ModalRegistryWorkByTicket";
import ModalSummaryRegistryWork from "@/components/layouts/modalSummaryRegistryWork";
import ModalEditRegistryWork from "@/components/layouts/modalEditRegistryWork";
import Cookies from "js-cookie";

export default function RegistryWorkByTicket({ ticketId }: { ticketId: string }) {
    const [registros, setRegistros] = useState([]);
    const [registrosPendientes, setRegistrosPendientes] = useState([]);
    const [registrosRechazados, setRegistrosRechazados] = useState([]);
    const [registrosAutorizados, setRegistrosAutorizados] = useState([]);
    const [duracionTotal, setDuracionTotal] = useState("0s");
    const [facturableLiteral, setDuracionFacturable] = useState("0s");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [selectedRegistroId, setSelectedRegistroId] = useState<string | null>(null);
    const [registroToEdit, setRegistroToEdit] = useState<any>(null);

    const formatDateWithTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const fetchRegistros = async () => {
        try {
            const res = await fetch(`${PATH_URL_BACKEND}/registro-trabajo/ticket/${ticketId}`);
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            const autorizados = data.filter((r: any) => r.estadoRegistro === "APROBADO");
            const pendientes = data.filter((r: any) => r.estadoRegistro === "PENDIENTE");
            const rechazados = data.filter((r: any) => r.estadoRegistro === "RECHAZADO");
            const autorizadosNuevos = data.filter((r: any) => r.estadoRegistro === "AUTORIZADO");

            setRegistros(autorizados);
            setRegistrosPendientes(pendientes);
            setRegistrosRechazados(rechazados);
            setRegistrosAutorizados(autorizadosNuevos);
        } catch (err: any) {
            console.error("Error al obtener registros:", err);
            Swal.fire("Error", err.message || "No se pudieron obtener los registros", "error");
        }
    };

    const fetchDuracionTotal = async () => {
        try {
            const res = await fetch(`${PATH_URL_BACKEND}/registro-trabajo/duracion-total/ticket/${ticketId}`);
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setDuracionTotal(data.duracionLiteral || "0s");
            setDuracionFacturable(data.facturableLiteral || "0s");
        } catch (err: any) {
            console.error("Error al obtener duración total:", err);
            Swal.fire("Error", err.message || "No se pudo obtener la duración total", "error");
        }
    };

    const refreshData = async () => {
        await fetchRegistros();
        await fetchDuracionTotal();
    };

    useEffect(() => {
        if (ticketId) {
            refreshData();
        }
    }, [ticketId]);

    const finalizarRegistro = async (registroId: string, registro: any) => {
        const now = new Date();
        const aprobadorId = Cookies.get("userId");

        if (!aprobadorId) {
            Swal.fire("Error", "No se pudo identificar al usuario que finaliza", "error");
            return;
        }

        const convertirAFormatoISO = (fechaStr: string) => {
            const fecha = new Date(fechaStr);
            const fechaGMT4 = new Date(fecha.getTime() - 4 * 60 * 60 * 1000);
            return fechaGMT4.toISOString();
        };

        let fechaInicioISO: string;
        let fechaFinISO: string;

        if (!registro.horaInicio) {
            const { value: formValues } = await Swal.fire({
                title: "Finalizar registro",
                html: `
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora de inicio</label>
                <input id="swal-hora-inicio" type="datetime-local" class="swal2-input" value="${now.toISOString().slice(0, 16)}" />
                <label class="block text-sm font-medium text-gray-700 mb-1 mt-2">Hora de finalización</label>
                <input id="swal-hora-fin" type="datetime-local" class="swal2-input" value="${now.toISOString().slice(0, 16)}" />
            `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "Finalizar",
                cancelButtonText: "Cancelar",
                preConfirm: () => {
                    const inicio = (document.getElementById("swal-hora-inicio") as HTMLInputElement).value;
                    const fin = (document.getElementById("swal-hora-fin") as HTMLInputElement).value;

                    if (!inicio || !fin) {
                        Swal.showValidationMessage("Debes ingresar ambas fechas");
                        return null;
                    }
                    if (new Date(inicio) >= new Date(fin)) {
                        Swal.showValidationMessage("La hora de inicio debe ser menor a la hora de fin");
                        return null;
                    }

                    return { inicio, fin };
                },
            });

            if (!formValues) return;

            fechaInicioISO = convertirAFormatoISO(formValues.inicio);
            fechaFinISO = convertirAFormatoISO(formValues.fin);

        } else {
            const horaInicioDefault = new Date(registro.horaInicio).toISOString().slice(0, 16);

            const { value: fechaFin } = await Swal.fire({
                title: "Finalizar registro",
                input: "datetime-local",
                inputLabel: "Selecciona la hora de finalización",
                inputValue: horaInicioDefault,
                inputAttributes: { required: "true" },
                showCancelButton: true,
                confirmButtonText: "Finalizar",
                cancelButtonText: "Cancelar",
            });

            if (!fechaFin) return;

            fechaInicioISO = new Date(new Date(registro.horaInicio).getTime() - 4 * 60 * 60 * 1000).toISOString();
            fechaFinISO = convertirAFormatoISO(fechaFin);
        }

        try {
            const res = await fetch(
                `${PATH_URL_BACKEND}/registro-trabajo/fin/${registroId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fechaInicio: fechaInicioISO,
                        fechaFin: fechaFinISO,
                        cerradoPor: aprobadorId,
                    }),
                }
            );

            if (!res.ok) throw new Error(await res.text());

            Swal.fire("¡Registro finalizado!", "La hora se ha registrado correctamente.", "success");
            await refreshData();
        } catch (err: any) {
            console.error(err);
            Swal.fire("Error", err.message || "No se pudo finalizar el registro", "error");
        }
    };

    const aprobarRegistro = async (registroId: string) => {
        const result = await Swal.fire({
            title: "¿Aprobar registro?",
            text: "¿Estás seguro de que deseas aprobar este registro de trabajo?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, aprobar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        const aprobadorId = Cookies.get("userId");
        if (!aprobadorId) {
            Swal.fire("Error", "No se pudo identificar al usuario aprobador", "error");
            return;
        }

        Swal.fire({
            title: "Procesando...",
            text: "Aprobando registro de trabajo",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const res = await fetch(
                `${PATH_URL_BACKEND}/registro-trabajo/aprobar/${registroId}/${aprobadorId}`,
                { method: "POST" }
            );

            const responseText = await res.text();

            if (!res.ok) {
                throw new Error(responseText || "Error al aprobar el registro");
            }

            Swal.close();
            Swal.fire({
                icon: "success",
                title: "¡Aprobado!",
                text: responseText || "El registro de trabajo ha sido aprobado correctamente.",
                confirmButtonText: "Entendido"
            });

            await refreshData();
        } catch (err: any) {
            Swal.close();
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message || "No se pudo aprobar el registro",
                confirmButtonText: "Entendido"
            });
        }
    };

    const rechazarRegistro = async (registroId: string) => {
        const result = await Swal.fire({
            title: "¿Rechazar registro?",
            text: "¿Estás seguro de que deseas rechazar este registro de trabajo?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, rechazar",
            cancelButtonText: "Cancelar",
            input: "textarea",
            inputLabel: "Motivo de rechazo",
            inputPlaceholder: "Ingresa el motivo del rechazo...",
            inputAttributes: {
                required: "true",
            },
        });

        if (!result.isConfirmed || !result.value) return;

        const motivoRechazo = encodeURIComponent(result.value);
        const rechazadoPor = Cookies.get("userId");
        if (!rechazadoPor) {
            Swal.fire("Error", "No se pudo identificar al usuario que rechaza", "error");
            return;
        }

        Swal.fire({
            title: "Procesando...",
            text: "Rechazando registro de trabajo",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const res = await fetch(
                `${PATH_URL_BACKEND}/registro-trabajo/rechazar/${registroId}/${rechazadoPor}?motivoRechazo=${motivoRechazo}`,
                { method: "POST" }
            );

            const responseText = await res.text();

            if (!res.ok) {
                throw new Error(responseText || "Error al rechazar el registro");
            }

            Swal.close();
            Swal.fire({
                icon: "success",
                title: "¡Rechazado!",
                text: responseText || "El registro de trabajo ha sido rechazado correctamente.",
                confirmButtonText: "Entendido"
            });

            await refreshData();
        } catch (err: any) {
            Swal.close();
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message || "No se pudo rechazar el registro",
                confirmButtonText: "Entendido"
            });
        }
    };

    const openEditModal = (registro: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setRegistroToEdit(registro);
        setIsEditModalOpen(true);
    };

    const openSummaryModal = (registroId: string) => {
        setSelectedRegistroId(registroId);
        setIsSummaryModalOpen(true);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <div className="flex justify-end mb-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-firstColor text-white rounded hover:bg-secondColor"
                    >
                        Agregar nuevo registro de trabajo
                    </button>
                </div>
                {/* <div className="mb-4 px-4 py-3 rounded-md bg-yellow-100 border border-yellow-300 text-yellow-800 animate-pulse text-sm shadow-sm">
                    Recuerde asignar un contrato al ticket para descontar las horas facturables.
                </div> */}

                {(registros.length > 0 || registrosAutorizados.length > 0) && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 ml-2 text-gray-800">
                            Registros aprobados y autorizados
                        </h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Ingeniero</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Inicio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Fin</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Duración</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Observación</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Facturable</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">

                                {registros.map((r: any, index) => (
                                    <tr
                                        key={`aprobado-${index}`}
                                        className="hover:bg-green-50 cursor-pointer"
                                        onClick={() => openSummaryModal(r.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{r.nombreTecnico}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.horaInicio ? formatDateWithTime(r.horaInicio) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.horaFin ? formatDateWithTime(r.horaFin) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{r.duracion_total}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{r.observacion}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.tipoRegistroTrabajo || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                                APROBADO
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {r.facturable
                                                ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Sí</span>
                                                : <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">No</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {!r.horaFin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        finalizarRegistro(r.id, r);
                                                    }}
                                                    title="Finalizar registro"
                                                    className="text-red-500 hover:text-red-800"
                                                >
                                                    <MdOutlineTaskAlt size={20} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {registrosAutorizados.map((r: any, index) => (
                                    <tr
                                        key={`autorizado-${index}`}
                                        className="hover:bg-blue-50 cursor-pointer"
                                        onClick={() => openSummaryModal(r.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{r.nombreTecnico}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.horaInicio ? formatDateWithTime(r.horaInicio) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.horaFin ? formatDateWithTime(r.horaFin) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{r.duracion_total}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{r.observacion}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.tipoRegistroTrabajo || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                                AUTORIZADO
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {r.facturable
                                                ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Sí</span>
                                                : <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">No</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                {!r.horaFin && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            finalizarRegistro(r.id, r);
                                                        }}
                                                        title="Finalizar registro"
                                                        className="text-red-500 hover:text-red-800"
                                                    >
                                                        <MdOutlineTaskAlt size={20} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => openEditModal(r, e)}
                                                    title="Editar solicitud"
                                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100"
                                                >
                                                    <MdEdit size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {(registrosPendientes.length > 0 || registrosRechazados.length > 0) && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 ml-2 text-gray-800">Solicitudes pendientes y rechazadas</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-orange-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Ingeniero</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Inicio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Fin</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Duración</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Observación</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Facturable</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Registros Pendientes */}
                                {registrosPendientes.map((r: any, index) => (
                                    <tr
                                        key={`pendiente-${index}`}
                                        className="hover:bg-orange-50 cursor-pointer"
                                        onClick={() => openSummaryModal(r.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{r.nombreTecnico}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.horaInicio ? formatDateWithTime(r.horaInicio) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.horaFin ? formatDateWithTime(r.horaFin) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{r.duracion_total}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{r.observacion}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.tipoRegistroTrabajo || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                                                PENDIENTE
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {r.facturable
                                                ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Sí</span>
                                                : <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">No</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        aprobarRegistro(r.id);
                                                    }}
                                                    title="Aprobar registro"
                                                    className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-100"
                                                >
                                                    <MdCheck size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        rechazarRegistro(r.id);
                                                    }}
                                                    title="Rechazar registro"
                                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
                                                >
                                                    <MdClose size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {registrosRechazados.map((r: any, index) => (
                                    <tr
                                        key={`rechazado-${index}`}
                                        className="hover:bg-red-50 cursor-pointer"
                                        onClick={() => openSummaryModal(r.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{r.nombreTecnico}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.horaInicio ? formatDateWithTime(r.horaInicio) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.horaFin ? formatDateWithTime(r.horaFin) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{r.duracion_total}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{r.observacion}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.tipoRegistroTrabajo || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                                                RECHAZADO
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {r.facturable
                                                ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Sí</span>
                                                : <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">No</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={(e) => openEditModal(r, e)}
                                                title="Editar solicitud"
                                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100"
                                            >
                                                <MdEdit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="min-w-full px-6 py-4 bg-white border-t text-sm text-gray-700">
                    Total trabajado: {duracionTotal} | Total facturable: {facturableLiteral}
                </div>
            </div>

            <ModalRegistryWorkByTicket
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                idTicket={ticketId}
                refresh={refreshData}
            />

            <ModalEditRegistryWork
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setRegistroToEdit(null);
                }}
                registro={registroToEdit}
                refresh={refreshData}
            />

            <ModalSummaryRegistryWork
                isOpen={isSummaryModalOpen}
                onClose={() => setIsSummaryModalOpen(false)}
                registroId={selectedRegistroId}
                refreshParent={refreshData}
            />
        </div>
    );
}