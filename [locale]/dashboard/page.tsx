'use client';

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Header from "../components/commons/header";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import Link from 'next/link';

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const scrollbarHideStyles = {
  scrollbarWidth: 'none' as const,
  msOverflowStyle: 'none' as const,
  '&::-webkit-scrollbar': {
    display: 'none'
  }
};

const DashboardGeneral = () => {
  const firstColor = "#002B5B";
  const secondColor = "#004B87";
  const thirdColor = "#0075B8";
  const fourthColor = "#D2ECFB";

  const [resumen, setResumen] = useState({
    tecnicos: 0,
    supervisores: 0,
    departamentos: 0,
    categorias: 0,
    ticketsTotales: 0,
    ticketsCerrados: 0,
    ticketsPendientes: 0,      
  });

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const [
          tecnicos, 
          supervisores, 
          departamentos, 
          categorias, 
          ticketsTotales, 
          ticketsCerrados, 
          ticketsPendientes,
        ] = await Promise.all([
          fetch(`${PATH_URL_BACKEND}/dashboard/tickets/ABIERTO`).then(res => res.json()),
          fetch(`${PATH_URL_BACKEND}/dashboard/tickets/ON_HOLD`).then(res => res.json()),
          fetch(`${PATH_URL_BACKEND}/dashboard/tickets/EN_PROGRESO`).then(res => res.json()),
          fetch(`${PATH_URL_BACKEND}/dashboard/tickets/ASIGNADO`).then(res => res.json()),
          fetch(`${PATH_URL_BACKEND}/dashboard/tickets/total`).then(res => res.json()),
          fetch(`${PATH_URL_BACKEND}/dashboard/tickets/RESUELTO`).then(res => res.json()),
          fetch(`${PATH_URL_BACKEND}/dashboard/tickets/ACEPTADO`).then(res => res.json()),
        ]);

        setResumen({
          tecnicos,
          supervisores,
          departamentos,
          categorias,
          ticketsTotales,
          ticketsCerrados,
          ticketsPendientes
        });
      } catch (error) {
        console.error("Error al cargar el resumen del dashboard:", error);
      }
    };

    fetchResumen();
  }, []);

  const fetchCharts = async () => {
    try {
      const [resCategorias, resMeses, resEstados, resTecnicos] = await Promise.all([
        fetch(`${PATH_URL_BACKEND}/dashboard/tickets/por-categoria`),
        fetch(`${PATH_URL_BACKEND}/dashboard/tickets/por-mes`),
        fetch(`${PATH_URL_BACKEND}/dashboard/tickets/por-estado`),
        fetch(`${PATH_URL_BACKEND}/dashboard/tickets/por-tecnico`),
      ]);

      const dataCategorias = await resCategorias.json();
      const dataMeses = await resMeses.json();
      const dataEstados = await resEstados.json();
      const dataTecnicos = await resTecnicos.json();


      setTicketsPorCategoria({
        series: dataCategorias.map(item => item.cantidad),
        options: {
          labels: dataCategorias.map(item => item.categoria),
          legend: { position: "bottom" },
          colors: [firstColor, secondColor, thirdColor, fourthColor, "#F5FBFE"],
        },
      });

      setTicketsPorMes({
        series: [
          {
            name: "Tickets",
            data: dataMeses.map(item => item.cantidad),
          },
        ],
        options: {
          chart: { type: "bar" },
          xaxis: {
            categories: dataMeses.map(item =>
              new Date(0, item.mes - 1).toLocaleString("default", { month: "short" })
            ),
          },
          colors: [secondColor],
          tooltip: { theme: "dark" },
        },
      });

      setTicketsPorEstado({
      series: [{ name: 'Tickets', data: dataEstados.map(item => item.cantidad) }],
      options: {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true } },
        xaxis: { categories: dataEstados.map(item => item.estado) },
        colors: [secondColor],
        tooltip: { theme: 'dark' },
      },
    });

    setTicketsPorTecnico({
      series: [{ name: 'Tickets', data: dataTecnicos.map(item => item.cantidadTickets) }],
      options: {
        chart: { type: 'bar' },
        plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
        xaxis: { categories: dataTecnicos.map(item => item.nombreCompleto) },
        colors: [secondColor],
        tooltip: { theme: 'dark' },
      },
    });
    } catch (error) {
      console.error("Error al cargar datos para los gráficos:", error);
    }
  };


  useEffect(() => {
    fetchCharts();
  }, []);


  const [ticketsPorCategoria, setTicketsPorCategoria] = useState<any>({
    series: [],
    options: { labels: [], legend: {}, colors: [] }
  });

  const [ticketsPorMes, setTicketsPorMes] = useState<any>({
    series: [],
    options: { xaxis: { categories: [] }, chart: {}, tooltip: {}, colors: [] }
  });

  const [ticketsPorEstado, setTicketsPorEstado] = useState<any>({
    series: [],
    options: {
      chart: { type: 'bar', toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true } },
      xaxis: { categories: [] },
      colors: [secondColor],
      tooltip: { theme: 'dark' },
    },
  });

  const [ticketsPorTecnico, setTicketsPorTecnico] = useState<any>({
    series: [],
    options: {
      chart: { type: 'bar' },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
      xaxis: { categories: [] },
      colors: [secondColor],
      tooltip: { theme: 'dark' },
    },
  });


  return (
    <div className="flex flex-col min-h-screen bg-fifthColor">
      <Header />
      <main className="p-6 bg-[#F5FBFE] min-h-screen">
        <h1 className="text-2xl font-bold text-[#002B5B] mb-6 flex items-center">
          <span className="mr-2 p-2 bg-[#004B87]/10 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#004B87]">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <path d="M3 9h18"></path>
              <path d="M9 21V9"></path>
            </svg>
          </span>
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link 
            href="/supportList?estado=ABIERTO" 
            className="cursor-pointer"
          >
            <Card 
              title="Tickets abiertos" 
              value={resumen.tecnicos || "0"} 
              iconPath="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" 
            />
          </Link>

          <Link 
            href="/supportList?estado=ON_HOLD" 
            className="cursor-pointer"
          >
            <Card 
              title="Tickets On Hold" 
              value={resumen.supervisores || "0"} 
              iconPath="M13 17h8m0 0V9m0 8-8-8-4 4-6-6" 
            />
          </Link>

          <Link 
            href="/supportList?estado=EN_PROGRESO" 
            className="cursor-pointer"
          >
            <Card 
              title="TICKETS En Progreso" 
              value={resumen.departamentos || "0"} 
              iconPath="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" 
            />
          </Link>

          <Link 
            href="/supportList?estado=ASIGNADO" 
            className="cursor-pointer"
          >
            <Card 
              title="Tickets Asignados Sin Empezar" 
              value={resumen.categorias || "0"} 
              iconPath="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" 
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link 
            href="/supportList?estado=Todos" 
            className="cursor-pointer"
          >
            <Card 
              title="Tickets Totales" 
              value={resumen.ticketsTotales} 
              iconPath="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM5 12h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" 
            />
          </Link>

          <Link 
            href="/supportList?estado=RESUELTO" 
            className="cursor-pointer"
          >
            <Card 
              title="Tickets Cerrados" 
              value={resumen.ticketsCerrados} 
              iconPath="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" 
            />
          </Link>

          <Link 
            href="/supportList?estado=ACEPTADO" 
            className="cursor-pointer"
          >
            <Card 
              title="Tickets Pendientes de Asignación" 
              value={resumen.ticketsPendientes} 
              iconPath="M12 8v4l3 3M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" 
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-bold text-[#002B5B] mb-4 flex items-center">
              <span className="mr-2 p-1 bg-[#004B87]/10 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#004B87]">
                  <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5zM6 9.01V9"></path>
                </svg>
              </span>
              Tickets por Categoría
            </h2>
            {ticketsPorCategoria.series.length > 0 ? (
              <Chart
                options={ticketsPorCategoria.options}
                series={ticketsPorCategoria.series}
                type="pie"
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                Cargando datos...
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-bold text-[#002B5B] mb-4 flex items-center">
              <span className="mr-2 p-1 bg-[#004B87]/10 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#004B87]">
                  <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM5 12h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z"></path>
                </svg>
              </span>
              Tickets por Mes
            </h2>
            <Chart
              options={ticketsPorMes.options}
              series={ticketsPorMes.series}
              type="bar"
              height={300}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-bold text-[#002B5B] mb-4 flex items-center">
              <span className="mr-2 p-1 bg-[#004B87]/10 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#004B87]">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path>
                </svg>
              </span>
              Tickets por Estado
            </h2>
            <Chart
              options={ticketsPorEstado.options}
              series={ticketsPorEstado.series}
              type="bar"
              height={300}
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-bold text-[#002B5B] mb-4 flex items-center">
              <span className="mr-2 p-1 bg-[#004B87]/10 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#004B87]">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              Tickets por Ingeniero
            </h2>
            <Chart
              options={ticketsPorTecnico.options}
              series={ticketsPorTecnico.series}
              type="bar"
              height={300}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

function Card({ title, value, iconPath }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow transition-transform duration-300 hover:shadow-lg hover:scale-105 border-l-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</h3>
          <p className="text-3xl font-bold text-[#002B5B]">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-[#92b42c]/10 text-[#92b42c]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={iconPath}></path>
          </svg>
        </div>
      </div>
      <div className="mt-4 h-1 w-full bg-gray-100 rounded">
        <div className="h-1 rounded bg-gradient-to-r from-[#004B87] to-[#92b42c]" style={{ width: '70%' }}></div>
      </div>
    </div>
  );
}

export default DashboardGeneral;