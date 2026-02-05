"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Swal from "sweetalert2";
import {
  IoHome,
  IoExitOutline,
  IoMenu,
} from "react-icons/io5";
import { FaUserAlt, FaListUl, FaBook } from "react-icons/fa";
import { RiChat1Line, RiTeamFill } from "react-icons/ri";
import { BiSolidCategory } from "react-icons/bi";
import { TbCategory, TbUsersGroup } from "react-icons/tb";
import { HiOutlineTicket } from "react-icons/hi";

const scrollbarHideStyles = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none'
  }
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const role = localStorage.getItem("userRole"); 
    setUserRole(role);
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
        text: "Hasta Pronto!!",
        showConfirmButton: false,
        timer: 3000,
      });

      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const renderLink = (href: string, icon: JSX.Element, label: string) => (
    <li className="relative">
      <Link
        href={href}
        className={`flex items-center p-3 font-semibold rounded-lg ${
          pathname === href
            ? "bg-opacity-10 bg-white text-[#94bf28]"
            : "text-fourthColor hover:bg-secondColor hover:text-fourthColor"
        }`}
      >
        {icon}
        <span className={`ml-4 ${isOpen ? "block" : "hidden"}`}>{label}</span>
      </Link>
      {pathname === href && (
        <div className="absolute right-0 top-0 w-1 h-full bg-[#94bf28]"></div>
      )}
    </li>
  );

  return (
    <aside
      className={`bg-secondColor text-white ${
        isOpen ? "w-64" : "w-20"
      } transition-all duration-300 flex flex-col fixed h-screen overflow-y-auto`}
      style={scrollbarHideStyles}
    >
      <div className={`flex ${isOpen ? "justify-end" : "justify-center"} p-2`}>
        <button onClick={() => setIsOpen(!isOpen)}>
          <IoMenu size={24} />
        </button>
      </div>

      {isOpen && (
        <div className="flex justify-center mb-2">
          <Image
            src="/images/Logo_IT.png"
            alt="Alpha IT"
            width={200}
            height={100}
            className="rounded"
          />
        </div>
      )}

      <nav className="flex-1 px-2">
        <ul className="space-y-2">
          {userRole === "SUPERADMIN" && (
            <>
              {renderLink("/dashboard", <IoHome size={22} />, "Inicio")}
              {renderLink("/tickets", <HiOutlineTicket size={22} />, "Tickets")}
              {renderLink("/supportList", <HiOutlineTicket size={22} />, "Generar Tickets")}
              {renderLink("/company", <FaBook size={22} />, "Compañías")}
              {renderLink("/departments", <IoHome size={22} />, "Departamentos")}
              {/* {renderLink("/roles", <FaUserAlt size={22} />, "Roles")}
              {renderLink("/groups", <TbUsersGroup size={22} />, "Grupo Técnicos")} */}
              {renderLink("/technicians", <RiTeamFill size={22} />, "Técnicos")}
              {renderLink("/category", <BiSolidCategory size={22} />, "Categoría")}
              {renderLink("/subCategory", <TbCategory size={22} />, "SubCategorías")}
              
              {renderLink("/Logs", <TbCategory size={22} />, "Registros y logs")}
              {/* {renderLink("/knowledge-base", <FaBook size={22} />, "Base de Conocimientos")} */}
              {/* {renderLink("/profileClient", <FaUserAlt size={22} />, "Perfil")} */}
              {/* {renderLink("/support", <RiChat1Line size={22} />, "Soporte")} */}
            </>
          )}

          {userRole === "CLIENTE" && (
            <>
              {renderLink("/home", <IoHome size={22} />, "Inicio")}
              {renderLink("/CustomerTicket", <HiOutlineTicket size={22} />, "Generar Tickets")}
              {renderLink("/ResoltTicket", <HiOutlineTicket size={22} />, "Generar Tickets")}
              {renderLink("/profileClient", <FaUserAlt size={22} />, "Perfil")}
              {renderLink("/support", <RiChat1Line size={22} />, "Soporte")}
            </>
          )}

          {userRole === "TECNICO" && (
            <>
              {renderLink("/dashboardTech", <IoHome size={22} />, "Inicio")}
              {renderLink("/ticket-technician", <FaListUl size={22} />, "Tickets Técnicos")}
              {renderLink("/knowledge-base", <FaBook size={22} />, "Base de Conocimientos")}
              {renderLink("/profileClient", <FaUserAlt size={22} />, "Perfil")}
              {renderLink("/support", <RiChat1Line size={22} />, "Soporte")}
            </>
          )}

          {userRole === "ASIGNADOR" && (
            <>
              {renderLink("/dashboardSup", <IoHome size={22} />, "Inicio")}
              {renderLink("/tickets", <HiOutlineTicket size={22} />, "Tickets")}
              {renderLink("/ticket-technician", <FaListUl size={22} />, "Tickets Técnicos")}
              {renderLink("/technicians-group", <TbUsersGroup size={22} />, "Grupo Técnicos")}
              {renderLink("/technicians", <RiTeamFill size={22} />, "Técnicos")}
              {renderLink("/profileClient", <FaUserAlt size={22} />, "Perfil")}
              {renderLink("/support", <RiChat1Line size={22} />, "Soporte")}
            </>
          )}
        </ul>
      </nav>

      <div className="p-2">
        <button
          onClick={handleLogout}
          className="flex items-center p-3 w-full rounded-lg hover:bg-red-700"
        >
          <IoExitOutline size={22} />
          {isOpen && <span className="ml-4">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
