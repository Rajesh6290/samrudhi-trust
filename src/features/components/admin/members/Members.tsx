"use client";
import useSwr from "@/features/hooks/useSwr";
import useMutation from "@/features/hooks/useMutation";
import Pagination from "@mui/material/Pagination";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import {
  Calendar,
  Check,
  Droplet,
  Edit2,
  Mail,
  Phone,
  Search,
  Trash2,
  X,
  CreditCard,
  X as CloseIcon,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import AddNewMember from "./AddNewMember";
import CustomButton from "@/common/CustomButton";
import Swal from "sweetalert2";

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

// --- HELPER ---
const formatIdNumber = (id: string, joiningDate: string): string => {
  const year = new Date(joiningDate).getFullYear();
  const idNum = id.slice(-4).padStart(4, "0");
  return `SST/${year}/${idNum}`;
};

// --- FRONT SIDE COMPONENT ---
const FrontSide = ({ member }: { member: Member }) => (
  <div className="w-[320px] h-[500px] bg-linear-to-b from-[#fbfd6e] to-[#98d443] rounded-xl shadow-lg overflow-hidden flex flex-col relative border border-gray-300 mx-auto print:border-none">
    {/* Maroon Header with Arc */}
    <div className="relative bg-[#6b0f1a] pt-3 pb-2 px-2 text-center z-20 h-[110px]">
      {/* The Convex Curve */}
      <div className="absolute -bottom-4 left-0 w-[110%] -ml-[5%] h-[40px] bg-[#6b0f1a] rounded-[50%] z-10"></div>

      <div className="relative z-20 flex flex-col items-center">
        {/* Logo */}
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-[#d4af37] shadow-sm mb-1">
          {/* Replace text with actual logo image if available */}
          <span className="text-[8px] font-bold text-[#6b0f1a]">LOGO</span>
        </div>
        {/* Trust Name */}
        <h1 className="text-[#facc15] font-serif font-bold text-xl tracking-wide leading-none mb-0.5 drop-shadow-md">
          SAMRIDDHI SEVA TRUST
        </h1>
        {/* Slogan */}
        <p className="text-white text-[9px] italic opacity-90 mb-0.5 font-light">
          Giving Happiness is the best way to find yourself....
        </p>
        {/* Regd No */}
        <p className="text-[#fde047] text-[10px] font-semibold">
          Regd. No. 41532200031/2022
        </p>
      </div>
    </div>

    {/* Body Content */}
    <div className="flex-1 px-5 pt-8 relative z-10">
      {/* Row: Photo (Left) & Blood Group (Right) */}
      <div className="flex justify-between items-start mb-2 mt-2">
        {/* Photo Frame */}
        <div className="w-28 h-32 bg-white border-2 border-gray-300 shadow-lg rounded-sm overflow-hidden">
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
        <div className="flex flex-col items-center justify-center pt-8 pr-2">
          <div className="relative">
            <Droplet className="w-9 h-9 text-[#d32f2f] fill-[#d32f2f] drop-shadow-sm" />
          </div>
          <span className="text-[#1a237e] font-extrabold text-xl -mt-1 tracking-tight">
            {member.bloodGroup}
          </span>
        </div>
      </div>

      {/* Name */}
      <div className="text-center mb-2">
        <h2 className="text-[#c62828] font-bold text-2xl uppercase leading-tight drop-shadow-xs">
          {member.name}
        </h2>
      </div>

      {/* Details Table-ish Layout */}
      <div className="space-y-0.5 px-1">
        <div className="flex text-sm items-baseline">
          <span className="text-[#1565c0] font-bold w-[95px] text-right pr-2">
            Designation :
          </span>
          <span className="text-[#1565c0] font-bold uppercase truncate">
            {member.role}
          </span>
        </div>
        <div className="flex text-sm items-baseline">
          <span className="text-[#1565c0] font-bold w-[95px] text-right pr-2">
            ID No. :
          </span>
          <span className="text-[#1565c0] font-bold uppercase">
            {formatIdNumber(member._id, member.joiningDate)}
          </span>
        </div>
        <div className="flex text-sm items-baseline">
          <span className="text-[#1565c0] font-bold w-[95px] text-right pr-2">
            Mob. :
          </span>
          <span className="text-[#1565c0] font-bold">{member.phone}</span>
        </div>
      </div>

      {/* Signature */}
      <div className="absolute bottom-2 right-4 text-right">
        <div className="h-6 relative">
          {/* Signature Placeholder */}
          <span className="font-cursive text-lg text-black opacity-80">
            S.Ranjan
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
        110/1687, Sankarpur Mouza, K-4, Kalinga Vihar, BBSR - 7510199
      </p>
      <p className="text-white text-[10px] font-bold mt-0.5">
        Mob.: {member.phone}
      </p>
    </div>
  </div>
);

// --- BACK SIDE COMPONENT ---
const BackSide = () => (
  <div className="w-[320px] h-[500px] bg-linear-to-br from-[#fbfd6e] to-[#98d443] rounded-xl shadow-lg overflow-hidden flex flex-col relative border border-gray-300 mx-auto print:border-none">
    {/* WATERMARK LOGO */}
    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-10">
      <div className="w-48 h-48 rounded-full border-4 border-gray-800 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">LOGO</span>
      </div>
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
            <span className="font-bold text-black text-xs min-w-[15px] mt-0.5">
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
        samriddhisevatrust05@gmail.com
      </p>
      <p className="text-white text-[10px] mb-1">
        <span className="opacity-80">Web :</span> www.samriddhiseva.com
      </p>
      <p className="text-white text-[9px] leading-tight opacity-90 break-all">
        Facebook :
        https://www.facebook.com/profile.php?id=100081242310061&mibextid=ZbWKwL
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
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onEdit,
  onDelete,
  onViewIDCard,
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

        <button
          onClick={() => onViewIDCard(member)}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <CreditCard className="w-4 h-4" />
          View ID Card
        </button>
      </div>
    </div>
  );
};

// Main Component
const Members = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingIDCard, setViewingIDCard] = useState<Member | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handlePageChange = (e: any, value: number) => {
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
                  <FrontSide member={viewingIDCard} />
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
        <div className="w-fit">
          <CustomButton onClick={() => setOpen(true)}>
            Add New Member
          </CustomButton>
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
