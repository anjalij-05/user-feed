import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCompanyMemberTls } from "@/app-api/tls";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import DummyImage from "@/assets/dummy_image.webp";
import TlsImage from "@/assets/tlsImage.webp";
import { getUserProfileImage } from "@/lib/utils";
import { toast } from "sonner";
import { Profile } from "../explore";

const CompanyEmployees: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { companyName } = useParams<{ companyName: string }>();
  const decodedName = decodeURIComponent(companyName || "");

  const { user } = useAppSelector((s) => s.auth);
  const {
    companyMembers,
    loading: companyTlsLoading,
    error: companyError,
  } = useAppSelector((s) => s.tls);

  // Fetch employees on mount
  useEffect(() => {
    if (!decodedName) {
      toast.error("Company name is required");
      navigate(-1);
      return;
    }

    const fetchEmployees = async () => {
      try {
        await dispatch(
          fetchCompanyMemberTls({ company: decodedName })
        ).unwrap();
      } catch (err: any) {
        toast.error("Error fetching employees", {
          description: err?.message || "Please try again",
        });
        console.error("Company members fetch error:", err);
      }
    };

    fetchEmployees();
  }, [dispatch, decodedName, navigate]);

  const handleEmployeeClick = (profile: Profile) => {
    navigate(`/profile/${profile.first_name.toLowerCase()}-${profile.last_name.toLowerCase()}-${profile._id}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (companyTlsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-klout-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-base sm:text-lg">
            Loading employees...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-border">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              size="sm"
              className="hover:bg-accent p-2"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground capitalize truncate">
                Employees at {decodedName}
              </h1>
              {companyMembers && companyMembers.length > 0 && (
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {companyMembers.length}{" "}
                  {companyMembers.length === 1 ? "employee" : "employees"} found
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-border">
          {companyError ? (
            <div className="text-center py-8 sm:py-12 bg-destructive/10 rounded-lg border border-destructive/20 px-4">
              <p className="text-destructive font-semibold text-base sm:text-lg mb-2">
                Error Loading Employees
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {companyError}
              </p>
              <Button
                onClick={handleGoBack}
                className="mt-4 bg-klout-primary hover:bg-klout-secondary text-white text-sm sm:text-base"
                size="sm"
              >
                Go Back
              </Button>
            </div>
          ) : companyMembers && companyMembers.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {companyMembers.map((member: any) => (
                <div
                  key={member._id}
                  className="border border-border rounded-lg sm:rounded-xl p-3 sm:p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-klout-primary/50 bg-card"
                  onClick={() => handleEmployeeClick(member)}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="shrink-0">
                        <img
                          src={
                            member.profileImage
                              ? getUserProfileImage(
                                  user?.imageBaseUrl || "",
                                  member.profileImage
                                )
                              : DummyImage
                          }
                          alt={`${member.first_name} ${member.last_name}`}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 sm:border-3 border-klout-primary/20 shadow-md"
                          onError={(e) => {
                            e.currentTarget.src = DummyImage;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-semibold capitalize text-foreground hover:text-klout-primary truncate">
                            {member.first_name} {member.last_name}
                          </h3>
                          {member.role?.toLowerCase() === "premium" && (
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold capitalize text-muted-foreground mb-1 line-clamp-1">
                          {member.designation ||
                            member.jobFunction ||
                            "Professional"}
                        </p>
                      </div>
                    </div>

                    {/* TLS Score */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      {member.score !== undefined && (
                        <div className="relative w-16 h-10 sm:w-16 sm:h-12">
                          <img
                            src={TlsImage}
                            alt="TLS"
                            className="w-full h-full object-contain"
                          />
                          <span className="absolute inset-y-0 right-1.5 sm:right-2 top-0.5 sm:top-1 flex items-center text-white font-semibold text-xs sm:text-sm">
                            {member.score}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 px-4">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <p className="text-foreground mb-2 text-base sm:text-lg font-semibold">
                No employees found
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                No employees are currently registered from this company
              </p>
              <Button
                onClick={handleGoBack}
                className="bg-klout-primary hover:bg-klout-secondary text-white text-sm sm:text-base"
                size="sm"
              >
                Go Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyEmployees;
