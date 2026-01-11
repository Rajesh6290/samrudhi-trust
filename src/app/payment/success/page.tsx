"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Home, FileText } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Confetti or celebration animation could be added here
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-50">
      <div className="text-center max-w-2xl mx-auto px-6">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <CheckCircle className="w-32 h-32 text-green-500 mx-auto animate-bounce" />
            <div className="absolute inset-0 bg-green-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Payment Successful! 🎉
        </h1>

        <p className="text-xl text-gray-700 mb-2">
          Thank you for your generous contribution!
        </p>

        <p className="text-gray-600 mb-8">
          Your payment has been processed successfully. You will receive a
          confirmation email shortly with your invoice and receipt.
        </p>

        {/* Info Box */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            What happens next?
          </h3>
          <ul className="text-left space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-gray-700">
                Confirmation email sent to your registered email address
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-gray-700">
                Invoice has been opened in a new tab (check if pop-ups are
                blocked)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-gray-700">
                You can view all your transactions in the &quot;My
                Donations&quot; section
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-gray-700">
                Tax receipts (if applicable) will be available for download
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/admin/my-donations")}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg font-semibold"
          >
            <FileText className="w-5 h-5" />
            View My Donations
          </button>

          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg font-semibold border border-gray-200"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </button>
        </div>

        {/* Additional Message */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-700">
            Your support helps us continue our mission to serve the community.
            <span className="block mt-1 font-semibold text-green-700">
              Thank you for making a difference! 🙏
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
