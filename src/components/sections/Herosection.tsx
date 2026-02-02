import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { CircleCheckBig, CircleX, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
// import { getImageUrl } from "@/utils/imageUtils";
import SingleFrame from "@/assets/singleFrame.webp";

const Herosection: React.FC = () => {
  const { login, loginSubuser } = useAuthStore();
  const { user } = useAuthStore((state) => state);

  const isOrganiserLoggedIn =
    user && (user.role === "admin" || user.role === "subuser");

  const [organiserFormData, setOrganiserFormData] = useState({
    email: "",
    password: "",
  });
  const [subUserFormData, setSubUserFormData] = useState({
    email: "",
    password: "",
  });
  const [isOrganiserLoading, setIsOrganiserLoading] = useState(false);
  const [isSubUserLoading, setIsSubUserLoading] = useState(false);
  const [showOrganiserPassword, setShowOrganiserPassword] = useState(false);
  const [showSubUserPassword, setShowSubUserPassword] = useState(false);

  const handleOrganiserInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setOrganiserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrganiserLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!organiserFormData.email || !organiserFormData.password) {
      toast("Please fill in all required fields", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />,
      });
      return;
    }

    setIsOrganiserLoading(true);

    try {
      const response = await login(
        organiserFormData.email,
        organiserFormData.password
      );

      if (response.status === 200) {
        toast(response.message, {
          className:
            "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheckBig className="size-5" />,
        });

        window.location.href = "/dashboard";
      } else {
        toast(response.message || "Login Failed", {
          className:
            "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleX className="size-5" />,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";

      toast(errorMessage, {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />,
      });
    } finally {
      setIsOrganiserLoading(false);
    }
  };

  const handleSubUserLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!subUserFormData.email || !subUserFormData.password) {
      toast("Please fill in all required fields", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />,
      });
      return;
    }

    setIsSubUserLoading(true);

    try {
      const response = await loginSubuser(
        subUserFormData.email,
        subUserFormData.password
      );

      if (response.status === 200) {
        toast(response.message || "Logged in successfully", {
          className:
            "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheckBig className="size-5" />,
        });

        window.location.href = "/dashboard";
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";

      toast(errorMessage, {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />,
      });
    } finally {
      setIsSubUserLoading(false);
    }
  };

  const handleOrganiserKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleOrganiserLogin();
    }
  };

  const handleSubUserKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubUserLogin();
    }
  };

  return (
    <section className="w-full h-fit lg:h-full flex flex-col-reverse lg:flex-row items-center lg:gap-20 justify-center max-w-7xl mx-auto px-5 py-8 lg:py-0">
      {/* Text Div */}
      <div className="flex flex-col gap-6 lg:gap-9 w-full mt-12 lg:mt-0 lg:w-1/2 text-center lg:text-left">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          Make Business Networking Effortless with{" "}
          <span className="text-brand-primary">Klout Club</span>
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground">
          Klout Club helps you create smarter events — with instant QR check-in,
          real-time networking, AI photos, and professional connections that
          last beyond the event. Start free, set up in minutes.
        </p>
        <Link to={"/add-first-event"} className="max-w-fit mx-auto lg:mx-0">
          <Button
            size={"lg"}
            className="mx-auto lg:mx-0 w-fit shadow-lg hover:shadow-xl transition-shadow"
          >
            Get Started - It's Free
          </Button>
        </Link>
      </div>

      {/* Conditional: Show Image if logged in, otherwise show Login Box */}
      <div className="w-full lg:w-1/2 max-w-md flex justify-center mt-8 lg:mt-0">
        {isOrganiserLoggedIn ? (
          // Show image when organiser is logged in
          <img
            src={SingleFrame}
            width={500}
            height={500}
            alt="Single Frame Illustration"
            className="w-full h-auto object-contain"
          />
        ) : (
          // Show login box when not logged in
          <Tabs defaultValue="organiser" className="w-full">
            <div className="bg-card rounded-2xl shadow-2xl border overflow-hidden">
              <TabsList className="w-full grid grid-cols-2 h-14 bg-muted/50 rounded-none border-b p-0">
                <TabsTrigger
                  value="organiser"
                  className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none font-medium transition-all"
                >
                  Organiser
                </TabsTrigger>
                <TabsTrigger
                  value="sub-user"
                  className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none font-medium transition-all"
                >
                  Sub User
                </TabsTrigger>
              </TabsList>

              <TabsContent value="organiser" className="m-0 p-6 space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="organiser-email" className="text-sm">
                      Email <span className="text-secondary">*</span>
                    </Label>
                    <Input
                      id="organiser-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={organiserFormData.email}
                      onChange={handleOrganiserInputChange}
                      onKeyDown={handleOrganiserKeyDown}
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="organiser-password" className="text-sm">
                      Password <span className="text-secondary">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="organiser-password"
                        name="password"
                        type={showOrganiserPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={organiserFormData.password}
                        onChange={handleOrganiserInputChange}
                        onKeyDown={handleOrganiserKeyDown}
                        className="h-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowOrganiserPassword(!showOrganiserPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showOrganiserPassword ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      to="/organiser/forgot-password"
                      className="text-xs text-brand-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  onClick={handleOrganiserLogin}
                  className="w-full h-10"
                  disabled={isOrganiserLoading}
                >
                  {isOrganiserLoading ? "Logging in..." : "Login"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/organiser/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </TabsContent>

              <TabsContent value="sub-user" className="m-0 p-6 space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="sub-user-email" className="text-sm">
                      Email <span className="text-secondary">*</span>
                    </Label>
                    <Input
                      id="sub-user-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={subUserFormData.email}
                      onChange={handleSubUserInputChange}
                      onKeyDown={handleSubUserKeyDown}
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sub-user-password" className="text-sm">
                      Password <span className="text-secondary">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="sub-user-password"
                        name="password"
                        type={showSubUserPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={subUserFormData.password}
                        onChange={handleSubUserInputChange}
                        onKeyDown={handleSubUserKeyDown}
                        className="h-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowSubUserPassword(!showSubUserPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSubUserPassword ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      to="/sub-user/forgot-password"
                      className="text-xs text-brand-primary hover:underline"
                    >
                      Contact Administrator
                    </Link>
                  </div>
                </div>

                <Button
                  onClick={handleSubUserLogin}
                  className="w-full h-10"
                  disabled={isSubUserLoading}
                >
                  {isSubUserLoading ? "Logging in..." : "Login"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/sub-user/signup"
                    className="text-brand-primary hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </section>
  );
};

export default Herosection;
