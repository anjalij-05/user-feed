import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MessageSquare,
  Target,
  Volume2,
  TrendingUp,
  Eye,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { appUrl } from "@/constants";

interface PremiumDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  token: string;
}

const PremiumDialog: React.FC<PremiumDialogProps> = ({
  isOpen,
  onClose,
  user,
  token,
}) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("3 Months");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const firstName = user?.first_name || "";
  const email = user?.emailId || "";
  const mobileNumber = user?.mobileNumber || "";

  const features = [
    { name: "Expanded Search Radius", icon: Search },
    { name: "Direct Messaging", icon: MessageSquare },
    { name: "Key Account Insights", icon: Target },
    { name: "Ad-Free Experience", icon: Volume2 },
    { name: "Boosted Thought Leadership Score", icon: TrendingUp },
    { name: "View Details of Thought Leadership Score", icon: Eye },
  ];

  const plans = [{ duration: "3 Months", price: "₹49.00", popular: true }];

  // Function to parse HTML form and extract input values
  const parsePaymentForm = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const inputs = doc.querySelectorAll("input[name]");

    const paymentData: any = {};
    inputs.forEach((input) => {
      const name = input.getAttribute("name");
      const value = input.getAttribute("value");
      if (name && value !== null) {
        paymentData[name] = value;
      }
    });

    return paymentData;
  };

  const handlePurchase = async () => {
    if (!firstName || !email || !mobileNumber) {
      setError("User details are missing. Please log in first.");
      return;
    }

    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${appUrl}/api/v1/payment/payment-topup`,
        {
          firstname: firstName,
          email: email,
          mobile: mobileNumber,
        },
        {
          headers: {
            "x-access-token": token,
          },
        }
      );

      console.log("Full API Response:", response.data);

      let paymentData = null;
      let responseContent = response.data;

      // Check if there's a nested data property
      if (responseContent && responseContent.data) {
        responseContent = responseContent.data;
      }

      // Check if response is HTML string (form)
      if (
        typeof responseContent === "string" &&
        responseContent.includes("<form")
      ) {
        console.log("Response is HTML form, parsing...");
        paymentData = parsePaymentForm(responseContent);
        console.log("Parsed Payment Data:", paymentData);
      }
      // Check if it's already a JSON object with payment fields
      else if (
        responseContent &&
        typeof responseContent === "object" &&
        responseContent.txnid
      ) {
        console.log("Response is JSON object with payment data");
        paymentData = responseContent;
      }
      // Check for direct payment URL redirect
      else if (responseContent && responseContent.paymentUrl) {
        const paymentUrl = responseContent.paymentUrl;
        console.log("Redirecting to payment URL:", paymentUrl);
        window.location.href = paymentUrl;
        return; // Exit after redirect
      }

      console.log("Final Payment Data:", paymentData);

      // Validate that we have the required fields
      if (
        paymentData &&
        paymentData.txnid &&
        paymentData.hash &&
        paymentData.key
      ) {
        console.log("Payment data validated successfully");

        // Navigate to payment form page with the data
        navigate("/payment/form", {
          state: { paymentData },
        });

        // Close the dialog
        onClose();
        toast.success("Redirecting to payment gateway...");
      } else {
        // If no valid payment data found
        console.error("Invalid response structure:", response.data);
        console.error("Parsed payment data:", paymentData);
        setError("Invalid payment data received from server");
        toast.error("Payment initialization failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      console.error("Error response:", err.response?.data);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong";

      setError(errorMessage);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setError("");
      setIsLoading(false);
      setSelectedPlan("3 Months");
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className=" p-6 pb-4 bg-white border-b border-gray-100">
          <div className="flex items-start gap-4 mb-2">
            <div className="w-15 h-15 bg-klout-primary rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="w-9 h-9 text-white"
                fill="currentColor"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-1 text-gray-900">
                Klout Club Premium
                <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
              </h2>
              <p className="text-xl font-bold text-gray-900">₹49.00</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.name}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2 flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-700 leading-tight">
                    {feature.name}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Plan Selection */}
          <div className="flex justify-center">
            {plans.map((plan) => (
              <button
                key={plan.duration}
                onClick={() => setSelectedPlan(plan.duration)}
                className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  selectedPlan === plan.duration
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {plan.duration}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 text-base font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Buy ${plans.find((p) => p.duration === selectedPlan)?.price}`
            )}
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumDialog;
