"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import { PATH_DOCUMENTS } from "@/components/utils/constants";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { useTranslations } from 'next-intl';
import Select from "react-select";

export default function ModalCreateTicketPersonal({ isOpen, onClose, onSubmit }) {
  const t = useTranslations('ticketModal');
  
  if (!isOpen) return null;

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tecnologia, setTecnologia] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [prioridad, setPrioridad] = useState("ALTA");

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState(null);
  const [prioridades, setPrioridades] = useState([]);
  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [solicitanteInfo, setSolicitanteInfo] = useState(null);
  const [loadingSolicitante, setLoadingSolicitante] = useState(false);
  const [ciudades, setCiudades] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [textoEnNegrita, setTextoEnNegrita] = useState(false);
  const [textoEnCursiva, setTextoEnCursiva] = useState(false);
  const [textoSubrayado, setTextoSubrayado] = useState(false);

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
    const fetchPrioridades = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${PATH_URL_BACKEND}/prioridades`);
        if (!response.ok) throw new Error("Error al obtener prioridades");
        const data = await response.json();
        setPrioridades(data);
      } catch (error) {
        console.error("Error cargando prioridades:", error);
        Swal.fire("Error", "No se pudieron cargar las prioridades.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPrioridades();
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

  const handleSubmit = async () => {
    if (
      !titulo || !descripcion ||
      !categoriaSeleccionada || !subcategoriaSeleccionada || !prioridadSeleccionada
    ) {
      Swal.fire(t('incompleteFields'), t('completeAllFields'), "warning");
      return;
    }

    const solicitanteId = localStorage.getItem("userId");
    if (!solicitanteId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el ID del usuario. Por favor, vuelve a iniciar sesión.",
      });
      return;
    }

    const ticketData = {
      titulo,
      descripcion,
      prioridadId: prioridadSeleccionada ? prioridadSeleccionada.id : null,
      tecnologia,
      ubicacion,
      categoriaId: categoriaSeleccionada,
      subCategoriaId: subcategoriaSeleccionada,
      solicitanteId,
      ciudadId: ciudadSeleccionada,
      solicitanteExtraId: solicitanteId,
    };

    setLoading(true);

    try {
      const ticketsUrl = `${PATH_URL_BACKEND}/tickets/crear-normal`;

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
        Swal.fire({
          icon: "error",
          title: "Error al crear el ticket",
          text: errorText || "Ocurrió un error inesperado",
        });
        return;
      }

      const ticketCreado = await response.json();
      await subirArchivos(ticketCreado.id);

      await Swal.fire({
        icon: "success",
        title: "¡Ticket Creado!",
        text: "Tu solicitud ha sido registrada correctamente.",
        showConfirmButton: true,
      });
      
      onSubmit();
      onClose();

    } catch (error: any) {
      console.error("Error al crear ticket:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudo crear el ticket: ${error.message}`,
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

          return { success: true, name: archivo.name };
        } catch (err) {
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
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Error en la subida",
        text: `Ocurrió un error inesperado: ${error.message}`,
        confirmButtonText: "Entendido"
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setArchivos(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setArchivos(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
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
      {solicitanteInfo && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-2">{t('name')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t('name')}:</p>
              <p className="font-medium">{solicitanteInfo.nombre || "No disponible"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('email')}:</p>
              <p className="font-medium">{solicitanteInfo.email || "No disponible"}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">{t('ticketInformation')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative z-0 w-full group">
            <Select
              value={ciudadSeleccionada ? ciudades.find(c => c.id === ciudadSeleccionada) ? { value: ciudadSeleccionada, label: `${ciudades.find(c => c.id === ciudadSeleccionada)?.nombre} (${ciudades.find(c => c.id === ciudadSeleccionada)?.regional})` } : null : null}
              onChange={(option) => setCiudadSeleccionada(option ? option.value : "")}
              options={ciudades.map(ciudad => ({ value: ciudad.id, label: `${ciudad.nombre} (${ciudad.regional})` }))}
              placeholder={t('cityRegional')}
              isSearchable
              isClearable
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                control: (base) => ({ ...base, minHeight: '42px', borderColor: '#d1d5db' }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
          </div>

          <div className="relative z-0 w-full group">
            <Select
              value={categoriaSeleccionada ? categorias.find(c => c.value === categoriaSeleccionada) : null}
              onChange={(option) => setCategoriaSeleccionada(option ? option.value : null)}
              options={categorias}
              placeholder={t('category')}
              isSearchable
              isClearable
              isDisabled={loading || categorias.length === 0}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                control: (base) => ({ ...base, minHeight: '42px', borderColor: '#d1d5db' }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
          </div>

          <div className="relative z-0 w-full group">
            <Select
              value={subcategoriaSeleccionada ? subcategorias.find(s => s.value === subcategoriaSeleccionada) : null}
              onChange={(option) => setSubcategoriaSeleccionada(option ? option.value : null)}
              options={subcategorias}
              placeholder={t('subcategory')}
              isSearchable
              isClearable
              isDisabled={loading || !categoriaSeleccionada || subcategorias.length === 0}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                control: (base) => ({ ...base, minHeight: '42px', borderColor: '#d1d5db' }),
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
              {t('technology')}
            </label>
          </div>

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
              {t('location')}
            </label>
          </div>
        </div>

        <div className="relative z-0 w-full group mt-2">
          <label className="text-sm text-gray-500 font-medium mb-2 block">
            {t('priority')}<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {prioridades.map((p) => (
              <div
                key={p.id}
                className={`border rounded-md p-2 text-center cursor-pointer ${prioridadSeleccionada?.id === p.id ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}
                onClick={() => setPrioridadSeleccionada(p)}
              >
                <span className={`text-sm font-medium ${prioridadSeleccionada?.id === p.id ? "text-blue-600" : "text-black"}`}>
                  {p.nombre}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
            {t('subjectTitle')}<span className="text-red-500 ml-1">*</span>
          </label>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm text-gray-500 font-medium mb-2 block">
          {t('detailedDescription')}<span className="text-red-500 ml-1">*</span>
        </label>
        <div className="border border-gray-300 rounded-md overflow-hidden">
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

          <textarea
            id="descripcion-textarea"
            placeholder={t('describeDetailPlaceholder')}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-3 py-3 text-black min-h-40 focus:outline-none focus:ring-0 border-0"
            required
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-900">
          {t('uploadAttachments')}
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
          <p className="text-sm text-gray-600 mb-2">{t('dragDrop')}</p>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-4 py-2 bg-firstColor text-white rounded-md cursor-pointer hover:bg-secondColor transition-colors"
          >
            {t('uploadFiles')}
          </label>
        </div>

        {archivos.length > 0 && (
          <div className="mt-4 space-y-2">
            {archivos.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-blue-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
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

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          disabled={loading}
        >
          {t('cancel')}
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-firstColor text-white rounded-md hover:bg-secondColor transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? t('sending') : t('create')}
        </button>
      </div>
    </div>
  );
}
