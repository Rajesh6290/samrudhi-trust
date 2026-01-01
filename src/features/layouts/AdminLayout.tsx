"use client";

import { useAuth } from "@/features/hooks/useAuth";
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
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");
const MENU_ITEMS = [
  { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Members", href: "/admin/members" },
  { icon: Briefcase, label: "Services", href: "/admin/services" },
  { icon: UserPlus, label: "Volunteers", href: "/admin/volunteers" },
  { icon: LineChart, label: "Statistics", href: "/admin/stats" },
  { icon: Star, label: "Testimonials", href: "/admin/testimonials" },
  { icon: Image, label: "Gallery", href: "/admin/gallery" },
  { icon: Award, label: "Certificates", href: "/admin/certificates" },
  { icon: FileText, label: "Content", href: "/admin/content" },
  { icon: MessageSquare, label: "Feedback", href: "/admin/feedback" },
  { icon: Mail, label: "Contact", href: "/admin/contact" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
] as const;

// ==================== SIDEBAR COMPONENT ====================
const Sidebar = memo(
  ({
    isOpen,
    onClose,
    onNavigate,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (href: string) => void;
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
          <nav className="mt-4 lg:mt-8 px-3 lg:px-4 space-y-1 lg:space-y-2 overflow-y-auto h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {MENU_ITEMS.map((item) => {
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
    user,
  }: {
    onToggleSidebar: () => void;
    onLogout: () => void;
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
      router.push("/admin/login");
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
          router.push("/admin/login");
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <motion.main
        animate={{
          marginLeft: mainMargin,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen"
      >
        {/* Header */}
        <Header
          onToggleSidebar={handleToggleSidebar}
          onLogout={handleLogout}
          user={user}
        />

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8">{children}</div>
      </motion.main>
    </div>
  );
};

export default AdminLayout;
