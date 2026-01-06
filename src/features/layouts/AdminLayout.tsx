"use client";

import PermissionErrorHandler from "@/features/components/admin/PermissionErrorHandler";
import { useAuth } from "@/features/hooks/useAuth";
import useSwr from "@/features/hooks/useSwr";
import { AnimatePresence, motion } from "framer-motion";
import NextImage from "next/image";
import {
  Activity,
  Award,
  BarChart3,
  Bell,
  Briefcase,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Image,
  LineChart,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquare,
  QrCode,
  Settings,
  Shield,
  Star,
  UserCog,
  UserPlus,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");
const MENU_ITEMS = [
  {
    icon: BarChart3,
    label: "Dashboard",
    href: "/admin/dashboard",
    permission: "dashboard",
  },
  {
    icon: Users,
    label: "Members",
    href: "/admin/members",
    permission: "members",
  },
  {
    icon: Briefcase,
    label: "Services",
    href: "/admin/services",
    permission: "services",
  },
  {
    icon: Megaphone,
    label: "Campaigns",
    href: "/admin/campaigns",
    permission: "campaigns",
  },
  {
    icon: UserPlus,
    label: "Volunteers",
    href: "/admin/volunteers",
    permission: "volunteers",
  },
  { icon: FileText, label: "Blogs", href: "/admin/blogs", permission: "blogs" },
  {
    icon: LineChart,
    label: "Statistics",
    href: "/admin/stats",
    permission: "stats",
  },
  {
    icon: Star,
    label: "Testimonials",
    href: "/admin/testimonials",
    permission: "testimonials",
  },
  {
    icon: Image,
    label: "Gallery",
    href: "/admin/gallery",
    permission: "gallery",
  },
  {
    icon: Award,
    label: "Certificates",
    href: "/admin/certificates",
    permission: "certificates",
  },
  {
    icon: Globe,
    label: "Content",
    href: "/admin/content",
    permission: "content",
  },
  {
    icon: MessageSquare,
    label: "Feedback",
    href: "/admin/feedback",
    permission: "feedback",
  },
  {
    icon: Mail,
    label: "Contact",
    href: "/admin/contact",
    permission: "contact",
  },
  {
    icon: HelpCircle,
    label: "FAQs",
    href: "/admin/faqs",
    permission: "faqs",
  },
  {
    icon: Mail,
    label: "Newsletter",
    href: "/admin/newsletter",
    permission: "newsletter",
  },
  {
    icon: MessageCircle,
    label: "Blog Comments",
    href: "/admin/blog-comments",
    permission: "blog_comments",
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/admin/notifications",
    permission: "notifications",
  },
  {
    icon: CreditCard,
    label: "Payments",
    href: "/admin/payments",
    permission: "payments",
  },
  {
    icon: Shield,
    label: "Admins",
    href: "/admin/admins",
    permission: "admins",
    roleRequired: ["superadmin", "admin"],
  },
  {
    icon: Activity,
    label: "Audit Logs",
    href: "/admin/audit-logs",
    permission: "audit_logs",
    roleRequired: ["superadmin", "admin"],
  },
  {
    icon: UserCog,
    label: "Profile",
    href: "/admin/profile",
    permission: "profile",
    alwaysShow: true,
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/admin/settings",
    permission: "settings",
  },
] as const;

// ==================== SIDEBAR COMPONENT ====================
const Sidebar = memo(
  ({
    isOpen,
    onClose,
    onNavigate,
    userPermissions,
    userRole,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (href: string) => void;
    userPermissions: string[];
    userRole: string;
  }) => {
    const metaPath = usePathname();
    const [ipInfo, setIpInfo] = useState<{
      ip: string;
      city: string;
      region: string;
      country: string;
    } | null>(null);

    // Fetch IP and location info - only once and store in localStorage
    useEffect(() => {
      const fetchIpInfo = async () => {
        // Check if we already have IP info in localStorage
        const storedIpInfo = localStorage.getItem("adminIpInfo");
        if (storedIpInfo) {
          try {
            setIpInfo(JSON.parse(storedIpInfo));
            return;
          } catch (error) {
            console.error("Failed to parse stored IP info:", error);
          }
        }

        // If not in storage, fetch it
        try {
          const response = await fetch("https://ipapi.co/json/");
          const data = await response.json();
          const ipData = {
            ip: data.ip || "N/A",
            city: data.city || "Unknown",
            region: data.region || "",
            country: data.country_name || "",
          };
          setIpInfo(ipData);
          // Store in localStorage
          localStorage.setItem("adminIpInfo", JSON.stringify(ipData));
        } catch (error) {
          console.error("Failed to fetch IP info:", error);
          const fallbackData = {
            ip: "Unavailable",
            city: "Unknown",
            region: "",
            country: "",
          };
          setIpInfo(fallbackData);
          localStorage.setItem("adminIpInfo", JSON.stringify(fallbackData));
        }
      };
      fetchIpInfo();
    }, []);

    const navRef = useCallback((node: HTMLElement | null) => {
      if (node) {
        const activeButton = node.querySelector('[aria-current="page"]');
        if (activeButton) {
          activeButton.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }, []);

    const handleNavClick = useCallback(
      (href: string) => {
        onNavigate(href);
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          onClose();
        }
      },
      [onNavigate, onClose]
    );

    // Filter menu items based on permissions and role
    const filteredMenuItems = useMemo(() => {
      return MENU_ITEMS.filter((item) => {
        // Superadmin sees everything
        if (userRole === "superadmin") return true;

        // Check if user has permission for this item
        return userPermissions.includes(item.permission);
      });
    }, [userPermissions, userRole]);

    return (
      <>
        {/* Mobile Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            x: isOpen ? 0 : -280,
            width: 280,
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-0 top-0 h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50 lg:translate-x-0"
        >
          {/* Logo */}
          <div className="h-16 lg:h-20 flex items-center justify-between px-4 lg:justify-start lg:gap-3 border-b border-white/10">
            <NextImage
              src="/logo.svg"
              alt="Samriddhi Logo"
              width={48}
              height={48}
              className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
            />
            <h1 className="text-base lg:text-xl font-black text-white uppercase tracking-tighter whitespace-nowrap">
              samriddhi <span className="text-orange-500">ADMIN</span>
            </h1>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors ml-auto"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)]">
            <nav
              ref={navRef}
              className="flex-1 mt-4 lg:mt-8 px-3 lg:px-4 space-y-1 lg:space-y-2 overflow-y-auto scroll-smooth pb-38"
            >
              {filteredMenuItems.map((item) => {
                const isActive = metaPath === item.href;
                return (
                  <motion.button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full relative flex items-center gap-3 lg:gap-4 px-3 lg:px-4 py-3 lg:py-3.5 rounded-xl font-bold text-xs lg:text-sm uppercase tracking-wider transition-all",
                      isActive
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/50"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </nav>

            {/* IP & Location Card */}
            {ipInfo && (
              <div className="absolute bottom-0 left-0 right-0 px-3 lg:px-4 pb-3 bg-linear-to-t from-slate-900 via-slate-900 to-transparent pt-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Wifi className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                        IP Address
                      </p>
                      <p className="text-white font-bold text-xs truncate">
                        {ipInfo.ip}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                        Location
                      </p>
                      <p className="text-white font-bold text-xs truncate">
                        {ipInfo.city}
                        {ipInfo.region && `, ${ipInfo.region}`}
                      </p>
                      {ipInfo.country && (
                        <p className="text-slate-400 text-[10px] truncate">
                          {ipInfo.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      </>
    );
  }
);

Sidebar.displayName = "Sidebar";

// ==================== NOTIFICATION BELL COMPONENT ====================
const NotificationBell = memo(() => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const { data: notificationsData } = useSwr(
    `notifications?limit=5&isRead=false`
  );

  const unreadCount = notificationsData?.unreadCount || 0;
  const recentNotifications = notificationsData?.notifications || [];

  const handleViewAll = () => {
    setShowDropdown(false);
    router.push("/admin/notifications");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-2 w-80 lg:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentNotifications.map(
                    (notification: {
                      _id: string;
                      title: string;
                      message: string;
                      createdAt: string;
                    }) => (
                      <div
                        key={notification._id}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={handleViewAll}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-slate-900 mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                              {notification.message}
                            </p>
                            <span className="text-xs text-slate-400">
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {recentNotifications.length > 0 && (
              <div className="p-3 border-t border-slate-200">
                <button
                  onClick={handleViewAll}
                  className="w-full text-center text-blue-600 hover:text-blue-700 font-semibold text-sm py-2"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

NotificationBell.displayName = "NotificationBell";

// ==================== HEADER COMPONENT ====================
const Header = memo(
  ({
    onToggleSidebar,
    onLogout,
    onOpenQRScanner,
    user,
  }: {
    onToggleSidebar: () => void;
    onLogout: () => void;
    onOpenQRScanner: () => void;
    user: { name?: string; email?: string } | null;
  }) => {
    const getUserInitials = useCallback((name: string) => {
      if (!name) return "A";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }, []);

    const initials = useMemo(
      () => getUserInitials(user?.name || "Admin"),
      [user?.name, getUserInitials]
    );

    return (
      <header className="sticky top-0 h-16 lg:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-40 flex items-center justify-between px-4 lg:px-8 shadow-sm">
        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 bg-slate-100 hover:bg-slate-200 cursor-pointer rounded-xl transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 lg:w-6 lg:h-6 text-slate-700" />
          </button>

          <div className="hidden sm:block">
            <h2 className="text-base lg:text-xl font-black text-slate-900 uppercase tracking-tight">
              Dashboard Overview
            </h2>
          </div>
        </div>
        {/* QR Scanner Button */}
        <button
          onClick={onOpenQRScanner}
          className="flex items-center cursor-pointer gap-2 px-3 lg:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all font-semibold text-xs lg:text-sm hover:scale-105 active:scale-95"
          aria-label="Scan QR Code"
          title="Quick QR Scanner for Payouts"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">QR Scan</span>
        </button>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notification Bell */}
          <NotificationBell />

          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center cursor-pointer gap-2 px-3 lg:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-all font-semibold text-xs lg:text-sm hover:scale-105 active:scale-95"
            aria-label="Logout"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Web View</span>
          </button>
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center cursor-pointer gap-2 px-3 lg:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all font-semibold text-xs lg:text-sm hover:scale-105 active:scale-95"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-slate-200">
            <div className="text-right hidden lg:block">
              <p className="text-slate-900 font-black text-sm uppercase tracking-wider truncate max-w-37.5">
                {user?.name || "Admin User"}
              </p>
              <p className="text-slate-600 text-xs font-bold truncate max-w-37.5">
                {user?.email || "admin@samriddhi.com"}
              </p>
            </div>
            <div
              className="w-10 h-10 lg:w-12 lg:h-12 bg-linear-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-orange-200 cursor-pointer hover:ring-4 transition-all"
              role="img"
              aria-label={`Profile picture of ${user?.name || "Admin"}`}
            >
              <span className="text-white font-black text-base lg:text-lg">
                {initials}
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  }
);

Header.displayName = "Header";

// ==================== LOADING COMPONENT ====================
const LoadingScreen = memo(() => (
  <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 lg:w-16 lg:h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-600 font-semibold text-sm lg:text-base">
        Verifying authentication...
      </p>
    </div>
  </div>
));

LoadingScreen.displayName = "LoadingScreen";

// ==================== MAIN ADMIN LAYOUT COMPONENT ====================
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  // Handle responsive sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Memoized callbacks
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const handleLogout = useCallback(async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          // Clear IP info from localStorage on logout
          localStorage.removeItem("adminIpInfo");

          await Swal.fire({
            title: "Logged out!",
            text: "You have been successfully logged out.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          // Call logout from AuthProvider to clear auth state
          if (logout) {
            await logout();
          } else {
            // Fallback: manually navigate
            router.push("/login");
            router.refresh();
          }
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to logout. Please try again.",
            icon: "error",
          });
        }
      } catch {
        Swal.fire({
          title: "Error!",
          text: "An error occurred. Please try again.",
          icon: "error",
        });
      }
    }
  }, [router, logout]);

  const handleOpenQRScanner = useCallback(() => {
    setIsQRScannerOpen(true);
  }, []);

  const handleQRScan = useCallback(
    (qrData: string) => {
      setIsQRScannerOpen(false);
      // Redirect to payments page with QR data in URL
      router.push(`/admin/payments?qrScan=${encodeURIComponent(qrData)}`);
    },
    [router]
  );

  const mainMargin = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return isSidebarOpen && window.innerWidth >= 1024 ? 280 : 0;
  }, [isSidebarOpen]);
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PermissionErrorHandler>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
          onNavigate={handleNavigate}
          userPermissions={user?.permissions || []}
          userRole={user?.role || "user"}
        />

        {/* Main Content */}
        <motion.main
          style={{ marginLeft: mainMargin }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="transition-all duration-300"
        >
          {/* Header */}
          <Header
            onToggleSidebar={handleToggleSidebar}
            onOpenQRScanner={handleOpenQRScanner}
            onLogout={handleLogout}
            user={user}
          />

          {/* Dashboard Content */}
          <div className="p-4 lg:p-8">{children}</div>
        </motion.main>

        {/* Global QR Scanner */}
        {isQRScannerOpen && (
          <QRScannerModal
            isOpen={isQRScannerOpen}
            onClose={() => setIsQRScannerOpen(false)}
            onScan={handleQRScan}
          />
        )}
      </div>
    </PermissionErrorHandler>
  );
};

// Simple QR Scanner Modal wrapper
function QRScannerModal({
  isOpen,
  onClose,
  onScan,
}: {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}) {
  const [QRScanner, setQRScanner] = useState<React.ComponentType<{
    isOpen: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
  }> | null>(null);

  useEffect(() => {
    // Dynamically import QRScanner to avoid SSR issues
    import("@/features/components/admin/QRScanner").then((mod) => {
      setQRScanner(() => mod.default);
    });
  }, []);

  if (!QRScanner) return null;

  return <QRScanner isOpen={isOpen} onClose={onClose} onScan={onScan} />;
}

export default AdminLayout;
