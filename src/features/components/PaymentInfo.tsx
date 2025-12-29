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
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const PaymentInfo = () => {
  const upiID = "samrudhiseva@okaxis";
  const bankDetails = {
    accountName: "samriddhi Seva Trust",
    accountNumber: "1234567890123456",
    ifscCode: "UTIB0001234",
    bankName: "Axis Bank",
    branch: "Mumbai Main Branch",
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=upi://pay?pa=${upiID}&pn=SamrudhiSevaTrust&cu=INR`;
  const [copied, setCopied] = useState("");

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
  };

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
                <div className="absolute -inset-1 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-700"></div>
                <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <Image
                    src={qrUrl}
                    alt="Donate UPI QR"
                    width={220}
                    height={220}
                    className="w-52 h-52 rounded-xl mix-blend-multiply"
                    unoptimized
                  />

                  {/* "Scan Any App" Badge */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5 border border-slate-700">
                    <Smartphone className="w-3 h-3" />
                    Scan with any App
                  </div>
                </div>
              </div>

              {/* UPI ID Copy */}
              <div className="mt-8 w-full max-w-[280px]">
                <div
                  onClick={() => copyToClipboard(upiID, "upi")}
                  className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      UPI ID
                    </p>
                    <p className="font-mono text-slate-700 font-semibold text-sm truncate">
                      {upiID}
                    </p>
                  </div>
                  {copied === "upi" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  )}
                </div>
              </div>

              {/* Payment App Icons (Now SVG based) */}
              <div className="mt-8 w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Supported Apps
                </p>
                <div className="flex items-center justify-center gap-3">
                  {/* Google Pay */}
                  <div
                    className="w-10 h-10 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center p-2 hover:scale-110 transition-transform cursor-default"
                    title="Google Pay"
                  >
                    <Logos.GooglePay />
                  </div>
                  {/* PhonePe */}
                  <div
                    className="w-10 h-10 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center p-2 hover:scale-110 transition-transform cursor-default"
                    title="PhonePe"
                  >
                    <Logos.PhonePe />
                  </div>
                  <div
                    className="w-10 h-10 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center p-2 hover:scale-110 transition-transform cursor-default"
                    title="PhonePe"
                  >
                    <Logos.AmazonPay />
                  </div>
                </div>
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
                  value={bankDetails.accountName}
                  icon={<Wallet className="w-5 h-5 text-orange-500" />}
                  onCopy={() =>
                    copyToClipboard(bankDetails.accountName, "name")
                  }
                  isCopied={copied === "name"}
                />
                <DetailRow
                  label="Account Number"
                  value={bankDetails.accountNumber}
                  isMono
                  icon={
                    <div className="w-5 h-5 rounded-full border-2 border-orange-500/30 flex items-center justify-center text-[10px] font-bold text-orange-600">
                      #
                    </div>
                  }
                  onCopy={() =>
                    copyToClipboard(bankDetails.accountNumber, "acc")
                  }
                  isCopied={copied === "acc"}
                />
                <DetailRow
                  label="IFSC Code"
                  value={bankDetails.ifscCode}
                  isMono
                  icon={<Zap className="w-5 h-5 text-orange-500" />}
                  onCopy={() => copyToClipboard(bankDetails.ifscCode, "ifsc")}
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
                        {bankDetails.bankName}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
                      Branch
                    </p>
                    <p className="text-slate-900 font-bold text-sm truncate">
                      {bankDetails.branch}
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

// --- Brand Logos (SVG Paths) ---
const Logos = {
  GooglePay: () => (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      <path
        fill="#4285F4"
        d="M24 9.5c3.3 0 6 1.1 8.2 3.1l-3.3 3.3c-.9-.9-2.5-2-4.9-2-4.2 0-7.6 3.5-7.6 7.8s3.4 7.8 7.6 7.8c4.9 0 6.7-3.5 7-5.3H24v-4.2h12.1c.1.7.2 1.4.2 2.3 0 7.3-4.9 12.4-12.3 12.4-7.4 0-13.4-6-13.4-13.5S16.6 9.5 24 9.5z"
      />
      <path
        fill="#34A853"
        d="M6.7 24l4.6 3.4c1.2-3.6 4.5-6.1 8.7-6.1V16c-6 0-11 3.7-13.3 8z"
      />
      <path
        fill="#FBBC05"
        d="M24 38c3.3 0 6.1-1.1 8.2-3l-4-3.3c-1.1.7-2.6 1.2-4.2 1.2-4.1 0-7.5-2.7-8.7-6.4l-4.6 3.5c2.3 4.3 7.2 8 13.3 8z"
      />
      <path
        fill="#EA4335"
        d="M36.4 21.3H24v4.2h7.1c-.6 2-2.1 3.6-4.2 4.5l4 3.3c2.3-2.1 3.6-5.2 3.6-9.1 0-.9-.1-1.6-.3-2.3z"
      />
    </svg>
  ),

  PhonePe: () => (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      <circle cx="24" cy="24" r="24" fill="#5F259F" />
      <path
        fill="#fff"
        d="M18 12h6c3.3 0 6 2.7 6 6s-2.7 6-6 6h-2v8h-4V12zm4 8h2c1.1 0 2-.9 2-2s-.9-2-2-2h-2v4z"
      />
    </svg>
  ),

  AmazonPay: () => (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      <rect width="48" height="48" rx="10" fill="#000" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fill="#FF9900"
        fontSize="14"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        Pay
      </text>
      <path
        fill="#FF9900"
        d="M14 30c6 4 14 4 20 0l-1.5 2c-5.5 3-11.5 3-17 0l-1.5-2z"
      />
    </svg>
  ),
};

export default PaymentInfo;
