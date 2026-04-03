import { useEffect, useState, useRef } from "react";
import { Bell, Trash2, CheckCircle, Info, AlertTriangle, Megaphone, BookOpen, RotateCcw, Key } from "lucide-react";
import api from "../api";

export default function NotificationArea() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/my");
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 minute poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/read/${id}`);
      if (res.data.success) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put("/notifications/read-all");
      if (res.data.success) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const isReadNotification = notifications.find(n => n._id === id)?.isRead;
      const res = await api.delete(`/notifications/delete/${id}`);
      if (res.data.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (!isReadNotification) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "Overdue": return { bg: "bg-red-50", text: "text-red-700", icon: <AlertTriangle size={14} className="text-red-600" /> };
      case "Announcement": return { bg: "bg-blue-50", text: "text-blue-700", icon: <Megaphone size={14} className="text-blue-600" /> };
      case "Reservation": return { bg: "bg-amber-50", text: "text-amber-700", icon: <CheckCircle size={14} className="text-amber-600" /> };
      case "Requested": return { bg: "bg-indigo-50", text: "text-indigo-700", icon: <BookOpen size={14} className="text-indigo-600" /> };
      case "Returned": return { bg: "bg-emerald-50", text: "text-emerald-700", icon: <RotateCcw size={14} className="text-emerald-600" /> };
      case "Access": return { bg: "bg-purple-50", text: "text-purple-700", icon: <Key size={14} className="text-purple-600" /> };
      default: return { bg: "bg-gray-100", text: "text-gray-700", icon: <Info size={14} className="text-gray-500" /> };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-[#0B132B] transition-all rounded-full hover:bg-gray-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#D26E4B] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white ring-1 ring-gray-100">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#E8E6DF] shadow-2xl rounded-xl z-50 transform origin-top-right overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-4 border-b border-[#E8E6DF] bg-[#FAF9F5] flex justify-between items-center">
            <h3 className="font-['Playfair_Display'] font-bold text-lg text-[#0B132B]">Archival Notices</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold tracking-widest text-[#8e6b10] hover:text-[#0B132B] uppercase transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((n) => {
                  const style = getTypeStyle(n.type);
                  return (
                    <div 
                      key={n._id} 
                      className={`p-4 hover:bg-gray-50 transition-colors relative group ${!n.isRead ? 'bg-gray-50/50' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                          {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-xs font-bold truncate pr-6 ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</h4>
                            <span className="text-[9px] text-gray-400 whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed mb-2">{n.message}</p>
                          <div className="flex items-center gap-3">
                            {!n.isRead && (
                              <button 
                                onClick={() => handleMarkAsRead(n._id)}
                                className="text-[9px] font-bold text-[#8e6b10] hover:underline uppercase tracking-widest"
                              >
                                Mark Read
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(n._id)}
                              className="text-[9px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest flex items-center"
                            >
                              <Trash2 size={10} className="mr-1" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      {!n.isRead && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#8e6b10] rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-gray-300" />
                </div>
                <p className="text-xs text-gray-400 italic">Silence in the archives. No new notices.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#FAF9F5] border-t border-[#E8E6DF] text-center">
            <button className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase hover:text-gray-600 transition-colors">
              Advanced Notification Suite
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
