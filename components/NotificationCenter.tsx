import React, { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, CreditCard, MessageSquare, BookOpen, Briefcase, Check, CheckSquare, Trash, X } from 'lucide-react';
import { useAuth } from '../App';
import { AppNotification } from '../types';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  createNotification
} from '../services/mockDataService';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'hearing' | 'payment' | 'question' | 'article' | 'job'>('all');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async (isInitial = false) => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotifications(user.uid, user.role);
      
      setNotifications(prev => {
        // Find new unread notifications that were not in the previous state:
        if (!isInitial && Notification.permission === "granted") {
           const prevUnreadIds = new Set(prev.filter(n => !n.isRead).map(n => n.id));
           const newUnread = data.filter(n => !n.isRead && !prevUnreadIds.has(n.id));
           newUnread.forEach(n => {
              new Notification(n.title, {
                 body: n.message,
                 icon: '/favicon.ico'
              });
           });
        }
        return data;
      });
      
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
    fetchNotifs(true);
    // Poll notifications every 45s for fresh updates
    const interval = setInterval(() => fetchNotifs(false), 45000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      // Update locally
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.uid, user.role);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'hearing':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'question':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'article':
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case 'job':
        return <Briefcase className="w-4 h-4 text-sky-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStyle = (type: string, isRead: boolean) => {
    const base = "p-3 rounded-xl border flex gap-3 transition duration-200 ";
    if (!isRead) {
      switch (type) {
        case 'hearing':
          return base + "bg-blue-50/70 border-blue-100 hover:bg-blue-50";
        case 'payment':
          return base + "bg-amber-50/70 border-amber-100 hover:bg-amber-50";
        case 'question':
          return base + "bg-emerald-50/70 border-emerald-100 hover:bg-emerald-50";
        case 'article':
          return base + "bg-indigo-50/70 border-indigo-100 hover:bg-indigo-50";
        case 'job':
          return base + "bg-sky-50/70 border-sky-100 hover:bg-sky-50";
        default:
          return base + "bg-slate-50 border-slate-100 hover:bg-slate-100";
      }
    }
    return base + "bg-white border-slate-100 hover:bg-slate-50 opacity-80";
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  if (!user) return null;

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Target bell button inside Header navigation line */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifs();
        }}
        id="navbar-notification-bell"
        className="relative p-2 text-blue-200 hover:text-white rounded-full hover:bg-blue-900/60 transition focus:outline-none flex items-center justify-center cursor-pointer"
        title="Notices & Announcements"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-blue-950 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating PanelDropdown list container */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Main Panel Header */}
          <div className="p-4 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex justify-between items-center shadow-md">
            <div>
              <h3 className="text-sm font-bold tracking-tight">Notices & Alerts | نوٹس بورڈ</h3>
              <p className="text-[10px] text-blue-200 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread announcements` : 'No pending alerts'}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-2.5 py-1 text-[10px] bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer"
                  title="Mark all notifications as read"
                >
                  <CheckSquare className="w-3 h-3" /> Mark Read
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition text-blue-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Categories Tab Bar */}
          <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none bg-slate-50/50 p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition ${
                activeTab === 'all' 
                  ? 'bg-blue-950 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('hearing')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition flex items-center gap-1 ${
                activeTab === 'hearing' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ⚖️ Hearing
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition flex items-center gap-1 ${
                activeTab === 'payment' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              💳 Payment
            </button>
            <button
              onClick={() => setActiveTab('question')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition flex items-center gap-1 ${
                activeTab === 'question' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              💬 Q&A
            </button>
            <button
              onClick={() => setActiveTab('job')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition flex items-center gap-1 ${
                activeTab === 'job' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              💼 Jobs
            </button>
          </div>

          {/* List Section */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-2 select-none">
            {loading && filteredNotifications.length === 0 ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900 mx-auto"></div>
                <p className="text-xs text-slate-400 mt-2">Checking updates...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-600">No Notifications</p>
                <p className="text-xs text-slate-400">Is category mein koi bhe notice nahi hai.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={getStyle(notif.type, notif.isRead)}
                >
                  {/* Category icon container with bubble accent */}
                  <div className="mt-0.5">
                    <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      {getIcon(notif.type)}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} • {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      
                      {!notif.isRead ? (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-0.5 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md cursor-pointer"
                        >
                          <Check className="w-2.5 h-2.5" /> Mark read
                        </button>
                      ) : (
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Read</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Notice Poster (Only available for logged in Admin/Lawyers to simulate/post notifications during sandbox review!) */}
          {(user.role === 'admin' || user.role === 'lawyer') && (
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                ⚡ Quick Simulate Notice (Demo Only)
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <button
                  onClick={async () => {
                    await createNotification(
                      'lawyers',
                      'Case Hearing Update',
                      'State vs. Khan High Court hearing has been scheduled for tomorrow 9:30 AM.',
                      'hearing',
                      '/dashboard/lawyer/cases'
                    );
                    fetchNotifs();
                  }}
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1.5 rounded-lg font-medium transition text-center border border-blue-200 cursor-pointer"
                >
                  ⚖️ Hearing Alert
                </button>
                <button
                  onClick={async () => {
                    await createNotification(
                      user.uid,
                      'Pending Payment Overdue',
                      'Remaining legal consultation installment amount Rs. 12,000 has been marked overdue.',
                      'payment',
                      '/dashboard/lawyer/ledger'
                    );
                    fetchNotifs();
                  }}
                  className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-2 py-1.5 rounded-lg font-medium transition text-center border border-amber-200 cursor-pointer"
                >
                  💳 Overdue Bill
                </button>
                <button
                  onClick={async () => {
                    await createNotification(
                      'lawyers',
                      'New Legal Job Posted',
                      'Senior Executive Legal Counsel vacancy available at Habib Bank HQ Karachi. Apply immediately!',
                      'job',
                      '/qa'
                    );
                    fetchNotifs();
                  }}
                  className="bg-sky-50 text-sky-700 hover:bg-sky-100 px-2 py-1.5 rounded-lg font-medium transition text-center border border-sky-200 cursor-pointer"
                >
                  💼 Corporate Job
                </button>
                <button
                  onClick={async () => {
                    await createNotification(
                      'all',
                      'New Advisory Article Published',
                      'Guide to Divorce, Khula, and Custody updates of Punjab Court Decisions 2026.',
                      'article',
                      '/qa'
                    );
                    fetchNotifs();
                  }}
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1.5 rounded-lg font-medium transition text-center border border-indigo-200 cursor-pointer"
                >
                  📚 Client Article
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
