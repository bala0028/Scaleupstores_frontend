import React, { createContext, useContext, useState, ReactNode } from "react";

interface ProfileModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ProfileModalContext = createContext<ProfileModalContextType | undefined>(undefined);

export const ProfileModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <ProfileModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ProfileModalContext.Provider>
  );
};

export const useProfileModal = () => {
  const context = useContext(ProfileModalContext);
  if (context === undefined) {
    throw new Error("useProfileModal must be used within a ProfileModalProvider");
  }
  return context;
};
