"use client";
import { Menu } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");
const NavLink = ({
  href,
  children,
  isScrolled,
}: {
  href: string;
  children: React.ReactNode;
  isScrolled: boolean;
}) => (
  <a
    href={href}
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
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
        <div className="flex items-center gap-3">
          <div>
            <Image src="/logo.svg" width={50} height={50} alt="trust-image" />
          </div>
          <span
            className={cn(
              "text-2xl font-black tracking-tighter",
              isScrolled ? "text-slate-900" : "text-white"
            )}
          >
            SAMRUDHI <span className="text-orange-500 font-black">SEVA</span>
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          <NavLink href="#home" isScrolled={isScrolled}>
            Home
          </NavLink>
          <NavLink href="#about" isScrolled={isScrolled}>
            About
          </NavLink>
          <NavLink href="#work" isScrolled={isScrolled}>
            Work
          </NavLink>
          <NavLink href="#impact" isScrolled={isScrolled}>
            Impact
          </NavLink>
          <NavLink href="#gallery" isScrolled={isScrolled}>
            Gallery
          </NavLink>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95">
            Contact Now
          </button>
        </nav>

        <button className="lg:hidden text-orange-500">
          <Menu size={32} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
