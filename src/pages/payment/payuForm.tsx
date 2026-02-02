import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface PaymentData {
  isAmountFilledByCustomer?: string;
  txnid: string;
  amount: string;
  currency?: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;
  key: string;
}

const PaymentFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);

  const paymentData: PaymentData | undefined = location.state?.paymentData;

  useEffect(() => {
    // If no payment data, redirect back
    if (!paymentData) {
      console.error("No payment data found");
      navigate("/explore");
      return;
    }

    // Auto-submit form once component mounts
    if (formRef.current && !hasSubmitted.current) {
      hasSubmitted.current = true;
      setTimeout(() => {
        formRef.current?.submit();
      }, 500);
    }
  }, [paymentData, navigate]);

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-primary-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Redirecting to Payment Gateway
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Please wait while we redirect you to secure payment...
          </p>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 sm:p-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-gray-800">
                {paymentData.currency || "INR"} {paymentData.amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-semibold text-gray-800 text-xs break-all">
                {paymentData.txnid}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          You will be redirected to PayU secure payment gateway
        </p>

        {/* Hidden Form */}
        <form
          ref={formRef}
          name="payment_post"
          id="payment_post"
          action="https://secure.payu.in/_payment"
          method="post"
          style={{ display: "none" }}
        >
          <input
            type="text"
            name="isAmountFilledByCustomer"
            value={paymentData.isAmountFilledByCustomer || "false"}
            readOnly
          />
          <input type="text" name="txnid" value={paymentData.txnid} readOnly />
          <input
            type="text"
            name="amount"
            value={paymentData.amount}
            readOnly
          />
          <input
            type="text"
            name="currency"
            value={paymentData.currency || "INR"}
            readOnly
          />
          <input
            type="text"
            name="productinfo"
            value={paymentData.productinfo}
            readOnly
          />
          <input
            type="text"
            name="firstname"
            value={paymentData.firstname}
            readOnly
          />
          <input type="text" name="email" value={paymentData.email} readOnly />
          <input type="text" name="phone" value={paymentData.phone} readOnly />
          <input type="text" name="surl" value={paymentData.surl} readOnly />
          <input type="text" name="furl" value={paymentData.furl} readOnly />
          <input type="text" name="hash" value={paymentData.hash} readOnly />
          <input type="text" name="key" value={paymentData.key} readOnly />
        </form>
      </div>
    </div>
  );
};

export default PaymentFormPage;
