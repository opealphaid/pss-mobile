"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RegistryWorkTab from "@/components/admin/ticketInfo/tasks/registryWork";
import { MdArrowBack } from "react-icons/md";

export default function TaskInfo({ task, onBack, onEdit }: { task: any; onBack?: () => void; onEdit?: () => void }) {

  return (
    <Card className="p-6">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-xl text-[#002B5B]">{task.titulo}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Asignado a: <strong>{task.encargado}</strong> | Fecha de vencimiento:{" "}
          <strong>{new Date(task.finEstimado).toLocaleString()}</strong>
        </p>
      </CardHeader>

      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4 mt-2"
        >
          <MdArrowBack className="text-lg" />
          Volver al listado de tareas
        </button>
      )}

      <CardContent className="mt-6">
        <Tabs defaultValue="detalles" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="detalles">Detalles</TabsTrigger>
            <TabsTrigger value="registros">Registros de trabajo</TabsTrigger>
          </TabsList>

          <div className="flex justify-end">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-2 text-sm bg-firstColor text-white rounded hover:bg-secondColor mb-4"
              >
                Actualizar tarea
              </button>
            )}
          </div>


          <TabsContent value="detalles" className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Descripción</h4>
              <div className="border rounded-md bg-gray-50 p-4 text-gray-800 min-h-[80px] whitespace-pre-wrap">
                {task.descripcion || "-"}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <DetailItem label="Grupo" value={task.cliente} />
              <DetailItem label="Propietario" value={task.encargado} />
              <DetailItem label="Prioridad" value={<Badge>{task.prioridad}</Badge>} />
              <DetailItem label="Estado" value={<Badge variant="outline">{task.estadoTarea}</Badge>} />
              <DetailItem label="Inicio programado" value={formatDate(task.inicioEstimado)} />
              <DetailItem label="Finalización programada" value={formatDate(task.finEstimado)} />
              <DetailItem label="Inicio real" value={formatDate(task.inicioActual)} />
              <DetailItem label="Finalización real" value={formatDate(task.finActual)} />
              <DetailItem label="Visita en sitio" value={task.visitaCliente ? "Sí" : "No"} />
              <DetailItem label="Tipo de tarea" value={task.tipoTarea} />
            </div>
          </TabsContent>

          <TabsContent value="registros">
            <RegistryWorkTab tareaId={task.id} ticketId={task.ticketId} />
          </TabsContent>

          <TabsContent value="historial">
            <p className="text-muted-foreground">Pronto historial de actividad...</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-gray-500 font-medium">{label}</p>
      <div className="text-gray-800">{value || "-"}</div>
    </div>
  );
}

function formatDate(date: any) {
  return date ? new Date(date).toLocaleString() : "-";
}
