"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BarChart3,
  Briefcase,
  Clock,
  FileText,
  Image,
  LineChart,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Star,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "@/features/hooks/useAuth";

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isAuthenticated, isLoading, user } = useAuth();

  const router = useRouter();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
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
  };

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "Members", href: "/admin/members" },
    { icon: Briefcase, label: "Services", href: "/admin/services" },
    { icon: LineChart, label: "Statistics", href: "/admin/stats" },
    { icon: Star, label: "Testimonials", href: "/admin/testimonials" },
    { icon: Image, label: "Gallery", href: "/admin/gallery" },
    { icon: Award, label: "Certificates", href: "/admin/certificates" },
    { icon: FileText, label: "Content", href: "/admin/content" },
    { icon: MessageSquare, label: "Feedback", href: "/admin/feedback" },
    { icon: Mail, label: "Contact", href: "/admin/contact" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-semibold">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50 overflow-hidden"
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-white/10">
          <motion.div
            animate={{ scale: isSidebarOpen ? 1 : 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {isSidebarOpen ? (
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                samriddhi <span className="text-orange-500">ADMIN</span>
              </h1>
            ) : (
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50">
                <span className="text-white font-black text-xl">S</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Menu Items */}
        <nav className="mt-8 px-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all",
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/50"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
      </motion.aside>

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen"
      >
        {/* Header */}
        <header className="sticky top-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-40 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-slate-100 cursor-pointer rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>

            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Dashboard Overview
              </h2>
              <p className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Last updated: Just now
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400 w-48"
              />
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all font-semibold text-sm hover:scale-105 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-slate-900 font-black text-sm uppercase tracking-wider">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-slate-600 text-xs font-bold">
                  {user?.email || "admin@samriddhi.com"}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-orange-200 cursor-pointer hover:ring-4 transition-all">
                <span className="text-white font-black text-lg">
                  {getUserInitials(user?.name || "Admin")}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
};
export default AdminLayout;
