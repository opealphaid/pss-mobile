"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import ModalCreateTicketTabsClient from '@/components/FOI/modalCreateTicketTabsClient';

interface ModalContextType {
  openTicketModal: () => void;
  closeTicketModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const openTicketModal = () => setIsTicketModalOpen(true);
  const closeTicketModal = () => setIsTicketModalOpen(false);

  const handleTicketSubmit = () => {
    closeTicketModal();
    window.location.reload();
  };

  return (
    <ModalContext.Provider value={{ openTicketModal, closeTicketModal }}>
      {children}
      <ModalCreateTicketTabsClient
        isOpen={isTicketModalOpen}
        onClose={closeTicketModal}
        onSubmit={handleTicketSubmit}
      />
    </ModalContext.Provider>
  );
}
