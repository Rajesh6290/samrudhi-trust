"use client";

import { useAuth } from "@/features/hooks/useAuth";
import PermissionErrorHandler from "@/features/components/admin/PermissionErrorHandler";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BarChart3,
  Briefcase,
  FileText,
  Globe,
  Image,
  LineChart,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  Star,
  Users,
  X,
  UserPlus,
  Megaphone,
  Shield,
  UserCog,
  CreditCard,
  Webhook,
  QrCode,
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
    icon: CreditCard,
    label: "Payments",
    href: "/admin/payments",
    permission: "payments",
  },
  {
    icon: QrCode,
    label: "Reconciliation",
    href: "/admin/payments/reconciliation",
    permission: "payments",
  },
  {
    icon: Webhook,
    label: "Webhooks",
    href: "/admin/webhooks",
    permission: "webhooks",
  },
  {
    icon: Shield,
    label: "Admins",
    href: "/admin/admins",
    permission: "admins",
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
          <div className="h-16 lg:h-20 flex items-center justify-between px-4 lg:justify-center border-b border-white/10">
            <h1 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter">
              samriddhi <span className="text-orange-500">ADMIN</span>
            </h1>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="mt-4 lg:mt-8 px-3 lg:px-4 pb-8 space-y-1 lg:space-y-2 overflow-y-auto h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)]">
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
        </motion.aside>
      </>
    );
  }
);

Sidebar.displayName = "Sidebar";

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
  const { isAuthenticated, isLoading, user } = useAuth();
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
        });

        if (response.ok) {
          await Swal.fire({
            title: "Logged out!",
            text: "You have been successfully logged out.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          router.push("/login");
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
  }, [router]);

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
