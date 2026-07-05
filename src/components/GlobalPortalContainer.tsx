"use client";

import { createContext, useContext, useState, useCallback } from "react";
import SideNavPortal from "@/components/SideNavPortal";
import NotificationDropdownPortal from "@/components/NotificationDropdownPortal";
import { useEffect, useRef } from "react";

type Notification = {
  id: string;
  user_id: string;
  order_id: string | null;
  type: string;
  title: string;
  message: string;
  icon: string;
  link: string;
  read: number;
  created_at: string;
  order_tracking_id: string | null;
};

type GlobalPortalContextType = {
  sideNavOpen: boolean;
  openSideNav: () => void;
  closeSideNav: () => void;
  toggleSideNav: () => void;
  notificationOpen: boolean;
  openNotification: () => void;
  closeNotification: () => void;
  notificationData: {
    notifications: Notification[];
    unread: number;
    markAllRead: () => void;
    deleteNotif: (id: string, e: React.MouseEvent) => void;
  };
  setNotificationData: (callback: (prev: GlobalPortalContextType['notificationData']) => GlobalPortalContextType['notificationData']) => void;
  notificationButtonRef: React.RefObject<HTMLButtonElement | null>;
  userId: string | null;
  setUserId: (userId: string | null) => void;
};

const GlobalPortalContext = createContext<GlobalPortalContextType | null>(null);

export function useGlobalPortals() {
  const context = useContext(GlobalPortalContext);
  if (!context) {
    throw new Error("useGlobalPortals must be used within GlobalPortalProvider");
  }
  return context;
}

export function GlobalPortalProvider({ children }: { children: React.ReactNode }) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationData, setNotificationData] = useState<GlobalPortalContextType['notificationData']>({
    notifications: [],
    unread: 0,
    markAllRead: () => {},
    deleteNotif: () => {},
  });
  const [userId, setUserId] = useState<string | null>(null);
  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);

  const openSideNav = useCallback(() => setSideNavOpen(true), []);
  const closeSideNav = useCallback(() => setSideNavOpen(false), []);
  const toggleSideNav = useCallback(() => setSideNavOpen((v) => !v), []);
  const openNotification = useCallback(() => setNotificationOpen(true), []);
  const closeNotification = useCallback(() => setNotificationOpen(false), []);

  const setNotificationDataCallback = useCallback((callback: (prev: GlobalPortalContextType['notificationData']) => GlobalPortalContextType['notificationData']) => {
    setNotificationData(callback);
  }, []);

  // Close notification when side nav opens
  useEffect(() => {
    if (sideNavOpen) {
      setNotificationOpen(false);
    }
  }, [sideNavOpen]);

  // Close side nav when notification opens
  useEffect(() => {
    if (notificationOpen) {
      setSideNavOpen(false);
    }
  }, [notificationOpen]);

  return (
    <GlobalPortalContext.Provider
      value={{
        sideNavOpen,
        openSideNav,
        closeSideNav,
        toggleSideNav,
        notificationOpen,
        openNotification,
        closeNotification,
        notificationData,
        setNotificationData: setNotificationDataCallback,
        notificationButtonRef,
        userId,
        setUserId,
      }}
    >
      {children}
      <SideNavPortal
        open={sideNavOpen}
        onClose={closeSideNav}
        userId={userId}
      />
      <NotificationDropdownPortal
        open={notificationOpen}
        onClose={closeNotification}
        notifications={notificationData.notifications}
        unread={notificationData.unread}
        onMarkAllRead={notificationData.markAllRead}
        onDeleteNotif={notificationData.deleteNotif}
        triggerRef={notificationButtonRef}
      />
    </GlobalPortalContext.Provider>
  );
}
