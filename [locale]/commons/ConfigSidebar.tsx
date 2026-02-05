"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { BsBuilding, BsBuildingsFill, BsGrid3X3GapFill, BsTelephone } from "react-icons/bs";
import {
    HiOutlineCog,
    HiOutlineUsers,
    HiOutlineCreditCard,
    HiChevronDown,
    HiChevronRight
} from "react-icons/hi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

const ConfigSidebar = () => {
    const pathname = usePathname();
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        organizacion: false,
        empresas: false,
        usuarios: false,
        facturacion: false
    });

    useEffect(() => {
        const newState: Record<string, boolean> = {
            organizacion: pathname.includes('/configuration/orgCompany')
                || pathname.includes('/configuration/orgDepartment')
                || pathname.includes('/configuration/city')
                || pathname.includes('/configuration/orgContract'),
            empresas: pathname.includes('/configuration/clientCompany') ||
                pathname.includes('/configuration/clientDepartment'),
            usuarios: pathname.includes('/configuration/users') ||
                pathname.includes('/configuration/technicians-group') ||
                pathname.includes('/configuration/category')
                || pathname.includes('/configuration/survey'),

            SLA: pathname.includes('/configuration/priority'),
                // || pathname.includes('/configuration/sla')
                // || pathname.includes('/configuration/scaling'),
            Soporte:pathname.includes('/configuration/support')

        };
        setOpenSections(newState);
    }, [pathname]);

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const menuItems = [
        {
            title: "Empresa Maestra",
            icon: <BsBuilding  size={18} />,
            key: "organizacion",
            items: [
                { name: "Datos de la Entidad", href: "/configuration/orgCompany" },
                { name: "Departamentos", href: "/configuration/orgDepartment" },
                { name: "Ciudades", href: "/configuration/city" },
                { name: "Contratos", href: "/configuration/orgContract" }
            ]
        },
        {
            title: "Gestion de empresas y Usuarios",
            icon: <HiOutlineBuildingOffice2  size={18} />,
            key: "empresas",
            items: [
                { name: "Empresas", href: "/configuration/clientCompany" },
            ]
        },
        {
            title: "Gestión de atención",
            icon: <HiOutlineUsers size={18} />,
            key: "usuarios",
            items: [
                { name: "Categorias", href: "/configuration/category" },
                { name: "Grupos", href: "/configuration/technicians-group" },
                { name: "Encuestas", href: "/configuration/survey" }
            ]
        },
        {
            title: "SLA",
            icon: <HiOutlineCreditCard size={18} />,
            key: "SLA",
            items: [
                { name: "Configuracion SLA", href: "/configuration/priority" },
                // { name: "Niveles SLA", href: "/configuration/sla" },
                // { name: "Escalado", href: "/configuration/scaling" }
            ]
        },
        {
            title: "Soporte",
            icon: <BsTelephone  size={18} />,
            key: "Soporte",
            items: [
                { name: "Ayuda", href: "/configuration/support" },
            ]
        }
    ];

    return (
        <aside className="w-64 bg-white h-full flex flex-col border border-gray-200 sticky top-0">
            <div className="p-4 border-r border-gray-200 bg-white sticky top-0 z-10">
                <h2 className="font-semibold text-lg flex items-center">
                    <BsGrid3X3GapFill className="mr-2" /> Configuración
                </h2>
            </div>

            <nav className="p-2  flex-1 bg-white overflow-y-auto">
                {menuItems.map((section) => (
                    <div key={section.key} className="mb-2">
                        <button
                            onClick={() => toggleSection(section.key)}
                            className="flex items-center justify-between w-full p-2 hover:bg-gray-100 rounded-md"
                        >
                            <div className="flex items-center">
                                <span className="mr-2">{section.icon}</span>
                                <span>{section.title}</span>
                            </div>
                            <HiChevronDown
                                size={18}
                                className={`transition-transform ${openSections[section.key] ? 'rotate-0' : '-rotate-90'}`}
                            />
                        </button>

                        <div className={`ml-8 mt-1 space-y-1 ${openSections[section.key] ? 'block' : 'hidden'}`}>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block p-2 text-sm rounded-md transition-colors ${pathname === item.href
                                        ? "bg-[#94bf28] bg-opacity-20 text-[#94bf28] font-medium"
                                        : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default ConfigSidebar;