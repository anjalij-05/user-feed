import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { sendOtp, verifyOtp, getUserProfile, registerUser } from "@/app-api/auth";
import { toast } from "sonner";
import { CircleCheckBig, CircleX, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getMyConnections } from "@/app-api/connections";
import ProfileImageUploader from "@/components/profileImageUploader";
import DummyImage from "@/assets/dummy_image.webp";
import { getUserProfileImage } from "@/lib/utils";
import axios from "axios";
import { appUrl } from "@/constants";
import type { RegisterForm } from "@/pages/validation/registerSchema";
import { registerSchema } from "@/pages/validation/registerSchema";

// Validation schemas
const sendOtpSchema = yup.object({
  countryCode: yup
    .string()
    .required("Country code is required")
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(1, "Country code is required")
    .max(3, "Country code must be at most 3 digits"),
  mobile: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]+$/, "Must be only digits")
    .length(10, "Mobile number must be exactly 10 digits"),
});

const verifyOtpSchema = yup.object({
  countryCode: yup.string().required(),
  mobile: yup.string().required(),
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^[0-9]+$/, "Must be only digits")
    .length(6, "OTP must be exactly 6 digits"),
});

type SendOtpForm = yup.InferType<typeof sendOtpSchema>;
type VerifyOtpForm = yup.InferType<typeof verifyOtpSchema>;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange, onAuthSuccess }) => {
  const [sentOtp, setSentOtp] = useState<boolean>(false);
  const [showSignup, setShowSignup] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { loading, user } = useAppSelector((state) => state.auth);

  // Form for sending OTP
  const sendOtpForm = useForm<SendOtpForm>({
    resolver: yupResolver(sendOtpSchema),
    mode: "onChange",
    defaultValues: {
      countryCode: "91",
      mobile: "",
    },
  });

  // Form for verifying OTP
  const verifyOtpForm = useForm<VerifyOtpForm>({
    resolver: yupResolver(verifyOtpSchema),
    mode: "onChange",
    defaultValues: {
      countryCode: "91",
      mobile: "",
      otp: "",
    },
  });

  // Form for registration
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors: registerErrors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      mobileNumber: "",
      designation: "",
      company: "",
      role: "user",
      countryCode: 91,
      profileImage: undefined,
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleSendOtp = async (data: SendOtpForm) => {
    try {
      const res: any = await dispatch(
        sendOtp({ country_code: data.countryCode, phone: data.mobile })
      );

      if (res.payload.status) {
        setSentOtp(true);
        verifyOtpForm.setValue("countryCode", data.countryCode);
        verifyOtpForm.setValue("mobile", data.mobile);

        toast("OTP sent successfully!", {
          className:
            "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
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
      })
    );

    const payload = resultAction.payload?.result;

    if (!payload?.user && !payload?.checkinUser) {
      toast.error("OTP verified but user not found.");
      setShowSignup(true);
      // Prefill signup form with phone number
      setValue("mobileNumber", data.mobile);
      setValue("countryCode", Number(data.countryCode));
      return;
    }

    if (!payload) return;

    // If full user exists → authentication successful
    if (payload.user) {
      dispatch(
        getUserProfile({ token: payload.token, userid: payload.user._id })
      );

      // Fetch connections
      navigator.geolocation.getCurrentPosition((pos) => {
        dispatch(
          getMyConnections({
            token: payload.token,
            userId: payload.user._id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            distance: 50,
          })
        );
      });

      toast("Login successful!", {
        className:
          "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleCheckBig className="size-5" />,
      });

      // Close dialog and trigger success callback
      onOpenChange(false);
      onAuthSuccess();
      return;
    }

    // If only checkin user → show signup form
    if (payload.checkinUser) {
      setShowSignup(true);
      // Prefill signup form
      const [firstName, ...rest] = (payload.checkinUser.name || "").split(" ");
      setValue("first_name", firstName || "");
      setValue("last_name", rest.join(" ") || "");
      setValue("email", payload.checkinUser.email || "");
      setValue("mobileNumber", payload.checkinUser.mobile || "");
      setValue("designation", payload.checkinUser.designation || "");
      setValue("company", payload.checkinUser.company || "");
      setValue("countryCode", Number(payload.checkinUser.countryCode || 91));
    }
  };

  const handleTempSave = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(`${appUrl}/api/v1/upload/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageKey = res.data?.key || res.data?.data?.key || res.data?.url;

      if (imageKey) {
        setValue("profileImage", imageKey, { shouldValidate: true });
        setPreview(URL.createObjectURL(file));
        toast.success("Profile image uploaded successfully");
      } else {
        toast.error("Upload succeeded but no image key found in response");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Error uploading image");
    }
  };

  const onSubmitRegister = async (data: RegisterForm) => {
    try {
      if (
        !data.first_name ||
        !data.last_name ||
        !data.email ||
        !data.mobileNumber ||
        !data.designation ||
        !data.company ||
        !data.countryCode
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (!data.profileImage) {
        toast.error("Profile image is required");
        return;
      }

      const countryCodeNumber = Number(
        data.countryCode.toString().replace(/\+/g, "").trim()
      );

      const registerPayload = {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim(),
        mobileNumber: data.mobileNumber.toString().trim(),
        countryCode: countryCodeNumber,
        designation: data.designation.trim(),
        company: data.company.trim(),
        role: data.role || "user",
        step: "1",
        otp: "",
        profileImage: data.profileImage,
      };

      const res: any = await dispatch(registerUser(registerPayload)).unwrap();

      const userId = res.result?.user?._id || res.user?._id;
      const token = res.result?.token || res.token;

      if (!userId || !token) {
        toast.error("Registration response is missing user or token");
        return;
      }

      await dispatch(getUserProfile({ token, userid: userId })).unwrap();

      toast.success("Registration successful!");

      // Close dialog and trigger success callback
      onOpenChange(false);
      onAuthSuccess();
    } catch (err: any) {
      console.error("❌ Register failed:", err);
      toast.error(err?.message || "Registration failed.");
    }
  };

  const currentErrors = sentOtp ? verifyOtpForm.formState.errors : sendOtpForm.formState.errors;

  const watchedFields = watch([
    "first_name",
    "last_name",
    "email",
    "mobileNumber",
    "designation",
    "company",
    "profileImage",
    "countryCode",
  ]);

  const isFormValid =
    watchedFields.every((field) => field && field.toString().trim() !== "") &&
    Object.keys(registerErrors).length === 0;

  // Reset state when dialog closes
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setSentOtp(false);
      setShowSignup(false);
      setPreview(null);
      sendOtpForm.reset();
      verifyOtpForm.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showSignup ? "Complete Registration" : "Login to Continue"}
          </DialogTitle>
        </DialogHeader>

        {!showSignup ? (
          // Login/OTP Flow
          <form
            onSubmit={
              sentOtp
                ? verifyOtpForm.handleSubmit(handleVerifyOtp)
                : sendOtpForm.handleSubmit(handleSendOtp)
            }
            className="space-y-4"
          >
            {/* Country Code + Mobile Input */}
            <div>
              <div className="flex gap-2">
                <div>
                  <Input
                    {...(sentOtp
                      ? verifyOtpForm.register("countryCode")
                      : sendOtpForm.register("countryCode"))}
                    type="text"
                    placeholder="91"
                    className={`w-20 h-10 ${
                      currentErrors.countryCode ? "border-red-500" : ""
                    }`}
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
                <div className="flex-1">
                  <Input
                    {...(sentOtp
                      ? verifyOtpForm.register("mobile")
                      : sendOtpForm.register("mobile"))}
                    type="tel"
                    placeholder="Enter Mobile Number"
                    className={`h-10 ${
                      currentErrors.mobile ? "border-red-500" : ""
                    }`}
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
                <p className="text-red-500 text-sm mt-1">
                  {currentErrors.countryCode?.message ||
                    currentErrors.mobile?.message}
                </p>
              )}
            </div>

            {/* OTP Input (shown after OTP sent) */}
            {sentOtp && (
              <div>
                <Input
                  {...verifyOtpForm.register("otp")}
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className={`h-10 ${
                    (currentErrors as any).otp ? "border-red-500" : ""
                  }`}
                  maxLength={6}
                  inputMode="numeric"
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onKeyDown={handleKeyDown}
                />
                {(currentErrors as any).otp && (
                  <p className="text-red-500 text-sm mt-1">
                    {(currentErrors as any).otp.message as any}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Please wait..." : sentOtp ? "Verify OTP" : "Send OTP"}
            </Button>

            {sentOtp && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setSentOtp(false);
                  verifyOtpForm.reset();
                }}
              >
                Change Number
              </Button>
            )}
          </form>
        ) : (
          // Signup Form
          <form onSubmit={handleSubmit(onSubmitRegister)} className="space-y-3 max-h-[70vh] overflow-y-auto">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center">
              <label className="text-sm font-medium mb-2">
                Profile Image <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <img
                  src={
                    preview ||
                    (user?.profileImage
                      ? getUserProfileImage(
                          user.imageBaseUrl || "",
                          user.profileImage
                        )
                      : DummyImage)
                  }
                  alt="Profile Preview"
                  className="rounded-full mb-2 w-28 h-28 object-cover border-4 border-primary shadow-md"
                />

                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md"
                  onClick={() => setDialogOpen(true)}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {registerErrors.profileImage && (
                <p className="text-red-500 text-sm mt-1">
                  Profile image is required
                </p>
              )}
            </div>

            {/* ProfileImageUploader Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Profile Image</DialogTitle>
                </DialogHeader>
                <ProfileImageUploader
                  context="signup"
                  onTempSave={handleTempSave}
                  onClose={() => setDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("first_name")}
                placeholder="Enter first name"
                className={`w-full px-4 py-2 border rounded-lg ${
                  registerErrors.first_name ? "border-red-500" : ""
                }`}
              />
              {registerErrors.first_name && (
                <p className="text-red-500 text-sm mt-1">
                  {registerErrors.first_name.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("last_name")}
                placeholder="Enter last name"
                className={`w-full px-4 py-2 border rounded-lg ${
                  registerErrors.last_name ? "border-red-500" : ""
                }`}
              />
              {registerErrors.last_name && (
                <p className="text-red-500 text-sm mt-1">
                  {registerErrors.last_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="Enter email"
                className={`w-full px-4 py-2 border rounded-lg ${
                  registerErrors.email ? "border-red-500" : ""
                }`}
              />
              {registerErrors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {registerErrors.email.message}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  {...register("countryCode", { valueAsNumber: true })}
                  placeholder="+91"
                  className={`w-20 px-3 py-2 border rounded-lg text-center ${
                    registerErrors.countryCode ? "border-red-500" : ""
                  }`}
                  maxLength={4}
                  inputMode="numeric"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9]/g, "");
                  }}
                />
                <input
                  {...register("mobileNumber")}
                  placeholder="Enter mobile number"
                  className={`flex-1 px-4 py-2 border rounded-lg ${
                    registerErrors.mobileNumber ? "border-red-500" : ""
                  }`}
                  maxLength={10}
                  inputMode="numeric"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9]/g, "");
                  }}
                />
              </div>
              {(registerErrors.countryCode || registerErrors.mobileNumber) && (
                <p className="text-red-500 text-sm mt-1">
                  {registerErrors.countryCode?.message ||
                    registerErrors.mobileNumber?.message}
                </p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                {...register("designation")}
                placeholder="Enter designation"
                className={`w-full px-4 py-2 border rounded-lg ${
                  registerErrors.designation ? "border-red-500" : ""
                }`}
              />
              {registerErrors.designation && (
                <p className="text-red-500 text-sm mt-1">
                  {registerErrors.designation.message}
                </p>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                {...register("company")}
                placeholder="Enter company"
                className={`w-full px-4 py-2 border rounded-lg ${
                  registerErrors.company ? "border-red-500" : ""
                }`}
              />
              {registerErrors.company && (
                <p className="text-red-500 text-sm mt-1">
                  {registerErrors.company.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isFormValid}
            >
              {loading ? "Registering..." : "Complete Registration"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;