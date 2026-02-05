"use client";

import Header from "../components/commons/header";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BsTicketPerforated, BsTicketPerforatedFill } from "react-icons/bs";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import ModalWelcome from "@/components/layouts/modalWelcome";
import ModalMessageClient from "../components/commons/ModalMessageClient";
import { useTranslations } from 'next-intl';
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardCliente({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const t = useTranslations('home');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showClientMsg, setShowClientMsg] = useState(false);
  const clientMsgShown = typeof window !== "undefined"
    ? sessionStorage.getItem("clientMsgShown") === "true"
    : false;
  useEffect(() => {
    const userRole = Cookies.get("userRole");
    const primerLogin = Cookies.get("primerLogin") === "true";

    if (!userRole) {
      router.push(`/${params.locale}`);
      return;
    }

    if (userRole === "CLIENTE") {
      if (primerLogin && !clientMsgShown) {
        setShowWelcomeModal(true);
        Cookies.set("primerLogin", "false", { expires: 1 });
      } else if (!clientMsgShown) {
        setShowClientMsg(true);
      }
    }
  }, [router, params.locale]);

  const handleCloseWelcome = () => {
    setShowWelcomeModal(false);
    const clientMsgShown = sessionStorage.getItem("clientMsgShown") === "true";
    const userRole = Cookies.get("userRole");
    if (userRole === "CLIENTE" && !clientMsgShown) {
      setShowClientMsg(true);
    }
  };

  const handleCloseClientMsg = () => {
    sessionStorage.setItem("clientMsgShown", "true");
    setShowClientMsg(false);
  };

  const [resumen, setResumen] = useState({
    ticketsSolicitados: 0,
    ticketsCerrados: 0,
    ticketsEnCurso: 0,
    sinAsignar: 0,
  });

  const [charts, setCharts] = useState({
    ticketsPorEstado: { series: [], options: {} },
    ticketsPorMes: { series: [], options: {} },
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const solicitanteId = Cookies.get("userId");
        if (!solicitanteId) throw new Error("No se encontró el solicitanteId en las cookies");

        const res = await fetch(`${PATH_URL_BACKEND}/dashboard/cliente/${solicitanteId}`);
        if (!res.ok) throw new Error("Error al obtener los datos del dashboard");
        const data = await res.json();

        setResumen({
          ticketsSolicitados: data.ticketsSolicitados,
          ticketsCerrados: data.ticketsCerrados,
          ticketsEnCurso: data.ticketsEnCurso,
          sinAsignar: data.sinAsignar,
        });

        setCharts({
          ticketsPorEstado: {
            series: [{ name: "Tickets", data: Object.values(data.ticketsPorEstado) }],
            options: {
              chart: { type: "bar", toolbar: { show: false } },
              plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
              xaxis: { categories: Object.keys(data.ticketsPorEstado) },
              colors: ["#004B87"],
              tooltip: { theme: "dark" },
            },
          },
          ticketsPorMes: {
            series: [{ name: "Tickets creados", data: Object.values(data.ticketsCreadosPorMes) }],
            options: {
              chart: { type: "line", toolbar: { show: false } },
              xaxis: { categories: Object.keys(data.ticketsCreadosPorMes) },
              stroke: { curve: "smooth", width: 3 },
              colors: ["#0075B8"],
              tooltip: { theme: "dark" },
            },
          },
        });
      } catch (err) {
        console.error("Error al cargar dashboard cliente:", err);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-fifthColor">
      <Header />
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-[#002B5B]">{t('title')}</h1>
          <button
            onClick={() => router.push(`/${params.locale}/CustomerTicket`)}
            className="bg-[#002B5B] hover:bg-[#004B87] text-white px-6 py-2 rounded-md transition"
          >
            {t('viewTickets')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card title={t('requestedTickets')} value={resumen.ticketsSolicitados} icon={<BsTicketPerforated />} />
          <Card title={t('closedTickets')} value={resumen.ticketsCerrados} icon={<FiCheckCircle />} />
          <Card title={t('inProgressTickets')} value={resumen.ticketsEnCurso} icon={<FiClock />} />
          <Card title={t('unassigned')} value={resumen.sinAsignar} icon={<BsTicketPerforatedFill />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-[#002B5B]">{t('ticketsByStatus')}</h2>
            <Chart
              options={charts.ticketsPorEstado.options}
              series={charts.ticketsPorEstado.series}
              type="bar"
              height={300}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-[#002B5B]">{t('ticketsPerMonth')}</h2>
            <Chart
              options={charts.ticketsPorMes.options}
              series={charts.ticketsPorMes.series}
              type="line"
              height={300}
            />
          </div>
        </div>
      </div>
      <ModalWelcome
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
      <ModalMessageClient
        isOpen={showClientMsg}
        onClose={handleCloseClientMsg}
      />
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow flex items-center gap-4">
      <div className="text-[#004B87] text-3xl">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-2xl font-bold text-[#002B5B]">{value}</p>
      </div>
    </div>
  );
}
