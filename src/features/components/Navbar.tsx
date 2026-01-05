"use client";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/features/hooks/useAuth";
import { usePathname } from "next/navigation";

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

const NavLink = ({
  href,
  children,
  isScrolled,
  onClick,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  isScrolled: boolean;
  onClick?: () => void;
  isActive?: boolean;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "font-bold text-sm uppercase tracking-widest transition-all hover:text-orange-500 relative pb-1",
      isScrolled ? "text-slate-700" : "text-white/90",
      isActive ? "text-orange-500" : ""
    )}
  >
    {children}
    {isActive && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></span>
    )}
  </Link>
);

const NavDropdown = ({
  label,
  items,
  isScrolled,
  isActive,
}: {
  label: string;
  items: { href: string; label: string; description?: string }[];
  isScrolled: boolean;
  isActive?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={cn(
          "font-bold text-sm uppercase tracking-widest transition-all hover:text-orange-500 flex items-center gap-1 relative pb-1",
          isScrolled ? "text-slate-700" : "text-white/90",
          isActive ? "text-orange-500" : ""
        )}
      >
        {label}
        <ChevronDown
          size={16}
          className={cn(
            "transition-transform duration-300",
            isOpen ? "rotate-180" : ""
          )}
        />
        {isActive && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></span>
        )}
      </button>

      {/* Dropdown Menu - Added padding-top bridge for smooth hover */}
      <div
        className={cn(
          "absolute top-full left-0 pt-2",
          isOpen ? "block" : "hidden"
        )}
      >
        <div className="w-64 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {items.map((item) => {
            // Only match exact page paths, not hash links
            const isItemActive =
              !item.href.includes("#") && pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-6 py-4 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 group/item",
                  isItemActive ? "bg-orange-50" : ""
                )}
              >
                <div
                  className={cn(
                    "font-bold group-hover/item:text-orange-500 transition-colors",
                    isItemActive ? "text-orange-500" : "text-slate-800"
                  )}
                >
                  {item.label}
                </div>
                {item.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

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

  // Check if any NON-HASH items in Get Involved dropdown are active
  const isGetInvolvedActive =
    pathname === "/volunteer" ||
    pathname === "/feedback" ||
    pathname === "/contact";

  // Check if any NON-HASH items in Programs dropdown are active
  const isProgramsActive =
    pathname === "/campaign" ||
    pathname === "/gallary" ||
    pathname === "/office" ||
    pathname === "/faq";

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/90 backdrop-blur-xl py-3 shadow-lg"
          : "bg-transparent py-6"
      )}
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

        <nav className="hidden lg:flex items-center gap-6">
          <NavLink href="/" isScrolled={isScrolled} isActive={pathname === "/"}>
            Home
          </NavLink>

          <NavDropdown
            label="Get Involved"
            isScrolled={isScrolled}
            isActive={isGetInvolvedActive}
            items={[
              {
                href: "/volunteer",
                label: "Volunteer",
                description: "Join our mission",
              },
              {
                href: "/#payment",
                label: "Donate",
                description: "Support our cause",
              },
              {
                href: "/feedback",
                label: "Feedback",
                description: "Share your experience",
              },
              {
                href: "/contact",
                label: "Contact Us",
                description: "Get in touch with us",
              },
            ]}
          />

          <NavDropdown
            label="Programs"
            isScrolled={isScrolled}
            isActive={isProgramsActive}
            items={[
              {
                href: "/campaign",
                label: "Campaigns",
                description: "Our ongoing initiatives",
              },
              {
                href: "/#services",
                label: "Our Services",
                description: "How we serve the community",
              },
              {
                href: "/gallary",
                label: "Gallery",
                description: "See our work in action",
              },
              {
                href: "/#about",
                label: "About Us",
                description: "Our mission & story",
              },
              {
                href: "/office",
                label: "Our Team",
                description: "Meet our team",
              },
              {
                href: "/faq",
                label: "FAQ",
                description: "Common questions",
              },
            ]}
          />

          <NavLink
            href="/blog"
            isScrolled={isScrolled}
            isActive={pathname.startsWith("/blog")}
          >
            Blog
          </NavLink>

          <Link
            href="/contact"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95"
          >
            Contact
          </Link>

          {!isLoading &&
            (isAuthenticated ? (
              <Link
                href="/admin/dashboard"
                className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95"
              >
                Sign In
              </Link>
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
        <div className="lg:hidden fixed inset-0 top-22 bg-white z-40 animate-in slide-in-from-top-4 duration-300 overflow-y-auto">
          <nav className="flex flex-col items-start gap-2 p-8">
            <NavLink href="/" isScrolled={true} onClick={closeMobileMenu}>
              Home
            </NavLink>

            {/* Get Involved Section */}
            <div className="w-full">
              <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mt-4 mb-2">
                Get Involved
              </div>
              <div className="flex flex-col gap-3 pl-4">
                <Link
                  href="/volunteer"
                  onClick={closeMobileMenu}
                  className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
                >
                  Volunteer
                </Link>
                <Link
                  href="/#payment"
                  onClick={closeMobileMenu}
                  className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
                >
                  Donate
                </Link>
                <Link
                  href="/feedback"
                  onClick={closeMobileMenu}
                  className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
                >
                  Feedback
                </Link>
                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Programs Section */}
            <div className="w-full">
              <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mt-4 mb-2">
                Programs
              </div>
              <div className="flex flex-col gap-3 pl-4">
                <Link
                  href="/campaign"
                  onClick={closeMobileMenu}
                  className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
                >
                  Campaigns
                </Link>
                <Link
                  href="/#services"
                  onClick={closeMobileMenu}
                  className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
                >
                  Our Services
                </Link>
                <Link
                  href="/gallary"
                  onClick={closeMobileMenu}
                  className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
                >
                  Gallery
                </Link>
                <Link
                  href="/#about"
                  onClick={closeMobileMenu}
                  className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="/office"
                  onClick={closeMobileMenu}
                  className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
                >
                  Our Team
                </Link>
                <Link
                  href="/faq"
                  onClick={closeMobileMenu}
                  className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>

            {/* Blog Link */}
            <NavLink
              href="/blog"
              isScrolled={true}
              onClick={closeMobileMenu}
              isActive={pathname.startsWith("/blog")}
            >
              Blog
            </NavLink>

            <Link
              href="/#payment"
              onClick={closeMobileMenu}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95 mt-6 w-full text-center"
            >
              Donate Now
            </Link>
            {!isLoading &&
              (isAuthenticated ? (
                <Link
                  href="/admin/dashboard"
                  onClick={closeMobileMenu}
                  className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95 mt-4"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95 mt-4"
                >
                  Sign In
                </Link>
              ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
