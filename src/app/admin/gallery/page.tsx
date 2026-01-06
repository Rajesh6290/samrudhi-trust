"use client";

import useSwr from "@/features/hooks/useSwr";
import useMutation from "@/features/hooks/useMutation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  FileText,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useState } from "react";

interface GalleryFile {
  id: string;
  url: string;
  type: string;
}

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  files: GalleryFile[];
  category: string;
  date: string;
  isActive: boolean;
}

// Category configurations with auto-generated content
const categories = [
  {
    id: "ACT001",
    label: "Food Distribution for Poor and Needy People",
    titles: [
      "Hunger Relief",
      "Nutritious Meals",
      "Food for All",
      "Zero Hunger Mission",
      "Daily Meal Support",
      "Care Through Food",
      "Community Feeding",
      "Serving with Dignity",
      "Hope Through Meals",
      "Support the Needy",
    ],
    descriptions: [
      "Providing freshly prepared and nutritious meals to poor and needy individuals.",
      "Ensuring that no person sleeps hungry due to poverty or hardship.",
      "Regular food distribution drives are conducted in slums and public areas.",
      "Meals are prepared hygienically with balanced nutrition.",
      "Special focus is given to children, elderly, and daily wage workers.",
      "Volunteers serve food with respect and compassion.",
      "This initiative directly fights hunger and malnutrition.",
      "Food support brings dignity and hope to vulnerable people.",
      "We aim to reduce food insecurity at the grassroots level.",
      "Every meal served reflects humanity and care.",
    ],
  },
  {
    id: "ACT002",
    label: "Food Service in Hospitals",
    titles: [
      "Hospital Meal Support",
      "Care Beyond Treatment",
      "Food for Patients",
      "Support for Attendants",
      "Healing with Care",
      "Hospital Outreach",
      "Nutrition Assistance",
      "Serving During Illness",
      "Humanity in Hospitals",
      "Meals with Compassion",
    ],
    descriptions: [
      "Serving food to patients and their attendants in hospitals.",
      "Supporting families who cannot afford regular meals during long treatments.",
      "Reducing stress for attendants staying day and night with patients.",
      "Food is served hygienically and on time.",
      "Special focus on government and critical care hospitals.",
      "Nutrition support helps patients recover better.",
      "Volunteers coordinate with hospital staff for smooth service.",
      "This service provides emotional comfort during illness.",
      "No one should go hungry during medical treatment.",
      "Care extends beyond medicine through this initiative.",
    ],
  },
  {
    id: "ACT003",
    label: "Food Distribution in Orphanages",
    titles: [
      "Care for Orphans",
      "Healthy Childhood",
      "Meals for Children",
      "Nutrition for Growth",
      "Support with Love",
      "Food for Smiles",
      "Child Welfare",
      "Serving Young Lives",
      "Building Healthy Futures",
      "Care with Compassion",
    ],
    descriptions: [
      "Supplying nutritious meals to children living in orphanages.",
      "Supporting proper growth, health, and development of children.",
      "Meals are planned according to children’s nutritional needs.",
      "Coordination with orphanage management ensures regular support.",
      "Children are served with care, love, and dignity.",
      "Special meals are arranged during festivals and events.",
      "This initiative promotes child welfare and well-being.",
      "Food distribution brings joy and happiness to children.",
      "Healthy food helps build strong futures.",
      "Every child deserves nutrition and care.",
    ],
  },
  {
    id: "ACT004",
    label:
      "Emergency Food Support During Natural Disasters and Critical Situations",
    titles: [
      "Emergency Food Relief",
      "Disaster Time Support",
      "Crisis Food Aid",
      "Rapid Emergency Response",
      "Relief During Calamities",
      "Immediate Hunger Relief",
      "Support in Critical Situations",
      "Standing with Victims",
      "Hope During Disasters",
      "Humanitarian Emergency Care",
    ],
    descriptions: [
      "Delivering immediate food relief during natural disasters and emergencies.",
      "Supporting communities affected by floods, cyclones, fires, and pandemics.",
      "Ensuring food access when normal supply chains are disrupted.",
      "Rapid response helps prevent hunger during crisis situations.",
      "Special priority is given to children and elderly people.",
      "Food packets are distributed in a safe and organized manner.",
      "Coordination with local authorities ensures effective relief.",
      "Our team works on the ground in affected areas.",
      "Emergency food support reduces suffering and stress.",
      "This initiative stands for humanity in difficult times.",
    ],
  },
  {
    id: "ACT005",
    label: "Blood Donation During Emergencies",
    titles: [
      "Life Saving Support",
      "Emergency Blood Help",
      "Donate for Life",
      "Urgent Blood Aid",
      "Saving Lives Together",
      "Medical Emergency Support",
      "Hope Through Donation",
      "Blood When Needed",
      "Stand for Life",
      "Critical Care Assistance",
    ],
    descriptions: [
      "Organizing blood donation support during medical emergencies.",
      "Helping patients in accidents, surgeries, and critical conditions.",
      "Coordinating donors quickly to meet urgent blood requirements.",
      "Creating awareness about voluntary blood donation.",
      "Working closely with hospitals and blood banks.",
      "Timely blood support helps save lives.",
      "Encouraging healthy donors to come forward.",
      "Every blood donation is a gift of life.",
      "Emergency response is handled with priority.",
      "This activity strengthens community responsibility.",
    ],
  },
  {
    id: "ACT006",
    label: "Distribution of Clothes and Essential Items to the Poor",
    titles: [
      "Clothing with Dignity",
      "Essential Support",
      "Care Beyond Food",
      "Warmth and Comfort",
      "Basic Needs Assistance",
      "Relief Distribution",
      "Helping Hands",
      "Humanitarian Aid",
      "Support for Survival",
      "Compassion in Action",
    ],
    descriptions: [
      "Providing clothes and essential items to poor families.",
      "Distribution includes blankets, footwear, and daily necessities.",
      "Special drives are conducted during winter and monsoon.",
      "Items are distributed respectfully and fairly.",
      "This support restores dignity and comfort.",
      "Reaching slums, streets, and remote areas.",
      "Donated items are cleaned and sorted before use.",
      "Helping families survive harsh conditions.",
      "Complements food distribution initiatives.",
      "Every item shared carries compassion.",
    ],
  },
  {
    id: "ACT007",
    label: "Helping Helpless and Homeless People with Food and Basic Needs",
    titles: [
      "Care for the Homeless",
      "Street Outreach",
      "Food and Basic Care",
      "Hope for the Helpless",
      "Support Without Judgment",
      "Human Touch",
      "Restoring Dignity",
      "Care on Streets",
      "Helping Lives",
      "Serving Humanity",
    ],
    descriptions: [
      "Reaching homeless individuals with food and basic necessities.",
      "Providing water, clothing, and essential care.",
      "Street outreach programs focus on the most vulnerable.",
      "Helping restore dignity and hope among homeless people.",
      "Support is provided without discrimination.",
      "Special care during extreme weather conditions.",
      "Volunteers build trust through regular help.",
      "Reducing suffering on the streets.",
      "Offering compassion and human connection.",
      "Humanity is the core of this initiative.",
    ],
  },
  {
    id: "ACT008",
    label: "Support to Elderly People Who Have No Family Support",
    titles: [
      "Care for Seniors",
      "Respect for Elders",
      "Support Without Family",
      "Dignity in Old Age",
      "Food and Care",
      "Emotional Support",
      "Compassionate Assistance",
      "Helping the Forgotten",
      "Senior Welfare",
      "Serving with Respect",
    ],
    descriptions: [
      "Supporting elderly people who lack family care.",
      "Providing meals and basic necessities to seniors.",
      "Reducing loneliness and neglect among the elderly.",
      "Treating elders with dignity and respect.",
      "Focusing on emotional and social well-being.",
      "Special attention to nutrition and health.",
      "Regular visits ensure continuous support.",
      "Helping seniors live with dignity.",
      "Care reflects gratitude toward elders.",
      "Serving elders is serving humanity.",
    ],
  },
  {
    id: "ACT009",
    label: "Assistance to Economically Weak Families",
    titles: [
      "Support for Families",
      "Economic Relief",
      "Helping the Needy",
      "Emergency Assistance",
      "Aid for Survival",
      "Care During Hardship",
      "Family Support Program",
      "Relief with Compassion",
      "Standing with the Poor",
      "Hope for Families",
    ],
    descriptions: [
      "Helping financially weak families during difficult times.",
      "Providing food supplies and emergency assistance.",
      "Supporting families facing sudden financial crises.",
      "Ensuring access to basic necessities.",
      "Reducing stress caused by poverty.",
      "Targeting the most vulnerable households.",
      "Helping families regain stability.",
      "Support offered with dignity and care.",
      "Strengthening community resilience.",
      "Empowering families through relief support.",
    ],
  },
  {
    id: "ACT010",
    label: "Awareness Programs for Social Welfare",
    titles: [
      "Social Awareness",
      "Community Education",
      "Health and Hygiene",
      "Responsible Society",
      "Knowledge for Change",
      "Public Awareness Drives",
      "Building Better Communities",
      "Social Responsibility",
      "Awareness for Welfare",
      "Educate and Empower",
    ],
    descriptions: [
      "Conducting awareness programs for social welfare.",
      "Promoting health, hygiene, and cleanliness.",
      "Encouraging blood donation and social responsibility.",
      "Spreading awareness about food wastage prevention.",
      "Educating communities on basic welfare issues.",
      "Programs are conducted at grassroots level.",
      "Building informed and responsible citizens.",
      "Awareness leads to long-term social change.",
      "Engaging communities through education.",
      "Knowledge empowers society.",
    ],
  },
  {
    id: "ACT011",
    label: "Helping People During Accidents and Medical Emergencies",
    titles: [
      "Emergency Medical Help",
      "Accident Support",
      "Immediate Assistance",
      "Critical Care Help",
      "Rapid Response",
      "Life Saving Aid",
      "Medical Crisis Support",
      "Helping in Emergencies",
      "Standing in Crisis",
      "Support When Needed",
    ],
    descriptions: [
      "Providing immediate help during accidents and medical emergencies.",
      "Assisting with food, blood support, and guidance.",
      "Helping families navigate emergency situations.",
      "Quick coordination reduces response time.",
      "Supporting patients during critical moments.",
      "Working closely with hospitals and volunteers.",
      "Ensuring timely help reaches those in need.",
      "Reducing panic and confusion during emergencies.",
      "Saving lives through rapid action.",
      "Compassion drives every response.",
    ],
  },
  {
    id: "ACT012",
    label: "Other Humanitarian and Social Service Activities",
    titles: [
      "Humanitarian Initiatives",
      "Social Service Programs",
      "Serving Humanity",
      "Community Upliftment",
      "Compassionate Action",
      "Welfare Activities",
      "Helping Communities",
      "Social Responsibility",
      "Care for Society",
      "Humanity First",
    ],
    descriptions: [
      "Engaging in various humanitarian and social service activities.",
      "Supporting vulnerable communities in different ways.",
      "Responding to emerging social needs.",
      "Uplifting society through compassionate action.",
      "Promoting values of humanity and dignity.",
      "Adapting initiatives based on community needs.",
      "Working for inclusive social development.",
      "Serving beyond defined programs.",
      "Every activity aims to help those in need.",
      "Humanity remains the core mission.",
    ],
  },
];

const GalleryPage: React.FC = () => {
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const { data, mutate, isLoading } = useSwr("gallery");
  const { mutation } = useMutation();

  const items = (data?.items || []) as GalleryItem[];
  const [formData, setFormData] = useState({
    category: "food-distribution-poor",
    date: new Date().toISOString().split("T")[0],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // Generate random title and description based on category
  const generateContent = (categoryValue: string) => {
    const cat = categories.find((c) => c.label === categoryValue);
    if (!cat || cat.titles.length === 0) return { title: "", description: "" };

    const randomTitle =
      cat.titles[Math.floor(Math.random() * cat.titles.length)];
    const randomDesc =
      cat.descriptions[Math.floor(Math.random() * cat.descriptions.length)];

    return { title: randomTitle, description: randomDesc };
  };

  const getFileType = (file: File | string): "image" | "video" | "pdf" => {
    if (typeof file === "string") {
      if (file.includes(".pdf")) return "pdf";
      if (file.includes(".mp4") || file.includes(".webm")) return "video";
      return "image";
    }
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type === "application/pdf") return "pdf";
    return "image";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/pdf",
    ];
    const maxSize = 10 * 1024 * 1024;

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > maxSize) {
        alert(`${file.name} exceeds 10MB limit`);
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a valid file type`);
        continue;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...validPreviews]);

    e.target.value = "";
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { title, description } = generateContent(formData.category);

      const formDataToSend = new FormData();
      formDataToSend.append("title", title);
      formDataToSend.append("description", description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("date", formData.date);

      selectedFiles.forEach((file, index) => {
        formDataToSend.append(`file_${index}`, file);
      });

      const path = editingItem ? `gallery/${editingItem._id}` : "gallery";
      const method = editingItem ? "PUT" : "POST";

      const response = await mutation(path, {
        method,
        body: formDataToSend,
        isFormData: true,
        isAlert: false,
      });

      if (response?.status === 200 || response?.status === 201) {
        setShowDrawer(false);
        setEditingItem(null);
        resetForm();
        mutate();
      } else {
        alert(response?.results?.error || "Failed to save gallery item");
      }
    } catch (error) {
      console.error("Failed to save gallery item:", error);
      alert("An error occurred while saving");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const response = await mutation(`gallery/${id}`, {
      method: "DELETE",
      isAlert: true,
    });

    if (response?.status === 200) {
      mutate();
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      date: new Date(item.date).toISOString().split("T")[0],
    });
    setShowDrawer(true);
  };

  const resetForm = () => {
    setFormData({
      category: "food-distribution-poor",
      date: new Date().toISOString().split("T")[0],
    });
    filePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setEditingItem(null);
    resetForm();
  };

  // Media Carousel Component with dots
  const MediaCarousel = ({ files }: { files: GalleryFile[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (files.length === 0) return null;

    const currentFile = files[currentIndex];

    const nextSlide = () => {
      setCurrentIndex((prev) => (prev + 1) % files.length);
    };

    const prevSlide = () => {
      setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    };

    return (
      <div className="relative w-full h-96 bg-slate-900 overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {currentFile.type === "video" ? (
              <video
                src={currentFile.url}
                controls
                className="w-full h-full object-contain bg-black"
              />
            ) : currentFile.type === "pdf" ? (
              <div className="h-full w-full flex items-center justify-center bg-slate-800">
                <button
                  onClick={() => setPdfPreview(currentFile.url)}
                  className="flex flex-col items-center gap-4 hover:scale-105 transition-transform"
                >
                  <div className="p-8 bg-white/10 rounded-3xl">
                    <FileText className="w-24 h-24 text-white" />
                  </div>
                  <p className="text-white font-bold text-xl">
                    Click to View PDF
                  </p>
                </button>
              </div>
            ) : (
              <img
                src={currentFile.url}
                alt={`Media ${currentIndex + 1}`}
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {files.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {files.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
            {files.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === index
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75 w-2"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // PDF Preview Modal
  const PDFPreviewModal = () => {
    if (!pdfPreview) return null;

    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-2xl">
            <h3 className="text-xl font-bold text-slate-900">PDF Document</h3>
            <div className="flex items-center gap-2">
              <a
                href={pdfPreview}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setPdfPreview(null)}
                className="p-2.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <iframe
            src={pdfPreview}
            className="flex-1 w-full"
            title="PDF Preview"
          />
        </motion.div>
      </div>
    );
  };

  // const getCategoryLabel = (categoryValue: string) => {
  //   const cat = categories.find((c) => c.label === categoryValue);
  //   return cat?.label || categoryValue;
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 ">
      <div className="w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
              Humanitarian Services Gallery
            </h1>
            <p className="text-slate-600 text-lg">
              Documenting our journey of service to humanity ❤️
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDrawer(true)}
            className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Service Activity
          </motion.button>
        </motion.div>
        {/* Date Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="w-full flex items-center justify-between pb-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
              Filter
            </h3>
            {(startDate || endDate || category) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setCategory("");
                }}
                type="button"
                className="px-4 py-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
              >
                Clear Dates
              </button>
            )}
          </div>
          <div className="w-full flex items-center justify-between">
            <div className=" flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-600  block">
                Quick Date Range:
              </label>
              <select
                onChange={(e) => {
                  const days = parseInt(e.target.value);
                  if (days === -1) {
                    setStartDate("-1");
                    setEndDate("");
                    return;
                  }
                  const today = new Date();
                  const past = new Date(today);
                  past.setDate(today.getDate() - days);
                  setStartDate(past.toISOString().split("T")[0]);
                  setEndDate(today.toISOString().split("T")[0]);
                }}
                className="px-4 py-2 text-gray-900 border border-slate-400 rounded-lg  focus:outline-none focus:border-blue-500 transition-colors bg-white"
                defaultValue="-1"
              >
                <option value="-1">Select date range</option>
                <option value="0">Today</option>
                <option value="7">Last Week</option>
                <option value="30">Last Month</option>
                <option value="90">Last 3 Months</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-600  block">
                Category:
              </label>
              <select
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 max-w-56 text-gray-900 border border-slate-400 rounded-lg  focus:outline-none focus:border-blue-500 transition-colors bg-white"
                defaultValue=""
              >
                <option value="">Select category</option>
                {data &&
                  data?.services?.length > 0 &&
                  data?.services?.map(
                    (item: { title: string; _id: string }) => (
                      <option key={item?._id} value={item.title}>
                        {item.title}
                      </option>
                    )
                  )}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className=" font-semibold text-slate-600">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border text-gray-900 border-slate-400 rounded-lg  focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className=" font-semibold text-slate-600">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border text-gray-900 border-slate-400 rounded-lg  focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="h-96 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-16 text-center shadow-lg"
          >
            <div className="text-6xl mb-6">🤝</div>
            <h3 className="text-3xl font-black text-slate-900 mb-3">
              No Activities Found
            </h3>
            <p className="text-slate-600 text-lg mb-8">
              Start documenting your humanitarian services
            </p>
            <button
              onClick={() => setShowDrawer(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Add First Activity
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Media Carousel */}
                <div className="relative">
                  <MediaCarousel files={item.files || []} />

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(item)}
                      className="p-3 bg-white/90 hover:bg-white rounded-xl transition-colors shadow-lg"
                    >
                      <Edit className="w-5 h-5 text-slate-700" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(item._id)}
                      className="p-3 bg-red-500/90 hover:bg-red-600 rounded-xl transition-colors shadow-lg"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>

                  {/* Category Badge */}
                  {/* <div className="absolute bottom-4 left-4 z-10">
                    <div className="px-4 py-2 bg-black/70 backdrop-blur-sm text-white font-bold text-sm rounded-lg flex items-center gap-2">
                      {getCategoryLabel(item.category)}
                    </div>
                  </div> */}
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-black text-slate-900">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>

                    {item.files.length > 1 && (
                      <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {item.files.length} files
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Right Side Drawer */}
        <AnimatePresence>
          {showDrawer && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseDrawer}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto"
              >
                {/* Drawer Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between z-10">
                  <h2 className="text-2xl font-black text-white">
                    {editingItem ? "Edit Activity" : "Add New Activity"}
                  </h2>
                  <button
                    onClick={handleCloseDrawer}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Drawer Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-slate-900 font-bold text-sm mb-3">
                      Upload Media Files *
                    </label>

                    {filePreviews.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {filePreviews.map((preview, index) => {
                            const fileType = getFileType(selectedFiles[index]);
                            return (
                              <div key={index} className="relative group">
                                <div className="relative h-40 rounded-xl overflow-hidden border-2 border-slate-200">
                                  {fileType === "video" ? (
                                    <video
                                      src={preview}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : fileType === "pdf" ? (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                      <FileText className="w-12 h-12 text-slate-400" />
                                    </div>
                                  ) : (
                                    <img
                                      src={preview}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        <label className="inline-flex items-center gap-2 px-5 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl cursor-pointer transition-colors font-bold text-sm">
                          <Plus className="w-5 h-5" />
                          Add More Files
                          <input
                            type="file"
                            accept="image/*,video/*,application/pdf"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="h-64 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 flex items-center justify-center bg-slate-50 hover:bg-blue-50 transition-all">
                          <div className="text-center">
                            <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-700 font-bold text-lg mb-2">
                              Click to upload media
                            </p>
                            <p className="text-slate-500 text-sm">
                              Images, Videos, or PDFs (Max 10MB each)
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*,video/*,application/pdf"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-slate-900 font-bold text-sm mb-3">
                      Service Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                      <option value="">Select Service Category</option>
                      {categories.slice(0, -1).map((cat) => (
                        <option key={cat.label} value={cat.label}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-2">
                      Title and description will be generated automatically
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-slate-900 font-bold text-sm mb-3">
                      Activity Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCloseDrawer}
                      className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-all"
                      disabled={uploading}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={selectedFiles.length === 0 || uploading}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {uploading
                        ? "Uploading..."
                        : editingItem
                          ? "Update Activity"
                          : "Add Activity"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* PDF Preview Modal */}
        <PDFPreviewModal />
      </div>
    </div>
  );
};

export default GalleryPage;
