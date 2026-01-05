"use client";
import {
  Copy,
  Check,
  ShieldCheck,
  HeartHandshake,
  BadgePercent,
  Smartphone,
  Zap,
  Wallet,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface SiteSettings {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  upiId: string;
  organizationName: string;
  phone: string;
}

const PaymentInfo = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-5xl w-full">
          <div className="bg-white rounded-[2.5rem] shadow-lg overflow-hidden animate-pulse">
            <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              <div className="lg:col-span-5 p-10 bg-slate-50/50">
                <div className="w-52 h-52 bg-slate-200 rounded-2xl mx-auto" />
                <div className="mt-8 h-12 bg-slate-200 rounded-xl w-full max-w-70 mx-auto" />
              </div>
              <div className="lg:col-span-7 p-12">
                <div className="space-y-4">
                  <div className="h-20 bg-slate-200 rounded-2xl" />
                  <div className="h-20 bg-slate-200 rounded-2xl" />
                  <div className="h-20 bg-slate-200 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!settings) {
    return null;
  }

  // Donation page URL for QR code
  const donationPageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/donation`
      : "https://yourwebsite.com/donation";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&format=png&data=${encodeURIComponent(donationPageUrl)}`;
  return (
    <section className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4 font-sans">
      <div className="max-w-5xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold tracking-wide uppercase">
            <HeartHandshake className="w-4 h-4" />
            Support Our Mission
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Make a Difference Today
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed">
            Your contributions directly fund food and medicine. <br />
            100% transparent. No hidden costs.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 relative">
          <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Left Side: QR & Payment Apps */}
            <div className="lg:col-span-5 p-10 bg-slate-50/50 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Background Blobs */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

              {/* QR Container */}
              <div className="relative group z-10">
                <div className="absolute -inset-1 bg-linear-to-tr from-orange-500 to-rose-500 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-700"></div>

                <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <Image
                    src={qrUrl}
                    alt="Donate Page QR"
                    width={220}
                    height={220}
                    className="w-52 h-52 rounded-xl mix-blend-multiply"
                    unoptimized
                  />

                  {/* "Scan to Donate" Badge */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5 border border-slate-700">
                    <Smartphone className="w-3 h-3" />
                    Scan to Donate
                  </div>
                </div>
              </div>

              {/* Donate Now Button */}
              <div className="mt-8 w-full max-w-70">
                <Link href="/donation">
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <HeartHandshake className="w-5 h-5" />
                    <span>Donate Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>

              {/* Payment App Icons (Now SVG based) */}
              <div className="mt-8 w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Supported Apps
                </p>
                <div className="mt-6 flex justify-center gap-x-4">
                  <Image
                    alt="BHIM"
                    className="h-8"
                    src="/upi/bhim.svg"
                    width={100}
                    height={32}
                  />
                  <Image
                    alt="UPI"
                    className="h-8"
                    src="/upi/upi.svg"
                    width={100}
                    height={32}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-3.5">
                <Image
                  alt="Google Pay"
                  className="h-6"
                  src="/upi/gpay.svg"
                  width={50}
                  height={24}
                />
                <Image
                  alt="PhonePe"
                  className="h-6"
                  src="/upi/phonepe.svg"
                  width={70}
                  height={24}
                />
                <Image
                  alt="Paytm"
                  className="h-6"
                  src="/upi/paytm.svg"
                  width={60}
                  height={24}
                />
                <Image
                  alt="Amazon Pay"
                  className="h-6"
                  src="/upi/amazon.svg"
                  width={70}
                  height={24}
                />
              </div>
            </div>

            {/* Right Side: Bank Details */}
            <div className="lg:col-span-7 p-8 md:p-12 bg-white flex flex-col justify-center">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Bank Transfer
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    For larger donations & corporate funds
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">
                  <BadgePercent className="w-3.5 h-3.5" />
                  80G Benefits
                </div>
              </div>

              <div className="space-y-4">
                <DetailRow
                  label="Account Name"
                  value={settings.accountHolderName}
                  icon={<Wallet className="w-5 h-5 text-orange-500" />}
                  onCopy={() =>
                    copyToClipboard(settings.accountHolderName, "name")
                  }
                  isCopied={copied === "name"}
                />
                <DetailRow
                  label="Account Number"
                  value={settings.accountNumber}
                  isMono
                  icon={
                    <div className="w-5 h-5 rounded-full border-2 border-orange-500/30 flex items-center justify-center text-[10px] font-bold text-orange-600">
                      #
                    </div>
                  }
                  onCopy={() => copyToClipboard(settings.accountNumber, "acc")}
                  isCopied={copied === "acc"}
                />
                <DetailRow
                  label="IFSC Code"
                  value={settings.ifscCode}
                  isMono
                  icon={<Zap className="w-5 h-5 text-orange-500" />}
                  onCopy={() => copyToClipboard(settings.ifscCode, "ifsc")}
                  isCopied={copied === "ifsc"}
                />

                <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-2">
                  <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
                        Bank Name
                      </p>
                      <p className="text-slate-900 font-bold text-sm">
                        {settings.bankName}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
                      Registration
                    </p>
                    <p className="text-slate-900 font-bold text-sm truncate">
                      41532200031/2022
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Strip */}
          <div className="bg-slate-50/80 backdrop-blur-sm px-8 py-4 border-t border-slate-100">
            <div className="flex flex-wrap gap-4 justify-center md:justify-between items-center text-xs md:text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Trust</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                <span>Zero Platform Fees</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
                <Check className="w-4 h-4 text-blue-500" />
                <span>Direct to Beneficiary</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Sub Components ---

const DetailRow = ({
  label,
  value,
  icon,
  isMono = false,
  onCopy,
  isCopied,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isMono?: boolean;
  onCopy: () => void;
  isCopied: boolean;
}) => (
  <div
    onClick={onCopy}
    className="group relative flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-orange-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 cursor-pointer"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
        <p
          className={`text-slate-800 font-bold text-base md:text-lg ${
            isMono ? "font-mono tracking-tight" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>

    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-colors">
      {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-4 h-4" />}
    </div>
  </div>
);

export default PaymentInfo;
