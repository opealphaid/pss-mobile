"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import HeaderWithLocale from "@/app/[locale]/components/commons/header";
import HeaderWithoutLocale from "@/components/commons/header";

export default function HeaderWrapper() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = Cookies.get("userRole");
    setUserRole(role || null);
  }, []);

  // Si es cliente, usar el header con traducciones
  if (userRole === "CLIENTE") {
    return <HeaderWithLocale />;
  }

  // Para otros roles, usar el header sin traducciones
  return <HeaderWithoutLocale />;
}
