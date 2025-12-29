"use client";
import React, { useState } from "react";
import DefaultLayouts from "../layouts/DefaultLayouts";
import BackgroundSlider from "../components/BackgroundSlider";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Book,
  Users,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "General",
    question: "What is Samriddhi Seva Trust?",
    answer:
      "Samriddhi Seva Trust is a non-profit organization dedicated to serving humanity through various initiatives including food distribution, blood donation drives, child welfare programs, and community development projects. We believe in creating positive social impact through collective action.",
  },
  {
    category: "General",
    question: "How can I get involved with the trust?",
    answer:
      "There are many ways to get involved! You can volunteer your time, make donations, participate in our events, or spread awareness about our cause. Visit our Contact page to learn more about volunteering opportunities and how you can contribute to making a difference.",
  },
  {
    category: "Donations",
    question: "How can I donate to Samriddhi Seva Trust?",
    answer:
      "We accept donations through multiple channels including bank transfers, online payment platforms, and cheques. All donations are tax-deductible under Section 80G. Visit our Payment Info section or contact us directly for detailed donation information and bank account details.",
  },
  {
    category: "Donations",
    question: "Are my donations tax-deductible?",
    answer:
      "Yes! Samriddhi Seva Trust is registered under Section 80G of the Income Tax Act. All donations made to the trust are eligible for tax deductions. We provide receipts for all donations which can be used for tax filing purposes.",
  },
  {
    category: "Donations",
    question: "What is the minimum donation amount?",
    answer:
      "There is no minimum donation amount. Every contribution, big or small, makes a significant difference in the lives of those we serve. We believe that collective small contributions can create a massive impact in society.",
  },
  {
    category: "Programs",
    question: "What programs does the trust run?",
    answer:
      "We run multiple programs including free food distribution to underprivileged communities, blood donation camps, educational support for children, women empowerment initiatives, healthcare camps, and disaster relief operations. Each program is designed to address specific community needs.",
  },
  {
    category: "Programs",
    question: "How do you select beneficiaries?",
    answer:
      "Our team conducts thorough ground surveys to identify communities and individuals in genuine need. We prioritize underserved areas, collaborate with local authorities, and ensure transparent selection processes. Our goal is to reach those who need help the most.",
  },
  {
    category: "Programs",
    question: "Do you organize blood donation camps?",
    answer:
      "Yes! We regularly organize blood donation camps in collaboration with certified blood banks and medical institutions. These camps are conducted with proper medical supervision ensuring donor safety. Check our events calendar or contact us to participate in upcoming camps.",
  },
  {
    category: "Volunteering",
    question: "Who can volunteer with the trust?",
    answer:
      "Anyone with a genuine desire to serve society can volunteer! We welcome volunteers from all age groups (18+) and backgrounds. Whether you can spare a few hours a week or want to engage long-term, we have opportunities that match your availability and skills.",
  },
  {
    category: "Volunteering",
    question: "What kind of volunteer work is available?",
    answer:
      "Volunteers can help with food distribution, event organization, fundraising campaigns, social media outreach, teaching children, administrative tasks, healthcare camps, and more. We match volunteer assignments based on individual skills, interests, and availability.",
  },
  {
    category: "Volunteering",
    question: "Do I need special skills to volunteer?",
    answer:
      "No special skills are required! While professional expertise in areas like healthcare, education, or marketing is valuable, most of our volunteer opportunities require only compassion, commitment, and willingness to help. We provide necessary training and guidance.",
  },
  {
    category: "Transparency",
    question: "How does the trust ensure transparency?",
    answer:
      "We maintain complete transparency through regular financial audits, detailed activity reports, public disclosure of fund utilization, and real-time impact updates. Our annual reports and financial statements are available for public review. We believe accountability is fundamental to trust-building.",
  },
  {
    category: "Transparency",
    question: "Can I visit your projects?",
    answer:
      "Absolutely! We encourage supporters and donors to visit our ongoing projects and see the impact firsthand. Please contact us in advance to schedule a visit, and our team will be happy to show you around and explain our work in detail.",
  },
  {
    category: "Partnership",
    question: "Do you accept corporate partnerships?",
    answer:
      "Yes! We welcome partnerships with corporates for CSR initiatives, employee engagement programs, and collaborative social projects. Corporate partnerships help us scale our impact and create sustainable change. Contact us to discuss customized partnership opportunities.",
  },
  {
    category: "Partnership",
    question: "Can schools/colleges collaborate with you?",
    answer:
      "Definitely! We actively collaborate with educational institutions for awareness drives, student volunteer programs, fundraising events, and social internships. These partnerships help educate young minds about social responsibility while creating tangible impact.",
  },
];

const categories = [
  "All",
  ...Array.from(new Set(faqData.map((faq) => faq.category))),
];

const categoryIcons: { [key: string]: React.ReactNode } = {
  General: <HelpCircle className="w-5 h-5" />,
  Donations: <MessageCircle className="w-5 h-5" />,
  Programs: <Book className="w-5 h-5" />,
  Volunteering: <Users className="w-5 h-5" />,
  Transparency: <MessageCircle className="w-5 h-5" />,
  Partnership: <Users className="w-5 h-5" />,
};

const FAQPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const backgroundImages = [
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1920&q=80",
  ];

  const filteredFAQs =
    selectedCategory === "All"
      ? faqData
      : faqData.filter((faq) => faq.category === selectedCategory);

  return (
    <DefaultLayouts>
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden">
        <BackgroundSlider
          images={backgroundImages}
          duration={6000}
          effect="fade-zoom"
          overlayOpacity="bg-emerald-950/90"
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-6 animate-fade-in">
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wider uppercase">
                Frequently Asked Questions
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 animate-slide-up tracking-tight">
              How Can We <span className="text-orange-400">Help You?</span>
            </h1>

            <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-8 animate-slide-up animation-delay-200">
              Find answers to common questions about Samriddhi Seva Trust, our
              programs, volunteering, donations, and more.
            </p>

            <div className="relative max-w-2xl mx-auto animate-slide-up animation-delay-300">
              <input
                type="text"
                placeholder="Search for answers..."
                className="w-full px-6 py-4 pl-12 rounded-full bg-white text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-4 focus:ring-orange-400 shadow-2xl transition-all"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  if (searchTerm) {
                    const matchedIndex = faqData.findIndex(
                      (faq) =>
                        faq.question.toLowerCase().includes(searchTerm) ||
                        faq.answer.toLowerCase().includes(searchTerm)
                    );
                    if (matchedIndex !== -1) setOpenIndex(matchedIndex);
                  }
                }}
              />
              <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-xl shadow-md py-6 border-b border-emerald-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                    flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                    transition-all duration-300 hover:scale-105 active:scale-95 shadow-md
                    ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-500/50"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }
                  `}
              >
                {category !== "All" && categoryIcons[category]}
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div
                    key={index}
                    className={`
                      bg-white rounded-2xl shadow-lg overflow-hidden
                      transition-all duration-300 hover:shadow-xl
                      ${isOpen ? "ring-4 ring-emerald-500/20" : ""}
                    `}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full px-8 py-6 flex items-start justify-between gap-4 text-left hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            {faq.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                          {faq.question}
                        </h3>
                      </div>

                      <ChevronDown
                        className={`
                          w-6 h-6 text-emerald-600 flex-shrink-0 transition-transform duration-300
                          ${isOpen ? "rotate-180" : ""}
                        `}
                      />
                    </button>

                    <div
                      className={`
                        overflow-hidden transition-all duration-500 ease-in-out
                        ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                      `}
                    >
                      <div className="px-8 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Our team is here to help! Reach out to us and{" we'll"} get back to
            you as soon as possible.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 shadow-2xl active:scale-95"
            >
              Contact Us
            </a>
            <a
              href="/feedback"
              className="inline-block bg-white hover:bg-slate-50 text-emerald-700 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 shadow-2xl active:scale-95"
            >
              Send Feedback
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </DefaultLayouts>
  );
};

export default FAQPage;
