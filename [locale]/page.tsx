"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaUser, FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { PATH_URL_BACKEND } from "@/components/utils/constants";
import Cookies from "js-cookie";
import ModalChangeFirstPassword from "@/components/layouts/modalChangeFirstPassword";
import Link from "next/link";
import LocaleSwitcher from "@/components/commons/LocaleSwitcher";

interface LoginResponse {
  id: string;
  nombre: string;
  password: string;
  email: string;
  rol: string;
  idDepartamento: string;
  activo: boolean;
  requireChangePwd: boolean;
  principalContact: boolean;
  empresaId: string;
  primerLogin: boolean;
}

export default function Login({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const [loggedUser, setLoggedUser] = useState<LoginResponse | null>(null);

  const getRouteByRole = (role: string): string => {
    const { locale } = params;
    switch (role.toUpperCase()) {
      case "SUPERADMIN":
        return `/${locale}/dashboard`;
      case "ASIGNADOR":
        return `/${locale}/dashboardSup`;
      case "TECNICO":
        return `/${locale}/dashboardTech`;
      case "CLIENTE":
        return `/${locale}/home`;
      default:
        return `/${locale}`;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

      if (!email.trim() || !password.trim()) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor, ingrese su correo electrónico y contraseña.",
        });
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(`${PATH_URL_BACKEND}/usuario/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
           
            const errorText = await response.text(); 
            throw new Error(errorText || "Usuario o contraseña incorrectos."); 
        }

        const user: LoginResponse & { requireChangePwd: boolean } = await response.json();

        if (user.requireChangePwd) {
          setLoggedUser(user);
          setIsPasswordChangeModalOpen(true);
          setLoading(false);
          return;
        }

        localStorage.setItem("userId", user.id);
        localStorage.setItem("fullname", user.nombre);
        localStorage.setItem("email", user.email);
        localStorage.setItem("userRole", user.rol);
        localStorage.setItem("idDepartamento", user.idDepartamento);

        Cookies.set("userId", user.id, { expires: 1 });
        Cookies.set("fullname", user.nombre, { expires: 1 });
        Cookies.set("email", user.email, { expires: 1 });
        Cookies.set("userRole", user.rol, { expires: 1 });
        Cookies.set("idDepartamento", user.idDepartamento, { expires: 1 });
        Cookies.set("puntoContacto", user.principalContact, { expires: 1 });
        Cookies.set("idEmpresa", user.empresaId, { expires: 1 });
        Cookies.set("primerLogin", user.primerLogin.toString(), { expires: 1 });

        sessionStorage.setItem("userId", user.id);
        sessionStorage.setItem("fullname", user.nombre);
        sessionStorage.setItem("email", user.email);
        sessionStorage.setItem("userRole", user.rol);
        sessionStorage.setItem("idDepartamento", user.idDepartamento);

        Swal.fire({
          icon: "success",
          title: `Bienvenido ${user.nombre}`,
          text: "Redirigiendo al sistema...",
          timer: 1500,
          showConfirmButton: false,
        });

        const route = getRouteByRole(user.rol);
        router.push(route);

      } catch (error: any) {
        console.error("Login error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Ocurrió un error al iniciar sesión. Inténtelo nuevamente.",
        });
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-firstColor via-secondColor to-thirdColor overflow-hidden">
      <div className="absolute inset-0">
        <svg className="w-full h-full animate-pulse-slow" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="#D2ECFB"
            fillOpacity="0.3"
            d="M0,160L60,154.7C120,149,240,139,360,133.3C480,128,600,128,720,133.3C840,139,960,149,1080,165.3C1200,181,1320,203,1380,213.3L1440,224V320H1380C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
          <path
            fill="#0075B8"
            fillOpacity="0.2"
            d="M0,288L48,272C96,256,192,224,288,202.7C384,181,480,171,576,170.7C672,171,768,181,864,202.7C960,224,1056,256,1152,256C1248,256,1344,224,1392,208L1440,192V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-firstColor to-secondColor p-6 text-center">
          <div className="flex justify-center">
            <Image
              src="/images/Logo_IT_3.png"
              alt="Alpha IT"
              width={250}
              height={100}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-firstColor mb-6 text-center">Iniciar Sesión</h2>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-thirdColor" />
                </div>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-fifthColor border border-thirdColor rounded-full text-firstColor placeholder-thirdColor focus:outline-none focus:ring-2 focus:ring-thirdColor focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-thirdColor" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-fifthColor border border-thirdColor rounded-full text-firstColor placeholder-thirdColor focus:outline-none focus:ring-2 focus:ring-thirdColor focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-thirdColor hover:text-firstColor transition"
                >
                  {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 rounded-full font-semibold text-white text-lg shadow-md transition-all ${loading ? "bg-thirdColor" : "bg-thirdColor hover:bg-secondColor"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>

          </form>

          <div className="mt-6 text-center">
            <Link href={`/${params.locale}/forgotPassword`}>
              <span className="text-sm text-firstColor hover:text-thirdColor hover:underline transition-colors cursor-pointer">
                ¿Olvidaste tu contraseña?
              </span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <LocaleSwitcher />
      </div>
      
      {isPasswordChangeModalOpen && loggedUser && (
        <ModalChangeFirstPassword
          isOpen={isPasswordChangeModalOpen}
          onClose={() => setIsPasswordChangeModalOpen(false)}
          userId={loggedUser.id}
        />
      )}
    </div>
  );
}