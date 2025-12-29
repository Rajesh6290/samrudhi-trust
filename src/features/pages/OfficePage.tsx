"use client";
import React from "react";
import DefaultLayouts from "../layouts/DefaultLayouts";
import BackgroundSlider from "../components/BackgroundSlider";
import {
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Users,
  Heart,
  Target,
  Award,
} from "lucide-react";
import Image from "next/image";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  email: string;
  linkedin?: string;
  twitter?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Dr. Rajesh Kumar",
    role: "Founder & President",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
    bio: "Leading social change with 15+ years of experience in community development and welfare initiatives.",
    email: "rajesh@samriddhiseva.org",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Priya Sharma",
    role: "Vice President & Operations Head",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    bio: "Passionate about creating sustainable social impact through strategic planning and execution.",
    email: "priya@samriddhiseva.org",
    linkedin: "#",
  },
  {
    name: "Amit Patel",
    role: "Program Director",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    bio: "Dedicated to designing and implementing programs that empower communities and change lives.",
    email: "amit@samriddhiseva.org",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Sneha Desai",
    role: "Volunteer Coordinator",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
    bio: "Building a strong volunteer community to amplify our impact and reach more people in need.",
    email: "sneha@samriddhiseva.org",
    twitter: "#",
  },
  {
    name: "Rahul Mehta",
    role: "Finance & Compliance Officer",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
    bio: "Ensuring transparency and accountability in all financial operations and compliance matters.",
    email: "rahul@samriddhiseva.org",
    linkedin: "#",
  },
  {
    name: "Anjali Singh",
    role: "Communications Manager",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    bio: "Sharing our stories and amplifying voices of those we serve through strategic communication.",
    email: "anjali@samriddhiseva.org",
    linkedin: "#",
    twitter: "#",
  },
];

const offices = [
  {
    city: "Mumbai",
    type: "Head Office",
    address:
      "123 Seva Street, Community Center, Andheri West, Mumbai, Maharashtra 400053",
    phone: "+91 22 1234 5678",
    email: "mumbai@samriddhiseva.org",
    hours: "Mon-Sat: 9:00 AM - 6:00 PM",
  },
  {
    city: "Delhi",
    type: "Regional Office",
    address: "456 Service Lane, Karol Bagh, New Delhi, Delhi 110005",
    phone: "+91 11 2345 6789",
    email: "delhi@samriddhiseva.org",
    hours: "Mon-Sat: 9:00 AM - 6:00 PM",
  },
  {
    city: "Bangalore",
    type: "Regional Office",
    address: "789 Community Road, Indiranagar, Bangalore, Karnataka 560038",
    phone: "+91 80 3456 7890",
    email: "bangalore@samriddhiseva.org",
    hours: "Mon-Sat: 10:00 AM - 5:00 PM",
  },
];

const stats = [
  { icon: Users, value: "50+", label: "Team Members" },
  { icon: Heart, value: "500+", label: "Active Volunteers" },
  { icon: Target, value: "15+", label: "Programs Running" },
  { icon: Award, value: "10+", label: "Years of Service" },
];

const OfficePage = () => {
  const backgroundImages = [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&q=80",
  ];

  return (
    <DefaultLayouts>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <BackgroundSlider
          images={backgroundImages}
          duration={6000}
          effect="ken-burns"
          overlayOpacity="bg-emerald-950/90"
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
              <Users className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wider uppercase">
                Our Team
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              Meet the People Behind{" "}
              <span className="text-orange-400">The Mission</span>
            </h1>

            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              A dedicated team of professionals and volunteers working together
              to create positive social change and serve humanity.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-black text-slate-800 mb-2">
                  {stat.value}
                </h3>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
              Our Leadership Team
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Meet the passionate individuals driving our mission forward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Image */}
                <div className="relative h-80 overflow-hidden bg-slate-200">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-black text-slate-800 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-emerald-600 font-bold mb-3">
                    {member.role}
                  </p>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </a>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-3">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      >
                        <Linkedin className="w-5 h-5 text-white" />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        className="w-10 h-10 bg-sky-500 hover:bg-sky-600 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      >
                        <Twitter className="w-5 h-5 text-white" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-20 bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
              Our Offices
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Visit us at any of our locations across India
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {offices.map((office, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 mb-1">
                      {office.city}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                      {office.type}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                    <p className="text-slate-600 text-sm">{office.address}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <a
                      href={`tel:${office.phone}`}
                      className="text-slate-600 hover:text-emerald-600 transition-colors text-sm font-medium"
                    >
                      {office.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <a
                      href={`mailto:${office.email}`}
                      className="text-slate-600 hover:text-emerald-600 transition-colors text-sm font-medium"
                    >
                      {office.email}
                    </a>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm font-bold text-slate-700">
                      {office.hours}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DefaultLayouts>
  );
};

export default OfficePage;
