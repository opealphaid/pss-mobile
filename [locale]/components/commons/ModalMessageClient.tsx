"use client";

import { MdClose, MdPhone, MdAccessTime, MdInfoOutline, MdContentCopy } from "react-icons/md";
import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/commons/LocaleSwitcher';

interface ModalMessageClientProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalMessageClient({ isOpen, onClose }: ModalMessageClientProps) {
  const t = useTranslations('supportModal');
  
  if (!isOpen) return null;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert(t('copy'));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-[fadeIn_.2s_ease]">
        <div className="relative p-6 border-b bg-gradient-to-r from-[#002B5B] to-[#004B87] text-white">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <MdInfoOutline size={22} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold leading-tight">{t('title')}</h2>
              <p className="text-white/80 text-sm">{t('subtitle')}</p>
            </div>
          </div>
          <div className="absolute top-4 right-14">
            <LocaleSwitcher />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 hover:bg-white/10 transition"
            aria-label="Cerrar"
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-gray-700 leading-relaxed">
            <span className="font-semibold">{t('greeting')}</span> {t('message')} <span className="font-medium">{t('afterHours')}</span> {t('afterTime')} <b>{t('time')}</b>{t('weekendsHolidays')}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MdAccessTime />
            <span>{t('availability')}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition bg-white">
              <div className="flex items-center gap-2 text-[#002B5B] font-semibold mb-1">
                <MdPhone />
                <span>{t('laPaz')}</span>
              </div>
              <div className="flex items-center justify-between">
                <a
                  href="tel:69722968"
                  className="text-2xl font-bold tracking-wide text-gray-900 hover:underline"
                >
                  69722968
                </a>
                <button
                  onClick={() => copy("69722968")}
                  className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50 flex items-center gap-1"
                >
                  <MdContentCopy size={16} /> {t('copy')}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition bg-white">
              <div className="flex items-center gap-2 text-[#002B5B] font-semibold mb-1">
                <MdPhone />
                <span>{t('santaCruzCochabamba')}</span>
              </div>
              <div className="flex items-center justify-between">
                <a
                  href="tel:62236208"
                  className="text-2xl font-bold tracking-wide text-gray-900 hover:underline"
                >
                  62236208
                </a>
                <button
                  onClick={() => copy("62236208")}
                  className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50 flex items-center gap-1"
                >
                  <MdContentCopy size={16} /> {t('copy')}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 text-blue-900 text-sm p-3">
            {t('suggestion')} <b>"{t('pilotLaPaz')}"</b> {t('suggestion').includes('y') ? 'y' : 'and'} <b>"{t('pilotSCZCBA')}"</b> {t('quickAccess')}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            {t('understood')}
          </button>
        </div>
      </div>
    </div>
  );
}
