"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import Header from "../components/commons/header";
import { FaEdit } from "react-icons/fa";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import { useTranslations } from 'next-intl';

type ProfileSection = "editProfile" | "security";

interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  idDepartamento: string;
  empresa: string;
  regional: string;
  activo: boolean;
  requireChangePwd: boolean;
}

export default function Profile({ params }: { params: { locale: string } }) {
  const t = useTranslations('profileClient');
  const [activeSection, setActiveSection] = useState<ProfileSection>("editProfile");
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const userId = Cookies.get("userId");
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`${PATH_URL_BACKEND}/usuario/${userId}`);
        if (!res.ok) throw new Error("Error al obtener el usuario");
        const data = await res.json();
        setUsuario(data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo cargar el perfil del usuario", "error");
      }
    };

    fetchUser();
  }, []);

  const handleSectionChange = (section: ProfileSection) => () => {
    setActiveSection(section);
  };

  const EditProfileSection = () => {
    if (!usuario) return <p className="text-sm text-gray-500">Cargando usuario...</p>;

    return (
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
            <svg
              className="w-24 h-24 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {/* <button
            className="absolute bottom-0 right-0 bg-firstColor text-white p-2 rounded-full hover:bg-secondColor transition"
            title="Editar foto"
          >
            <FaEdit />
          </button> */}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
          {[
            { label: t('name'), value: usuario.nombre },
            { label: "Apellidos", value: usuario.apellidos },
            { label: t('email'), value: usuario.email },
            { label: "Rol", value: usuario.rol },
            { label: t('company'), value: usuario.empresa },
            { label: "Regional", value: usuario.regional },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type="text"
                defaultValue={value}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondColor focus:border-secondColor transition"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SecuritySettingsSection = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();

      if (newPassword !== confirmPassword) {
        Swal.fire("Error", "Las contraseñas no coinciden", "error");
        return;
      }

      const userId = Cookies.get("userId");
      if (!userId) {
        Swal.fire("Error", "No se pudo obtener el ID de usuario", "error");
        return;
      }

      const requestBody = {
        idUsuario: userId,
        oldPassword,
        newPassword,
        confirmPassword,
      };

      try {
        const response = await fetch(`${PATH_URL_BACKEND}/usuario/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Error al cambiar la contraseña");
        }

        Swal.fire("Éxito", "La contraseña se ha cambiado correctamente", "success");
      } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        Swal.fire("Error", error instanceof Error ? error.message : "Hubo un problema al cambiar la contraseña", "error");
      }
    };

    return (
      <form onSubmit={handleChangePassword} className="space-y-6">
        <h2 className="text-lg font-semibold text-firstColor">{t('changePassword')}</h2>
        {[t('currentPassword'), t('newPassword'), t('confirmPassword')].map((label, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="password"
              required
              value={index === 0 ? oldPassword : index === 1 ? newPassword : confirmPassword}
              onChange={(e) =>
                index === 0
                  ? setOldPassword(e.target.value)
                  : index === 1
                    ? setNewPassword(e.target.value)
                    : setConfirmPassword(e.target.value)
              }
              className="mt-1 w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondColor focus:border-secondColor transition"
            />
          </div>
        ))}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-firstColor hover:bg-thirdColor text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {t('saveChanges')}
          </button>
        </div>
      </form>
    );
  };

  const sectionComponents: Record<ProfileSection, JSX.Element> = {
    editProfile: <EditProfileSection />,
    security: <SecuritySettingsSection />
  };

  return (
    <div className="flex flex-col min-h-screen bg-fifthColor">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-firstColor mb-6">{t('title')}</h1>

          <div className="flex space-x-6 border-b border-gray-200 mb-6">
            {Object.keys(sectionComponents).map((section) => (
              <button
                key={section}
                onClick={handleSectionChange(section as ProfileSection)}
                className={`pb-2 text-sm font-medium transition ${activeSection === section
                  ? "border-b-2 border-secondColor text-secondColor"
                  : "text-gray-500 hover:text-secondColor"
                  }`}
              >
                {section === "editProfile" ? t('personalInfo') : t('security')}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {sectionComponents[activeSection]}
          </div>
        </div>
      </main>
    </div>
  );
}
