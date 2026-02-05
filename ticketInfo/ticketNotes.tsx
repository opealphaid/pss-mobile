"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import Cookies from "js-cookie";

export default function TicketNotes({ ticketId }: { ticketId: string }) {
  const [nota, setNota] = useState("");
  const [notas, setNotas] = useState<any[]>([]);

  const fetchNotas = async () => {
    try {
      const res = await fetch(`${PATH_URL_BACKEND}/notas/ticket/${ticketId}`);
      if (!res.ok) throw new Error("Error al obtener notas");
      const data = await res.json();
      setNotas(data);
    } catch (error) {
      console.error("Error al obtener notas:", error);
    }
  };

  useEffect(() => {
    fetchNotas();
  }, [ticketId]);

  const handleGuardarNota = async () => {
    if (!nota.trim()) {
      Swal.fire("Error", "La nota no puede estar vacía.", "warning");
      return;
    }

    const userId = Cookies.get("userId");
    if (!userId) {
      Swal.fire("Error", "No se encontró el ID del usuario en cookies.", "error");
      return;
    }

    try {
      const response = await fetch(`${PATH_URL_BACKEND}/notas/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          createBy: userId,
          nota,
        }),
      });

      if (!response.ok) throw new Error("Error al crear la nota");
      setNota("");
      fetchNotas();
      Swal.fire("Éxito", "Nota guardada correctamente.", "success");
    } catch (error) {
      console.error("Error al guardar nota:", error);
      Swal.fire("Error", "No se pudo guardar la nota.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Escribe una nota aquí..."
          className="w-full min-h-32 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleGuardarNota}
          className="mt-2 px-4 py-2 bg-firstColor text-white rounded-md hover:bg-secondColor transition-colors"
        >
          Guardar Nota
        </button>
      </div>

      <div className="space-y-3">
        {notas.length === 0 ? (
          <p className="text-sm text-gray-500">No hay notas registradas.</p>
        ) : (
          notas.map((n) => (
            <div
              key={n.id}
              className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700 relative"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 font-semibold">Escrito por: {n.creadorNota}</span>
                <span className="text-xs text-gray-400">
                  {new Date(n.createAt).toLocaleString("es-BO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
              {n.nota}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
