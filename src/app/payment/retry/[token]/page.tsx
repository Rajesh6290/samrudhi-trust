"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import useMutation from "@/features/hooks/useMutation";

interface PaymentData {
  amount: number;
  paymentType: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorAddress?: string;
  needs80G: boolean;
  panCard?: string;
  memberId?: string;
  month?: string;
  transactionId: string;
  isMember?: boolean; // Add this flag
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export default function RetryPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { mutation } = useMutation();

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePaymentSuccess = useCallback(
    async (razorpayResponse: RazorpayResponse, paymentId: string) => {
      try {
        const verifyData = await mutation("payments/verify", {
          method: "POST",
          body: {
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            paymentId,
          },
        });

        if (verifyData?.results?.success) {
          const payment = verifyData.results.payment;

          // Open invoice in new tab immediately
          if (payment._id) {
            window.open(`/api/payments/invoice/${payment._id}`, "_blank");
          }

          toast.success("Payment successful! Invoice sent to your email.");

          setTimeout(() => {
            router.push("/payment/success");
          }, 2000);
        } else {
          throw new Error(
            verifyData?.results?.message || "Payment verification failed"
          );
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Payment verification failed");
        setProcessing(false);
      }
    },
    [router, mutation]
  );

  const initiatePayment = useCallback(
    async (data: PaymentData) => {
      if (processing) return;
      setProcessing(true);

      try {
        const orderData = await mutation("payments/create-order", {
          method: "POST",
          body: {
            amount: data.amount,
            paymentType: data.paymentType,
            donorName: data.donorName,
            donorEmail: data.donorEmail,
            donorPhone: data.donorPhone,
            donorAddress: data.donorAddress,
            needs80G: data.needs80G,
            panCard: data.panCard,
            memberId: data.memberId,
            month: data.month,
          },
        });

        if (!orderData?.results?.success) {
          throw new Error(
            orderData?.results?.error || "Failed to create payment order"
          );
        }

        const { orderId, amount, keyId, paymentId } = orderData.results;

        interface RazorpayOptions {
          key: string;
          amount: number;
          currency: string;
          order_id: string;
          name: string;
          description: string;
          image: string;
          prefill: { name: string; email: string; contact?: string };
          theme: { color: string };
          handler: (response: RazorpayResponse) => Promise<void>;
          modal: { ondismiss: () => void };
        }

        const options: RazorpayOptions = {
          key: keyId,
          amount,
          currency: "INR",
          order_id: orderId,
          name: "Samriddhi Seva Trust",
          description:
            data.paymentType === "member" ? "Membership Payment" : "Donation",
          image: "/logo.svg",
          prefill: {
            name: data.donorName,
            email: data.donorEmail,
            contact: data.donorPhone,
          },
          theme: {
            color: "#f97316",
          },
          handler: async (response: RazorpayResponse) => {
            await handlePaymentSuccess(response, paymentId);
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
              toast.error("Payment cancelled");
            },
          },
        };

        const RazorpayConstructor = (
          window as typeof window & {
            Razorpay: new (options: RazorpayOptions) => { open: () => void };
          }
        ).Razorpay;
        const razorpay = new RazorpayConstructor(options);
        razorpay.open();
      } catch (error) {
        console.error("Error initiating payment:", error);
        toast.error("Failed to initiate payment");
        setProcessing(false);
      }
    },
    [processing, handlePaymentSuccess]
  );

  const fetchPaymentDetails = useCallback(async () => {
    try {
      // Using native fetch for GET request as useSWR is for data fetching with caching
      const response = await fetch(`/api/payments/retry/${token}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch payment details");
      }

      setPaymentData(data);
      setLoading(false);

      setTimeout(() => {
        initiatePayment(data);
      }, 1000);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      setError((error as Error).message);
      setLoading(false);
    }
  }, [token, initiatePayment]);

  useEffect(() => {
    if (token) {
      fetchPaymentDetails();
    }
  }, [token, fetchPaymentDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Payment Details...
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare your payment
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md px-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Link Invalid
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* Only show My Donations button if user is a member */}
            {paymentData?.isMember && (
              <button
                onClick={() => router.push("/admin/my-donations")}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Go to My Donations
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 to-red-50">
      <div className="text-center max-w-md">
        {processing ? (
          <>
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Payment...
            </h2>
            <p className="text-gray-600">
              Complete your payment in the Razorpay window
            </p>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Pay
            </h2>
            <p className="text-gray-600 mb-4">Amount: ₹{paymentData?.amount}</p>
            <button
              onClick={() => paymentData && initiatePayment(paymentData)}
              disabled={!paymentData}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Open Payment Gateway
            </button>
          </>
        )}
      </div>
    </div>
  );
}
