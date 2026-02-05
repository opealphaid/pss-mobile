"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import ModalCreateTicketPersonal from "@/app/[locale]/components/client/ModalCreateTicketPersonal";
import ModalCreateTicketFoi from "@/components/FOI/ModalCreateTicketFoi";
import { useTranslations } from 'next-intl';

interface ModalCreateTicketTabsProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    solicitanteInfo?: any;
    loadingSolicitante?: boolean;
}

export default function ModalCreateTicketTabsPersonal({
    isOpen,
    onClose,
    onSubmit,
    solicitanteInfo,
    loadingSolicitante
}: ModalCreateTicketTabsProps) {
    const t = useTranslations('ticketModal');
    const [activeTab, setActiveTab] = useState("soporte");
    const [showTabs, setShowTabs] = useState(true);

    useEffect(() => {
        const userEmail = Cookies.get("email");

        if (userEmail && !userEmail.endsWith("@alphasys.com.bo")) {
            setShowTabs(false);
            setActiveTab("soporte");
        } else {
            setShowTabs(true);
        }
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 text-black backdrop-blur-sm overflow-y-auto py-10">
            <div className="bg-white p-8 rounded-xl w-full max-w-5xl shadow-2xl my-8 mx-4">
                <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-black">{t('createTicket')}</h2>

                    {showTabs && (
                        <div className="grid grid-cols-2 gap-2 w-1/2 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab("soporte")}
                                className={`rounded-md py-2 ${activeTab === "soporte" ? "bg-firstColor text-white" : ""}`}
                            >
                                {t('normal')}
                            </button>
                            <button
                                onClick={() => setActiveTab("foi")}
                                className={`rounded-md py-2 ${activeTab === "foi" ? "bg-green-500 text-white" : ""}`}
                            >
                                {t('foi')}
                            </button>
                        </div>
                    )}
                </div>

                {activeTab === "soporte" ? (
                    <ModalCreateTicketPersonal
                        isOpen={true}
                        onClose={onClose}
                        onSubmit={onSubmit}
                    />
                ) : (
                    <ModalCreateTicketFoi
                        solicitanteInfo={solicitanteInfo}
                        onClose={onClose}
                        onSubmit={onSubmit}
                        loadingSolicitante={loadingSolicitante}
                    />
                )}
            </div>
        </div>
    );
}
