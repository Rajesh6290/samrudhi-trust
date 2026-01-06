"use client";

import { useParams, useRouter } from "next/navigation";
import useSwr from "@/features/hooks/useSwr";
import DefaultLayouts from "@/features/layouts/DefaultLayouts";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Heart,
  Share2,
  ExternalLink,
  Clock,
  Users,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  address: string;
  startDate: string;
  endDate?: string;
  isActive: string;
  type: string;
  donationLink?: string;
  eventLink?: string;
  status: string;
  order: number;
  createdAt: string;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data, isLoading } = useSwr(`campaigns/${params.id}`);
  const campaign: Campaign | null = data?.campaign || null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
    if (!campaign) return null;

    const today = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;

    let status = "Ongoing";
    let color = "bg-green-500";

    if (endDate && today > endDate) {
      status = "Completed";
      color = "bg-gray-500";
    } else if (today < startDate) {
      status = "Upcoming";
      color = "bg-blue-500";
    }

    return (
      <span
        className={`${color} text-white px-4 py-2 rounded-full text-sm font-semibold`}
      >
        {status}
      </span>
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title,
          text: campaign?.description,
          url: window.location.href,
        });
      } catch (_error) {
        // Share cancelled or not supported
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <DefaultLayouts>
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 py-20">
          <div className="container mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-3xl mb-8"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </DefaultLayouts>
    );
  }

  if (!campaign) {
    return (
      <DefaultLayouts>
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Campaign Not Found
            </h1>
            <p className="text-slate-600 mb-8">
              The campaign you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <Link
              href="/campaign"
              className="inline-flex items-center gap-2 bg-linear-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              <ArrowLeft size={20} />
              Back to Campaigns
            </Link>
          </div>
        </div>
      </DefaultLayouts>
    );
  }

  return (
    <DefaultLayouts>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
        {/* Hero Section */}
        <div className="relative h-125 overflow-hidden">
          <Image
            src={campaign.image || "/placeholder-campaign.jpg"}
            alt={campaign.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent"></div>

          {/* Back Button */}
          <div className="absolute top-24 left-6 z-10">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-800 px-4 py-2 rounded-full font-semibold hover:bg-white transition-all shadow-lg"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              <div className="flex items-center gap-4 mb-4">
                {getStatusBadge()}
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                  {campaign.type === "event" ? "Event" : "Campaign"}
                </span>
              </div>
              <h1 className="text-5xl font-bold mb-4">{campaign.title}</h1>
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>{campaign.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>{formatDate(campaign.startDate)}</span>
                  {campaign.endDate && (
                    <>
                      <span>-</span>
                      <span>{formatDate(campaign.endDate)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">
                  About This {campaign.type === "event" ? "Event" : "Campaign"}
                </h2>
                <div className="prose prose-lg max-w-none text-slate-600">
                  <p className="whitespace-pre-line">{campaign.description}</p>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <MapPin className="text-orange-500" size={28} />
                  Location
                </h2>
                <p className="text-slate-600 text-lg mb-4">
                  {campaign.address}
                </p>
                <button className="text-orange-500 font-semibold hover:text-orange-600 transition-colors flex items-center gap-2">
                  <ExternalLink size={20} />
                  View on Map
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Action Card */}
              <div className="bg-linear-to-br from-orange-500 to-red-500 rounded-3xl shadow-2xl p-8 text-white mb-8 sticky top-24">
                <h3 className="text-2xl font-bold mb-6">Get Involved</h3>

                {campaign.donationLink && (
                  <a
                    href={campaign.donationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-orange-600 text-center py-4 rounded-xl font-bold text-lg mb-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Heart size={24} />
                      Donate Now
                    </div>
                  </a>
                )}

                {campaign.eventLink && (
                  <a
                    href={campaign.eventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-white/20 backdrop-blur-sm text-white text-center py-4 rounded-xl font-bold text-lg mb-4 hover:bg-white/30 transition-all"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Users size={24} />
                      Register for Event
                    </div>
                  </a>
                )}

                <button
                  onClick={handleShare}
                  className="w-full bg-white/20 backdrop-blur-sm text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Share2 size={24} />
                    Share Campaign
                  </div>
                </button>

                <div className="mt-8 pt-8 border-t border-white/20">
                  <h4 className="font-semibold mb-4">Campaign Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Clock size={18} className="mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold">Duration</div>
                        <div className="text-white/80">
                          {formatDate(campaign.startDate)}
                          {campaign.endDate &&
                            ` - ${formatDate(campaign.endDate)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold">Location</div>
                        <div className="text-white/80">{campaign.location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target size={18} className="mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold">Type</div>
                        <div className="text-white/80 capitalize">
                          {campaign.type}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Need More Information?
                </h3>
                <p className="text-slate-600 mb-4">
                  Contact us for more details about this{" "}
                  {campaign.type === "event" ? "event" : "campaign"}.
                </p>
                <Link
                  href="/contact"
                  className="block w-full bg-slate-800 text-white text-center py-3 rounded-xl font-semibold hover:bg-slate-700 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* More Campaigns Section */}
        <div className="container mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
            More Campaigns & Events
          </h2>
          <div className="text-center">
            <Link
              href="/campaign"
              className="inline-flex items-center gap-2 bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all"
            >
              View All Campaigns
              <ArrowLeft className="rotate-180" size={24} />
            </Link>
          </div>
        </div>
      </div>
    </DefaultLayouts>
  );
}
