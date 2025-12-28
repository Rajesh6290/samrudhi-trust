"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Download,
  ExternalLink,
  Eye,
  ShieldCheck,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// --- Types ---
interface Certificate {
  id: number;
  title: string;
  issuer: string;
  date: string;
  type: "Legal" | "Award" | "Compliance";
  image: string;
  regNumber: string;
}

// --- Mock Data ---
const certificates: Certificate[] = [
  {
    id: 1,
    title: "80G Tax Exemption",
    issuer: "Income Tax Department",
    date: "Valid till 2026",
    type: "Legal",
    regNumber: "ITBA/EXM/S/80G/2023",
    // Using placeholder document images
    image:
      "https://images.bannerbear.com/requests/images/008/924/579/original/eac42cabf39c21cf858e5f844efc4a0522f8e179.png?1632808302",
  },
  {
    id: 3,
    title: "ISO 9001:2015 Certified",
    issuer: "International Standards",
    date: "2024 - 2027",
    type: "Compliance",
    regNumber: "ISO/QM/9982",
    image:
      "https://images.bannerbear.com/requests/images/008/925/756/original/170390a0bd96de43dff97995168a7632fe4a98e1.png?1632811033",
  },
  {
    id: 4,
    title: "Best NGO Award 2024",
    issuer: "Social Impact Forum",
    date: "Dec 2024",
    type: "Award",
    regNumber: "AWD-2024-001",
    image:
      "https://images.bannerbear.com/direct/4mGpW3zwrxA1K0AxQw/requests/000/010/382/677/Lvpkalx2D6B5GKMMzWE7rB3Xq/a40521e401ae999872137edffbddcb86aa549737.jpg",
  },
];

const Certifications = () => {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  return (
    <section className="py-24  overflow-hidden relative z-0">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="p-2 bg-orange-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-orange-600" />
            </span>
            <span className="text-orange-600 font-bold uppercase tracking-wider text-sm">
              Transparency & Trust
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6"
          >
            Certified for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Excellence & Impact
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 leading-relaxed max-w-2xl"
          >
            We adhere to the highest standards of transparency and legal
            compliance. Click on any document to view details.
          </motion.p>
        </div>

        {/* Grid - Using the Gallery Card Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => setSelectedCert(cert)}
              // EXACT GALLERY CARD STYLING: aspect ratio, rounded corners, shadows, hover lift
              className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer bg-slate-200 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
            >
              {/* Full Background Image with Zoom Effect */}
              <Image
                src={cert.image}
                alt={cert.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-95"
              />

              {/* Gradient Overlay - Appears on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content Overlay - Slides up on Hover */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-orange-400 text-xs font-bold uppercase tracking-wider block mb-1">
                  {cert.type}
                </span>
                <h3 className="text-white text-xl font-bold leading-tight">
                  {cert.title}
                </h3>
                <p className="text-white/70 text-sm mt-1 truncate">
                  {cert.issuer}
                </p>
              </div>

              {/* Top Right Icon Button - Slides down on Hover */}
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                {/* Using Eye icon here as it fits 'viewing a document' */}
                <Eye className="text-white w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]"
            >
              {/* Left: Image (Scrollable if needed) */}
              <div className="w-full md:w-3/5 bg-slate-100 relative h-64 md:h-auto overflow-hidden">
                <Image
                  src={selectedCert.image}
                  alt={selectedCert.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
              </div>

              {/* Right: Details */}
              <div className="w-full md:w-2/5 p-8 md:p-10 flex flex-col bg-white">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-orange-50 rounded-2xl">
                    {selectedCert.type === "Award" ? (
                      <Award className="w-8 h-8 text-orange-500" />
                    ) : (
                      <ShieldCheck className="w-8 h-8 text-orange-500" />
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">
                      {selectedCert.title}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium">
                      Issued by {selectedCert.issuer}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <DetailRow
                      label="Registration No."
                      value={selectedCert.regNumber}
                      mono
                    />
                    <DetailRow label="Validity" value={selectedCert.date} />
                    <DetailRow
                      label="Status"
                      value="Active & Verified"
                      active
                    />
                  </div>

                  <p className="text-sm text-slate-500 leading-relaxed py-4 border-t border-slate-100">
                    This document verifies that {selectedCert.issuer} has
                    officially recognized our organization. Scan the QR code on
                    the document or verify via the official portal.
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3">
                  <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-slate-200">
                    <ExternalLink className="w-4 h-4" />
                    Verify
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// --- Helper for Modal Details ---
const DetailRow = ({
  label,
  value,
  mono,
  active,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
    <span
      className={`text-sm font-bold ${
        mono ? "font-mono text-slate-700" : "text-slate-800"
      } ${active ? "text-green-600 flex items-center gap-1.5" : ""}`}
    >
      {active && (
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse relative top-[1px]" />
      )}
      {value}
    </span>
  </div>
);

export default Certifications;
