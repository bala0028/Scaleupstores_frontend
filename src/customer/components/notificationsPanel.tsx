import React, { useEffect } from "react";
import { notificationService } from "@/shared/api/services";
import { useNavigate } from "react-router-dom";
import { Notification } from "@/shared/api/services/types";
import { X, Trash2 } from "lucide-react";
import type { CustomerUser } from "@/shared/contexts/AuthContext";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: CustomerUser;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  openFeedbackModal: (product: { id: number; product_name?: string }, callback: () => void) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  user,
  notifications,
  setNotifications,
  unreadCount,
  setUnreadCount,
  openFeedbackModal,
}) => {
  const [swipedId, setSwipedId] = React.useState<number | null>(null);
  const touchStartX = React.useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || unreadCount <= 0 || !user?.customer_details?.id) return;
    notificationService.customer
      .markAllRead(user.customer_details.id)
      .then(() => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      })
      .catch(console.error);
  }, [isOpen, unreadCount, user?.customer_details?.id, setUnreadCount, setNotifications]);

  const deleteNotification = async (id: number) => {
    try {
      await notificationService.customer.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.customer.clearAll(user.customer_details!.id);
      setNotifications([]);
      setUnreadCount(0);
      onClose();
    } catch (err) {
      console.error("Clear all error:", err);
    }
  };

  const handleClick = async (n: Notification) => {
    try {
      await notificationService.customer.markRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      if (!n.is_read) setUnreadCount((c) => c - 1);
    } catch (err) {
      console.error(err);
    }

    const typed = n as Record<string, unknown>;
    if (typed.type === "order_status") navigate(`/order-tracking/${typed.order_number}`);
    else if (typed.type === "product_rating") {
      openFeedbackModal(
        { id: (typed.product_id as number) || 0, product_name: typed.product_name as string },
        () => deleteNotification(n.id)
      );
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[2000]" onClick={onClose} />
      <div className="fixed top-0 right-0 w-80 h-screen bg-brand-cream border-l-2 border-brand-border z-[2100] flex flex-col animate-[slideInRight_0.3s_ease_forwards]">
        <div className="p-[15px] flex justify-between border-b border-brand-border">
          <h6>Notifications</h6>
          {notifications.length > 0 && (
            <button
              className="border-none bg-destructive text-white px-2.5 py-1.5 rounded-md"
              onClick={clearAll}
            >
              Clear All
            </button>
          )}
          <button
            className="w-7 h-7 rounded-full border-[1.5px] border-destructive bg-white text-destructive flex items-center justify-center text-sm cursor-pointer transition-all duration-[250ms] mr-2.5 hover:bg-destructive hover:text-white hover:scale-110"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-70px)]">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 mt-3">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="relative w-full overflow-hidden bg-brand-cream border-b border-brand-border group"
                onTouchStart={(e) => {
                  touchStartX.current = e.changedTouches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const diff = touchStartX.current - e.changedTouches[0].clientX;
                  if (diff > 40) setSwipedId(n.id);
                  else if (diff < -40) setSwipedId(null);
                }}
              >
                <div
                  className={`w-full p-3.5 bg-brand-cream relative z-[2] transition-transform duration-[250ms] ease-in-out ${swipedId === n.id ? "-translate-x-[70px]" : ""} group-hover:-translate-x-[70px]`}
                  onClick={() => handleClick(n)}
                >
                  <strong>{(n as Record<string, unknown>).title as string}</strong>
                  <p>{n.message}</p>
                  <span className="text-muted-foreground text-xs">
                    {new Date(
                      ((n as Record<string, unknown>).created_at as string) || ""
                    ).toLocaleString()}
                  </span>
                </div>
                <div
                  className="absolute top-0 right-0 w-[70px] h-full bg-destructive text-white flex items-center justify-center z-[1]"
                  onClick={() => deleteNotification(n.id)}
                >
                  <Trash2 size={16} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
