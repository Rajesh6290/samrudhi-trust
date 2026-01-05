"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Gift,
  Heart,
  Lock,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="w-full mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
              <Heart className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Make a Difference Today
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose how {"you'd"} like to contribute to our mission of creating
              positive change in communities
            </p>
          </motion.div>

          {/* Payment Options */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Member Payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => router.push("/members/payments")}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 h-full">
                <div className="flex flex-col h-full">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                    <Users className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Member Payment
                  </h3>
                  <p className="text-gray-600 mb-6 grow">
                    Make your monthly membership contribution and continue
                    supporting our community initiatives
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Fast auto-fill for registered members</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Automatic membership renewal</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Member benefits and recognition</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm font-semibold text-blue-600">
                      For Existing Members
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Donation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => router.push("/donation")}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500 h-full">
                <div className="flex flex-col h-full">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors">
                    <Gift className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Make a Donation
                  </h3>
                  <p className="text-gray-600 mb-6 grow">
                    Support our cause with a generous contribution and help us
                    create lasting impact
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>80G tax exemption certificate</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>50% tax deduction benefit</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>Instant payment receipt</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm font-semibold text-purple-600">
                      Open to Everyone
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-md border border-gray-100">
              <Lock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                Secure Payment • SSL Encrypted • Powered by Razorpay
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
