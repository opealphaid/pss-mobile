"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import Select from "react-select";

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

interface ModalTransferTicketFoiProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  fetchTickets: () => void;
}

export default function ModalTransferTicketFoi({ 
  isOpen, 
  onClose, 
  ticket, 
  fetchTickets 
}: ModalTransferTicketFoiProps) {
  const [motivo, setMotivo] = useState("");
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCargando(true);
      fetch(`${PATH_URL_BACKEND}/usuario/without/CLIENTE`)
        .then((res) => res.json())
        .then((data: Usuario[]) => {
          setTecnicos(data);
          setCargando(false);
        })
        .catch((err) => {
          console.error("Error cargando técnicos", err);
          setCargando(false);
          Swal.fire("Error", "No se pudieron cargar los técnicos", "error");
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && ticket) {
      setMotivo("");
      setTecnicoSeleccionado(null);
    }
  }, [isOpen, ticket]);

  const handleTransferencia = async () => {
    if (!tecnicoSeleccionado) {
      Swal.fire("Campo requerido", "Debe seleccionar un técnico", "warning");
      return;
    }

    if (!motivo.trim()) {
      Swal.fire("Campo requerido", "Debe ingresar el motivo de la transferencia", "warning");
      return;
    }

    try {
      const url = `${PATH_URL_BACKEND}/transferencias/transferir-ticket?ticketId=${ticket.id}&tecnicoDestinoId=${tecnicoSeleccionado.value}&motivo=${encodeURIComponent(motivo)}`;

      const res = await fetch(url, {
        method: "POST",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudo completar la transferencia");
      }

      Swal.fire("Éxito", "La transferencia se realizó correctamente", "success");
      fetchTickets();
      onClose();
    } catch (err: any) {
      console.error("Error en la transferencia:", err);
      Swal.fire("Error", err.message || "Error inesperado", "error");
    }
  };

  if (!isOpen || !ticket) return null;

  const opcionesTecnicos = tecnicos.map(tecnico => ({
    value: tecnico.id,
    label: `${tecnico.nombre || ''} ${tecnico.apellidos || ''} - ${tecnico.regional || 'Sin regional'}`
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 text-black backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-white p-6 rounded-xl w-full max-w-3xl shadow-2xl m-4">
        <h2 className="text-xl font-bold mb-6">Transferir Ticket FOI</h2>

        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <p className="text-sm text-gray-500 mb-1">Título:</p>
          <p className="font-medium text-gray-800">{ticket.titulo}</p>
          <p className="text-sm text-gray-500 mt-2 mb-1">Prioridad:</p>
          <p className="text-gray-700 font-medium">{ticket.prioridad?.nombre}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Ingeniero
            </label>
            <Select
              options={opcionesTecnicos}
              value={tecnicoSeleccionado}
              onChange={setTecnicoSeleccionado}
              isLoading={cargando}
              placeholder="Seleccione un ingeniero..."
              isSearchable
              noOptionsMessage={() => "No hay técnicos disponibles"}
              className="text-sm"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo de la transferencia
          </label>
          <textarea
            rows={4}
            placeholder="Ingrese el motivo de la transferencia"
            className="w-full p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            onClick={handleTransferencia}
            disabled={cargando}
          >
            {cargando ? "Procesando..." : "Confirmar transferencia"}
          </button>
        </div>
      </div>
    </div>
  );
}