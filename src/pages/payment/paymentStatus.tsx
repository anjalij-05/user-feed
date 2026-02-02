import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PaymentStatus: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { status, id } = useParams<{ status?: string; id?: string }>();
  const { user } = useAppSelector((state) => state.auth);

  console.log("PaymentStatus params:", { status, id });

  const [countdown, setCountdown] = useState(5);
  const [isVerifying, setIsVerifying] = useState(true);

  // Get payment details from URL params or query params
  // const id = urlId || searchParams.get("id") || searchParams.get("mihpayid") || "";
  // const status = urlStatus || searchParams.get("status") || "";
  const amount = searchParams.get("amount") || "199.00";
  const paymentMode = searchParams.get("mode") || "";
  const errorMessage =
    searchParams.get("error_Message") || searchParams.get("field9") || "";

  // Determine payment status directly from params
  const paymentStatus =
    status?.toLowerCase() === "success" ? "success" : "failure";

  useEffect(() => {
    // Simulate verification delay
    const verifyTimer = setTimeout(() => {
      setIsVerifying(false);

      // Show toast based on status
      if (paymentStatus === "success") {
        toast.success("Payment completed successfully!");
      } else {
        toast.error("Payment failed. Please try again.");
      }
    }, 1500);

    return () => clearTimeout(verifyTimer);
  }, [paymentStatus]);

  // Countdown timer for auto-redirect (commented out but available)
  useEffect(() => {
    if (!isVerifying && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    // Uncomment to enable auto-redirect
    // if (countdown === 0) {
    //   navigate("/");
    // }
  }, [countdown, isVerifying, navigate]);

  const handleRedirect = () => {
    navigate("/");
  };

  // Loading/Verifying state
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-primary-100 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 sm:w-20 sm:h-20 text-klout-primary animate-spin mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Verifying Payment
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Please wait while we confirm your payment...
          </p>
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-klout-primary h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-60 to-primary-100 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mb-4">
              Your premium subscription has been activated
            </p>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 sm:p-6 mb-6">
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-gray-800">₹{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold text-gray-800">
                  3 Months Premium
                </span>
              </div>
              {id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-semibold text-gray-800 text-xs break-all">
                    {id.length > 20 ? `${id.slice(0, 20)}...` : id}
                  </span>
                </div>
              )}
              {paymentMode && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Mode:</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {paymentMode}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleRedirect}
              className="w-full bg-klout-primary hover:bg-klout-primary-dark cursor-pointer text-white py-3 text-base sm:text-lg font-semibold rounded-xl transition-all hover:scale-105"
            >
              Continue
            </Button>
            {/* Uncomment to show countdown */}
            <p className="text-xs sm:text-sm text-gray-500">
              Redirecting in {countdown} seconds...
            </p>
          </div>

          {user?.emailId && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                A confirmation email has been sent to {user.emailId}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Failure state
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-pink-100 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
        <div className="mb-4">
          <div className="w-15 h-15 sm:w-24 sm:h-21 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <XCircle className="w-12 h-12 sm:w-14 sm:h-14 text-red-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Payment Failed
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            We couldn't process your payment
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-4 mb-4">
          {id && (
            <div className="mb-3 pb-3 border-b border-red-200">
              <p className="text-xs text-gray-600">Transaction ID:</p>
              <p className="text-sm text-gray-800 font-mono break-all">{id}</p>
            </div>
          )}
          {errorMessage && (
            <div className="mb-3 pb-3 border-b border-red-200">
              <p className="text-xs text-gray-600">Error Message:</p>
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
          <p className="text-sm text-gray-700 mb-3">
            Your payment was not successful. This could be due to:
          </p>
          <ul className="text-xs sm:text-sm text-gray-600 text-left space-y-2">
            <li>• Insufficient funds</li>
            <li>• Network connectivity issues</li>
            <li>• Payment gateway timeout</li>
            <li>• Incorrect payment details</li>
            <li>• Payment cancelled by user</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate(-2)}
            className="w-full bg-red-600 hover:bg-red-700 cursor-pointer text-white py-3 text-base sm:text-lg font-semibold rounded-xl transition-all hover:scale-105"
          >
            Try Again
          </Button>
          <Button
            onClick={handleRedirect}
            variant="outline"
            className="w-full cursor-pointer py-3 text-base sm:text-lg font-semibold rounded-xl"
          >
            Go to Home
          </Button>
          {/* Uncomment to show countdown */}
          {/* <p className="text-xs sm:text-sm text-gray-500">
            Auto-redirecting in {countdown} seconds...
          </p> */}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact support at{" "}
            <a
              href="mailto:support@kloutclub.com"
              className="text-primary hover:underline"
            >
              support@kloutclub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
