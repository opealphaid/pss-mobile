import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import ModalPostConversation from "@/components/layouts/modalPostConversation";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import { IoMailOutline } from "react-icons/io5";
import { 
    AiOutlineFilePdf, 
    AiOutlineFileImage, 
    AiOutlineFileZip, 
    AiOutlineFileExcel, 
    AiOutlineFile, 
    AiOutlineClose, 
    AiOutlineCloudUpload,
    AiOutlineDownload,
    AiOutlineEye 
} from "react-icons/ai";
import { PATH_DOCUMENTS } from "@/components/utils/constants";
import Swal from "sweetalert2";
interface AdjuntoCorreo {
    id: string;
    nombreArchivo: string;
    tipoContenido: string;
    tamanio: number;
    fechaSubida: string;
    extension: string;
    esImagen: boolean;
    esPDF: boolean;
    tamanoFormateado: string;
}

export default function TicketDetails({ ticket }: { ticket: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mensajes, setMensajes] = useState<any[]>([]);
    const [mensajeActivo, setMensajeActivo] = useState<string | null>(null);
    const [documentos, setDocumentos] = useState<any[]>([]);
    const [documentosExtra, setDocumentosExtra] = useState<any[]>([]);
    const [archivos, setArchivos] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [adjuntosPorMensaje, setAdjuntosPorMensaje] = useState<Record<string, AdjuntoCorreo[]>>({});
    const [cargandoAdjuntos, setCargandoAdjuntos] = useState<Record<string, boolean>>({});
    const fetchAdjuntos = async (mensajeId: string) => {
        if (adjuntosPorMensaje[mensajeId]) return;
        
        setCargandoAdjuntos(prev => ({ ...prev, [mensajeId]: true }));
        
        try {
            const response = await fetch(`${PATH_URL_BACKEND}/adjuntos/mensaje/${mensajeId}`);
            if (!response.ok) throw new Error("Error al obtener adjuntos");
            
            const data: AdjuntoCorreo[] = await response.json();
            setAdjuntosPorMensaje(prev => ({ ...prev, [mensajeId]: data }));
        } catch (error) {
            console.error(`Error al obtener adjuntos del mensaje ${mensajeId}:`, error);
            setAdjuntosPorMensaje(prev => ({ ...prev, [mensajeId]: [] }));
        } finally {
            setCargandoAdjuntos(prev => ({ ...prev, [mensajeId]: false }));
        }
    };

    const fetchMensajes = useCallback(async () => {
        try {
            const response = await fetch(`${PATH_URL_BACKEND}/tickets/mensajes/${ticket.id}`);
            if (!response.ok) throw new Error("Error al obtener mensajes");
            const data = await response.json();
            const ordenados = data.sort(
                (a: any, b: any) => new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime()
            );
            setMensajes(ordenados);

            ordenados.forEach((msg: any) => {
                fetchAdjuntos(msg.id);
            });
        } catch (error) {
            console.error("Error al obtener mensajes:", error);
        }
    }, [ticket.id]);

    useEffect(() => {
        fetchMensajes();
    }, [fetchMensajes]);

    useEffect(() => {
        const fetchDocumentos = async () => {
            try {
                const res = await fetch(`${PATH_DOCUMENTS}/files/item/${ticket.id}/tipo/solicitante`);
                if (!res.ok) throw new Error("No se pudieron obtener los documentos");
                const data = await res.json();
                setDocumentos(data);
            } catch (err) {
                console.error("Error obteniendo documentos:", err);
            }
        };

        const fetchDocumentosExtra = async () => {
            try {
                const res = await fetch(`${PATH_DOCUMENTS}/files/item/${ticket.id}/tipo/ArchivosExtra`);
                if (!res.ok) throw new Error("No se pudieron obtener los documentos extra");
                const data = await res.json();
                setDocumentosExtra(data);
            } catch (err) {
                console.error("Error obteniendo documentos extra:", err);
            }
        };

        if (ticket?.id) {
            fetchDocumentos();
            fetchDocumentosExtra();
        }
    }, [ticket?.id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setArchivos(prev => [...prev, ...filesArray]);
        }
    };

    const esTicketFOI = (ticket: any) => {
        return ticket.formulario === "FOI-NSI-OO5";
    };

    const removeFile = (index: number) => {
        setArchivos(prev => prev.filter((_, i) => i !== index));
    };

    const subirArchivos = async () => {
        if (archivos.length === 0) return;

        setIsUploading(true);
        Swal.fire({
            title: "Subiendo archivos...",
            text: "Por favor espere mientras se suben los documentos.",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const errores: string[] = [];
        const token = localStorage.getItem("token");

        try {
            const promesas = archivos.map(async (archivo) => {
                const formData = new FormData();
                formData.append("file", archivo);
                formData.append("idItem", ticket.id);
                formData.append("entityType", "ArchivosExtra");

                try {
                    console.log("Subiendo archivo:", archivo.name);
                    const res = await fetch(`${PATH_DOCUMENTS}/files/upload`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`Error ${res.status}: ${errorText}`);
                    }

                    console.log(`Archivo ${archivo.name} subido correctamente`);
                    return { success: true, name: archivo.name };
                } catch (err: any) {
                    console.error(`Error subiendo ${archivo.name}:`, err);
                    errores.push(`❌ ${archivo.name}: ${err.message}`);
                    return { success: false, name: archivo.name, error: err.message };
                }
            });

            const resultados = await Promise.all(promesas);
            Swal.close();

            if (errores.length > 0) {
                await Swal.fire({
                    icon: "warning",
                    title: "Subida completada con errores",
                    html: [
                        `<p>Se subieron ${resultados.filter(r => r.success).length} de ${archivos.length} archivos.</p>`,
                        `<div class="text-left mt-3">${errores.join("<br>")}</div>`
                    ].join(""),
                    confirmButtonText: "Entendido"
                });
            } else {
                await Swal.fire({
                    icon: "success",
                    title: "¡Subida exitosa!",
                    text: `Todos los ${archivos.length} archivos se subieron correctamente.`,
                    confirmButtonText: "Entendido"
                });
            }

            const res = await fetch(`${PATH_DOCUMENTS}/files/item/${ticket.id}/tipo/ArchivosExtra`);
            if (res.ok) {
                const data = await res.json();
                setDocumentosExtra(data);
            }

            setArchivos([]);
        } catch (error: any) {
            console.error("Error general en subida de archivos:", error);
            Swal.close();
            await Swal.fire({
                icon: "error",
                title: "Error en la subida",
                text: `Ocurrió un error inesperado: ${error.message}`,
                confirmButtonText: "Entendido"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const renderFileIcon = (fileName: string, extension?: string, esPDF?: boolean, esImagen?: boolean) => {
        const nombre = fileName.toLowerCase();
        const ext = extension?.toLowerCase() || "";
        
        if (esPDF || ext === "pdf" || nombre.endsWith(".pdf")) {
            return <AiOutlineFilePdf className="text-red-500 text-xl" />;
        } else if (esImagen || ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif" || ext === "webp") {
            return <AiOutlineFileImage className="text-blue-500 text-xl" />;
        } else if (ext === "xlsx" || ext === "xls" || nombre.endsWith(".xlsx") || nombre.endsWith(".xls")) {
            return <AiOutlineFileExcel className="text-green-600 text-xl" />;
        } else if (ext === "zip" || ext === "rar" || nombre.endsWith(".zip") || nombre.endsWith(".rar")) {
            return <AiOutlineFileZip className="text-yellow-600 text-xl" />;
        }
        return <AiOutlineFile className="text-gray-500 text-xl" />;
    };

    const formatMensajeContenido = (contenido: string) => {
        if (!contenido) return "";
        
        return contenido
            .replace(/^"|"$/g, "") 
            .replace(/\\n/g, "\n");
    };

    const descargarAdjunto = (adjuntoId: string, nombreArchivo: string) => {
        const url = `${PATH_URL_BACKEND}/adjuntos/descargar/${adjuntoId}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const verAdjunto = (adjuntoId: string) => {
        const url = `${PATH_URL_BACKEND}/adjuntos/ver/${adjuntoId}`;
        window.open(url, '_blank');
    };

    return (
        <div className="mt-4 space-y-6">
            <div>
                <h4 className="text-base font-semibold text-firstColor mb-2">Descripción</h4>
                <p className="text-sm text-gray-800 bg-gray-100 p-3 rounded-md">{ticket.descripcion || "Sin descripción"}</p>
            </div>

            <div>
                {ticket.estado === "EN_PROGRESO" && (
                    <Button
                        variant="default"
                        onClick={() => setIsModalOpen(true)}
                        className="bg-firstColor hover:bg-secondColor"
                    >
                        Responder
                    </Button>
                )}
            </div>

            <div>
                <h3 className="text-lg font-semibold text-firstColor mb-2">Conversación</h3>
                <div className="space-y-2">
                    {mensajes.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay mensajes registrados.</p>
                    ) : (
                        mensajes.map((msg) => (
                            <div
                                key={msg.id}
                                className={`border rounded-md p-3 cursor-pointer transition-all ${
                                    mensajeActivo === msg.id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                                }`}
                                onClick={() => setMensajeActivo(mensajeActivo === msg.id ? null : msg.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm">
                                        <IoMailOutline className="text-green-600" />
                                        <span className="font-medium text-firstColor">{msg.nombre}</span>
                                        <span className="text-xs text-gray-500">{msg.correo}</span>
                                        {adjuntosPorMensaje[msg.id] && adjuntosPorMensaje[msg.id].length > 0 && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                📎 {adjuntosPorMensaje[msg.id].length}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(msg.fechaEnvio).toLocaleString()}
                                    </span>
                                </div>

                                {mensajeActivo === msg.id && (
                                    <div className="mt-2 space-y-3">
                                        <div className="text-sm text-gray-700 bg-gray-100 p-2 rounded whitespace-pre-line">
                                            {formatMensajeContenido(msg.contenido)}
                                        </div>

                                        {cargandoAdjuntos[msg.id] ? (
                                            <div className="text-sm text-gray-500 italic">
                                                Cargando adjuntos...
                                            </div>
                                        ) : adjuntosPorMensaje[msg.id] && adjuntosPorMensaje[msg.id].length > 0 && (
                                            <div className="border-t pt-3">
                                                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                                    Archivos adjuntos ({adjuntosPorMensaje[msg.id].length})
                                                </h5>
                                                <div className="space-y-2">
                                                    {adjuntosPorMensaje[msg.id].map((adjunto) => (
                                                        <div 
                                                            key={adjunto.id} 
                                                            className="flex items-center justify-between bg-white p-2 rounded border hover:bg-gray-50"
                                                        >
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                {renderFileIcon(
                                                                    adjunto.nombreArchivo, 
                                                                    adjunto.extension, 
                                                                    adjunto.esPDF, 
                                                                    adjunto.esImagen
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm text-gray-800 truncate">
                                                                        {adjunto.nombreArchivo}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {adjunto.tamanoFormateado}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 ml-2">
                                                                {(adjunto.esImagen || adjunto.esPDF) && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            verAdjunto(adjunto.id);
                                                                        }}
                                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                                        title="Ver archivo"
                                                                    >
                                                                        <AiOutlineEye className="text-lg" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        descargarAdjunto(adjunto.id, adjunto.nombreArchivo);
                                                                    }}
                                                                    className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                                                                    title="Descargar archivo"
                                                                >
                                                                    <AiOutlineDownload className="text-lg" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-firstColor mb-2">Propiedades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div className="break-words">
                        <strong>Estado:</strong> 
                        <span className="ml-2">{ticket.estado}</span>
                    </div>
                    
                    <div className="break-words">
                        <strong>Prioridad:</strong> 
                        <span className="ml-2">{ticket.prioridad?.nombre}</span>
                    </div>
                    
                    <div className="break-words">
                        <strong>Grupo:</strong> 
                        <span className="ml-2">{ticket.grupo}</span>
                    </div>
                    
                    <div className="break-words">
                        <strong>Ingeniero:</strong> 
                        <span className="ml-2">{ticket.tecnicoAsignado?.nombre} {ticket.tecnicoAsignado?.apellidos}</span>
                    </div>
                    
                    <div className="break-words">
                        <strong>Cuenta:</strong> 
                        <span className="ml-2">{ticket.solicitante?.empresa}</span>
                    </div>
                    
                    <div className="break-words">
                        <strong>Fecha de creación:</strong> 
                        <span className="ml-2">{new Date(ticket.fechaCreacion).toLocaleString()}</span>
                    </div>
                    
                    <div className="break-words">
                        <strong>Última actualización:</strong> 
                        <span className="ml-2">{new Date(ticket.fechaUltimoCambio).toLocaleString()}</span>
                    </div>
                    
                    <div className="break-words">
                        <strong>Categoría:</strong> 
                        <span className="ml-2">{ticket.categoria?.nombre}</span>
                    </div>
                    
                    <div className="break-words">
                        <strong>Subcategoría:</strong> 
                        <span className="ml-2">{ticket.subcategoria?.nombre || "No asignado"}</span>
                    </div>
                    
                    <div className="break-words">
                        <strong>Nro de Contrato:</strong> 
                        <span className="ml-2">{ticket.nroContrato || "N/A"}</span>
                    </div>
                    
                    <div className="break-words">
                        <strong>Regional:</strong> 
                        <span className="ml-2">{ticket.regional?.regional || "N/A"}</span>
                    </div>
                    
                    <div className="break-words">
                        <strong>Ciudad:</strong> 
                        <span className="ml-2">{ticket.regional?.nombre || "N/A"}</span>
                    </div>

                    {esTicketFOI(ticket) && (
                        <>
                            <div className="col-span-1 md:col-span-2 break-words">
                                <strong>Link Sharepoint:</strong> 
                                {ticket.linkSharepoint && ticket.linkSharepoint !== "N/A" ? (
                                    <a 
                                        href={ticket.linkSharepoint} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-600 hover:text-blue-800 underline break-all"
                                    >
                                        {ticket.linkSharepoint}
                                    </a>
                                ) : (
                                    <span className="ml-2">N/A</span>
                                )}
                            </div>
                            
                            <div className="break-words">
                                <strong>Productos:</strong> 
                                <span className="ml-2">{ticket.productos || "N/A"}</span>
                            </div>
                            
                            <div className="break-words">
                                <strong>Código CRM:</strong> 
                                <span className="ml-2">{ticket.codigoCRM || "N/A"}</span>
                            </div>
                            
                            <div className="break-words">
                                <strong>Precio Propuesta:</strong> 
                                <span className="ml-2">{ticket.precioEstimadoProspuesta || "N/A"}</span>
                            </div>
                            
                            <div className="break-words">
                                <strong>Fecha Tentativa:</strong> 
                                <span className="ml-2">{ticket.fechaTentativa || "N/A"}</span>
                            </div>
                            
                            <div className="col-span-1 md:col-span-2 break-words">
                                <strong>Requisitos de Soporte:</strong> 
                                <p className="ml-2 mt-1 whitespace-pre-wrap">{ticket.requisitosSoporte || "N/A"}</p>
                            </div>
                            
                            <div className="col-span-1 md:col-span-2 break-words">
                                <strong>Comentarios Adicionales:</strong> 
                                <p className="ml-2 mt-1 whitespace-pre-wrap">{ticket.comentariosAdicionales || "N/A"}</p>
                            </div>
                            
                            <div className="break-words">
                                <strong>Sitio:</strong> 
                                <span className="ml-2">{ticket.sitio || "N/A"}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {ticket.estado !== "RESUELTO" && (
                <div className="border rounded-md p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold text-firstColor mb-3">Agregar archivos adicionales</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar archivos
                        </label>
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center gap-2 hover:bg-gray-50">
                                <AiOutlineCloudUpload className="text-firstColor" />
                                <span>Seleccionar archivos</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    onChange={handleFileChange}
                                />
                            </label>
                            {archivos.length > 0 && (
                                <Button
                                    onClick={subirArchivos}
                                    disabled={isUploading}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isUploading ? "Subiendo..." : "Subir archivos"}
                                </Button>
                            )}
                        </div>
                    </div>

                    {archivos.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Archivos seleccionados ({archivos.length})</h4>
                            <ul className="space-y-2 max-h-40 overflow-y-auto">
                                {archivos.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                        <div className="flex items-center gap-2">
                                            {renderFileIcon(file.name)}
                                            <span className="text-sm text-gray-800 break-all">{file.name}</span>
                                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <AiOutlineClose />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {documentosExtra.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-firstColor mb-2">Documentos adicionales</h3>
                    <ul className="space-y-2 text-sm text-gray-800">
                        {documentosExtra.map((doc) => (
                            <li key={doc.id} className="flex items-center gap-2">
                                {renderFileIcon(doc.fileNameOriginal, doc.fileType)}
                                <a
                                    href={`${PATH_DOCUMENTS}/files/download/${doc.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 hover:underline break-all"
                                >
                                    {doc.fileNameOriginal}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <ModalPostConversation
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                ticketId={ticket.id}
                onSubmit={() => {
                    fetchMensajes();
                }}
            />
        </div>
    );
}