"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import Cookies from 'js-cookie';

export default function ModalEditTicketFoi({ isOpen, onClose, ticket, fetchTickets }) {
  // Campos básicos
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [subcategoriaId, setSubcategoriaId] = useState("");
  const [tecnicoId, setTecnicoId] = useState("");
  const [estado, setEstado] = useState("");
  const [regionalId, setRegionalId] = useState("");

  // Campos específicos FOI
  const [fechaTentativa, setFechaTentativa] = useState("");
  const [codigoCrm, setCodigoCrm] = useState("");
  const [precioEstimadoPropuesto, setPrecioEstimadoPropuesto] = useState("");
  const [requisitosSoporte, setRequisitosSoporte] = useState("");
  const [productos, setProductos] = useState("");
  const [comentariosAdicionales, setComentariosAdicionales] = useState("");
  const [sitio, setSitio] = useState("");
  const [linkSharePoint, setLinkSharePoint] = useState("");

  // Datos para selects
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const estadosPosibles = [
    "ABIERTO", "ACEPTADO", "ASIGNADO", "EN_PROGRESO", "RESUELTO", "ESCALADO", "ON_HOLD", "FABRICANTE"
  ];

  useEffect(() => {
    if (ticket) {
      // Campos básicos
      setTitulo(ticket.titulo || "");
      setDescripcion(ticket.descripcion || "");
      setCategoriaId(ticket.categoria?.id || "");
      setSubcategoriaId(ticket.subcategoria?.id || "");
      setTecnicoId(ticket.tecnicoAsignado?.id || "");
      setEstado(ticket.estado || "");
      setRegionalId(ticket.regional?.id || "");

      // Campos FOI específicos
      setFechaTentativa(ticket.fechaTentativa || "");
      setCodigoCrm(ticket.codigoCRM || "");
      setPrecioEstimadoPropuesto(ticket.precioEstimadoProspuesta?.toString() || "");
      setRequisitosSoporte(ticket.requisitosSoporte || "");
      setProductos(ticket.productos || "");
      setComentariosAdicionales(ticket.comentariosAdicionales || "");
      setSitio(ticket.sitio || "");
      setLinkSharePoint(ticket.linkSharepoint || "");
    }
  }, [ticket]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [catRes, ciuRes, tecRes] = await Promise.all([
          fetch(`${PATH_URL_BACKEND}/categorias`),
          fetch(`${PATH_URL_BACKEND}/ciudad`),
          fetch(`${PATH_URL_BACKEND}/usuario/por-rol/TECNICO`) // Técnicos generales para FOI
        ]);

        if (!catRes.ok || !ciuRes.ok || !tecRes.ok) throw new Error("Error en carga de datos iniciales");

        const [catData, ciuData, tecData] = await Promise.all([
          catRes.json(),
          ciuRes.json(),
          tecRes.json()
        ]);

        setCategorias(catData);
        setCiudades(ciuData);
        setTecnicos(tecData);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar datos de edición.", "error");
      }
    };
    if (isOpen) fetchAll();
  }, [isOpen]);

  useEffect(() => {
    const fetchSub = async () => {
      if (!categoriaId) {
        setSubcategorias([]);
        return;
      }
      try {
        const res = await fetch(`${PATH_URL_BACKEND}/subcategorias/por-categoria/${categoriaId}`);
        if (!res.ok) throw new Error("Error al obtener subcategorías");
        const data = await res.json();
        setSubcategorias(data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar las subcategorías.", "error");
      }
    };
    fetchSub();
  }, [categoriaId]);

  const handleSubmit = async () => {
    const userId = Cookies.get('userId');

    if (!userId) {
      Swal.fire("Error", "No se pudo identificar al usuario", "error");
      return;
    }

    // Validación de campos requeridos
    if (!titulo || !descripcion || !categoriaId || !subcategoriaId || !estado || !regionalId) {
      Swal.fire("Faltan datos", "Completa todos los campos requeridos.", "warning");
      return;
    }

    // Preparar el body según el formato FOI
    const body = {
      solicitanteId: ticket.solicitante?.id || "",
      titulo,
      descripcion,
      categoriaId,
      subCategoriaId: subcategoriaId,
      ciudadId: regionalId,
      fechaTentativa,
      codigoCrm,
      precioEstimadoPropuesto: precioEstimadoPropuesto ? parseFloat(precioEstimadoPropuesto) : 0,
      requisitosSoporte,
      productos,
      comentariosAdicionales,
      sitio,
      linkSharePoint,
      tecnicoId: tecnicoId || null
    };

    try {
      // Nuevo endpoint FOI
      const res = await fetch(`${PATH_URL_BACKEND}/tickets/modificar-foi/${ticket.id}/${estado}/${userId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "No se pudo actualizar el ticket FOI");
      }

      Swal.fire("Actualizado", "El ticket FOI fue actualizado correctamente", "success");
      fetchTickets();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Error inesperado", "error");
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 text-black backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-white p-6 rounded-xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-6">Editar Ticket FOI</h2>

        <div className="grid grid-cols-1 gap-6">
          <div className="relative z-0 w-full group">
            <select
              id="estado"
              className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              required
            >
              <option value="" disabled hidden></option>
              {estadosPosibles.map(e => (
                <option key={e} value={e}>{e.replace(/_/g, ' ').toLowerCase()}</option>
              ))}
            </select>
            <label
              htmlFor="estado"
              className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Estado<span className="text-red-500 ml-1">*</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="relative z-0 w-full group">
              <input
                type="text"
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="titulo"
                className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Título<span className="text-red-500 ml-1">*</span>
              </label>
            </div>

            {/* Categoría */}
            <div className="relative z-0 w-full group">
              <select
                id="categoria"
                className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
              >
                <option value="" disabled hidden></option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              <label
                htmlFor="categoria"
                className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Categoría<span className="text-red-500 ml-1">*</span>
              </label>
            </div>

            {/* Subcategoría */}
            <div className="relative z-0 w-full group">
              <select
                id="subcategoria"
                className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                value={subcategoriaId}
                onChange={(e) => setSubcategoriaId(e.target.value)}
                required
              >
                <option value="" disabled hidden></option>
                {subcategorias.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                ))}
              </select>
              <label
                htmlFor="subcategoria"
                className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Subcategoría<span className="text-red-500 ml-1">*</span>
              </label>
            </div>

            {/* Regional */}
            <div className="relative z-0 w-full group">
              <select
                id="regional"
                className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                value={regionalId}
                onChange={(e) => setRegionalId(e.target.value)}
                required
              >
                <option value="" disabled hidden></option>
                {ciudades.map(ciudad => (
                  <option key={ciudad.id} value={ciudad.id}>
                    {ciudad.nombre} ({ciudad.regional})
                  </option>
                ))}
              </select>
              <label
                htmlFor="regional"
                className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Regional<span className="text-red-500 ml-1">*</span>
              </label>
            </div>

            {/* Técnico Asignado */}
            <div className="relative z-0 w-full group">
              <select
                id="tecnico"
                className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                value={tecnicoId}
                onChange={(e) => setTecnicoId(e.target.value)}
              >
                <option value="">Sin asignar</option>
                {tecnicos.map(tec => (
                  <option key={tec.id} value={tec.id}>
                    {tec.nombre} {tec.apellidos}
                  </option>
                ))}
              </select>
              <label
                htmlFor="tecnico"
                className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Técnico Asignado
              </label>
            </div>

            {/* Fecha Tentativa */}
            <div className="relative z-0 w-full group">
              <input
                type="date"
                id="fechaTentativa"
                value={fechaTentativa}
                onChange={(e) => setFechaTentativa(e.target.value)}
                className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              />
              <label
                htmlFor="fechaTentativa"
                className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Fecha Tentativa
              </label>
            </div>

            {/* Código CRM */}
            <div className="relative z-0 w-full group">
              <input
                type="text"
                id="codigoCrm"
                value={codigoCrm}
                onChange={(e) => setCodigoCrm(e.target.value)}
                className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
              />
              <label
                htmlFor="codigoCrm"
                className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Código CRM
              </label>
            </div>

            {/* Precio Estimado Propuesto */}
            <div className="relative z-0 w-full group">
              <input
                type="number"
                id="precioEstimadoPropuesto"
                value={precioEstimadoPropuesto}
                onChange={(e) => setPrecioEstimadoPropuesto(e.target.value)}
                className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                step="0.01"
              />
              <label
                htmlFor="precioEstimadoPropuesto"
                className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Precio Estimado Propuesto
              </label>
            </div>

            {/* Sitio */}
            <div className="relative z-0 w-full group">
              <input
                type="text"
                id="sitio"
                value={sitio}
                onChange={(e) => setSitio(e.target.value)}
                className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
              />
              <label
                htmlFor="sitio"
                className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Sitio
              </label>
            </div>
          </div>

          {/* Descripción */}
          <div className="relative z-0 w-full group">
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer resize-none min-h-[100px]"
              placeholder=" "
              required
            />
            <label
              htmlFor="descripcion"
              className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Descripción<span className="text-red-500 ml-1">*</span>
            </label>
          </div>

          {/* Requisitos de Soporte */}
          <div className="relative z-0 w-full group">
            <textarea
              id="requisitosSoporte"
              value={requisitosSoporte}
              onChange={(e) => setRequisitosSoporte(e.target.value)}
              className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer resize-none min-h-[60px]"
              placeholder=" "
            />
            <label
              htmlFor="requisitosSoporte"
              className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Requisitos de Soporte
            </label>
          </div>

          {/* Productos */}
          <div className="relative z-0 w-full group">
            <textarea
              id="productos"
              value={productos}
              onChange={(e) => setProductos(e.target.value)}
              className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer resize-none min-h-[60px]"
              placeholder=" "
            />
            <label
              htmlFor="productos"
              className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Productos
            </label>
          </div>

          <div className="relative z-0 w-full group">
            <textarea
              id="comentariosAdicionales"
              value={comentariosAdicionales}
              onChange={(e) => setComentariosAdicionales(e.target.value)}
              className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer resize-none min-h-[60px]"
              placeholder=" "
            />
            <label
              htmlFor="comentariosAdicionales"
              className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Comentarios Adicionales
            </label>
          </div>

          {/* Link SharePoint */}
          <div className="relative z-0 w-full group">
            <input
              type="url"
              id="linkSharePoint"
              value={linkSharePoint}
              onChange={(e) => setLinkSharePoint(e.target.value)}
              className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="linkSharePoint"
              className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Link SharePoint
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}