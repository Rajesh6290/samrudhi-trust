"use client";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/features/hooks/useAuth";

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");
const NavLink = ({
  href,
  children,
  isScrolled,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  isScrolled: boolean;
  onClick?: () => void;
}) => (
  <a
    href={href}
    onClick={onClick}
    className={cn(
      "font-bold text-sm uppercase tracking-widest transition-all hover:text-orange-500",
      isScrolled ? "text-slate-700" : "text-white/90"
    )}
  >
    {children}
  </a>
);
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`
           fixed top-0 w-full z-50 transition-all duration-500
          ${
            isScrolled
              ? "bg-white/90 backdrop-blur-xl py-3 shadow-lg"
              : "bg-transparent py-6"
          }
        `}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" width={50} height={50} alt="trust-image" />

          <span
            className={cn(
              "text-2xl font-black uppercase tracking-tighter",
              isScrolled ? "text-slate-900" : "text-white"
            )}
          >
            samriddhi{" "}
            <span className="text-orange-500 font-black">SEVA Trust</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <NavLink href="/" isScrolled={isScrolled}>
            Home
          </NavLink>
          <NavLink href="/gallary" isScrolled={isScrolled}>
            Gallery
          </NavLink>
          <NavLink href="/volunteer" isScrolled={isScrolled}>
            Volunteer
          </NavLink>
          <NavLink href="/faq" isScrolled={isScrolled}>
            FAQ
          </NavLink>
          <a
            href="/contact"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95"
          >
            Contact Now
          </a>
          {!isLoading &&
            (isAuthenticated ? (
              <a
                href="/admin/dashboard"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95"
              >
                Dashboard
              </a>
            ) : (
              <a
                href="/admin/login"
                className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95"
              >
                Sign In
              </a>
            ))}
        </nav>

        <button
          className="lg:hidden text-orange-500"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[88px] bg-white z-40 animate-slideDown">
          <nav className="flex flex-col items-center gap-6 p-8">
            <NavLink href="/" isScrolled={true} onClick={closeMobileMenu}>
              Home
            </NavLink>
            <NavLink
              href="/gallary"
              isScrolled={true}
              onClick={closeMobileMenu}
            >
              Gallery
            </NavLink>
            <NavLink
              href="/volunteer"
              isScrolled={true}
              onClick={closeMobileMenu}
            >
              Volunteer
            </NavLink>
            <NavLink href="/faq" isScrolled={true} onClick={closeMobileMenu}>
              FAQ
            </NavLink>
            <NavLink href="/office" isScrolled={true} onClick={closeMobileMenu}>
              Team
            </NavLink>
            <NavLink
              href="/feedback"
              isScrolled={true}
              onClick={closeMobileMenu}
            >
              Feedback
            </NavLink>
            <a
              href="/contact"
              onClick={closeMobileMenu}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95 mt-4"
            >
              Contact Now
            </a>
            {!isLoading &&
              (isAuthenticated ? (
                <a
                  href="/admin/dashboard"
                  onClick={closeMobileMenu}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95 mt-4"
                >
                  Dashboard
                </a>
              ) : (
                <a
                  href="/admin/login"
                  onClick={closeMobileMenu}
                  className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95 mt-4"
                >
                  Sign In
                </a>
              ))}
          </nav>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
