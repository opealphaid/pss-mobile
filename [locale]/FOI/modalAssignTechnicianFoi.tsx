"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { PATH_URL_BACKEND } from "@/components/utils/constants";

interface ModalAssignTechnicianFoiProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  fetchTickets: () => void;
}

interface TecnicoOption {
  value: string;
  label: string;
}

interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  idDepartamento: string;
  departamento: string;
  empresaId: string;
  empresa: string;
  regionalId: string;
  regional: string;
  requireChangePwd: boolean;
  principalContact: boolean;
  primerLogin: boolean;
}

export default function ModalAssignTechnicianFoi({ 
  isOpen, 
  onClose, 
  ticket, 
  fetchTickets 
}: ModalAssignTechnicianFoiProps) {
  const [tecnicos, setTecnicos] = useState<TecnicoOption[]>([]);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<TecnicoOption | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoAsignacion, setCargandoAsignacion] = useState(false);

  useEffect(() => {
    if (isOpen && ticket) {
      cargarTecnicos();
      setTecnicoSeleccionado(null);
    }
  }, [isOpen, ticket]);

  const cargarTecnicos = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${PATH_URL_BACKEND}/usuario/without/CLIENTE`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al cargar técnicos");
      }

      const data: Usuario[] = await response.json();
      const usuariosFiltrados = data.filter(usuario => usuario.rol !== "CLIENTE");
      
      const options = usuariosFiltrados.map((usuario: Usuario) => ({
        value: usuario.id,
        label: `${usuario.nombre} ${usuario.apellidos} (${usuario.rol})`
      }));

      setTecnicos(options);
    } catch (error: any) {
      console.error("Error:", error);
      Swal.fire("Error", error.message || "No se pudieron cargar los técnicos", "error");
    } finally {
      setCargando(false);
    }
  };

  const handleAsignar = async () => {
    if (!tecnicoSeleccionado) {
      Swal.fire("Advertencia", "Selecciona un técnico", "warning");
      return;
    }

    const userId = Cookies.get("userId");
    
    if (!userId) {
      Swal.fire("Error", "No se encontró el ID de usuario", "error");
      return;
    }

    try {
      setCargandoAsignacion(true);
      
      const response = await fetch(
        `${PATH_URL_BACKEND}/tickets/${ticket.id}/asignar?tecnicoId=${tecnicoSeleccionado.value}&asignadorId=${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(responseText || "Error al asignar técnico");
      }
      Swal.fire({
        title: "Éxito",
        text: responseText || "Técnico asignado correctamente",
        icon: "success"
      });
      
      fetchTickets();
      onClose();
    } catch (error: any) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo asignar el técnico",
        icon: "error"
      });
    } finally {
      setCargandoAsignacion(false);
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl m-4 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Asignar Técnico FOI</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Ticket FOI:</strong> {ticket.titulo}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>N° Caso:</strong> {ticket.nroCaso}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Estado:</strong> {ticket.estado.replace("_", " ")}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Técnico:
          </label>
          <Select
            options={tecnicos}
            value={tecnicoSeleccionado}
            onChange={setTecnicoSeleccionado}
            isLoading={cargando}
            loadingMessage={() => "Cargando técnicos..."}
            placeholder="Selecciona un técnico..."
            isSearchable
            noOptionsMessage={() => "No hay técnicos disponibles"}
            styles={{
              control: (base) => ({
                ...base,
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
                padding: "2px"
              })
            }}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
            disabled={cargandoAsignacion}
          >
            Cancelar
          </button>
          <button
            onClick={handleAsignar}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            disabled={cargandoAsignacion || !tecnicoSeleccionado}
          >
            {cargandoAsignacion ? "Asignando..." : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
