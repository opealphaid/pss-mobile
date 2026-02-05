"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import { PATH_DOCUMENTS } from "@/components/utils/constants";
import Select from "react-select";
import { FaSearch, FaCloudUploadAlt, FaTimes } from "react-icons/fa";

export default function ModalCreateTicketClientFoi({ isOpen, onClose, onSubmit }) {
    if (!isOpen) return null;

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [tecnologia, setTecnologia] = useState("");
    const [ubicacion, setUbicacion] = useState("");

    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState(null);
    const [loading, setLoading] = useState(false);
    const [solicitanteInfo, setSolicitanteInfo] = useState(null);
    const [loadingSolicitante, setLoadingSolicitante] = useState(false);
    const [ciudades, setCiudades] = useState([]);
    const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
    const [archivos, setArchivos] = useState<File[]>([]);
    const [usuariosConCopia, setUsuariosConCopia] = useState([]);
    const [copiasSeleccionadas, setCopiasSeleccionadas] = useState([]);


    const [textoEnNegrita, setTextoEnNegrita] = useState(false);
    const [textoEnCursiva, setTextoEnCursiva] = useState(false);
    const [textoSubrayado, setTextoSubrayado] = useState(false);

    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [loadingClientes, setLoadingClientes] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [codigoCrm, setCodigoCrm] = useState("");
    const [precioEstimadoPropuesto, setPrecioEstimadoPropuesto] = useState(0);
    const [requisitosSoporte, setRequisitosSoporte] = useState("");
    const [comentariosAdicionales, setComentariosAdicionales] = useState("");
    const [sitio, setSitio] = useState("");
    const [linkSharePoint, setLinkSharePoint] = useState("");
    const [fechaTentativa, setFechaTentativa] = useState("");

    useEffect(() => {
        const userData = {
            id: localStorage.getItem("id"),
            email: localStorage.getItem("email"),
            fullname: localStorage.getItem("fullname"),
            userRole: localStorage.getItem("userRole"),
            idDepartamento: localStorage.getItem("idDepartamento"),
        };

        if (userData.userRole === "CLIENTE" && userData.id) {
            fetchSolicitanteInfo(userData.id);
        } else {
            setSolicitanteInfo({
                nombre: userData.fullname,
                email: userData.email
            });
        }
    }, []);

    useEffect(() => {
        const fetchClientes = async () => {
            setLoadingClientes(true);
            try {
                const response = await fetch(`${PATH_URL_BACKEND}/usuario/all-users`);
                if (!response.ok) throw new Error("Error al obtener clientes");
                const data = await response.json();
                setClientes(data);
            } catch (error) {
                console.error("Error cargando clientes:", error);
                Swal.fire("Error", "No se pudieron cargar los clientes.", "error");
            } finally {
                setLoadingClientes(false);
            }
        };

        fetchClientes();
    }, []);

    const fetchSolicitanteInfo = async (userId) => {
        setLoadingSolicitante(true);
        try {
            const response = await fetch(`${PATH_URL_BACKEND}/usuario/${userId}`);
            if (!response.ok) throw new Error("Error al obtener información del solicitante");
            const data = await response.json();
            setSolicitanteInfo(data);
        } catch (error) {
            console.error("Error cargando información del solicitante:", error);
            Swal.fire("Error", "No se pudo cargar la información del solicitante.", "error");
        } finally {
            setLoadingSolicitante(false);
        }
    };

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const res = await fetch(`${PATH_URL_BACKEND}/usuario/without/CLIENTE`);
                if (!res.ok) throw new Error("Error al obtener usuarios");
                const data = await res.json();

                const opciones = data.map((user) => ({
                    value: user.id,
                    label: `${user.nombre} ${user.apellidos} (${user.email})`,
                }));

                setUsuariosConCopia(opciones);
            } catch (error) {
                console.error("Error cargando usuarios para copias:", error);
            }
        };

        fetchUsuarios();
    }, []);


    useEffect(() => {
        const fetchCategorias = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${PATH_URL_BACKEND}/categorias`);
                if (!response.ok) throw new Error("Error al obtener categorías");
                const data = await response.json();
                setCategorias(data.map(cat => ({ value: cat.id, label: cat.nombre })));
            } catch (error) {
                console.error("Error cargando categorías:", error);
                Swal.fire("Error", "No se pudieron cargar las categorías.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchCategorias();
    }, []);


    useEffect(() => {

        const fetchSubcategorias = async () => {
            if (!categoriaSeleccionada) {
                setSubcategorias([]);
                setSubcategoriaSeleccionada(null);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`${PATH_URL_BACKEND}/subcategorias/por-categoria/${categoriaSeleccionada}`);
                if (!response.ok) throw new Error("Error al obtener subcategorías");
                const data = await response.json();
                const newSubcategorias = data.map(sub => ({ value: sub.id, label: sub.nombre }));
                setSubcategorias(newSubcategorias);

                // Verificar si la subcategoría seleccionada todavía existe en la nueva lista
                if (subcategoriaSeleccionada && !newSubcategorias.some(item => item.value === subcategoriaSeleccionada)) {
                    setSubcategoriaSeleccionada(null);
                }
            } catch (error) {
                console.error("Error cargando subcategorías:", error);
                Swal.fire("Error", "No se pudieron cargar las subcategorías.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchSubcategorias();
    }, [categoriaSeleccionada]);

    useEffect(() => {
        const fetchCiudades = async () => {
            try {
                const response = await fetch(`${PATH_URL_BACKEND}/ciudad`);
                if (!response.ok) throw new Error("Error al obtener ciudades");
                const data = await response.json();
                setCiudades(data);
            } catch (error) {
                console.error("Error cargando ciudades:", error);
                Swal.fire("Error", "No se pudieron cargar las regiones.", "error");
            }
        };

        fetchCiudades();
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        setArchivos(prev => [...prev, ...files]);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        setArchivos(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setArchivos(prev => prev.filter((_, i) => i !== index));
    };


    const handleSubmit = async () => {
        if (
            !titulo || !descripcion ||
            !categoriaSeleccionada || !subcategoriaSeleccionada ||
            !ciudadSeleccionada || !clienteSeleccionado
        ) {
            Swal.fire("Campos incompletos", "Por favor, completa todos los campos requeridos.", "warning");
            return;
        }

        if (!codigoCrm || !linkSharePoint) {
            Swal.fire(
                "Campos obligatorios",
                "Código CRM y Link SharePoint no pueden estar vacíos.",
                "warning"
            );
            return;
        }

        const solicitanteExtraId = localStorage.getItem("userId");
        if (!solicitanteExtraId) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se encontró el ID del usuario. Por favor, vuelve a iniciar sesión.",
            });
            return;
        }

        const ticketData = {
            solicitanteId: clienteSeleccionado.id,
            titulo,
            descripcion,
            categoriaId: categoriaSeleccionada,
            subCategoriaId: subcategoriaSeleccionada,
            solicitanteExtraId,
            ciudadId: ciudadSeleccionada,
            fechaTentativa: (fechaTentativa || new Date().toISOString().split("T")[0]),
            usuariosANotificar: copiasSeleccionadas.map(opt => opt.value),
            codigoCrm,
            precioEstimadoPropuesto: Number(precioEstimadoPropuesto) || 0,
            requisitosSoporte: requisitosSoporte || descripcion,
            productos: tecnologia || "",
            comentariosAdicionales: comentariosAdicionales || "",
            sitio: sitio || ubicacion || "",
            linkSharePoint: linkSharePoint || "",
        };


        setLoading(true);

        try {
            console.log("ticketData enviado:", ticketData);

            const ticketsUrl = `${PATH_URL_BACKEND}/tickets/crear-foi`;

            const response = await fetch(ticketsUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(localStorage.getItem("token") && {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }),
                },
                body: JSON.stringify(ticketData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Respuesta del servidor:", response.status, errorText);
                Swal.fire({
                    icon: "error",
                    title: "Error al crear el ticket FOI",
                    text: errorText || "Ocurrió un error inesperado",
                });
                return;
            }

            const ticketCreado = await response.json();
            console.log("ID del ticket FOI creado:", ticketCreado.id);

            if (archivos.length > 0) {
                await subirArchivos(ticketCreado.id);
            }

            await Swal.fire({
                icon: "success",
                title: "¡Ticket FOI Creado!",
                text: "El ticket FOI ha sido registrado correctamente.",
            });

            onSubmit();
            onClose();

        } catch (error: any) {
            console.error("Error al crear ticket FOI:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `No se pudo crear el ticket FOI: ${error.message}`,
            });
        } finally {
            setLoading(false);
        }
    };

    const subirArchivos = async (ticketId: string) => {
        if (archivos.length === 0) return;
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
                formData.append("idItem", ticketId);
                formData.append("entityType", "solicitante");

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
                } catch (err) {
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
        } catch (error) {
            console.error("Error general en subida de archivos:", error);
            Swal.close();
            await Swal.fire({
                icon: "error",
                title: "Error en la subida",
                text: `Ocurrió un error inesperado: ${error.message}`,
                confirmButtonText: "Entendido"
            });
        }
    };


    const aplicarFormato = (tipo) => {
        let textArea = document.getElementById('descripcion-textarea');
        let start = textArea.selectionStart;
        let end = textArea.selectionEnd;
        let selectedText = descripcion.substring(start, end);
        let beforeText = descripcion.substring(0, start);
        let afterText = descripcion.substring(end);

        let formattedText = selectedText;

        switch (tipo) {
            case 'negrita':
                setTextoEnNegrita(!textoEnNegrita);
                formattedText = `**${selectedText}**`;
                break;
            case 'cursiva':
                setTextoEnCursiva(!textoEnCursiva);
                formattedText = `*${selectedText}*`;
                break;
            case 'subrayado':
                setTextoSubrayado(!textoSubrayado);
                formattedText = `__${selectedText}__`;
                break;
            default:
                break;
        }

        setDescripcion(beforeText + formattedText + afterText);
        setTimeout(() => {
            textArea.focus();
            textArea.setSelectionRange(start + formattedText.length, start + formattedText.length);
        }, 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-black">Crear Nuevo Ticket para Cliente</h2>
            </div>

            {/* Selector de Cliente */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Seleccionar Cliente</h3>

                <Select
                    value={clienteSeleccionado ? {
                        value: clienteSeleccionado.id,
                        label: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellidos} - ${clienteSeleccionado.email}`
                    } : null}
                    onChange={(selectedOption) => {
                        if (selectedOption) {
                            const selectedCliente = clientes.find(c => c.id === selectedOption.value);
                            setClienteSeleccionado(selectedCliente || null);
                        } else {
                            setClienteSeleccionado(null);
                        }
                    }}
                    options={clientes.map(cliente => ({
                        value: cliente.id,
                        label: `${cliente.nombre} ${cliente.apellidos} - ${cliente.email}`
                    }))}
                    placeholder="Buscar cliente..."
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "No hay clientes disponibles"}
                    loadingMessage={() => "Cargando clientes..."}
                    styles={{
                        control: (base) => ({
                            ...base,
                            border: 'none',
                            borderBottom: '2px solid #d1d5db',
                            borderRadius: '0',
                            boxShadow: 'none',
                            '&:hover': {
                                borderBottomColor: '#2563eb'
                            }
                        }),
                        option: (base, { isFocused }) => ({
                            ...base,
                            backgroundColor: isFocused ? '#f3f4f6' : 'white',
                            color: '#1f2937',
                            '&:active': {
                                backgroundColor: '#e5e7eb'
                            }
                        }),
                        menu: (base) => ({
                            ...base,
                            marginTop: '0',
                            borderRadius: '0.375rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }),
                        input: (base) => ({
                            ...base,
                            color: '#1f2937'
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: '#1f2937'
                        })
                    }}
                    components={{
                        DropdownIndicator: () => <FaSearch className="text-gray-400 mr-2" />,
                        IndicatorSeparator: null
                    }}
                    isDisabled={loadingClientes || clientes.length === 0}
                />

                {/* Mostrar info del cliente seleccionado */}
                {clienteSeleccionado && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Nombre:</p>
                            <p className="font-medium">{clienteSeleccionado.nombre} {clienteSeleccionado.apellidos}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email:</p>
                            <p className="font-medium">{clienteSeleccionado.email}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sección de datos principales */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Información del Ticket</h3>

                {/* Primera fila de campos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Ciudad/Regional */}
                    <div className="relative z-0 w-full group">
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600">
                            Ciudad/Regional<span className="text-red-500 ml-1">*</span>
                        </label>
                        <Select
                            value={ciudades.find(c => c.id === ciudadSeleccionada) ? {
                                value: ciudadSeleccionada,
                                label: `${ciudades.find(c => c.id === ciudadSeleccionada)?.nombre} (${ciudades.find(c => c.id === ciudadSeleccionada)?.regional})`
                            } : null}
                            onChange={(option) => setCiudadSeleccionada(option?.value || "")}
                            options={ciudades.map(ciudad => ({
                                value: ciudad.id,
                                label: `${ciudad.nombre} (${ciudad.regional})`
                            }))}
                            placeholder="Seleccionar ciudad..."
                            isSearchable
                            isClearable
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                                control: (base) => ({ ...base, marginTop: '20px', border: 'none', borderBottom: '2px solid #d1d5db', borderRadius: '0', boxShadow: 'none' }),
                                menuPortal: (base) => ({ ...base, zIndex: 9999 })
                            }}
                        />
                    </div>

                    {/* Categoría */}
                    <div className="relative z-0 w-full group">
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600">
                            Categoría<span className="text-red-500 ml-1">*</span>
                        </label>
                        <Select
                            value={categorias.find(c => c.value === categoriaSeleccionada) || null}
                            onChange={(option) => setCategoriaSeleccionada(option?.value || null)}
                            options={categorias}
                            placeholder="Seleccionar categoría..."
                            isSearchable
                            isClearable
                            isDisabled={loading || categorias.length === 0}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                                control: (base) => ({ ...base, marginTop: '20px', border: 'none', borderBottom: '2px solid #d1d5db', borderRadius: '0', boxShadow: 'none' }),
                                menuPortal: (base) => ({ ...base, zIndex: 9999 })
                            }}
                        />
                    </div>

                    {/* Subcategoría */}
                    <div className="relative z-0 w-full group">
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600">
                            Subcategoría<span className="text-red-500 ml-1">*</span>
                        </label>
                        <Select
                            value={subcategorias.find(s => s.value === subcategoriaSeleccionada) || null}
                            onChange={(option) => setSubcategoriaSeleccionada(option?.value || null)}
                            options={subcategorias}
                            placeholder="Seleccionar subcategoría..."
                            isSearchable
                            isClearable
                            isDisabled={loading || !categoriaSeleccionada || subcategorias.length === 0}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                                control: (base) => ({ ...base, marginTop: '20px', border: 'none', borderBottom: '2px solid #d1d5db', borderRadius: '0', boxShadow: 'none' }),
                                menuPortal: (base) => ({ ...base, zIndex: 9999 })
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="relative z-0 w-full group">
                        <input
                            type="text"
                            id="tecnologia"
                            className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            placeholder=" "
                            value={tecnologia}
                            onChange={(e) => setTecnologia(e.target.value)}
                        />
                        <label
                            htmlFor="tecnologia"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                            Tecnología
                        </label>
                    </div>

                    {/* Ubicación */}
                    <div className="relative z-0 w-full group">
                        <input
                            type="text"
                            id="ubicacion"
                            className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            placeholder=" "
                            value={ubicacion}
                            onChange={(e) => setUbicacion(e.target.value)}
                        />
                        <label
                            htmlFor="ubicacion"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                            Ubicación
                        </label>
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-10">
                    <div className="relative z-0 w-full group">
                        <input
                            type="text"
                            id="codigoCrm"
                            className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            placeholder=" "
                            value={codigoCrm}
                            onChange={(e) => setCodigoCrm(e.target.value)}
                            required
                        />
                        <label
                            htmlFor="codigoCrm"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                            Código CRM<span className="text-red-500 ml-1">*</span>
                        </label>
                    </div>

                    {/* Precio Estimado Propuesto */}
                    <div className="relative z-0 w-full group">
                        <input
                            type="number"
                            id="precioEstimado"
                            className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            placeholder=" "
                            value={precioEstimadoPropuesto}
                            onChange={(e) => setPrecioEstimadoPropuesto(Number(e.target.value))}
                        />
                        <label
                            htmlFor="precioEstimado"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                            Precio Estimado (Bs.)
                        </label>
                    </div>
                </div>

                {/* Fecha Tentativa */}
                <div className="mb-4">
                    <label className="text-sm text-gray-500 font-medium mb-2 block">
                        Fecha Tentativa
                    </label>
                    <input
                        type="date"
                        value={fechaTentativa}
                        onChange={(e) => setFechaTentativa(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                {/* Requisitos de Soporte */}
                <div className="mb-4">
                    <label className="text-sm text-gray-500 font-medium mb-2 block">
                        Requisitos de Soporte
                    </label>
                    <textarea
                        value={requisitosSoporte}
                        onChange={(e) => setRequisitosSoporte(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                    />
                </div>

                {/* Comentarios Adicionales */}
                <div className="mb-4">
                    <label className="text-sm text-gray-500 font-medium mb-2 block">
                        Comentarios Adicionales
                    </label>
                    <textarea
                        value={comentariosAdicionales}
                        onChange={(e) => setComentariosAdicionales(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                    />
                </div>

                {/* Sitio */}
                <div className="mb-4">
                    <label className="text-sm text-gray-500 font-medium mb-2 block">
                        Sitio
                    </label>
                    <input
                        type="text"
                        value={sitio}
                        onChange={(e) => setSitio(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Ubicación específica del sitio"
                    />
                </div>

                <div className="mb-6">
                    <label className="text-sm text-gray-500 font-medium mb-2 block">
                        Link SharePoint <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="text"
                        value={linkSharePoint}
                        onChange={(e) => setLinkSharePoint(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="https://sharepoint.com/..."
                        required
                    />
                </div>


            </div>

            {/* Asunto/Título del ticket */}
            <div className="mb-6">
                <div className="relative z-0 w-full group">
                    <input
                        type="text"
                        id="titulo"
                        className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                        placeholder=" "
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                    />
                    <label
                        htmlFor="titulo"
                        className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                        Asunto/Título del Ticket<span className="text-red-500 ml-1">*</span>
                    </label>
                </div>
            </div>

            {/* Descripción detallada */}
            <div className="mb-6">
                <label className="text-sm text-gray-500 font-medium mb-2 block">
                    Descripción detallada<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                    {/* Barra de herramientas del editor */}
                    <div className="bg-gray-50 border-b border-gray-300 p-1 flex gap-1">
                        <button
                            type="button"
                            onClick={() => aplicarFormato('negrita')}
                            className={`p-1 rounded hover:bg-gray-200 ${textoEnNegrita ? 'bg-gray-200' : ''}`}
                            title="Negrita"
                        >
                            <span className="font-bold">B</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => aplicarFormato('cursiva')}
                            className={`p-1 rounded hover:bg-gray-200 ${textoEnCursiva ? 'bg-gray-200' : ''}`}
                            title="Cursiva"
                        >
                            <span className="italic">I</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => aplicarFormato('subrayado')}
                            className={`p-1 rounded hover:bg-gray-200 ${textoSubrayado ? 'bg-gray-200' : ''}`}
                            title="Subrayado"
                        >
                            <span className="underline">U</span>
                        </button>
                    </div>

                    {/* Área de texto */}
                    <textarea
                        id="descripcion-textarea"
                        placeholder="Describe el problema detalladamente"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="w-full px-3 py-3 text-black min-h-40 focus:outline-none focus:ring-0 border-0"
                        required
                    />
                </div>
            </div>

            {/* Archivos adjuntos */}
            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-900">
                    Subir archivos adjuntos
                </label>
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
                >
                    <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                        Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="inline-block px-4 py-2 bg-firstColor text-white rounded-md cursor-pointer hover:bg-secondColor transition-colors"
                    >
                        Seleccionar archivos
                    </label>
                </div>
                {archivos.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {archivos.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                                <div className="flex items-center space-x-3">
                                    <div className="text-blue-500">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-firstColor text-white rounded-md hover:bg-secondColor transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                    disabled={loading}
                >
                    {loading ? "Enviando..." : "Crear Ticket FOI"}
                </button>
            </div>
        </div>
    );
}