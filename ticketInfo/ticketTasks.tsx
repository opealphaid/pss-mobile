import { useEffect, useState } from "react";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import { GoTasklist } from "react-icons/go";
import Swal from "sweetalert2";

interface TicketTasksProps {
  ticketId: string;
  tareas: any[];
  fetchTareas: () => void;
  onView?: (task: any) => void;
}

export default function TicketTasks({ ticketId, tareas, fetchTareas, onView }: TicketTasksProps) {
  const [duracionTareas, setDuracionTareas] = useState<string | null>(null);

  const formatToISOWithT = (dateString: string): string => {
    if (dateString.includes('T')) {
      return dateString;
    }
    if (dateString.includes(' ')) {
      return dateString.replace(' ', 'T');
    }
    return new Date(dateString).toISOString();
  };

  const toBolivianTime = (date: Date): Date => {
    return new Date(date.getTime() - 4 * 60 * 60 * 1000); 
  };

  const formatForDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleAbrirModalRegistro = (tarea: any) => {
    const now = new Date();
    

    const inicioActual = tarea.inicioActual 
      ? formatForDateTimeLocal(new Date(tarea.inicioActual))
      : formatForDateTimeLocal(now);
    
    const finActual = tarea.finActual 
      ? formatForDateTimeLocal(new Date(tarea.finActual))
      : formatForDateTimeLocal(new Date(now.getTime() + 60 * 60 * 1000));

    Swal.fire({
      title: 'Registrar tiempos',
      html: `
      <label for="inicio">Inicio actual</label>
      <input type="datetime-local" id="inicio" class="swal2-input" value="${inicioActual}">
      <label for="fin">Fin actual</label>
      <input type="datetime-local" id="fin" class="swal2-input" value="${finActual}">
    `,
      confirmButtonText: 'Guardar',
      focusConfirm: false,
      preConfirm: async () => {
        const inicio = (document.getElementById('inicio') as HTMLInputElement)?.value;
        const fin = (document.getElementById('fin') as HTMLInputElement)?.value;

        if (!inicio || !fin) return Swal.showValidationMessage("Ambas fechas son obligatorias");

        const fechaInicio = new Date(inicio);
        const fechaFin = new Date(fin);
        const fechaInicioBolivia = new Date(fechaInicio.getTime() - 4 * 60 * 60 * 1000);
        const fechaFinBolivia = new Date(fechaFin.getTime() - 4 * 60 * 60 * 1000);

        console.log('Input inicio:', inicio);
        console.log('Input fin:', fin);
        console.log('Fecha inicio (local):', fechaInicio.toString());
        console.log('Fecha fin (local):', fechaFin.toString());
        console.log('Fecha inicio Bolivia:', fechaInicioBolivia.toISOString());
        console.log('Fecha fin Bolivia:', fechaFinBolivia.toISOString());

        const inicioEstimado = new Date(tarea.inicioEstimado);
        const fechaCreacion = new Date(tarea.ticketCreado);
        if (fechaInicio < fechaCreacion || fechaInicio < inicioEstimado) {
          return Swal.showValidationMessage("Inicio no puede ser anterior a la creación o al inicio estimado.");
        }
        if (fechaFin < fechaInicio) {
          return Swal.showValidationMessage("Fin no puede ser anterior al inicio.");
        }

        try {
          const requestBody = {
            titulo: tarea.titulo,
            estadoTareaId: tarea.estadoTareaId,
            descripcion: tarea.descripcion,
            tipoTareaId: tarea.tipoTareaId,
            encargadoId: tarea.encargadoId,
            creadorId: tarea.creadorId,
            prioridadId: tarea.prioridadId,
            clienteId: tarea.clienteId,
            ticketId: tarea.ticketId,
            inicioEstimado: formatToISOWithT(tarea.inicioEstimado), 
            finEstimado: formatToISOWithT(tarea.finEstimado), 
            inicioActual: fechaInicioBolivia.toISOString(),
            finActual: fechaFinBolivia.toISOString(), 
            visitaCliente: tarea.visitaCliente
          };

          console.log('Enviando al backend:', requestBody);

          await fetch(`${PATH_URL_BACKEND}/tareas/modificar-tarea/${tarea.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
          });

          await fetchDuracionTotal();
          fetchTareas();

          Swal.fire("Actualizado", "La tarea fue modificada con éxito", "success");
        } catch (error) {
          console.error("Error:", error);
          Swal.fire("Error", "No se pudo actualizar la tarea", "error");
        }
      }
    });
  };

  const fetchDuracionTotal = async () => {
    try {
      const res = await fetch(`${PATH_URL_BACKEND}/tareas/duracion/ticket/${ticketId}`);
      const data = await res.json();
      setDuracionTareas(data.duracionLiteral || null);
    } catch (err) {
      console.error("Error al obtener duración total", err);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchDuracionTotal();
    }
  }, [ticketId]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio programado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finalización programada</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tareas.map((tarea, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="text-sm font-semibold text-blue-600 hover:underline"
                    onClick={() => onView?.(tarea)}
                  >
                    {tarea.titulo}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{tarea.estadoTarea}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{tarea.prioridad}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{tarea.encargado}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(tarea.inicioEstimado).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(tarea.finEstimado).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  <button
                    title="Registrar inicio y finalización actual"
                    onClick={() => handleAbrirModalRegistro(tarea)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <GoTasklist size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {tareas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay tareas registradas para este ticket.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {duracionTareas && (
        <div className="p-4 bg-gray-100 border-t text-sm text-gray-800 font-medium">
          Tiempo total de duración de las tareas:{" "}
          <span className="font-bold text-blue-600">{duracionTareas}</span>
        </div>
      )}
    </div>
  );
}