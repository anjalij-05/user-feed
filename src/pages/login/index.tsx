import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getUserProfile, sendOtp, verifyOtp } from "@/app-api/auth";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getMyConnections } from "@/app-api/connections";
import { Input } from "@/components/ui/input";
import {
  CircleCheckBig,
  CircleX,
  Phone,
  KeyRound,
  Sparkles,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Helmet } from "react-helmet-async";
import useThemeStore from "@/store/themeStore";

const sendOtpSchema = yup.object().shape({
  countryCode: yup
    .string()
    .required("Country code is required")
    .matches(/^[0-9]+$/, "Country code must contain only digits"),
  mobile: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
});

const verifyOtpSchema = yup.object().shape({
  countryCode: yup
    .string()
    .required("Country code is required")
    .matches(/^[0-9]+$/, "Country code must contain only digits"),
  mobile: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^[0-9]{4,6}$/, "OTP must be 4-6 digits"),
});

type SendOtpForm = yup.InferType<typeof sendOtpSchema>;
type VerifyOtpForm = yup.InferType<typeof verifyOtpSchema>;

const UserLogin: React.FC = () => {
  const [sentOtp, setSentOtp] = useState<boolean>(false);
  const [floatingElements, setFloatingElements] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  // const location = useLocation();

  const { getEffectiveTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme();

  // Get the page user was trying to access before being redirected to login
  // const from = (location.state as any)?.from?.pathname || "/";

  // Generate floating elements for animation
  useEffect(() => {
    const elements = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setFloatingElements(elements);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [effectiveTheme]);

  const sendOtpForm = useForm<SendOtpForm>({
    resolver: yupResolver(sendOtpSchema),
    mode: "onChange",
    defaultValues: {
      countryCode: "91",
      mobile: "",
    },
  });

  const verifyOtpForm = useForm<VerifyOtpForm>({
    resolver: yupResolver(verifyOtpSchema),
    mode: "onChange",
    defaultValues: {
      countryCode: "91",
      mobile: "",
      otp: "",
    },
  });

  const handleSendOtp = async (data: SendOtpForm) => {
    try {
      const res: any = await dispatch(
        sendOtp({ country_code: data.countryCode, phone: data.mobile }),
      );

      if (res.payload.status) {
        setSentOtp(true);
        verifyOtpForm.setValue("countryCode", data.countryCode);
        verifyOtpForm.setValue("mobile", data.mobile);

        toast("OTP sent successfully!", {
          className:
            "!bg-purple-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheckBig className="size-5" />,
        });
      } else {
        toast("Failed to send OTP. Please try again.", {
          className:
            "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleX className="size-5" />,
        });
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      toast("Failed to send OTP. Please try again.", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />,
      });
    }
  };

  const handleVerifyOtp = async (data: VerifyOtpForm) => {
    const resultAction: any = await dispatch(
      verifyOtp({
        country_code: data.countryCode,
        phone: data.mobile,
        otp: data.otp,
      }),
    );

    const payload = resultAction.payload?.result;

    // If neither user nor checkinUser exists, redirect to signup
    if (!payload?.user && !payload?.checkinUser) {
      toast.info("Please complete your registration");
      navigate("/user-signup");
      return;
    }

    if (!payload) return;

    // If full user exists (registered user)
    if (payload.user) {
      await dispatch(
        getUserProfile({ token: payload.token, userid: payload.user._id }),
      );
      
      // Fetch connections with geolocation
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          dispatch(
            getMyConnections({
              token: payload.token,
              userId: payload.user._id,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              distance: 50,
            }),
          );
        },
        () => {
          // Fallback to default location if geolocation fails
          dispatch(
            getMyConnections({
              token: payload.token,
              userId: payload.user._id,
              latitude: 28.4595,
              longitude: 77.0266,
              distance: 50,
            }),
          );
        }
      );

      toast("Login successful!", {
        className:
          "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleCheckBig className="size-5" />,
      });

      // Redirect to the page user was trying to access or home page
      navigate("/");
      return;
    }

    // If only checkinUser exists (partial registration)
    if (payload?.checkinUser) {
      toast.info("Please complete your registration");
      navigate("/user-signup");
      return;
    }
  };

  const currentErrors = sentOtp
    ? verifyOtpForm.formState.errors
    : sendOtpForm.formState.errors;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (sentOtp) {
        verifyOtpForm.handleSubmit(handleVerifyOtp)();
      } else {
        sendOtpForm.handleSubmit(handleSendOtp)();
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Klout Club</title>
      </Helmet>
      <div className="relative flex justify-center items-stretch min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 overflow-hidden transition-colors duration-300">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingElements.map((elem) => (
            <div
              key={elem.id}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 dark:from-purple-500 dark:to-pink-500 rounded-full opacity-20 dark:opacity-10 animate-float"
              style={{
                left: `${elem.x}%`,
                top: `${elem.y}%`,
                animationDelay: `${elem.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left Side - Illustration/Content */}
          <div className="flex-1 text-center lg:text-left space-y-6 animate-slide-in-left">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <Sparkles className="size-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Secure Login
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Welcome Back to
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Klout Club
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-lg mx-auto lg:mx-0">
              Connect with professionals, grow your network, and make meaningful
              business connections.
            </p>

            {/* Decorative Illustration */}
            <div className="hidden lg:block mt-8">
              <div className="relative w-full h-64">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 dark:from-blue-500 dark:to-purple-500 rounded-full opacity-20 dark:opacity-10 blur-2xl animate-pulse" />
                <div
                  className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-600 to-pink-400 dark:from-purple-500 dark:to-pink-500 rounded-full opacity-20 dark:opacity-10 blur-2xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Phone className="size-32 text-purple-600 dark:text-purple-400 opacity-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form, vertically centered within the right column */}
          <div className="w-full lg:w-auto lg:min-w-[420px] flex items-center justify-center animate-slide-in-right">
            <div className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
              {/* Form Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 mb-4 shadow-lg">
                  <Phone className="size-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {sentOtp ? "Verify OTP" : "Welcome!"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {sentOtp
                    ? "Enter the OTP sent to your mobile"
                    : "Enter your mobile number to continue"}
                </p>
              </div>

              {/* Form */}
              <div
                onSubmit={(e) => {
                  e.preventDefault();
                  if (sentOtp) {
                    verifyOtpForm.handleSubmit(handleVerifyOtp)();
                  } else {
                    sendOtpForm.handleSubmit(handleSendOtp)();
                  }
                }}
                className="space-y-6"
              >
                {/* Mobile Number Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mobile Number
                  </label>
                  <div className="flex gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                        +
                      </span>
                      <Input
                        {...(sentOtp
                          ? verifyOtpForm.register("countryCode")
                          : sendOtpForm.register("countryCode"))}
                        type="text"
                        placeholder="91"
                        className={`w-20 h-12 pl-7 font-medium dark:bg-gray-700/50 dark:text-white dark:placeholder:text-gray-400 ${
                          currentErrors.countryCode
                            ? "border-red-500 dark:border-red-400"
                            : "border-gray-200 dark:border-gray-600"
                        } focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all`}
                        disabled={sentOtp}
                        maxLength={3}
                        inputMode="numeric"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <div className="flex-1 relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        {...(sentOtp
                          ? verifyOtpForm.register("mobile")
                          : sendOtpForm.register("mobile"))}
                        type="tel"
                        placeholder="9876543210"
                        className={`h-12 pl-11 dark:bg-gray-700/50 dark:text-white dark:placeholder:text-gray-400 ${
                          currentErrors.mobile
                            ? "border-red-500 dark:border-red-400"
                            : "border-gray-200 dark:border-gray-600"
                        } focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all`}
                        disabled={sentOtp}
                        maxLength={10}
                        inputMode="numeric"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  </div>
                  {(currentErrors.countryCode || currentErrors.mobile) && (
                    <p className="text-red-500 dark:text-red-400 text-sm flex items-center gap-1">
                      <CircleX className="size-4" />
                      {currentErrors.countryCode?.message ||
                        currentErrors.mobile?.message}
                    </p>
                  )}
                </div>

                {/* OTP Input */}
                {sentOtp && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enter OTP
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        {...verifyOtpForm.register("otp")}
                        type="text"
                        placeholder="123456"
                        className={`h-12 pl-11 tracking-widest text-center text-lg font-semibold dark:bg-gray-700/50 dark:text-white dark:placeholder:text-gray-400 ${
                          verifyOtpForm.formState.errors.otp
                            ? "border-red-500 dark:border-red-400"
                            : "border-gray-200 dark:border-gray-600"
                        } focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all`}
                        maxLength={6}
                        inputMode="numeric"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    {verifyOtpForm.formState.errors.otp && (
                      <p className="text-red-500 dark:text-red-400 text-sm flex items-center gap-1">
                        <CircleX className="size-4" />
                        {verifyOtpForm.formState.errors.otp.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                    <CircleX className="size-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (sentOtp) {
                      verifyOtpForm.handleSubmit(handleVerifyOtp)();
                    } else {
                      sendOtpForm.handleSubmit(handleSendOtp)();
                    }
                  }}
                  className="w-full h-12 bg-gradient-to-r cursor-pointer from-blue-600 via-purple-600 to-pink-600 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 dark:hover:from-blue-600 dark:hover:via-purple-600 dark:hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Please wait...
                    </span>
                  ) : sentOtp ? (
                    "Verify OTP"
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
            }
            50% {
              transform: translateY(-20px) translateX(10px);
            }
          }
          
          @keyframes slide-in-left {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slide-in-right {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-slide-in-left {
            animation: slide-in-left 0.6s ease-out;
          }
          
          .animate-slide-in-right {
            animation: slide-in-right 0.6s ease-out;
          }
          
          .animate-fade-in {
            animation: fade-in 0.4s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default UserLogin;