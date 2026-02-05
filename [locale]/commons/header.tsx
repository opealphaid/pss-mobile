"use client";

import { useState, useEffect } from "react";
import { FaBell, FaCommentDots, FaUserCircle, FaUserAlt, FaListUl, FaBook } from "react-icons/fa";
import { BsIndent, BsTextIndentRight } from "react-icons/bs";
import Swal from "sweetalert2";
import { usePathname } from "next/navigation";
import { IoExitOutline, IoHome } from "react-icons/io5";
import { RiChat1Line, RiTeamFill } from "react-icons/ri";
import { BiSolidCategory } from "react-icons/bi";
import { TbCategory, TbUsersGroup } from "react-icons/tb";
import { HiOutlineTicket } from "react-icons/hi";
import Link from "next/link";
import Image from "next/image";
import Cookies from 'js-cookie';
import LocaleSwitcher from './LocaleSwitcher';

import {
  HiOutlineClock,
  HiOutlineCog,
  HiOutlineQuestionMarkCircle
} from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";
import ModalCreateTicketTabs from "@/components/FOI/ModalCreateTicketTabs";
import ModalCreateTicketTabsClient from "@/components/FOI/modalCreateTicketTabsClient";

const Header = () => {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const [userName, setUserName] = useState("Usuario");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClientOpen, setIsModalClientOpen] = useState(false);
  const [isPuntoContacto, setIsPuntoContacto] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const contactPoint = Cookies.get("puntoContacto");
    const storedName = Cookies.get("fullname") || "Usuario";
    const role = Cookies.get("userRole") || null;

    setUserName(storedName);
    setUserRole(role);
    setIsPuntoContacto(contactPoint === "true");
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Deseas cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      customClass: {
        confirmButton: "bg-red-500 text-white px-4 py-2 rounded-md",
        cancelButton: "bg-firstColor text-white px-4 py-2 rounded-md",
      },
    });

    if (result.isConfirmed) {
      await Swal.fire({
        position: "center",
        icon: "success",
        text: "Hasta pronto!",
        showConfirmButton: false,
        timer: 3000,
      });

      sessionStorage.clear();
      localStorage.clear();
      Cookies.remove("userId");
      Cookies.remove("fullname");
      Cookies.remove("email");
      Cookies.remove("userRole");
      Cookies.remove("idDepartamento");
      window.location.href = `/`;
    }
  };

  const renderNavLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`flex items-center px-3 py-1.5 rounded-md text-sm ${pathname === href
        ? "bg-alphaVerde bg-opacity-20 text-alphaVerde"
        : "text-fourthColor hover:bg-thirdColor hover:text-white"
        }`}
      onClick={() => setIsMenuOpen(false)}
    >
      {label}
    </Link>
  );

  const handleTicketsRedirect = () => {
    switch (userRole) {
      case "SUPERADMIN":
        window.location.href = `/supportList`;
        break;
      case "CLIENTE":
        window.location.href = `/CustomerTicket`;
        break;
      case "TECNICO":
        window.location.href = `/technicianTickets`;
        break;
      case "ASIGNADOR":
        window.location.href = `/allocatorTickets`;
        break;
      default:
        Swal.fire({
          icon: "warning",
          text: "No tienes permisos para acceder a esta sección.",
          confirmButtonText: "Entendido",
        });
    }
  };

  const handleTicketSubmit = () => {
    setIsModalOpen(false);
    switch (userRole) {
      case "SUPERADMIN":
        window.location.href = `/supportList`;
        break;
      case "CLIENTE":
        window.location.href = `/CustomerTicket`;
        break;
      case "TECNICO":
        window.location.href = `/technicianTickets`;
        break;
      case "ASIGNADOR":
        window.location.href = `/allocatorTickets`;
        break;
      default:
        Swal.fire({
          icon: "warning",
          text: "No tienes permisos para acceder a esta sección.",
          confirmButtonText: "Entendido",
        });
    }
  };

  return (
    <header className="flex flex-col md:flex-row h-auto md:h-16 items-center justify-between px-6 shadow-md z-20 relative bg-firstColor text-white">
      <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full md:w-auto items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 py-2 md:py-0`}>
        <Image
          src="/images/Logo_IT_3.png"
          alt="Alpha IT"
          width={160}
          height={64}
          className="object-contain h-full"

        />
        {userRole === "SUPERADMIN" && (
          <>
            {renderNavLink("/dashboard", "Inicio")}
            {/* {renderNavLink("/tickets", "Tickets")} */}
            {renderNavLink("/supportList", "Administración de Tickets")}
            {renderNavLink("/statusTechnician", "Estado de Ingenieros")}
            {/* {renderNavLink("/contract", "Contratos")} */}
            {renderNavLink("/task", "Tareas")}
            <button
              onClick={() => window.open("https://baserow.alphasys.com.bo/public/grid/sEapJrN93pWFp43CDij2ozWKb18jv56vMNc2maSniqM", "_blank")}
              className="flex items-center px-3 py-1.5 rounded-md text-sm text-fourthColor hover:bg-thirdColor hover:text-white"
            >
              Contratos
            </button>
            <button
              onClick={() => window.open("https://baserow.alphasys.com.bo/public/grid/s36-8aWtm-xVoYVKDkUBHvFjCvSu9-578kBziwYndQw", "_blank")}
              className="flex items-center px-3 py-1.5 rounded-md text-sm text-fourthColor hover:bg-thirdColor hover:text-white"
            >
              Equipos
            </button>
            {renderNavLink("/reports", "Reportes")}
            {/*{renderNavLink("/profileClient", "Perfil")}
             {renderNavLink("/support", "Soporte")} */}
          </>
        )}

        {userRole === "CLIENTE" && (
          <>
            {renderNavLink("/home", "Inicio")}
            {renderNavLink("/CustomerTicket", "Seguimiento de Tickets")}
            {/*{renderNavLink("/profileClient", "Perfil")}
             {renderNavLink("/support", "Soporte")} */}
          </>
        )}

        {userRole === "TECNICO" && (
          <>
            {renderNavLink("/dashboardTech", "Inicio")}
            {renderNavLink("/technicianTickets", "Tickets Asignados")}
            {renderNavLink("/task", "Tareas")}
            <button
              onClick={() => window.open("https://baserow.alphasys.com.bo/public/grid/sEapJrN93pWFp43CDij2ozWKb18jv56vMNc2maSniqM", "_blank")}
              className="flex items-center px-3 py-1.5 rounded-md text-sm text-fourthColor hover:bg-thirdColor hover:text-white"
            >
              Contratos
            </button>
            <button
              onClick={() => window.open("https://baserow.alphasys.com.bo/public/grid/s36-8aWtm-xVoYVKDkUBHvFjCvSu9-578kBziwYndQw", "_blank")}
              className="flex items-center px-3 py-1.5 rounded-md text-sm text-fourthColor hover:bg-thirdColor hover:text-white"
            >
              Equipos
            </button>
            {/* {renderNavLink("/knowledge-base", "Base de Conocimientos")} */}
            {/*{renderNavLink("/profileClient", "Perfil")}
             {renderNavLink("/support", "Soporte")} */}
          </>
        )}

        {userRole === "ASIGNADOR" && (
          <>
            {renderNavLink("/dashboardSup", "Inicio")}
            {/* {renderNavLink("/tickets", "Tickets")} */}
            {renderNavLink("/allocatorTickets", "Asignación de tickets")}
            {renderNavLink("/task", "Tareas")}
            <button
              onClick={() => window.open("https://baserow.alphasys.com.bo/public/grid/sEapJrN93pWFp43CDij2ozWKb18jv56vMNc2maSniqM", "_blank")}
              className="flex items-center px-3 py-1.5 rounded-md text-sm text-fourthColor hover:bg-thirdColor hover:text-white"
            >
              Contratos
            </button>
            <button
              onClick={() => window.open("https://baserow.alphasys.com.bo/public/grid/s36-8aWtm-xVoYVKDkUBHvFjCvSu9-578kBziwYndQw", "_blank")}
              className="flex items-center px-3 py-1.5 rounded-md text-sm text-fourthColor hover:bg-thirdColor hover:text-white"
            >
              Equipos
            </button>
            {/* {renderNavLink("/technicians-group", "Grupo Ingenieros")}
            {renderNavLink("/technicians", "Ingenieros")} */}
            {/* {renderNavLink("/profileClient", "Perfil")}
             {renderNavLink("/support", "Soporte")} */}
          </>
        )}
      </nav>

      <div className="flex items-center space-x-3 py-2 md:py-0">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-full hover:bg-thirdColor transition-colors flex items-center"
            title="Nuevo Ticket"
          >
            <HiOutlineTicket size={23} className="text-white" />
            <span className="pl-1">Nuevo Ticket</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Ticket Personal
                </button>

                {userRole !== "CLIENTE" && (
                  <button
                    onClick={() => {
                      setIsModalClientOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Ticket Cliente
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {userRole === "CLIENTE" && isPuntoContacto && (
          <Link href="/configurationClient" passHref>
            <button className="p-2 rounded-full hover:bg-thirdColor transition-colors" title="Configuración">
              <HiOutlineCog size={23} className="text-white" />
            </button>
          </Link>
        )}

        {userRole !== "CLIENTE" && userRole !== "TECNICO" && userRole !== "ASIGNADOR" && (
          <Link href="/configuration" passHref>
            <button className="p-2 rounded-full hover:bg-thirdColor transition-colors" title="Configuración">
              <HiOutlineCog size={23} className="text-white" />
            </button>
          </Link>
        )}

        {/* <Link href="/support" passHref>
          <button className="p-2 rounded-full hover:bg-thirdColor transition-colors" title="Ayuda">
            <HiOutlineQuestionMarkCircle size={23} className="text-white" />
          </button>
        </Link> */}

        {userRole === "CLIENTE" && <LocaleSwitcher />}

        <Link href="/profileClient" passHref>
          <button className="p-2 rounded-full hover:bg-thirdColor transition-colors" title="Perfil">
            <FaUserCircle size={23} className="text-white" />
          </button>
        </Link>

        <div className="hidden md:flex flex-col text-right mr-2">
          <span className="text-sm font-semibold">{userName}</span>
          <span className="text-xs text-gray-200">{userRole}</span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-red-500 transition-colors"
          title="Cerrar sesión"
        >
          <FiLogOut size={23} className="text-white" />
        </button>
      </div>

      <ModalCreateTicketTabs
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTicketSubmit}
      />

      <ModalCreateTicketTabsClient
        isOpen={isModalClientOpen}
        onClose={() => setIsModalClientOpen(false)}
        onSubmit={handleTicketSubmit}
        locale={locale}
      />
    </header>
  );
};

export default Header;