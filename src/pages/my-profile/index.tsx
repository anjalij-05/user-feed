import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import React, { useEffect, useMemo, useState } from "react";
import DummyImage from "@/assets/dummy_image.webp";
import {
  MapPin,
  Edit2,
  User,
  Briefcase,
  GraduationCap,
  Code,
  ChevronLeft,
  ChevronRight,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditProfile from "@/pages/user/editProfile";
import { getUserProfileImage, safeParseArray } from "@/lib/utils";
import ProfileImageUploader from "@/components/profileImageUploader";
import { fetchTlsScore } from "@/app-api/tls";
import TlsImage from "@/assets/tlsImage.webp";
import { fetchCompanies } from "@/app-api/company";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import ImageDialog from "@/components/imageDialogBox";
import MultiImageUpload from "@/components/multiImageUploader";
import { getUserProfile } from "@/app-api/auth";
import LinkedinImage from "@/assets/linkedin.webp";
import { Badge } from "@/components/ui/badge";

// Factor labels mapping
const factorLabels: Record<string, string> = {
  yourTotalExperience: "Your Total Experience",
  yourCurrentJob: "Your Current Job",
  eventYouAttend: "Events You Attended",
  yourEducation: "Your Education",
  mediaPresence: "Media Presence",
  others: "Others",
};

// Section edit types
type EditSection =
  | "personal"
  | "about"
  | "experience"
  | "education"
  | "skills"
  | "connect"
  | "awards"
  | "features";

// Award and Featured types
export interface Award {
  id: string;
  description: string;
}

export interface Featured {
  id: string;
  description: string;
  link: string;
  image: string | null;
}

// Local types
type Education = {
  courseType: string;
  educationType: string;
  instituteName: string;
  passingYear: string;
  specialisation: string;
};

// Reusable SectionCard with enhanced styling
const SectionCard = ({
  title,
  children,
  onEdit,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-col items-start mt-6 w-full border border-accent rounded-2xl p-6 shadow-sm bg-muted hover:shadow-md transition-shadow duration-200">
    <div className="flex justify-between items-center w-full mb-4">
      <div className="flex items-center gap-3">
        {icon && <div className="text-primary">{icon}</div>}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="rounded-full"
        >
          <Edit2 className="size-4" />
        </Button>
      )}
    </div>
    <div className="w-full">{children}</div>
  </div>
);

// Updated Experience Card - displays years of experience
const ExperienceCard = ({ years }: { years: number }) => {
  return (
    <div className="rounded-xl border border-accent p-5 bg-muted shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-foreground">
          {years || "0"}
        </span>
      </div>
    </div>
  );
};

// Enhanced Education Card
const EducationCard = ({ edu }: { edu: Education; index: number }) => (
  <div className="rounded-xl border border-accent p-5 bg-muted shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex flex-col space-y-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
        <div>
          <h3 className="font-semibold capitalize text-lg text-foreground">
            {edu.instituteName || "Institute"}
          </h3>
          <p className="text-klout-primary capitalize font-medium">
            {edu.specialisation || "Specialization"}
          </p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p className="font-medium">{edu.passingYear || "Year"}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {edu.courseType && (
          <Badge className="capitalize">{edu.courseType}</Badge>
        )}
        {edu.educationType && (
          <Badge className="capitalize bg-green-700">
            {edu.educationType.replace("-", " ")}
          </Badge>
        )}
      </div>
    </div>
  </div>
);

const parseUserImages = (
  imagesData: string | string[] | undefined
): string[] => {
  if (!imagesData) return [];

  // If it's already an array, return it
  if (Array.isArray(imagesData)) return imagesData;

  // If it's a string, try to parse it
  try {
    const parsed = JSON.parse(imagesData);

    // Backend format: [{"Image": "path/to/image.jpg"}]
    if (Array.isArray(parsed)) {
      return parsed
        .map((item: any) => {
          // Handle both formats: {"Image": "..."} and plain strings
          if (typeof item === "object" && item.Image) {
            return item.Image;
          }
          return item;
        })
        .filter(Boolean);
    }

    return [];
  } catch (error) {
    console.error("Failed to parse images:", error);
    return [];
  }
};

// Helper function to parse experience data
const parseExperience = (experienceData: any): number => {
  if (!experienceData) return 0;

  // If it's already a number
  if (typeof experienceData === "number") return experienceData;

  // If it's a string, try to parse it
  if (typeof experienceData === "string") {
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(experienceData);

      // If parsed is a number, return it
      if (typeof parsed === "number") return parsed;

      // If it's an array with objects like [{year: 5}]
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].year) {
        return parsed[0].year;
      }

      // If it's just a number as string
      return Number(parsed) || 0;
    } catch {
      // If JSON parse fails, try direct number conversion
      return Number(experienceData) || 0;
    }
  }

  return 0;
};

// Helper function to parse skills properly
const parseSkills = (skillsData: any): string[] => {
  if (!skillsData) return [];

  // If it's already an array
  if (Array.isArray(skillsData)) {
    return skillsData.filter(
      (skill) => typeof skill === "string" && skill.trim() !== ""
    );
  }

  // If it's a string
  if (typeof skillsData === "string") {
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(skillsData);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (skill) => typeof skill === "string" && skill.trim() !== ""
        );
      }
      // If it's a comma-separated string after parsing
      if (typeof parsed === "string") {
        return parsed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } catch {
      // If JSON parse fails, treat as comma-separated string
      return skillsData
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  return [];
};

// Parse awards helper
const parseAwards = (awardsData: any): Award[] => {
  if (!awardsData) return [];
  if (Array.isArray(awardsData)) return awardsData;
  try {
    const parsed = JSON.parse(awardsData);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Parse featured helper
const parseFeatured = (featuredData: any): Featured[] => {
  if (!featuredData) return [];
  if (Array.isArray(featuredData)) return featuredData;
  try {
    const parsed = JSON.parse(featuredData);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const MyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAppSelector((state) => state.auth);
  const [editSection, setEditSection] = useState<EditSection | null>(null);
  const [openImageEdit, setOpenImageEdit] = useState(false);
  const { score, factorGroup } = useAppSelector((state) => state.tls);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showTlsDialog, setShowTlsDialog] = useState(false);
  const [openMultiImageEdit, setOpenMultiImageEdit] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (user?.mobileNumber) {
      dispatch(fetchTlsScore({ mobileNumber: user.mobileNumber }));
    }
  }, [user?.mobileNumber, dispatch]);

  const educationList = useMemo<Education[]>(
    () => safeParseArray<Education>(user?.education),
    [user?.education]
  );

  // Parse experience to get the number of years
  const experienceYears = useMemo<number>(
    () => parseExperience(user?.experience),
    [user?.experience]
  );

  const skillsList = useMemo<string[]>(() => {
    const parsedSkills = parseSkills(user?.preferred_skills);
    return parsedSkills;
  }, [user?.preferred_skills]);

  // Parse images correctly
  const coverImages = useMemo(() => {
    const parsedImages = parseUserImages(user?.images);
    if (parsedImages.length > 0) {
      return parsedImages;
    }

    // Fallback to profile image if no cover images
    if (user?.profileImage) {
      return [user.profileImage];
    }

    return [];
  }, [user?.images, user?.profileImage]);

  const awardsList = useMemo(() => parseAwards(user?.awards), [user?.awards]);
  const featuredList = useMemo(
    () => parseFeatured(user?.featured),
    [user?.featured]
  );

  const mainCoverImage = useMemo(() => {
    return coverImages.length > 0
      ? getUserProfileImage(user?.imageBaseUrl || "", coverImages[0])
      : DummyImage;
  }, [coverImages, user?.imageBaseUrl]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swipe left - next image
      nextImage();
    }
    if (touchStart - touchEnd < -75) {
      // Swipe right - previous image
      prevImage();
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === coverImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? coverImages.length - 1 : prev - 1
    );
  };

  // Reset to first image when coverImages change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [coverImages]);

  // Handle company name click
  const handleCompanyClick = async () => {
    if (!user?.company) {
      toast.info("No company information available");
      return;
    }

    const encodedName = encodeURIComponent(user.company.trim());
    await dispatch(fetchCompanies(user.company.trim())).unwrap();
    navigate(`/company/${encodedName}`);
  };

  // Handle TLS Badge click
  const handleTlsClick = () => {
    setShowTlsDialog(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-klout-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-muted rounded-2xl shadow-lg overflow-hidden">
          {/* Cover Image Carousel */}
          <div
            className="relative w-full h-56 sm:h-64 md:h-80 lg:h-96 overflow-hidden bg-gray-200"
            style={{
              backgroundImage: `url(${mainCoverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Full background image */}
            {coverImages.length > 0 ? (
              <img
                src={getUserProfileImage(
                  user?.imageBaseUrl || "",
                  coverImages[currentImageIndex]
                )}
                alt={`Cover ${currentImageIndex + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DummyImage;
                }}
              />
            ) : (
              <img
                src={DummyImage}
                alt="Default Cover"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            )}

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />

            {/* Top Right Buttons */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                type="button"
                className="bg-black/50 cursor-pointer backdrop-blur-lg p-2 rounded-full shadow-lg text-white transition-all"
                onClick={() => setOpenMultiImageEdit(true)}
                title="Edit cover images"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Arrows - Desktop Only */}
            {coverImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all z-10 hidden sm:block"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all z-10 hidden sm:block"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Dot Indicators - Bottom Start (Left) */}
            {coverImages.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                {coverImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentImageIndex
                        ? "w-8 h-2 bg-white"
                        : "w-2 h-2 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="relative px-4 sm:px-6 pb-6">
            {/* Profile Image and TLS Container */}
            <div className="relative flex flex-col items-center -mt-16 sm:-mt-20">
              {/* Profile Image with TLS Badge */}
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                  <img
                    src={
                      user?.profileImage
                        ? getUserProfileImage(
                            user.imageBaseUrl || "",
                            user.profileImage
                          )
                        : DummyImage
                    }
                    alt="Profile"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setDialogOpen(true)}
                  />
                </div>

                {/* Edit Profile Image Button */}
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 cursor-pointer bg-primary p-2 rounded-full shadow-lg text-white hover:bg-primary-dark transition-colors"
                  onClick={() => setOpenImageEdit(true)}
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* TLS Badge - Positioned near profile image */}
                {score && (
                  <div
                    className="absolute -right-19 bottom-2 w-20 h-14 cursor-pointer hover:scale-110 transition-transform"
                    onClick={handleTlsClick}
                  >
                    <img
                      src={TlsImage}
                      alt="TLS Score"
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute inset-y-0 right-3 top-1 flex items-center text-white font-bold text-sm">
                      {score}
                    </span>
                  </div>
                )}
              </div>

              {/* Name & Basic Info - Centered below profile image with Edit Button */}
              <div className="text-center mt-4 w-full relative">
                <button
                  onClick={() => setEditSection("personal")}
                  className="absolute -top-2 right-0 text-gray-500 cursor-pointer hover:text-klout-primary hover:bg-primary/50 p-2 rounded-full transition-colors"
                  title="Edit personal information"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <h1 className="text-2xl sm:text-3xl font-bold text-foreground capitalize mb-2">
                  {user?.first_name} {user?.last_name}
                </h1>
                <p className="text-foreground text-lg capitalize font-medium mb-2">
                  {user?.designation}
                </p>
                <p>
                  <span className="font-semibold">Company:</span>{" "}
                  <button
                    onClick={handleCompanyClick}
                    className="text-primary capitalize font-semibold cursor-pointer hover:underline inline-flex items-center gap-1 ml-1"
                  >
                    {user?.company}
                  </button>
                </p>
                <div className="flex items-center justify-center capitalize text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="capitalize">{user?.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-0">
          {/* Contact Information Section */}
          <SectionCard
            title="Contact Information"
            icon={<User className="w-5 h-5" />}
          >
            {user?.emailId ? (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {user.emailId}
              </p>
            ) : (
              <p className="text-muted-foreground italic">{""}</p>
            )}

            {user?.mobileNumber ? (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {user.mobileNumber}
              </p>
            ) : (
              <p className="text-muted-foreground italic">{""}</p>
            )}
          </SectionCard>

          {/* Connect Section */}
          <SectionCard
            title="Connect with me"
            onEdit={() => setEditSection("connect")}
          >
            {user?.linkedinProfileUrl ? (
              <a
                href={
                  user.linkedinProfileUrl.startsWith("http")
                    ? user.linkedinProfileUrl
                    : `https://www.linkedin.com/in/${user.linkedinProfileUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary transition-colors font-medium"
              >
                <img
                  src={LinkedinImage}
                  width={40}
                  height={40}
                  className="hover:scale-105"
                />
              </a>
            ) : (
              <p className="text-muted-foreground italic">{""}</p>
            )}
          </SectionCard>

          {/* About Section */}
          <SectionCard
            title="About Me"
            onEdit={() => setEditSection("about")}
            icon={<User className="w-5 h-5" />}
          >
            {user?.aboutMe ? (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {user.aboutMe}
              </p>
            ) : (
              <p className="text-muted-foreground italic">{""}</p>
            )}
          </SectionCard>

          {/* Experience Section */}
          <SectionCard
            title="Experience"
            onEdit={() => setEditSection("experience")}
            icon={<Briefcase className="w-5 h-5" />}
          >
            {experienceYears > 0 ? (
              <ExperienceCard years={experienceYears} />
            ) : (
              <p className="text-muted-foreground italic">{""}</p>
            )}
          </SectionCard>

          {/* Education Section */}
          <SectionCard
            title="Education"
            onEdit={() => setEditSection("education")}
            icon={<GraduationCap className="w-5 h-5" />}
          >
            {educationList.length > 0 ? (
              <div className="space-y-4">
                {educationList.map((edu, i) => (
                  <EducationCard key={i} edu={edu} index={i} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">{""}</p>
            )}
          </SectionCard>

          {/* Skills Section */}
          <SectionCard
            title="Skills"
            onEdit={() => setEditSection("skills")}
            icon={<Code className="w-5 h-5" />}
          >
            {skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium capitalize shadow-sm hover:shadow-md transition-shadow border border-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">{""}</p>
            )}
          </SectionCard>

          {/* Awards Section */}
          <SectionCard
            title="Awards"
            onEdit={() => setEditSection("awards")}
            icon={<Award className="w-5 h-5" />}
          >
            {awardsList.length > 0 ? (
              <div className="space-y-3">
                {awardsList.map((award, i) => (
                  <div
                    key={award.id || i}
                    className="border-l-4 border-primary pl-4 py-2"
                  >
                    <p className="text-foreground whitespace-pre-wrap">
                      {award.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">{""}</p>
            )}
          </SectionCard>

          {/* Featured Section */}
          <SectionCard
            title="Featured"
            onEdit={() => setEditSection("features")}
            icon={<Award className="w-5 h-5" />}
          >
            {featuredList.length > 0 ? (
              <div className="space-y-4">
                {featuredList.map((item, i) => (
                  <div
                    key={item.id || i}
                    className="border rounded-lg p-4 bg-accent"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt="Featured"
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <p className="text-foreground mb-2">{item.description}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm break-all"
                      >
                        {item.link}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">{""}</p>
            )}
          </SectionCard>
        </div>

        {/* Section-specific Edit Dialogs */}
        <Dialog
          open={editSection !== null}
          onOpenChange={() => setEditSection(null)}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="capitalize">
                Edit{" "}
                {editSection === "connect"
                  ? "Social Links"
                  : editSection === "personal"
                  ? "Personal Information"
                  : editSection}
              </DialogTitle>
            </DialogHeader>
            <EditProfile
              initialSection={editSection}
              onClose={() => setEditSection(null)}
            />
          </DialogContent>
        </Dialog>

        {/* Image Edit Dialog */}
        <Dialog open={openImageEdit} onOpenChange={setOpenImageEdit}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile Image</DialogTitle>
            </DialogHeader>
            <ProfileImageUploader
              context="profile"
              onClose={() => setOpenImageEdit(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Image Dialog */}
        <ImageDialog
          isOpen={dialogOpen}
          imageUrl={
            user?.profileImage
              ? getUserProfileImage(user.imageBaseUrl || "", user.profileImage)
              : DummyImage
          }
          onClose={() => setDialogOpen(false)}
        />

        {/* TLS Score Dialog */}
        <Dialog open={showTlsDialog} onOpenChange={setShowTlsDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={TlsImage}
                  alt="TLS"
                  className="w-32 h-32 object-contain"
                />
                <span className="absolute inset-y-0 right-6 top-2 flex items-center text-white font-semibold text-xl">
                  {score}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-6 mt-4">
                Thought Leadership Score
              </h2>

              {/* TLS Breakdown Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.entries(factorGroup || {}).map(([key, value]) => {
                  const percentage =
                    score && score > 0 ? Math.round((value / score) * 100) : 0;
                  const circumference = 251.2;
                  const offset = circumference * (1 - percentage / 100);

                  return (
                    <div key={key} className="p-4 border rounded-lg">
                      <div className="relative w-24 h-24 mx-auto mb-2">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#E5E7EB"
                            strokeWidth="8"
                            fill="none"
                          />
                          {percentage > 0 && (
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="#3B82F6"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={circumference}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                            />
                          )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {factorLabels[key] || key}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <div className="text-left">
                  <p className="text-sm font-semibold mb-2">
                    Top Thought Leaders In:
                  </p>
                  <Button
                    className="w-full bg-klout-primary hover:bg-klout-secondary text-white cursor-pointer"
                    onClick={() =>
                      navigate(`/company/${user?.company}/employees`)
                    }
                  >
                    Klout Club
                  </Button>
                </div>

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/compare-leadership-scores?user1=${user?._id}&user2=${id}`
                    )
                  }
                >
                  Compare your TLS
                </Button>
                <p className="text-xs text-gray-500">
                  Compare yourself with your connections
                </p>
              </div>

              {/* Improvement Tips */}
              <div className="text-left bg-accent p-4 rounded-lg">
                <h3 className="font-bold mb-3">
                  Improve your Thought Leadership Score:
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>• Update your complete profile</li>
                  <li>• Add a professional photo</li>
                  <li>
                    • When you attend events ask the organiser to update your
                    role whether a delegate, panelist/speaker, or award winner.
                  </li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Multi Background Images Dialog */}
        <Dialog
          open={openMultiImageEdit}
          onOpenChange={(open) => {
            if (!open) {
              // When closing, refresh user profile to get latest data
              if (user?._id && token) {
                dispatch(getUserProfile({ token, userid: user._id }));
              }
            }
            setOpenMultiImageEdit(open);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <MultiImageUpload
              onClose={() => {
                setOpenMultiImageEdit(false);
                // Force refresh after close
                if (user?._id && token) {
                  dispatch(getUserProfile({ token, userid: user._id }));
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyProfile;
