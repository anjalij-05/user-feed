import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Linkedin,
  Award,
} from "lucide-react";
import { safeParseArray } from "@/lib/utils";
import { updateUserProfile } from "@/app-api/user";
import { getUserProfile } from "@/app-api/auth";
import { appUrl } from "@/constants";
import axios from "axios";
import SkillsSelector from "@/components/skillsSection";
import {
  type Awards,
  EditAwards,
  EditFeatured,
  type Featured,
} from "@/components/awardAndFeatured";

// Define the EditSection type - UPDATED to include "personal"
type EditSection =
  | "personal"
  | "about"
  | "experience"
  | "education"
  | "skills"
  | "connect"
  | "awards"
  | "features";

interface Institute {
  _id: string;
  aisheCode: string;
  name: string;
  state: string;
  district: string;
  websiteUrl: string;
  YOE: string;
  location: string;
  collegeType: string;
  universityName: string;
  universityType: string;
  administrativeMinistry: string;
  management: string;
  mappedTo: string[];
}

interface Company {
  _id: string;
  company: string;
  // industry?: string;
  // employeeSize?: string;
  // logo?: string;
}

interface Designation {
  _id: string;
  designation: string;
}

type Education = {
  courseType: string;
  educationType: string;
  instituteName: Institute | string;
  passingYear: string;
  specialisation: string;
};

interface EditProfileProps {
  initialSection?: EditSection | null;
  onClose?: () => void;
}

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

const EditProfile: React.FC<EditProfileProps> = ({
  initialSection,
  onClose,
}) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  // const [skillInput, setSkillInput] = useState("");

  const [activeTab, setActiveTab] = useState<EditSection>(
    initialSection || "personal"
  );
  const [instituteSuggestions, setInstituteSuggestions] = useState<Institute[]>(
    []
  );
  const [companySuggestions, setCompanySuggestions] = useState<Company[]>([]);
  const [designationSuggestions, setDesignationSuggestions] = useState<
    Designation[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  const initialEducation = safeParseArray<Education>(user?.education);
  const initialSkills = parseSkills(user?.preferred_skills);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    designation: user?.designation || "",
    company: user?.company || "",
    city: user?.city || "",
    linkedinProfileUrl: user?.linkedinProfileUrl || "",
    xProfileUrl: user?.xProfileUrl || "",
    aboutMe: user?.aboutMe || "",
    experience: user?.experience || "0",
    education: initialEducation,
    preferred_skills: initialSkills,
    awards: safeParseArray<Awards>(user?.awards),
    featured: safeParseArray<Featured>(user?.featured),
  });

  // Generic input change handler
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Handle company autocomplete
    if (name === "company" && value.trim().length > 0) {
      try {
        const companies = await fetchCompanies(value.trim());
        setCompanySuggestions(companies);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setCompanySuggestions([]);
      }
    } else if (name === "company") {
      setCompanySuggestions([]);
    }

    // Handle designation autocomplete
    if (name === "designation" && value.trim().length > 0) {
      try {
        const designations = await fetchDesignations(value.trim());
        setDesignationSuggestions(designations);
      } catch (err) {
        console.error("Error fetching designations:", err);
        setDesignationSuggestions([]);
      }
    } else if (name === "designation") {
      setDesignationSuggestions([]);
    }
  };

  // Fetch companies API
  const fetchCompanies = async (search: string): Promise<Company[]> => {
    try {
      const res = await axios.get(
        `${appUrl}/api/mapping/v1/company-master/all-company`,
        {
          params: {
            page: 1,
            search,
            industry: "",
            employeeSize: "",
            logo: "undefined",
          },
        }
      );
      return res.data?.data?.companies || [];
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      return [];
    }
  };

  // Fetch designations API
  const fetchDesignations = async (search: string): Promise<Designation[]> => {
    try {
      const res = await axios.get(
        `${appUrl}/api/mapping/v1/designation-master/all-designation`,
        {
          params: { page: 1, search },
        }
      );
      return res.data?.data?.designations || [];
    } catch (err) {
      console.error("Failed to fetch designations:", err);
      return [];
    }
  };

  const getInstitutes = async (search?: string): Promise<Institute[]> => {
    const response = await axios.get(
      `${appUrl}/api/mapping/v1/education-master/all-institute?name=${
        search ? search : ""
      }`
    );
    return response.data.data.institutes as Institute[];
  };

  // Education handlers
  const handleEducationChange = async (
    idx: number,
    field: keyof Education,
    value: string
  ) => {
    const updated = [...formData.education];
    updated[idx][field] = value;
    setFormData((prev) => ({ ...prev, education: updated }));

    // If user is typing in institute name, fetch suggestions
    if (field === "instituteName" && value.trim().length > 1) {
      try {
        const res = await getInstitutes(value.trim());
        setInstituteSuggestions(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Error fetching institutes:", err);
        setInstituteSuggestions([]);
      }
    } else if (field === "instituteName") {
      setInstituteSuggestions([]);
    }
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          instituteName: "",
          courseType: "",
          specialisation: "",
          passingYear: "",
          educationType: "",
        },
      ],
    }));
  };

  const deleteEducation = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx),
    }));
  };

  // Experience handler
  const handleExperienceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, experience: value }));
  };

  // const addSkill = (skill: string) => {
  //   const trimmedSkill = skill.trim();
  //   if (trimmedSkill && !formData.preferred_skills.includes(trimmedSkill)) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       preferred_skills: [...prev.preferred_skills, trimmedSkill],
  //     }));
  //   }
  //   setSkillInput("");
  // };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_skills: prev.preferred_skills.filter((s) => s !== skill),
    }));
  };

  // Add render functions:
  const renderAwards = () => (
    <EditAwards
      initialAwards={formData.awards}
      onSave={(awards) => {
        setFormData((prev) => ({ ...prev, awards }));
      }}
      onClose={onClose || undefined}
    />
  );

  const renderFeatured = () => (
    <EditFeatured
      initialFeatured={formData.featured}
      onSave={(featured) => {
        setFormData((prev) => ({ ...prev, featured }));
      }}
      onClose={onClose || undefined}
    />
  );

  // Save
  const handleSave = async () => {
    if (isSaving) return; // Prevent double-clicking

    setIsSaving(true);

    try {
      console.log("Saving data:", {
        experience: formData.experience,
        skills: formData.preferred_skills,
        education: formData.education,
      });

      // Prepare update payload
      const updatePayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        designation: formData.designation,
        company: formData.company,
        city: formData.city,
        linkedinProfileUrl: formData.linkedinProfileUrl,
        xProfileUrl: formData.xProfileUrl,
        aboutMe: formData.aboutMe,
        education: JSON.stringify(formData.education || []),
        experience: formData.experience,
        preferred_skills: JSON.stringify(formData.preferred_skills || []),
        awards: JSON.stringify(formData.awards || []),
        featured: JSON.stringify(formData.featured || []),
      };

      // Update profile
      await dispatch(updateUserProfile(updatePayload)).unwrap();

      // Refresh user profile
      if (token && user?._id) {
        await dispatch(getUserProfile({ token, userid: user._id })).unwrap();
      }

      toast.success("Profile updated successfully!");

      // Close modal after successful save
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Tab configuration
  const tabs = [
    {
      id: "personal" as const,
      label: "Personal Info",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "about" as const,
      label: "About Me",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "experience" as const,
      label: "Experience",
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: "education" as const,
      label: "Education",
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: "skills" as const,
      label: "Skills",
      icon: <Code className="w-4 h-4" />,
    },
    {
      id: "connect" as const,
      label: "Social Links",
      icon: <Linkedin className="w-4 h-4" />,
    },
    {
      id: "awards" as const,
      label: "Awards",
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: "features" as const,
      label: "Featured",
      icon: <Award className="w-4 h-4" />,
    },
  ];

  // Render Personal Info Section
  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block capitalize text-sm font-medium mb-1">
            First Name
          </label>
          <Input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <Input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Enter your last name"
          />
        </div>
        <div className="relative rounded-lg">
          <label className="block capitalize text-sm font-medium mb-1">
            Designation
          </label>
          <Input
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="e.g. Frontend Developer"
            autoComplete="off"
            onBlur={() => setTimeout(() => setDesignationSuggestions([]), 200)}
            className="capitalize"
          />
          {/* Designation dropdown */}
          {designationSuggestions.length > 0 && formData.designation && (
            <div className="fixed w-55 z-['999']! mt-1 bg-white border border-gray-200 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <ul className="h-20 overflow-scroll">
                {designationSuggestions.map((item, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        designation: item.designation,
                      }));
                      setDesignationSuggestions([]);
                    }}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="font-medium capitalize">
                      {item.designation}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Company</label>
          <Input
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Enter your company name"
            autoComplete="off"
            onBlur={() => setTimeout(() => setCompanySuggestions([]), 200)}
            className="capitalize"
          />
          {/* Company dropdown */}
          {companySuggestions.length > 0 && formData.company && (
            <div className="fixed w-55 z-['999']! mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
              <ul className="h-20 overflow-scroll">
                {companySuggestions.map((item, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        company: item.company,
                      }));
                      setCompanySuggestions([]);
                    }}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="font-medium capitalize">{item.company}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <label className="block capitalize text-sm font-medium mb-1">
            City
          </label>
          <Input
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
          />
        </div>
      </div>
    </div>
  );

  // Render About Me Section
  const renderAboutMe = () => (
    <div>
      <label className="block text-sm font-medium mb-2">About Me</label>
      <Textarea
        name="aboutMe"
        value={formData.aboutMe}
        onChange={handleChange}
        placeholder="Tell us about yourself, your interests, and what drives you..."
        rows={6}
        className="resize-none"
      />
    </div>
  );

  // Render Connect Section
  const renderConnect = () => (
    <div className="space-y-4">
      <div>
        <label className="block capitalize text-sm font-medium mb-2">
          LinkedIn Profile URL
        </label>
        <Input
          name="linkedinProfileUrl"
          value={formData.linkedinProfileUrl}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/your-profile or just your-profile"
        />
      </div>

      <div>
        <label className="block capitalize text-sm font-medium mb-2">
          Twitter Profile URL
        </label>
        <Input
          name="xProfileUrl"
          value={formData.xProfileUrl}
          onChange={handleChange}
          placeholder="https://twitter.com/your-profile or just your-profile"
        />
      </div>
    </div>
  );

  // Render Skills Section
  // Around line 577-580, change the renderSkills function:
  const renderSkills = () => (
    <div className="space-y-4">
      <div>
        <label className="block capitalize text-sm font-medium mb-2">
          Skills
        </label>

        {/* Show selected skills */}
        {formData.preferred_skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.preferred_skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-blue-100 capitalize text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-red-500 cursor-pointer hover:text-red-700 text-lg leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* SkillsSelector embedded directly - NO BUTTON, NO NESTED DIALOG */}
        <SkillsSelector
          selectedSkills={formData.preferred_skills}
          onSkillsChange={(skills) => {
            setFormData((prev) => ({ ...prev, preferred_skills: skills }));
          }}
        />
      </div>
    </div>
  );

  // Render Experience Section
  const renderExperience = () => (
    <div className="space-y-6">
      <div className="border p-4 rounded-xl shadow-sm bg-muted space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Years of Experience
          </label>
          <Input
            type="number"
            value={formData.experience}
            onChange={(e) => handleExperienceChange(e.target.value)}
            placeholder="Enter number of years"
            min="0"
            step="0.5"
          />
        </div>
      </div>
    </div>
  );

  // Render Education Section
  const renderEducation = () => (
    <div className="space-y-6">
      {formData.education.length > 0 && (
        <div className="space-y-6">
          {formData.education.map((edu, idx) => (
            <div
              key={idx}
              className="border p-4 rounded-xl shadow-sm bg-muted space-y-4 relative"
            >
              <button
                onClick={() => deleteEducation(idx)}
                className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">
                    Institute Name
                  </label>
                  <Input
                    value={
                      typeof edu.instituteName === "string"
                        ? edu.instituteName
                        : edu.instituteName?.name || ""
                    }
                    onChange={(e) =>
                      handleEducationChange(
                        idx,
                        "instituteName",
                        e.target.value
                      )
                    }
                    placeholder="Search institute name..."
                    autoComplete="off"
                    onBlur={() =>
                      setTimeout(() => setInstituteSuggestions([]), 200)
                    }
                  />

                  {/* Stylish dropdown */}
                  {instituteSuggestions.length > 0 && edu.instituteName && (
                    <div className="absolute z-20 w-full mt-1 bg-accent border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <ul className="max-h-56 overflow-y-auto custom-scrollbar">
                        {instituteSuggestions.map((item, i) => (
                          <li
                            key={i}
                            onClick={() => {
                              handleEducationChange(
                                idx,
                                "instituteName",
                                item.name
                              );
                              setInstituteSuggestions([]);
                            }}
                            className="px-4 py-2 text-sm text-accent-foreground hover:bg-blue-50/13 cursor-pointer transition-all"
                          >
                            <div className="font-medium capitalize text-accent-foreground">
                              {item.name}
                            </div>
                            {item.state && (
                              <div className="text-xs text-accent-foreground mt-1">
                                {item.state}{" "}
                                {item.district ? `• ${item.district}` : ""}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Course Type
                  </label>
                  <Input
                    value={edu.courseType}
                    onChange={(e) =>
                      handleEducationChange(idx, "courseType", e.target.value)
                    }
                    placeholder="e.g. B.Tech, MBA, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Specialisation
                  </label>
                  <Input
                    value={edu.specialisation}
                    onChange={(e) =>
                      handleEducationChange(
                        idx,
                        "specialisation",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Passing Year
                  </label>
                  <Input
                    value={edu.passingYear}
                    onChange={(e) =>
                      handleEducationChange(idx, "passingYear", e.target.value)
                    }
                    placeholder="e.g. 2023"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Education Type
                  </label>
                  <select
                    className="w-full border bg-accent rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={edu.educationType}
                    onChange={(e) =>
                      handleEducationChange(
                        idx,
                        "educationType",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select Type</option>
                    <option value="online">Online</option>
                    <option value="full-time">Full Time</option>
                    <option value="distance-learning">Distance Learning</option>
                    <option value="part-time">Part Time</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={addEducation}
        className="cursor-pointer"
      >
        + Add Education
      </Button>
    </div>
  );

  // Get current section content
  const getCurrentSectionContent = () => {
    switch (activeTab) {
      case "personal":
        return renderPersonalInfo();
      case "about":
        return renderAboutMe();
      case "connect":
        return renderConnect();
      case "skills":
        return renderSkills();
      case "experience":
        return renderExperience();
      case "education":
        return renderEducation();
      case "awards":
        return renderAwards();
      case "features":
        return renderFeatured();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation - only show if no initial section specified */}
      {!initialSection && (
        <div className="flex flex-wrap gap-1 mb-6 p-1 bg-muted rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-klout-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-6">{getCurrentSectionContent()}</div>
      </div>

      {/* Save Button */}
      <div className="mt-6 pt-4 border-t flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-klout-primary cursor-pointer hover:bg-klout-primary-dark text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default EditProfile;
