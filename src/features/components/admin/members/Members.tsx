"use client";
import CustomButton from "@/common/CustomButton";
import useMutation from "@/features/hooks/useMutation";
import useSwr from "@/features/hooks/useSwr";
import { PictureAsPdf } from "@mui/icons-material";
import {
  Alert,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import {
  Calendar,
  Check,
  X as CloseIcon,
  CreditCard,
  Download,
  Droplet,
  Edit2,
  Mail,
  Phone,
  Receipt,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import Swal from "sweetalert2";
import AddNewMember from "./AddNewMember";

// TypeScript Interfaces
interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  bloodGroup: string;
  joiningDate: string;
  role: string;
  receivedIdCard: boolean;
  receivedTshirt: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Payment {
  _id: string;
  amount: number;
  month?: string;
  paymentDate: string;
  status: "pending" | "completed" | "failed" | "refunded" | "disputed";
  invoiceNumber?: string;
  invoiceType?: "standard" | "80g";
  razorpayPaymentId?: string;
  paymentMethod?: string;
}

// --- HELPER ---
const formatIdNumber = (id: string, joiningDate: string): string => {
  const year = new Date(joiningDate).getFullYear();
  const idNum = id.slice(-4).padStart(4, "0");
  return `SST/${year}/${idNum}`;
};

// --- FRONT SIDE COMPONENT ---
const FrontSide = ({
  member,
  settings,
}: {
  member: Member;
  settings: {
    organizationName?: string;
    tagline?: string;
    address?: string;
    phone?: string;
  };
}) => {
  return (
    <div className="w-[320px] h-130 bg-linear-to-b from-[#fbfd6e] to-[#98d443] rounded-xl shadow-lg overflow-hidden flex flex-col relative border border-gray-300 mx-auto print:border-none">
      {/* Maroon Header with Arc */}
      <div className="relative bg-[#6b0f1a] pt-3 pb-2 px-2 text-center z-20 h-36">
        {/* The Convex Curve */}
        <div className="absolute -bottom-4 left-0 w-[110%] -ml-[5%] h-10 bg-[#6b0f1a] rounded-[50%] z-10"></div>

        <div className="relative z-20 gap-1 flex flex-col items-center">
          {/* Logo */}
          <Image
            src="/logo.svg"
            alt="Samriddhi Logo"
            width={48}
            height={48}
            className="w-10 h-10 lg:size-18 object-contain"
          />
          {/* Trust Name */}
          <h1 className="text-[#facc15] uppercase font-serif font-extrabold text-xl tracking-wide leading-none mb-0.5 drop-shadow-md">
            {settings?.organizationName}
          </h1>
          {/* Slogan */}
          <p className="text-white text-right w-full text-[9px] italic opacity-90 mb-0.5 font-light">
            {settings?.tagline}....
          </p>
          {/* Regd No */}
          <p className="text-[#fde047] text-[14px] font-bold">
            Regd. No. 41532200031/2022
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 px-5 pt-8 relative z-10">
        {/* Row: Photo (Left) & Blood Group (Right) */}
        <div className="flex justify-end items-start mb-2 mt-2">
          {/* Photo Frame */}
          <div className="w-28 h-32 rounded-tl-lg rounded-br-lg bg-white border-2 border-gray-300 shadow-lg rounded-sm overflow-hidden">
            <Image
              src={member.photo}
              alt={member.name}
              width={112}
              height={128}
              className="w-full h-full object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = `https://via.placeholder.com/112x128?text=${member.name.charAt(0)}`;
              }}
            />
          </div>

          {/* Blood Group Floating Right */}
          <div className="flex flex-col items-center justify-center pt-8 mx-6">
            <div className="relative">
              <Droplet
                size={26}
                className=" text-[#d32f2f] fill-[#d32f2f] drop-shadow-sm"
              />
            </div>
            <span
              style={{
                WebkitTextStroke: "2px white",
                paintOrder: "stroke fill",
              }}
              className="text-[#1a237e] font-extrabold text-xl -mt-1 tracking-tight"
            >
              {member.bloodGroup} ve
            </span>
          </div>
        </div>

        {/* Name */}
        <div className="text-center mb-2">
          <h2
            className="text-[#c62828] font-[1000] text-xl uppercase leading-tight drop-shadow-xs"
            style={{
              WebkitTextStroke: "2px white",
              paintOrder: "stroke fill",
            }}
          >
            {member.name}
          </h2>
        </div>

        {/* Details Table-ish Layout */}
        <div className="w-full flex items-center justify-center">
          <div className="space-y-0.5 px-1">
            <div className="flex text-sm items-baseline">
              <span
                style={{
                  WebkitTextStroke: "1px white",
                  paintOrder: "stroke fill",
                }}
                className="text-blue-800 font-black w-24 text-left"
              >
                Designation
              </span>
              <span
                style={{
                  WebkitTextStroke: "1px white",
                  paintOrder: "stroke fill",
                }}
                className="text-blue-800 font-black mx-1"
              >
                :
              </span>
              <span
                style={{
                  WebkitTextStroke: "1px white",
                  paintOrder: "stroke fill",
                }}
                className="text-blue-800 font-black uppercase truncate"
              >
                {member.role}
              </span>
            </div>
            <div className="flex text-sm items-baseline">
              <span
                style={{
                  WebkitTextStroke: "1px white",
                  paintOrder: "stroke fill",
                }}
                className="text-blue-800 font-black w-24 text-left"
              >
                ID No.
              </span>
              <span
                style={{
                  WebkitTextStroke: "1px white",
                  paintOrder: "stroke fill",
                }}
                className="text-blue-800 font-black mx-1"
              >
                :
              </span>
              <span
                style={{
                  WebkitTextStroke: "1px white",
                  paintOrder: "stroke fill",
                }}
                className="text-blue-800 font-black uppercase"
              >
                {formatIdNumber(member._id, member.joiningDate)}
              </span>
            </div>
            <div className="flex text-sm items-baseline">
              <span
                style={{
                  WebkitTextStroke: "1px white",
                  paintOrder: "stroke fill",
                }}
                className="text-blue-800 font-black w-24 text-left"
              >
                Mob.
              </span>
              <span
                style={{
                  WebkitTextStroke: "1px white",
                  paintOrder: "stroke fill",
                }}
                className="text-blue-800 font-black mx-1"
              >
                :
              </span>
              <span
                style={{
                  WebkitTextStroke: "1px white",
                  paintOrder: "stroke fill",
                }}
                className="text-blue-800 font-black"
              >
                {member.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="absolute bottom-2 right-4 text-right">
          <div className="h-6 relative">
            {/* Signature Placeholder */}
            <span
              className="text-lg capitalize font-semibold text-black opacity-80"
              style={{ fontFamily: "'Brush Script MT', cursive" }}
            >
              smruti ranjan sethi
            </span>
          </div>
          <p className="text-[10px] font-bold text-black -mt-1">
            Authorised Signature
          </p>
        </div>
      </div>

      {/* Blue Footer */}
      <div className="bg-[#1a237e] py-2 px-4 text-center w-full mt-auto relative z-20">
        <p className="text-white text-[9px] leading-tight font-medium">
          {settings?.address}
        </p>
        <p className="text-white text-[10px] font-bold mt-0.5">
          Mob.: {settings?.phone}
        </p>
      </div>
    </div>
  );
};

// --- BACK SIDE COMPONENT ---
const BackSide = () => (
  <div className="w-[320px] h-130 bg-linear-to-br from-[#fbfd6e] to-[#98d443] rounded-xl shadow-lg overflow-hidden flex flex-col relative border border-gray-300 mx-auto print:border-none">
    {/* WATERMARK LOGO */}
    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-10">
      <Image
        src="/logo.svg"
        alt="Samriddhi Logo"
        width={48}
        height={48}
        className="w-10 h-10 lg:size-48 object-contain"
      />
    </div>

    {/* Content */}
    <div className="flex-1 p-6 flex flex-col pt-12 relative z-10">
      <h2 className="text-[#c62828] font-bold text-2xl text-center mb-8 uppercase tracking-wide inline-block mx-auto relative">
        INSTRUCTION
        {/* Underline */}
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#c62828]"></span>
      </h2>

      <div className="space-y-3 pl-1">
        {[
          "The Card is not transferable.",
          "Loss of this must be reported Chairman and Core Committee.",
          "The holder must be surrender this Card & T-Shirt when He/She Ceases to be a Member of the Organization.",
          "This Card & T-Shirt can't be use for personal purpose.",
          "Obey All the Rules and Regulations.",
        ].map((rule, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="font-bold text-black text-xs min-w-3.75 mt-0.5">
              {i + 1}.
            </span>
            <p className="text-black text-xs font-semibold leading-relaxed">
              {rule}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Maroon Footer */}
    <div className="bg-[#6b0f1a] py-3 px-4 text-center w-full mt-auto relative z-20">
      <p className="text-white text-[10px] mb-1">
        <span className="opacity-80">E-mail :</span>{" "}
        samriddhisevatrust2022@gmail.com
      </p>
      <p className="text-white text-[10px] mb-1">
        <span className="opacity-80">Web :</span> www.samriddhisevatrust.org
      </p>
      <p className="text-white text-[9px] leading-tight opacity-90 break-all">
        Facebook :
        https://www.facebook.com/samriddhi.seva.trust?rdid=Q83jJUgVT6ClHQSp#
      </p>
    </div>
  </div>
);

// Skeleton Loader
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
    <div className="relative h-24 bg-linear-to-r from-gray-200 to-gray-300">
      <div className="absolute -bottom-10 left-4">
        <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-300"></div>
      </div>
    </div>
    <div className="pt-12 px-4 pb-4">
      <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        <div className="h-3 bg-gray-200 rounded w-3/5"></div>
      </div>
    </div>
  </div>
);

// Member Card (Grid Item)
interface MemberCardProps {
  member: Member;
  index: number;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
  onViewIDCard: (member: Member) => void;
  onViewPaymentHistory: (member: Member) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onEdit,
  onDelete,
  onViewIDCard,
  onViewPaymentHistory,
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1 relative h-full flex flex-col">
      <div className="relative h-24 bg-linear-to-br from-blue-500 via-blue-600 to-indigo-600">
        <div className="absolute -bottom-10 left-4">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 relative ring-2 ring-blue-100">
            <Image
              src={member.photo}
              alt={member.name}
              fill
              className="object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = `https://via.placeholder.com/80?text=${member.name.charAt(0)}`;
              }}
            />
          </div>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {member.isActive && (
            <span className="px-2.5 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow-sm">
              Active
            </span>
          )}
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(member)}
            className="bg-white/95 hover:bg-white p-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(member._id)}
            className="bg-white/95 hover:bg-white p-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
          </button>
        </div>
      </div>

      <div className="pt-12 px-4 pb-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-0.5 capitalize truncate">
          {member.name.toLowerCase()}
        </h3>
        <p className="text-xs text-gray-500 mb-3 truncate">{member.role}</p>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <span>{member.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>Joined {formatDate(member.joiningDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Droplet className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="font-semibold">{member.bloodGroup}</span>
          </div>
        </div>

        <div className="flex gap-1.5 pt-3 border-t border-gray-100 mb-3 mt-auto">
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium ${
              member.receivedIdCard
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-gray-50 text-gray-600 ring-1 ring-gray-200"
            }`}
          >
            {member.receivedIdCard ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            ID Card
          </div>
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium ${
              member.receivedTshirt
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-gray-50 text-gray-600 ring-1 ring-gray-200"
            }`}
          >
            {member.receivedTshirt ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            T-Shirt
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewPaymentHistory(member)}
            className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Receipt className="w-3.5 h-3.5" />
            Payment
          </button>
          <button
            onClick={() => onViewIDCard(member)}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <CreditCard className="w-3.5 h-3.5" />
            ID Card
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const Members = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingIDCard, setViewingIDCard] = useState<Member | null>(null);
  const [viewingPaymentHistory, setViewingPaymentHistory] =
    useState<Member | null>(null);
  const [paymentHistoryData, setPaymentHistoryData] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pdfMenuAnchor, setPdfMenuAnchor] = useState<null | HTMLElement>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const { data: settingData } = useSwr("settings");
  const settings = settingData?.settings || {};
  const { mutation } = useMutation();
  const { data, isValidating, mutate } = useSwr(
    `members?page=${page}&limit=${limit}${searchQuery ? `&search=${searchQuery}` : ""}`
  );

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setOpen(true);
  };

  const handleViewIDCard = (member: Member) => {
    setViewingIDCard(member);
  };

  const handleViewPaymentHistory = async (member: Member) => {
    setViewingPaymentHistory(member);
    setLoadingPayments(true);
    try {
      const response = await fetch(`/api/payments?memberId=${member._id}`);
      const data = await response.json();
      setPaymentHistoryData(data.payments || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setPaymentHistoryData([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      customClass: { container: "swal-z-index" },
    });

    if (result.isConfirmed) {
      const res = await mutation(`members/${id}`, {
        method: "DELETE",
        isAlert: false,
      });

      if (res?.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 2000,
          showConfirmButton: false,
        });
        mutate();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.results?.error,
        });
      }
    }
  };

  const handleCloseDrawer = () => {
    setOpen(false);
    setTimeout(() => setEditingMember(null), 300);
  };

  const handlePDFMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setPdfMenuAnchor(event.currentTarget);
  };

  const handlePDFMenuClose = () => {
    setPdfMenuAnchor(null);
  };

  const handleExportPDF = async (type: string) => {
    handlePDFMenuClose();
    setExportingPDF(true);

    try {
      const response = await fetch(`/api/members/export-pdf?type=${type}`);

      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Open in new tab instead of downloading
      window.open(url, "_blank");

      // Clean up the blob URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      Swal.fire({
        icon: "success",
        title: "Export Successful!",
        text: "PDF opened in new tab",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Failed to export members to PDF",
      });
    } finally {
      setExportingPDF(false);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = data?.pagination?.totalPages || 1;
  const currentPage = data?.pagination?.page || page;

  return (
    <div className="w-full h-fit">
      <AddNewMember
        open={open}
        onClose={handleCloseDrawer}
        mutate={mutate}
        editingMember={editingMember}
      />

      {/* --- ID CARD DRAWER --- */}
      <Drawer
        anchor="right"
        open={Boolean(viewingIDCard)}
        onClose={() => setViewingIDCard(null)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "450px" },
            backgroundColor: "#f3f4f6",
          },
        }}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-50 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Digital ID Card
              </h2>
              <p className="text-sm text-gray-500">{viewingIDCard?.name}</p>
            </div>
            <IconButton onClick={() => setViewingIDCard(null)}>
              <CloseIcon className="w-6 h-6 text-gray-500 hover:text-red-500" />
            </IconButton>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-100 flex flex-col items-center">
            {viewingIDCard && (
              <>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Front Side
                  </span>
                  <FrontSide member={viewingIDCard} settings={settings} />
                </div>

                <div className="flex flex-col items-center gap-2 pb-8">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Back Side
                  </span>
                  <BackSide />
                </div>
              </>
            )}
          </div>
        </div>
      </Drawer>

      {/* --- PAYMENT HISTORY DRAWER --- */}
      <Drawer
        anchor="right"
        open={Boolean(viewingPaymentHistory)}
        onClose={() => {
          setViewingPaymentHistory(null);
          setPaymentHistoryData([]);
        }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "650px" },
            backgroundColor: "#f9fafb",
          },
        }}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="bg-linear-to-r from-green-600 to-emerald-600 px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 z-50 shadow-lg">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="w-6 h-6" />
                Payment History
              </h2>
              <p className="text-sm text-green-50 mt-1">
                {viewingPaymentHistory?.name}
              </p>
            </div>
            <IconButton
              onClick={() => {
                setViewingPaymentHistory(null);
                setPaymentHistoryData([]);
              }}
            >
              <CloseIcon className="w-6 h-6 text-white hover:text-red-200" />
            </IconButton>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loadingPayments ? (
              <div className="flex items-center justify-center py-20">
                <CircularProgress size={50} sx={{ color: "#16a34a" }} />
              </div>
            ) : (
              <>
                {/* Current Month Status */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Current Month Status
                  </h3>
                  {(() => {
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    const currentMonthPayment = paymentHistoryData.find(
                      (p: Payment) =>
                        p.month &&
                        new Date(p.month).toISOString().slice(0, 7) ===
                          currentMonth &&
                        p.status === "completed"
                    );
                    return currentMonthPayment ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-700">
                            Payment Received
                          </p>
                          <p className="text-sm text-gray-600">
                            Amount: ₹{currentMonthPayment.amount} •{" "}
                            {new Date(
                              currentMonthPayment.paymentDate
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <X className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-700">
                            No Payment This Month
                          </p>
                          <p className="text-sm text-gray-600">
                            Payment not received for{" "}
                            {new Date().toLocaleDateString("en-IN", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Payment Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹
                      {paymentHistoryData
                        .filter((p: Payment) => p.status === "completed")
                        .reduce((sum: number, p: Payment) => sum + p.amount, 0)
                        .toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Total Payments</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {
                        paymentHistoryData.filter(
                          (p: Payment) => p.status === "completed"
                        ).length
                      }
                    </p>
                  </div>
                </div>

                {/* Payment History Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">
                      Transaction History
                    </h3>
                  </div>

                  {paymentHistoryData.length === 0 ? (
                    <div className="p-8 text-center">
                      <Alert severity="info">
                        No payment history found for this member
                      </Alert>
                    </div>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#f9fafb" }}>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Month
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Amount
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Status
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              Invoice
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paymentHistoryData.map((payment: Payment) => (
                            <TableRow
                              key={payment._id}
                              sx={{
                                "&:hover": { bgcolor: "#f9fafb" },
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              <TableCell>
                                {payment.month
                                  ? new Date(payment.month).toLocaleDateString(
                                      "en-IN",
                                      {
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-gray-900">
                                  ₹{payment.amount.toLocaleString("en-IN")}
                                </span>
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  payment.paymentDate
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={payment.status}
                                  size="small"
                                  sx={{
                                    bgcolor:
                                      payment.status === "completed"
                                        ? "#dcfce7"
                                        : payment.status === "pending"
                                          ? "#fef3c7"
                                          : "#fee2e2",
                                    color:
                                      payment.status === "completed"
                                        ? "#166534"
                                        : payment.status === "pending"
                                          ? "#854d0e"
                                          : "#991b1b",
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                {payment.invoiceNumber &&
                                payment.status === "completed" ? (
                                  <div className="flex items-center gap-2">
                                    <IconButton
                                      size="small"
                                      onClick={async () => {
                                        try {
                                          // Handle invoice download
                                          const blob = await fetch(
                                            `/api/payments/invoice/${payment._id}`
                                          ).then((r) => r.blob());
                                          const url =
                                            window.URL.createObjectURL(blob);
                                          const link =
                                            document.createElement("a");
                                          link.href = url;
                                          link.download = `invoice-${payment.invoiceNumber}.pdf`;
                                          document.body.appendChild(link);
                                          link.click();
                                          link.remove();
                                          window.URL.revokeObjectURL(url);
                                        } catch (error) {
                                          console.error(
                                            "Error downloading invoice:",
                                            error
                                          );
                                        }
                                      }}
                                      sx={{
                                        bgcolor: "#dbeafe",
                                        "&:hover": { bgcolor: "#bfdbfe" },
                                      }}
                                    >
                                      <Download className="w-4 h-4 text-blue-700" />
                                    </IconButton>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-900">
                                        {payment.invoiceNumber}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {payment.invoiceType === "80g"
                                          ? "80G"
                                          : "Normal"}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    N/A
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Drawer>

      {/* Header Section */}
      <div className="w-full mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Members Directory
          </h1>
          <p className="text-gray-600">
            Manage and view all trust members in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-fit">
            <CustomButton
              loading={exportingPDF}
              loadingText="exporting..."
              startIcon={<PictureAsPdf className="w-4 h-4" />}
              className="bg-red-500!"
              onClick={handlePDFMenuClick}
            >
              Export PDF
            </CustomButton>
          </div>
          <Menu
            anchorEl={pdfMenuAnchor}
            open={Boolean(pdfMenuAnchor)}
            onClose={handlePDFMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                mt: 1,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                minWidth: "220px",
              },
            }}
          >
            <MenuItem
              onClick={() => handleExportPDF("all")}
              sx={{
                py: 1.5,
                px: 2,
                "&:hover": { bgcolor: "#fee2e2" },
              }}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">All Members</span>
                <span className="text-xs text-gray-500">
                  With current month payment status
                </span>
              </div>
            </MenuItem>
            <MenuItem
              onClick={() => handleExportPDF("payment")}
              sx={{
                py: 1.5,
                px: 2,
                "&:hover": { bgcolor: "#fee2e2" },
              }}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">
                  With Payment Status
                </span>
                <span className="text-xs text-gray-500">
                  Name, email, phone & payment status
                </span>
              </div>
            </MenuItem>
            <MenuItem
              onClick={() => handleExportPDF("minimal")}
              sx={{
                py: 1.5,
                px: 2,
                "&:hover": { bgcolor: "#fee2e2" },
              }}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">Minimal</span>
                <span className="text-xs text-gray-500">
                  Only name, email & phone
                </span>
              </div>
            </MenuItem>
          </Menu>
          <div className="w-fit">
            <CustomButton onClick={() => setOpen(true)}>
              Add New Member
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 w-full">
        <div className="flex w-full items-center gap-3 ">
          <div className="relative w-full flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or blood group..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 pr-4 py-2 border border-gray-400 text-gray-900 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
            />
          </div>
          <div className="w-fit">
            <CustomButton
              disabled={isValidating || !searchInput.trim()}
              onClick={handleSearch}
            >
              Search
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isValidating && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {/* Members Grid */}
      {!isValidating && data?.members && data.members.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {data.members.map((member: Member, index: number) => (
            <MemberCard
              key={member._id}
              member={member}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewIDCard={handleViewIDCard}
              onViewPaymentHistory={handleViewPaymentHistory}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {!isValidating && (!data?.members || data.members.length === 0) && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No members found
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "No members available"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!isValidating && data?.members && data.members.length > 0 && (
        <div className="flex flex-col items-center gap-4">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "1rem",
                fontWeight: 500,
              },
              "& .Mui-selected": {
                backgroundColor: "#2563eb !important",
                color: "white",
              },
            }}
          />
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} • Total {data?.pagination?.total}{" "}
            members
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
