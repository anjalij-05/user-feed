import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getUserProfile, registerUser } from "@/app-api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { RegisterForm } from "@/pages/validation/registerSchema";
import { registerSchema } from "@/pages/validation/registerSchema";
import {
  Edit2,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  CircleCheckBig,
  CircleX,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import DummyImage from "@/assets/dummy_image.webp";
import { getUserProfileImage } from "@/lib/utils";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfileImageUploader from "@/components/profileImageUploader";
import { appUrl } from "@/constants";
import { Input } from "@/components/ui/input";

const Signup: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error, user, checkinuser } = useAppSelector(
    (state) => state.auth,
  );

  const [preview, setPreview] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [floatingElements, setFloatingElements] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    const elements = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setFloatingElements(elements);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
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
    Object.keys(errors).length === 0;

  useEffect(() => {
    if (checkinuser) {
      const nameParts = (checkinuser.name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const cleanMobile = checkinuser.mobile || "";
      const countryCode = checkinuser.countryCode
        ? Number(String(checkinuser.countryCode).replace(/\D/g, ""))
        : 91;

      reset({
        first_name: firstName,
        last_name: lastName,
        email: checkinuser.email || "",
        mobileNumber: cleanMobile,
        designation: checkinuser.designation || "",
        company: checkinuser.company || "",
        role: "user",
        countryCode: countryCode,
        profileImage: undefined,
      });

      toast.info("Your details have been prefilled from check-in", {
        className:
          "!bg-blue-800 !text-white !font-sans !font-regular tracking-wider",
      });
    }
  }, [checkinuser, reset]);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleTempSave = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(`${appUrl}/api/v1/upload/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageKey =
        res.data?.key ||
        res.data?.data?.key ||
        res.data?.url ||
        res.data?.Key ||
        res.data?.data?.Key;

      if (imageKey) {
        setValue("profileImage", imageKey, { shouldValidate: true });
        setPreview(URL.createObjectURL(file));
        toast.success("Profile image uploaded successfully", {
          className:
            "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheckBig className="size-5" />,
        });
      } else {
        toast.error("Upload succeeded but no image key found in response", {
          className:
            "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleX className="size-5" />,
        });
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Error uploading image", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />,
      });
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
        data.countryCode.toString().replace(/\+/g, "").trim(),
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

      toast.success("Registration successful!", {
        className:
          "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleCheckBig className="size-5" />,
      });
      navigate("/nearby-users");
    } catch (err: any) {
      console.error("❌ Register failed:", err);
      toast.error(err?.message || "Registration failed.", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />,
      });
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden py-6">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((elem) => (
          <div
            key={elem.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-float"
            style={{
              left: `${elem.x}%`,
              top: `${elem.y}%`,
              animationDelay: `${elem.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

          {/* Left Side - Welcome Content */}
          <div className="flex-1 space-y-5 animate-slide-in-left lg:self-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <Sparkles className="size-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                Join Our Network
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Start Your
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Professional Journey
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-lg">
              Join thousands of professionals already networking and growing
              their business on Klout Club.
            </p>

            {checkinuser && (
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-xl p-4 animate-fade-in">
                <p className="text-sm font-medium text-primary mb-1">
                  ✨ Welcome back!
                </p>
                <p className="text-xs text-primary">
                  We've prefilled your details from the {checkinuser.eventName}{" "}
                  event check-in
                </p>
              </div>
            )}

            {/* Benefits List */}
            <div className="space-y-3 pt-2">
              {[
                "Connect with like-minded professionals",
                "Expand your business network",
                "Discover collaboration opportunities",
                "Build meaningful relationships",
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <CircleCheckBig className="size-3.5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Decorative blobs */}
            <div className="hidden lg:block">
              <div className="relative w-full h-24">
                <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 blur-2xl animate-pulse" />
                <div
                  className="absolute bottom-0 right-0 w-36 h-36 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-2xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form (compact, no scroll) */}
          <div className="w-full lg:w-auto lg:min-w-[400px] lg:max-w-[440px] flex items-center justify-center animate-slide-in-right">
            <div className="w-full bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/20">

              {/* Form Header + Avatar inline to save vertical space */}
              <div className="flex items-center gap-4 mb-4">
                {/* Avatar */}
                <div className="relative group flex-shrink-0">
                  <img
                    src={
                      preview ||
                      (user?.profileImage
                        ? getUserProfileImage(
                            user.imageBaseUrl || "",
                            user.profileImage,
                          )
                        : DummyImage)
                    }
                    alt="Profile Preview"
                    className="rounded-full w-16 h-16 object-cover border-4 border-purple-200 shadow-md transition-transform group-hover:scale-105"
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-1.5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
                    onClick={() => setDialogOpen(true)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Create Account
                  </h2>
                  <p className="text-xs text-gray-500">Fill in your details below</p>
                  {errors.profileImage && (
                    <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1">
                      <CircleX className="size-3" />
                      Profile image required
                    </p>
                  )}
                </div>
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

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmitRegister)}
                className="space-y-3"
              >
                {/* Name Fields - Side by Side */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        {...register("first_name")}
                        placeholder="John"
                        className={`h-9 pl-8 text-sm ${
                          errors.first_name ? "border-red-500" : "border-gray-200"
                        } focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all`}
                      />
                    </div>
                    {errors.first_name && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <CircleX className="size-3" />
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        {...register("last_name")}
                        placeholder="Doe"
                        className={`h-9 pl-8 text-sm ${
                          errors.last_name ? "border-red-500" : "border-gray-200"
                        } focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all`}
                      />
                    </div>
                    {errors.last_name && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <CircleX className="size-3" />
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="john@example.com"
                      className={`h-9 pl-8 text-sm ${
                        errors.email ? "border-red-500" : "border-gray-200"
                      } focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <CircleX className="size-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
                        +
                      </span>
                      <Input
                        {...register("countryCode", { valueAsNumber: true })}
                        type="text"
                        placeholder="91"
                        className={`w-16 h-9 pl-6 text-sm font-medium text-center ${
                          errors.countryCode ? "border-red-500" : "border-gray-200"
                        } focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all`}
                        maxLength={4}
                        inputMode="numeric"
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/[^0-9]/g, "");
                        }}
                      />
                    </div>
                    <div className="flex-1 relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        {...register("mobileNumber")}
                        type="tel"
                        placeholder="9876543210"
                        className={`h-9 pl-8 text-sm ${
                          errors.mobileNumber ? "border-red-500" : "border-gray-200"
                        } focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all`}
                        maxLength={10}
                        inputMode="numeric"
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/[^0-9]/g, "");
                        }}
                      />
                    </div>
                  </div>
                  {(errors.countryCode || errors.mobileNumber) && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <CircleX className="size-3" />
                      {errors.countryCode?.message || errors.mobileNumber?.message}
                    </p>
                  )}
                </div>

                {/* Designation + Company side by side */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        {...register("designation")}
                        placeholder="Engineer"
                        className={`h-9 pl-8 text-sm ${
                          errors.designation ? "border-red-500" : "border-gray-200"
                        } focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all`}
                      />
                    </div>
                    {errors.designation && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <CircleX className="size-3" />
                        {errors.designation.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        {...register("company")}
                        placeholder="Tech Corp"
                        className={`h-9 pl-8 text-sm ${
                          errors.company ? "border-red-500" : "border-gray-200"
                        } focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all`}
                      />
                    </div>
                    {errors.company && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <CircleX className="size-3" />
                        {errors.company.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2 animate-fade-in">
                    <CircleX className="size-4 text-red-600 flex-shrink-0" />
                    <p className="text-red-600 text-xs">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r cursor-pointer from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading || !isFormValid}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Complete Registration
                      <ArrowRight className="size-4" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.6s ease-out; }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default Signup;