import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  googleMapsApiKey,
  domain,
  appDomain,
  UserAvatar,
  appUrl,
} from "@/constants";
import Wave from "@/components/Wave";
import GoogleMap from "@/components/GoogleMap";
import { AgendaType, AttendeeType, EventType } from "@/types";
import ReactHlsPlayer from "react-hls-player";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle,
  CircleX,
  IndianRupee,
  MapPin,
  UserRoundCheck,
  ChevronDown,
  Check,
  CircleXIcon,
  Globe,
  Star,
} from "lucide-react";
import { formatDateTime, getImageUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useExtrasStore from "@/store/extrasStore";
import { Helmet } from "react-helmet-async";
import DocumentRenderer from "@/components/DocumentRenderer";
import { Badge } from "@/components/ui/badge";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchAttendedEvents } from "@/app-api/attendedEvents";
import LogoImage from "@/assets/logo.svg";
import PollDisplayCard from "./PollDisplayCard";
import { Textarea } from "@/components/ui/textarea";
// import DummyImage from "@/assets/dummy_image.webp";
import EventImages from "./EventImages";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AuthDialog from "./AuthDialog";
import useEventStore from "@/store/eventStore";

interface CompanySponsor {
  id: number;
  event_id: number;
  company_name: string;
  company_logo: string;
}

interface Sponsor extends CompanySponsor {
  uuid: string;
  user_id: number;
  about_company: string;
  video_link: string | null;
  upload_deck: string[];
  created_at: string;
  updated_at: string;
  attendees: AttendeeType[];
}

interface AttendeeResponse {
  status: number;
  message: string;
  total_attendees: number;
  pending_attendees: number;
  rejected_attendees: number;
  data: Array<{
    id: number;
    uuid: string;
    user_id: number;
    event_id: number;
    check_in: number;
    first_name: string;
    last_name: string;
    email_id: string;
    phone_number: string;
    event_invitation: number;
    user_invitation_request: number;
    [key: string]: any;
  }>;
}

// Function to download PDF
const handleDownloadPDF = async (pdfPaths: string[]) => {
  try {
    // If there's only one PDF, download it directly
    if (pdfPaths.length === 1) {
      const pdfUrl = `${domain}/${pdfPaths[0]}`;
      const fileName = pdfPaths[0].split("/").pop() || "sponsor-document.pdf";

      // Fetch the PDF
      const response = await fetch(pdfUrl);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast("PDF downloaded successfully", {
        className:
          "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CheckCircle className="size-5" />,
      });
    } else {
      // If multiple PDFs, download them sequentially with a delay
      toast("Downloading multiple PDFs...", {
        className:
          "!bg-primary !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CheckCircle className="size-5" />,
      });

      for (let i = 0; i < pdfPaths.length; i++) {
        const pdfUrl = `${domain}/${pdfPaths[i]}`;
        const fileName =
          pdfPaths[i].split("/").pop() || `sponsor-document-${i + 1}.pdf`;

        const response = await fetch(pdfUrl);
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Add delay between downloads to avoid browser blocking
        if (i < pdfPaths.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      toast("All PDFs downloaded successfully", {
        className:
          "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CheckCircle className="size-5" />,
      });
    }
  } catch (error) {
    console.error("Error downloading PDF:", error);
    toast("Failed to download PDF", {
      className:
        "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
      icon: <CircleXIcon className="size-5" />,
    });
  }
};

// Custom Combo Box Component for company names with filtering and creation
const CustomComboBox = React.memo(
  ({
    label,
    value,
    onValueChange,
    placeholder,
    options,
    required = false,
  }: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: { id: number; name: string }[];
    required?: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState(value);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      setSearchTerm(newValue);
      setIsOpen(true);
      setSelectedIndex(-1);
      onValueChange(newValue);
    };

    // Handle key down for navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prevIndex) =>
            prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex,
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : prevIndex,
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[selectedIndex]);
          }
        }
      }
    };

    // Handle option selection
    const handleOptionSelect = (option: { id: number; name: string }) => {
      setInputValue(option.name);
      setSearchTerm("");
      setIsOpen(false);
      setSelectedIndex(-1);
      onValueChange(option.name);
      inputRef.current?.blur();
    };

    // Handle creating new option
    const handleCreateNew = () => {
      setInputValue(searchTerm);
      setIsOpen(false);
      setSelectedIndex(-1);
      onValueChange(searchTerm);
      inputRef.current?.blur();
    };

    // Handle click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
          setSelectedIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update input value when value prop changes
    useEffect(() => {
      setInputValue(value);
    }, [value]);

    // Scroll to selected option
    useEffect(() => {
      if (selectedIndex >= 0 && dropdownRef.current) {
        const selectedOption =
          dropdownRef.current.querySelectorAll(".option")[selectedIndex];
        if (selectedOption) {
          selectedOption.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }
    }, [selectedIndex]);

    return (
      <div className="flex gap-2 flex-col w-full" ref={dropdownRef}>
        <Label className="font-semibold">
          {label} {required && <span className="text-secondary">*</span>}
        </Label>
        <div className="relative">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full capitalize h-12! text-base pr-10"
            />
            <ChevronDown
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 size-4 opacity-50 transition-transform cursor-pointer ${
                isOpen ? "rotate-180" : ""
              }`}
              onClick={() => {
                setIsOpen(!isOpen);
                inputRef.current?.focus();
              }}
            />
          </div>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-background/70 border backdrop-blur-xl rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-accent flex items-center justify-between text-sm ${
                      selectedIndex === index ? "bg-accent" : ""
                    } option`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <span className="capitalize">{option.name}</span>
                    {inputValue === option.name && (
                      <Check className="size-4 min-w-4 min-h-4 text-secondary" />
                    )}
                  </div>
                ))
              ) : searchTerm ? (
                <div
                  className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm font-medium"
                  onClick={handleCreateNew}
                >
                  {searchTerm}
                </div>
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No companies found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

const ExploreViewEvent: React.FC = () => {
  let { slug } = useParams<{ slug: string }>();
  const urlSlug = slug?.split("_");
  const slugParts = slug?.split("_");
  slug = slugParts?.[0];
  const [isLoading, setIsLoading] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<
    (EventType & { company_name: string }) | null
  >(null);
  const startTime = currentEvent?.event_date || "";
  const [agendaData, setAgendaData] = useState<AgendaType[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: -3.745,
    lng: -38.523,
  });
  const dispatch = useAppDispatch();
  const allAttendedEvents = useAppSelector(
    (state) => state.attendedEvents.events,
  );

  const [liveURL, setliveURL] = useState<string>("");
  const [completeEventData, setCompleteEventData] = useState<any>(null);
  const temp = useEventStore((state) => state.getEventBySlug(slug));

  const [allSpeakers, setAllSpeakers] = useState<any[]>([]);
  const [allJury, setAllJury] = useState<any[]>([]);
  const [allSponsors, setAllSponsors] = useState<AttendeeType[]>([]);
  const [allCompanySponsors, setAllCompanySponsors] = useState<
    CompanySponsor[]
  >([]);
  const [viewAgendaBy, setViewAgendaBy] = useState<number>(0);
  const [singleCompanySponsor, setSingleCompanySponsor] =
    useState<Sponsor | null>(null);
  const [singleSponsorLoading, setSingleSponsorLoading] =
    useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  // Live stream states
  const appUser = useAppSelector((state) => state.auth.user);

  const [isUserCheckedIn, setIsUserCheckedIn] = useState<boolean>(false);
  const [userUuid, setUserUuid] = useState<string>("");
  const [showLiveStream, setShowLiveStream] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentAgendaId, setCurrentAgendaId] = useState<number | null>(null);

  // Speaker ratings and feedback - key format: "agendaId_speakerId"
  const [speakerRatings, setSpeakerRatings] = useState<{
    [key: string]: number;
  }>({});
  const [speakerFeedback, setSpeakerFeedback] = useState<{
    [key: string]: string;
  }>({});

  // Auth dialog state
  const [authDialogOpen, setAuthDialogOpen] = useState<boolean>(false);

  const [form, setForm] = useState({
    amount: 0,
    product: {
      title: "",
      price: 0,
    },
    firstname: "",
    email: "",
    mobile: "",
  });

  const [open, setOpen] = useState(false);
  const { companies, getCompanies, designations, getDesignations } =
    useExtrasStore((state) => state);

  const [userAccount, setUserAccount] = useState({
    first_name: "",
    last_name: "",
    email_id: "",
    phone_number: "",
    country_code: "",
    company_name: "",
    job_title: "",
    acceptance: "1",
  });

  const validateForm = () => {
    let isValid = true;
    const errors = {
      first_name: "",
      last_name: "",
      phone_number: "",
      email_id: "",
      country_code: "",
      company_name: "",
      job_title: "",
    };

    if (!userAccount.first_name.trim()) {
      errors.first_name = "First name is required";
      isValid = false;
      toast("First name is required", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleXIcon className="size-5" />,
      });
      return;
    }

    if (!userAccount.last_name.trim()) {
      errors.last_name = "Last name is required";
      isValid = false;
      toast("Last name is required", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleXIcon className="size-5" />,
      });
      return;
    }

    if (!userAccount.country_code.trim()) {
      errors.country_code = "Country code is required";
      isValid = false;
      toast("Country Code is required", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleXIcon className="size-5" />,
      });
      return;
    }

    if (!userAccount.phone_number.trim()) {
      errors.phone_number = "Mobile number is required";
      isValid = false;
      toast("Mobile number is required", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleXIcon className="size-5" />,
      });
    } else if (!/^\d{10}$/.test(userAccount.phone_number)) {
      errors.phone_number = "Please enter a valid 10-digit mobile number";
      isValid = false;
      toast("Please enter a valid 10-digit mobile number", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleXIcon className="size-5" />,
      });
      return;
    }

    if (!userAccount.email_id.trim()) {
      errors.email_id = "Email is required";
      isValid = false;
      toast("Email is required", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleXIcon className="size-5" />,
      });
    } else if (!/\S+@\S+\.\S+/.test(userAccount.email_id)) {
      errors.email_id = "Please enter a valid email address";
      isValid = false;
      toast("Please enter a valid email address", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleXIcon className="size-5" />,
      });
      return;
    }

    if (!userAccount.company_name.trim()) {
      errors.company_name = "Please select a company";
      isValid = false;
      toast("Please select a company", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleXIcon className="size-5" />,
      });
      return;
    }

    if (!userAccount.job_title.trim()) {
      errors.job_title = "Please select a job title";
      isValid = false;
      toast("Please select a job title", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleXIcon className="size-5" />,
      });
      return;
    }

    return isValid;
  };

  // Check if event is live
  const isEventLive = () => {
    if (!currentEvent?.event_start_date || !currentEvent?.event_end_date)
      return false;

    const now = new Date();
    const startDate = new Date(currentEvent.event_start_date);
    const endDate = new Date(currentEvent.event_end_date);

    // Construct start time with hours and minutes
    if (
      currentEvent.start_time &&
      currentEvent.start_minute_time &&
      currentEvent.start_time_type
    ) {
      let hours = parseInt(currentEvent.start_time);
      if (currentEvent.start_time_type.toLowerCase() === "pm" && hours !== 12) {
        hours += 12;
      } else if (
        currentEvent.start_time_type.toLowerCase() === "am" &&
        hours === 12
      ) {
        hours = 0;
      }
      startDate.setHours(hours, parseInt(currentEvent.start_minute_time), 0, 0);
    }

    // Construct end time with hours and minutes
    if (
      currentEvent.end_time &&
      currentEvent.end_minute_time &&
      currentEvent.end_time_type
    ) {
      let hours = parseInt(currentEvent.end_time);
      if (currentEvent.end_time_type.toLowerCase() === "pm" && hours !== 12) {
        hours += 12;
      } else if (
        currentEvent.end_time_type.toLowerCase() === "am" &&
        hours === 12
      ) {
        hours = 0;
      }
      endDate.setHours(hours, parseInt(currentEvent.end_minute_time), 0, 0);
    }

    return now >= startDate && now <= endDate;
  };

  // Check if an agenda is currently active based on time
  const isAgendaActive = (agenda: AgendaType) => {
    if (!currentEvent?.event_start_date) return false;

    const now = new Date();
    const agendaDate = new Date(agenda.event_date);

    // Create start time for agenda
    const agendaStartTime = new Date(agendaDate);
    let startHours = parseInt(agenda.start_time);
    if (agenda.start_time_type.toLowerCase() === "pm" && startHours !== 12) {
      startHours += 12;
    } else if (
      agenda.start_time_type.toLowerCase() === "am" &&
      startHours === 12
    ) {
      startHours = 0;
    }
    agendaStartTime.setHours(
      startHours,
      parseInt(agenda.start_minute_time),
      0,
      0,
    );

    // Create end time for agenda
    const agendaEndTime = new Date(agendaDate);
    let endHours = parseInt(agenda.end_time);
    if (agenda.end_time_type.toLowerCase() === "pm" && endHours !== 12) {
      endHours += 12;
    } else if (agenda.end_time_type.toLowerCase() === "am" && endHours === 12) {
      endHours = 0;
    }
    agendaEndTime.setHours(endHours, parseInt(agenda.end_minute_time), 0, 0);

    return now >= agendaStartTime && now <= agendaEndTime;
  };

  // Group agendas by day for multi-day events
  const groupAgendasByDay = (agendas: AgendaType[]) => {
    if (!currentEvent?.event_start_date || agendas.length === 0) {
      return [];
    }

    const eventStartDate = new Date(currentEvent.event_start_date);
    eventStartDate.setHours(0, 0, 0, 0);

    // Group agendas by their event_date
    const grouped: { [key: string]: AgendaType[] } = {};

    agendas.forEach((agenda) => {
      const agendaDate = agenda.event_date;
      if (!grouped[agendaDate]) {
        grouped[agendaDate] = [];
      }
      grouped[agendaDate].push(agenda);
    });

    // Convert to array and sort by date, calculate day numbers
    const result = Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((dateKey) => {
        const agendaDate = new Date(dateKey);
        agendaDate.setHours(0, 0, 0, 0);

        // Calculate day number (1-based)
        const daysDiff = Math.floor(
          (agendaDate.getTime() - eventStartDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const dayNumber = daysDiff + 1;

        return {
          date: dateKey,
          dayNumber: dayNumber,
          agendas: grouped[dateKey],
        };
      });

    return result;
  };

  // Check if user is logged in and get attendee data
  const checkUserAttendeeStatus = async () => {
    if (!currentEvent?.uuid) {
      console.log("No event UUID available");
      return;
    }

    try {
      //   console.log("Checking attendee status for event:", currentEvent.uuid);

      // Make API call without auth check first to see all attendees
      const response = await axios.post<AttendeeResponse>(
        `${domain}/api/totalattendees-list/${currentEvent.uuid}`,
        {}, // Empty body if needed
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.status === 200 && response.data.data.length > 0) {
        if (appUser) {
          // Find current user in attendees list - try multiple matching strategies
          const currentUserAttendee = response.data.data.find((attendee) => {
            // const emailMatch =
            //   attendee.email_id?.toLowerCase() ===
            //     appUser.email_id?.toLowerCase() ||
            //   attendee.email_id?.toLowerCase() === appUser.email?.toLowerCase();
            const phoneMatch =
              String(attendee.phone_number) === String(appUser.mobileNumber);

            return phoneMatch;
          });

          if (currentUserAttendee) {
            setUserUuid(currentUserAttendee.uuid);
            setIsUserCheckedIn(currentUserAttendee.check_in === 1);

            // Check if event is live and user is checked in
            if (currentUserAttendee.check_in === 1 && isEventLive()) {
              console.log("Showing live stream");
              setShowLiveStream(true);
            } else {
              console.log(
                "Not showing live stream - Check in:",
                currentUserAttendee.check_in,
                "Is Live:",
                isEventLive(),
              );
            }
          } else {
            console.log("Current user not found in attendee list");
          }
        } else {
          console.log("No user data in localStorage");
        }
      } else {
        console.log("No attendees found or invalid response");
      }
    } catch (error) {
      console.error("Error checking attendee status:", error);
      if (axios.isAxiosError(error)) {
        console.error("API Error Response:", error.response?.data);
        console.error("API Error Status:", error.response?.status);
      }
    }
  };

  // Fetch existing speaker ratings for all agendas
  const fetchExistingSpeakerRatings = async (agendas: AgendaType[]) => {
    if (!appUser?._id || !currentEvent?.uuid) {
      return;
    }

    try {
      // Fetch ratings for each agenda that has speakers
      const ratingsPromises = agendas
        .filter((agenda) => agenda.speakers && agenda.speakers.length > 0)
        .map(async (agenda) => {
          try {
            const response = await axios.post(
              `${appDomain}/api/v1/tls/view-agenda-rating`,
              {
                eventUuid: currentEvent.uuid,
                agendaUuid: agenda.uuid,
                givenBy: appUser._id,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );

            if (response.data.status && response.data.data.length > 0) {
              return {
                agendaId: agenda.id,
                ratings: response.data.data,
              };
            }
            return null;
          } catch (error) {
            console.error(
              `Error fetching ratings for agenda ${agenda.uuid}:`,
              error,
            );
            return null;
          }
        });

      const results = await Promise.all(ratingsPromises);

      // Process the results and populate the state
      const newSpeakerRatings: { [key: string]: number } = {};
      const newSpeakerFeedback: { [key: string]: string } = {};

      results.forEach((result) => {
        if (result && result.ratings) {
          result.ratings.forEach((rating: any) => {
            // Find the speaker by phone number in the agenda
            const agenda = agendas.find((a) => a.id === result.agendaId);
            if (agenda && agenda.speakers) {
              const speaker = agenda.speakers.find(
                (s) => String(s.phone_number) === String(rating.givenTo),
              );
              if (speaker) {
                const ratingKey = `${result.agendaId}_${speaker.id}`;
                newSpeakerRatings[ratingKey] = rating.rating;
                newSpeakerFeedback[ratingKey] = rating.feedback || "";
              }
            }
          });
        }
      });

      // Update the state with prefetched ratings
      setSpeakerRatings(newSpeakerRatings);
      setSpeakerFeedback(newSpeakerFeedback);
    } catch (error) {
      console.error("Error fetching speaker ratings:", error);
    }
  };

  const isEventAttended = () => {
    const attended = allAttendedEvents.some(
      (event) => event.eventUUID === currentEvent?.uuid,
    );
    if (attended) {
      console.log("Event attended - found match in allAttendedEvents");
    }
    return attended;
  };

  // Initialize HLS for live stream
  useEffect(() => {
    if (
      showLiveStream &&
      currentEvent?.uuid &&
      completeEventData &&
      videoRef.current
    ) {
      const videoUrl = `${appUrl}/stream/${completeEventData?.user_uuid}__${currentEvent.uuid}/live.m3u8`;
      setliveURL(videoUrl);
      //   setliveURL(
      //     "https://quantamcoder.space/stream/63de4c24-3bb8-4bcf-88f2-025f6cdee956__dad9a089-4628-4459-8736-5027a1168a78/live.m3u8"
      //   );

      // Check if HLS is supported
      //   if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      //     // Native HLS support (Safari)
      //     videoRef.current.src = liveURL;
      //   } else {
      //     // Use HLS.js for other browsers
      //     import("hls.js")
      //       .then((module) => {
      //         const Hls = module.default;
      //         if (Hls.isSupported()) {
      //           const hls = new Hls();
      //           hls.loadSource(liveURL);
      //           hls.attachMedia(videoRef.current!);
      //           hls.on(Hls.Events.MANIFEST_PARSED, () => {
      //             videoRef.current?.play();
      //           });
      //         }
      //       })
      //       .catch((error) => {
      //         console.error("Error loading HLS.js:", error);
      //       });
      //   }
    }
  }, [showLiveStream, currentEvent?.uuid, userUuid, completeEventData]);

  // Fetch attended events when user is logged in
  useEffect(() => {
    if (appUser?.mobileNumber) {
      dispatch(fetchAttendedEvents({ mobileNumber: appUser.mobileNumber }));
    }
  }, [dispatch, appUser?.mobileNumber]);

  useEffect(() => {
    if (slug) {
      try {
        setIsLoading(true);
        axios
          .get(`${domain}/api/all_events`)
          .then((res: any) => {
            setCurrentEvent(
              res.data.data.find((event: any) => event.slug === slug),
            );
          })
          .catch((err: any) => {
            console.log(err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [slug]);

  useEffect(() => {
    getCompanies(userAccount.company_name);
    getDesignations(userAccount.job_title);
  }, [userAccount.company_name, userAccount.job_title]);

  useEffect(() => {
    if (currentEvent) {
      axios.get(`${domain}/api/all-agendas/${currentEvent.id}`).then((res) => {
        if (res.data) {
          const sortedData = res.data.data.sort(
            (a: AgendaType, b: AgendaType) => a.position - b.position,
          );
          setAgendaData(sortedData);

          extractCoordinates(currentEvent?.event_venue_address_1).then(
            (coords) => {
              if (coords) {
                setCenter(coords);
              }
            },
          );

          // Fetch existing speaker ratings after agendas are loaded
          if (appUser?._id && currentEvent?.uuid) {
            fetchExistingSpeakerRatings(sortedData);
          }
        }
      });

      // Check user attendee status
      checkUserAttendeeStatus();
    }
  }, [currentEvent]);

  // Express interest API call
  useEffect(() => {
    if (urlSlug && slug) {
      const customs = urlSlug.slice(1);
      axios
        .get(`${domain}/api/express-interest/${customs.join("_")}`)
        .then(() => {});
    }
  }, [slug]);

  useEffect(() => {
    if (currentEvent) {
      axios
        .post(`${domain}/api/event_details_attendee_list/`, {
          event_uuid: currentEvent.uuid,
          phone_number: 9643314331,
        })
        .then((res) => {
          setAllSpeakers(res.data.data.speakers);
          setAllJury(res.data.data.jury);
          setCompleteEventData(res.data.data);
          setViewAgendaBy(res.data.data.view_agenda_by);
          setAllSponsors(res?.data?.data?.sponsor);

          // Only update if the value is different to prevent infinite loop
          if (
            currentEvent.session_feedback_open_text_box !==
            res.data.data.session_feedback_open_text_box
          ) {
            setCurrentEvent((prev) => ({
              ...prev!,
              session_feedback_open_text_box:
                res.data.data.session_feedback_open_text_box,
            }));
          }
        })
        .catch((err) => {
          console.log("The error is", err);
        });

      axios
        .post(`${domain}/api/get-sponsors/${currentEvent.id}`)
        .then((res) => {
          if (res.data.success) {
            setAllCompanySponsors(res.data.data);
          }
        })
        .catch((err) => {
          console.log("The error is", err);
        });
    }
  }, [currentEvent?.uuid]);

  const getSingleSponsor = async (id: number) => {
    try {
      setSingleSponsorLoading(true);
      const response = await axios.post(`${domain}/api/display-sponsors/${id}`);
      if (response.data.success) {
        setSingleCompanySponsor({
          ...response.data.sponsor,
          attendees: response.data.attendees,
        });
      }
    } catch (error: any) {
      toast(error.message || "Something went wrong", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleXIcon className="size-5" />,
      });
    } finally {
      setSingleSponsorLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserAccount((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const newObj = {
        ...userAccount,
        event_uuid: currentEvent?.uuid,
        paid_event: currentEvent?.paid_event,
        event_fee: currentEvent?.event_fee,
      };

      try {
        const checkResponse = await axios.post(
          `${domain}/api/check-existing-attendee`,
          {
            email_id: userAccount.email_id,
            phone_number: userAccount.phone_number,
            event_uuid: currentEvent?.uuid,
          },
        );

        if (checkResponse.data.data) {
          toast("Already Registered", {
            className:
              "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
            icon: <CheckCircle className="size-5" />,
          });
          setOpen(false);
          return;
        }

        if (currentEvent?.paid_event === 1) {
          localStorage.setItem(
            "pendingRegistrationData",
            JSON.stringify(newObj),
          );

          const response = await axios.post(
            `${appDomain}/api/v1/payment/get-payment`,
            {
              amount: Number(currentEvent?.event_fee),
              product: {
                title: currentEvent.title,
                price: Number(currentEvent.event_fee),
              },
              firstname: userAccount.first_name,
              email: userAccount.email_id,
              mobile: userAccount.phone_number,
            },
          );
          setForm(response.data);

          if (currentEvent?.slug) {
            localStorage.setItem("pendingEventSlug", currentEvent.slug);
          }
        } else {
          const response = await axios.post(
            `${domain}/api/request_event_invitation`,
            {
              ...newObj,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (response.data.status === 200) {
            toast("Request Recieved", {
              className:
                "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
              icon: <CheckCircle className="size-5" />,
            });
          } else {
            toast("Registration Failed", {
              className:
                "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
              icon: <CircleX className="size-5" />,
            });
          }
        }
        setOpen(false);
      } catch (error) {
        console.error("Error checking existing attendee:", error);
        toast("Error checking existing attendee", {
          className:
            "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleX className="size-5" />,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast("An error occurred during registration", {
        className:
          "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const formData = document.getElementById("payment_post") as HTMLFormElement;
    if (formData) {
      formData.submit();
    }
  }, [form]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Update current agenda based on time
  useEffect(() => {
    if (!showLiveStream || agendaData.length === 0) return;

    const updateCurrentAgenda = () => {
      const activeAgenda = agendaData.find((agenda) => isAgendaActive(agenda));
      setCurrentAgendaId(activeAgenda?.id || null);
    };

    // Update immediately
    updateCurrentAgenda();

    // Update every 10 seconds
    const interval = setInterval(updateCurrentAgenda, 10000);

    return () => clearInterval(interval);
  }, [showLiveStream, agendaData, currentEvent]);

  const isEventDatePassed = () => {
    if (!currentEvent?.event_start_date) return false;

    const eventDate = new Date(currentEvent.event_start_date);
    eventDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return eventDate < today;
  };

  const extractCoordinates = async (address: string | undefined) => {
    if (!address) return;

    try {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      await new Promise((resolve) => (script.onload = resolve));

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=${googleMapsApiKey}`,
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }

      return;
    } catch (error) {
      console.error("Error getting coordinates:", error);
      return;
    }
  };

  // Handler for successful authentication
  const handleAuthSuccess = () => {
    // The ratings and feedback are already preserved in state
    // Just close the dialog - the user can now submit their ratings
    toast("Login successful! You can now submit your ratings.", {
      className:
        "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
      icon: <CheckCircle className="size-5" />,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Wave />
      </div>
    );
  }
  // Use currentEvent if available, otherwise fallback to temp from store
  const eventData = currentEvent || temp;

  // Generate dynamic page title using useMemo to recalculate when eventData changes
  const pageTitle = React.useMemo(() => {
    if (eventData?.title) {
      return `${eventData.title}${
        eventData.city ? `, ${eventData.city}` : ""
      } | Klout Club`;
    }
    return "Event Details | Klout Club";
  }, [eventData?.title, eventData?.city]);

  // Update document title when pageTitle changes
  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <React.Fragment>
      <Helmet>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta
          property="og:description"
          content={eventData?.description || "Event description not available"}
        />
        <meta
          property="og:image"
          content={getImageUrl(eventData?.image) || "default-image-url.jpg"}
        />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="w-full min-h-screen bg-background overflow-y-auto pb-12">
        <div
          dangerouslySetInnerHTML={{ __html: form as unknown as string }}
          style={{ opacity: 0 }}
        />

        <div className="max-w-5xl flex flex-col-reverse md:flex-row gap-7 justify-center mx-auto! space-y-4 px-5">
          {/* Left Div */}
          <div className="space-y-4 w-full">
            <Link
              to={`/company/${encodeURIComponent(
                currentEvent?.company_name || "",
              )}`}
              className="hover:underline"
            >
              <span className="text-gray-700 text-sm">
                By {currentEvent?.company_name}
              </span>
            </Link>

            <h1 className="text-2xl font-semibold mt-0! flex items-center gap-2">
              {currentEvent?.title}{" "}
              {currentEvent?.paid_event === 1 && (
                <Badge className="rounded-full">Paid</Badge>
              )}
            </h1>
            {/* Row for Start Date */}
            <div className="flex gap-2">
              <div className="rounded-md grid place-content-center size-10 bg-muted">
                <p className="uppercase text-secondary font-semibold text-xs text-center">
                  {startTime
                    ? new Date(startTime)
                        .toLocaleString("en-US", { weekday: "short" })
                        .toUpperCase()
                    : ""}
                </p>
                <p className="text-2xl leading-none font-semibold text-foreground">
                  {startTime ? new Date(startTime).getDate() : ""}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">{formatDateTime(startTime)}</h4>
                <p className="text-sm text-foreground">
                  {currentEvent?.start_time}:{currentEvent?.start_minute_time}{" "}
                  {currentEvent?.start_time_type} - {currentEvent?.end_time}:
                  {currentEvent?.end_minute_time} {currentEvent?.end_time_type}
                </p>
              </div>
            </div>
            {/* Row for Location */}
            <div className="flex gap-2">
              <Link
                to={
                  currentEvent?.event_mode === 1
                    ? currentEvent?.webinar_link
                    : currentEvent?.google_map_link || ""
                }
                target="_blank"
                className="flex gap-2 items-center cursor-pointer"
              >
                {currentEvent?.event_mode === 0 ? (
                  <React.Fragment>
                    <div className="rounded-md grid place-content-center size-10 bg-muted">
                      <MapPin size={30} className="text-foreground" />
                    </div>

                    <div>
                      <h4 className="font-semibold flex items-center">
                        {currentEvent?.event_venue_name}{" "}
                        <ArrowRight size={20} className="-rotate-45" />
                      </h4>
                      <p className="text-sm text-foreground">
                        {currentEvent?.city}, {currentEvent?.pincode}
                      </p>
                    </div>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <div className="rounded-md grid place-content-center size-10 bg-muted">
                      <Globe size={30} className="text-foreground" />
                    </div>

                    <div>
                      <h4 className="font-semibold flex items-center">
                        Online
                      </h4>
                    </div>
                  </React.Fragment>
                )}
              </Link>
            </div>
            {/* Row for Event Fee */}
            {currentEvent?.paid_event === 1 && (
              <div className="flex gap-2">
                <div className="flex gap-2">
                  <div className="rounded-md grid place-content-center size-10 bg-muted">
                    <IndianRupee size={30} className="text-foreground" />
                  </div>

                  <div>
                    <h4 className="font-semibold flex items-center">
                      Event Fee
                    </h4>
                    <p className="text-sm text-primary font-bold">
                      {currentEvent?.event_fee} /-
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Row for Registration */}
            <div className="border border-accent rounded-[10px]">
              <p className="text-sm p-2.5">
                {isEventDatePassed() ? "Registration Closed" : "Registration"}
              </p>

              <div
                className={`rounded-b-[10px] bg-muted ${
                  isEventDatePassed() ? "opacity-50" : ""
                }`}
              >
                <div
                  className={`flex gap-2 p-2.5 border-b ${
                    isEventDatePassed() ? "blur-[2px]" : ""
                  }`}
                >
                  <div className="rounded-md grid place-content-center size-10 bg-background/50">
                    <UserRoundCheck size={30} className="text-foreground" />
                  </div>

                  <div className="">
                    <h4 className="font-semibold! flex items-center">
                      Pending Approval
                    </h4>
                    <p className="text-sm -mt-1">
                      Your registration requires approval from the host.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-2.5 ${isEventDatePassed() ? "blur-[2px]" : ""}`}
                >
                  <p className="text-sm">
                    Welcome! Register below to request event access.
                  </p>
                  <Button
                    disabled={isEventDatePassed()}
                    onClick={() => setOpen(true)}
                    className="w-full h-12 mt-4"
                  >
                    Get an Invite
                  </Button>
                </div>
              </div>
            </div>
            {/* Poll Display Card */}
            {currentEvent && completeEventData && (
              <PollDisplayCard
                eventUuid={currentEvent.uuid}
                organiserUuid={completeEventData.user_uuid}
                isLive={isEventLive()}
              />
            )}
            {/* Event Details */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg">Event Details</h3>
              <hr className="border-t-2 border-white my-2.5" />
              <p className="text-foreground">{currentEvent?.description}</p>
            </div>

            {/* Event Images Section - Only show for past events */}
            {isEventDatePassed() &&
              (appUser && currentEvent && isEventAttended() ? (
                <EventImages
                  eventUuid={currentEvent?.uuid}
                  userId={currentEvent.user_id}
                  userImage={appUser.profileImage}
                />
              ) : (
                <div className="mt-6 border border-accent rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-muted p-4 border-b border-accent">
                    <h3 className="font-semibold text-lg">Event Images</h3>
                  </div>
                  <div className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                      <div className="text-5xl mb-2">🔒</div>

                      {/* Not logged in */}
                      {!appUser && (
                        <>
                          <div>
                            <p className="text-foreground font-semibold text-lg mb-2">
                              Login Required
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Please login to access event images. You must be
                              checked in to this event to view the gallery.
                            </p>
                          </div>
                          <Button
                            onClick={() => setAuthDialogOpen(true)}
                            variant="default"
                            className="mt-2"
                          >
                            Login to Continue
                          </Button>
                        </>
                      )}

                      {/* Logged in but not checked in */}
                      {appUser && !isEventAttended() && (
                        <div>
                          <p className="text-foreground font-semibold text-lg mb-2">
                            Check-in Required
                          </p>
                          <p className="text-sm text-muted-foreground">
                            You must be checked in to this event to view images.
                            Please check in at the event to access the gallery.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {/* Live Stream Section - Show after map */}
            {showLiveStream && isUserCheckedIn && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg">Live Stream</h3>
                <hr className="border-t-2 border-white my-2.5!" />
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-4 border-primary shadow-lg">
                  {/* Logo positioned at top-right */}
                  <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
                    <img
                      src={LogoImage}
                      alt="Logo"
                      className="h-8 w-auto object-contain"
                    />
                  </div>

                  {/* Video Player */}
                  <ReactHlsPlayer
                    src={liveURL}
                    autoPlay={true}
                    muted={true} // Required for autoplay to work
                    controls={true}
                    width="100%"
                    height="auto"
                    playerRef={videoRef as React.RefObject<HTMLVideoElement>}
                  />

                  {/* Active Agenda Overlay */}
                  {(() => {
                    const activeAgenda = agendaData.find(
                      (agenda) => agenda.id === currentAgendaId,
                    );

                    return (
                      <div className="absolute bottom-0 left-0 right-0 z-10 bg-linear-to-t from-black/95 via-black/80 to-transparent p-4 md:p-6 pb-16 md:pb-20">
                        {activeAgenda ? (
                          <div className="space-y-2 md:space-y-3">
                            {/* Live indicator and timing */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 bg-secondary/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                  <div className="size-2 bg-white rounded-full animate-pulse"></div>
                                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                                    Live Now
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs md:text-sm font-semibold text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                                {activeAgenda.start_time}:
                                {activeAgenda.start_minute_time}{" "}
                                {activeAgenda.start_time_type} -{" "}
                                {activeAgenda.end_time}:
                                {activeAgenda.end_minute_time}{" "}
                                {activeAgenda.end_time_type}
                              </div>
                            </div>

                            {/* Title */}
                            <h4 className="text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight line-clamp-2">
                              {activeAgenda.title}
                            </h4>

                            {/* Description */}
                            {activeAgenda.description && (
                              <p className="text-xs md:text-sm text-white/90 leading-relaxed line-clamp-2 md:line-clamp-3">
                                {activeAgenda.description}
                              </p>
                            )}

                            {/* Speakers */}
                            {activeAgenda.speakers &&
                              activeAgenda.speakers.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  <span className="text-xs text-white/70 font-medium">
                                    Speakers:
                                  </span>
                                  {activeAgenda.speakers.map((speaker) => (
                                    <div
                                      key={speaker.id}
                                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/20"
                                    >
                                      <img
                                        src={
                                          speaker.image
                                            ? `${domain}/${speaker.image}`
                                            : UserAvatar
                                        }
                                        alt={`${speaker.first_name} ${speaker.last_name}`}
                                        className="size-6 rounded-full object-cover object-top border border-white/30"
                                      />
                                      <span className="text-xs font-medium text-white capitalize">
                                        {speaker.first_name} {speaker.last_name}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-sm md:text-base text-white/70 font-medium">
                              No active session at the moment
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                    <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                    Event is Live
                  </p>
                </div>

                {/* Livestream Agenda Display */}
                {agendaData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-4">Event Agenda</h3>
                    <div className="space-y-3">
                      {agendaData.map((agenda) => {
                        const isActive = currentAgendaId === agenda.id;
                        return (
                          <div
                            key={agenda.id}
                            className={`
                              relative rounded-lg border-2 p-4 transition-all duration-300
                              ${
                                isActive
                                  ? "border-secondary bg-secondary/10 shadow-lg scale-[1.02]"
                                  : "border-border bg-card hover:border-accent"
                              }
                            `}
                          >
                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute -left-1 top-1/2 -translate-y-1/2">
                                <div className="flex items-center gap-2">
                                  <div className="size-3 bg-secondary rounded-full animate-pulse shadow-lg"></div>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                              {/* Time Badge */}
                              <div
                                className={`
                                shrink-0 px-3 py-2 rounded-md text-sm font-semibold text-center min-w-[120px]
                                ${
                                  isActive
                                    ? "bg-secondary text-secondary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }
                              `}
                              >
                                <div className="text-xs opacity-80">
                                  {agenda.start_time}:{agenda.start_minute_time}{" "}
                                  {agenda.start_time_type}
                                </div>
                                <div className="text-xs opacity-60">to</div>
                                <div className="text-xs opacity-80">
                                  {agenda.end_time}:{agenda.end_minute_time}{" "}
                                  {agenda.end_time_type}
                                </div>
                              </div>

                              {/* Agenda Content */}
                              <div className="flex-1">
                                <h4
                                  className={`
                                  font-semibold text-base mb-1
                                  ${
                                    isActive
                                      ? "text-secondary"
                                      : "text-foreground"
                                  }
                                `}
                                >
                                  {agenda.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {agenda.description}
                                </p>

                                {/* Speakers */}
                                {agenda.speakers &&
                                  agenda.speakers.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {agenda.speakers.map((speaker) => (
                                        <div
                                          key={speaker.id}
                                          className="flex items-center gap-2 bg-background/50 rounded-full px-3 py-1 border border-border"
                                        >
                                          <img
                                            src={
                                              speaker.image
                                                ? `${domain}/${speaker.image}`
                                                : UserAvatar
                                            }
                                            alt={`${speaker.first_name} ${speaker.last_name}`}
                                            className="size-6 rounded-full object-cover object-top"
                                          />
                                          <span className="text-xs font-medium capitalize">
                                            {speaker.first_name}{" "}
                                            {speaker.last_name}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            </div>

                            {/* Active label */}
                            {isActive && (
                              <div className="absolute top-2 right-2">
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-semibold"
                                >
                                  Live Now
                                </Badge>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Speakers */}
            <div hidden={allSpeakers.length === 0} className="mt-6">
              <h3 className="font-semibold text-lg">Speakers</h3>
              <hr className="border-t-2 border-white my-2.5!" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 justify-between">
                {allSpeakers.length > 0 ? (
                  allSpeakers.map((speaker, index) => (
                    <div
                      key={index}
                      className="max-w-60 max-h-96 overflow-hidden text-ellipsis text-center"
                    >
                      <Avatar className="size-24 rounded-full shrink-0">
                        <AvatarImage
                          src={
                            speaker.image
                              ? domain + "/" + speaker.image
                              : UserAvatar
                          }
                          className="size-24 rounded-full mx-auto object-cover object-top"
                          alt={`${speaker.first_name} ${speaker.last_name}`}
                        />
                        <AvatarFallback className="size-24 mx-auto rounded-full bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <img
                            src={UserAvatar}
                            alt="fallback"
                            className="size-24 rounded-full mx-auto object-cover object-top"
                          />
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-wrap capitalize">
                        {speaker.first_name + " " + speaker.last_name}
                      </p>
                      <p className="text-wrap text-sm capitalize">
                        {speaker.job_title}
                      </p>
                      <p className="text-sm font-bold text-wrap capitalize">
                        {speaker.company_name}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-foreground mb-10 text-nowrap">
                    No speakers available
                  </p>
                )}
              </div>
            </div>

            {/* Sponsors */}
            <div hidden={true} className="mt-6">
              <h3 className="font-semibold text-lg">Sponsors</h3>
              <hr className="border-t-2 border-white my-2.5!" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 justify-between">
                {allSponsors?.length > 0 ? (
                  allSponsors?.map((sponsor, index) => (
                    <div
                      key={index}
                      className="max-w-60 max-h-96 overflow-hidden text-ellipsis text-center"
                    >
                      <img
                        src={
                          sponsor.image
                            ? domain + "/" + sponsor.image
                            : UserAvatar
                        }
                        alt="Sponsor"
                        className="rounded-full mx-auto size-24 object-cover object-top"
                      />
                      <p className="font-semibold text-wrap capitalize">
                        {sponsor.first_name + " " + sponsor.last_name}
                      </p>
                      <p className="text-wrap text-sm capitalize">
                        {sponsor.job_title}
                      </p>
                      <p className="text-sm font-bold text-wrap capitalize">
                        {sponsor.company_name}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-foreground mb-10 text-nowrap">
                    No speakers available
                  </p>
                )}
              </div>
            </div>
            {/* Jury */}
            <div hidden={allJury.length === 0} className="mt-6">
              <h3 className="font-semibold text-lg">Jury</h3>
              <hr className="border-t-2 border-white my-2.5!" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 justify-between">
                {allJury.map((jury, index) => (
                  <div
                    key={index}
                    className="max-w-60 max-h-96 overflow-hidden text-ellipsis text-center"
                  >
                    <img
                      src={jury.image ? domain + "/" + jury.image : UserAvatar}
                      alt="Jury"
                      className="rounded-full mx-auto size-24"
                    />
                    <p className="font-semibold text-wrap capitalize">
                      {jury.first_name + " " + jury.last_name}
                    </p>
                    <p className="text-wrap text-sm capitalize">
                      {jury.job_title}
                    </p>
                    <p className="text-sm font-bold text-wrap capitalize">
                      {jury.company_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Sponsors */}
            <div hidden={allCompanySponsors.length === 0} className="mt-6">
              <h3 className="font-semibold text-lg">Company Sponsors</h3>
              <hr className="border-t-2 border-white my-2.5!" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 justify-between">
                {allCompanySponsors.map((sponsor, index) => (
                  <div
                    key={index}
                    className="max-w-60 max-h-96 flex flex-col gap-2 overflow-hidden text-ellipsis text-center"
                  >
                    <img
                      src={
                        sponsor.company_logo
                          ? domain + "/" + sponsor.company_logo
                          : UserAvatar
                      }
                      alt="Sponsor"
                      className="rounded-full mx-auto size-24"
                    />
                    <p className="font-semibold text-wrap capitalize">
                      {sponsor.company_name}
                    </p>

                    <Dialog>
                      <DialogTrigger
                        onClick={() => getSingleSponsor(sponsor.id)}
                        className="underline underline-offset-1 text-brand-primary hover:text-brand-primary-dark transition-colors duration-300 cursor-pointer"
                      >
                        View Details
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] md:w-[90vw] lg:w-[80vw] xl:w-3xl max-w-none max-h-[90vh] p-4 sm:p-6 overflow-y-auto">
                        {singleSponsorLoading ? (
                          <Wave />
                        ) : (
                          <>
                            <DialogHeader>
                              <DialogTitle>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-center mb-5">
                                  {sponsor?.company_logo ? (
                                    <img
                                      src={getImageUrl(sponsor.company_logo)}
                                      alt={sponsor.company_name}
                                      className="size-20 sm:size-24 md:size-28 border-2 object-contain rounded-full shrink-0"
                                    />
                                  ) : (
                                    <div className="size-20 sm:size-24 md:size-28 bg-brand-primary/30 rounded-full shrink-0" />
                                  )}
                                  <h3 className="font-semibold capitalize text-center sm:text-left text-lg sm:text-xl md:text-2xl">
                                    {sponsor?.company_name}
                                  </h3>
                                </div>
                              </DialogTitle>
                              <DialogDescription>
                                <h3 className="font-semibold text-black text-base sm:text-lg">
                                  About Company
                                </h3>
                                <div className="mt-2">
                                  <p className="text-sm sm:text-base">
                                    {singleCompanySponsor?.about_company}
                                  </p>
                                </div>
                              </DialogDescription>
                            </DialogHeader>

                            {/* Attendees */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-5">
                              {singleCompanySponsor?.attendees.map(
                                (attendee, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col gap-1 overflow-hidden text-ellipsis text-center items-center"
                                  >
                                    <img
                                      src={
                                        attendee.image
                                          ? domain + "/" + attendee.image
                                          : UserAvatar
                                      }
                                      alt="Sponsor"
                                      className="rounded-full size-20 sm:size-24 object-cover object-top"
                                    />
                                    <p className="font-semibold text-sm text-wrap capitalize">
                                      {attendee.first_name +
                                        " " +
                                        attendee.last_name}
                                    </p>
                                    <p className="text-wrap text-xs capitalize">
                                      {attendee.job_title}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>

                            {/* Video Link */}
                            {singleCompanySponsor?.video_link && (
                              <div className="w-full h-48 sm:h-60 md:h-80 rounded-xl mt-5">
                                {(() => {
                                  const link = singleCompanySponsor.video_link;
                                  const youtubeMatch = link.match(
                                    /(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
                                  );
                                  if (youtubeMatch) {
                                    const videoId = youtubeMatch[1];
                                    return (
                                      <iframe
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title="Sponsor Video"
                                        className="w-full h-full rounded-xl"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    );
                                  }
                                })()}
                                {singleCompanySponsor?.upload_deck && (
                                  <div className="w-full rounded-xl mt-10 relative">
                                    <button
                                      onClick={() => {
                                        const elem =
                                          document.getElementById(
                                            "pdf-container",
                                          );
                                        if (elem) {
                                          if (!document.fullscreenElement) {
                                            elem
                                              .requestFullscreen()
                                              .catch((err) => {
                                                console.error(
                                                  "Error attempting to enable fullscreen:",
                                                  err,
                                                );
                                              });
                                          } else {
                                            document.exitFullscreen();
                                          }
                                        }
                                      }}
                                      className="absolute top-2 right-2 z-50 bg-black/70 hover:bg-black/90 text-white p-1.5 sm:p-2 rounded-lg transition-colors duration-200 flex items-center gap-1 sm:gap-2"
                                      title="Toggle Fullscreen"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="sm:w-5 sm:h-5"
                                      >
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                      </svg>
                                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                                        Fullscreen
                                      </span>
                                    </button>
                                    <div
                                      id="pdf-container"
                                      className="w-full bg-black rounded-xl flex items-center justify-center overflow-auto min-h-[300px] sm:min-h-[400px]"
                                      style={
                                        {
                                          "--pdf-scale": "1",
                                        } as React.CSSProperties
                                      }
                                    >
                                      {/* Zoom Controls - Only visible in fullscreen */}
                                      {isFullscreen && (
                                        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-black/80 p-2 rounded-lg">
                                          <button
                                            onClick={() => {
                                              const container =
                                                document.getElementById(
                                                  "pdf-container",
                                                );
                                              if (container) {
                                                const currentScale = parseFloat(
                                                  container.style.getPropertyValue(
                                                    "--pdf-scale",
                                                  ) || "1",
                                                );
                                                const newScale = Math.max(
                                                  0.5,
                                                  currentScale - 0.25,
                                                );
                                                container.style.setProperty(
                                                  "--pdf-scale",
                                                  newScale.toString(),
                                                );
                                              }
                                            }}
                                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors duration-200 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10"
                                            title="Zoom Out"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="16"
                                              height="16"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="sm:w-5 sm:h-5"
                                            >
                                              <circle cx="11" cy="11" r="8" />
                                              <path d="m21 21-4.35-4.35" />
                                              <line
                                                x1="8"
                                                y1="11"
                                                x2="14"
                                                y2="11"
                                              />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() => {
                                              const container =
                                                document.getElementById(
                                                  "pdf-container",
                                                );
                                              if (container) {
                                                const currentScale = parseFloat(
                                                  container.style.getPropertyValue(
                                                    "--pdf-scale",
                                                  ) || "1",
                                                );
                                                const newScale = Math.min(
                                                  3,
                                                  currentScale + 0.25,
                                                );
                                                container.style.setProperty(
                                                  "--pdf-scale",
                                                  newScale.toString(),
                                                );
                                              }
                                            }}
                                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors duration-200 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10"
                                            title="Zoom In"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="16"
                                              height="16"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="sm:w-5 sm:h-5"
                                            >
                                              <circle cx="11" cy="11" r="8" />
                                              <path d="m21 21-4.35-4.35" />
                                              <line
                                                x1="11"
                                                y1="8"
                                                x2="11"
                                                y2="14"
                                              />
                                              <line
                                                x1="8"
                                                y1="11"
                                                x2="14"
                                                y2="11"
                                              />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() => {
                                              const container =
                                                document.getElementById(
                                                  "pdf-container",
                                                );
                                              if (container) {
                                                container.style.setProperty(
                                                  "--pdf-scale",
                                                  "1",
                                                );
                                              }
                                            }}
                                            className="bg-white/10 hover:bg-white/20 text-white px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center text-xs sm:text-sm font-medium"
                                            title="Reset Zoom"
                                          >
                                            Reset
                                          </button>
                                        </div>
                                      )}

                                      <div
                                        style={{
                                          transform: "scale(var(--pdf-scale))",
                                          transformOrigin: "center center",
                                          transition: "transform 0.3s ease",
                                        }}
                                      >
                                        <DocumentRenderer
                                          filePaths={
                                            singleCompanySponsor.upload_deck
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <Button
                                  className="mt-5 hidden"
                                  onClick={() =>
                                    handleDownloadPDF(
                                      singleCompanySponsor.upload_deck,
                                    )
                                  }
                                >
                                  Download{" "}
                                  {singleCompanySponsor.upload_deck.length > 1
                                    ? "PDFs"
                                    : "PDF"}
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </div>

            {/* Agenda Details */}
            {viewAgendaBy == 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Agenda Details</h3>
                <hr className="border-t-2 border-white my-2.5" />

                <div>
                  {agendaData.length > 0 ? (
                    (() => {
                      const dayGroups = groupAgendasByDay(agendaData);
                      const isMultiDay = dayGroups.length > 1;

                      // Single-day event: render structured cards
                      if (!isMultiDay) {
                        return (
                          <div className="space-y-4">
                            {dayGroups[0]?.agendas.map((agenda, index) => (
                              <div
                                key={agenda.id}
                                className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
                              >
                                {/* Time Badge */}
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2">
                                  <div className="flex items-center justify-between text-white">
                                    <span className="text-sm font-semibold">
                                      Session {index + 1}
                                    </span>
                                    <span className="text-sm font-medium">
                                      {agenda.start_time}:
                                      {agenda.start_minute_time}{" "}
                                      {agenda.start_time_type} -{" "}
                                      {agenda.end_time}:{agenda.end_minute_time}{" "}
                                      {agenda.end_time_type}
                                    </span>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="p-3">
                                  {/* Title */}
                                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                                    {agenda.title}
                                  </h3>

                                  {/* Description */}
                                  <p className="text-gray-600 leading-relaxed text-sm ">
                                    {agenda.description}
                                  </p>

                                  {/* Speakers Section */}
                                  {agenda.speakers &&
                                    agenda.speakers.length > 0 && (
                                      <div className="border-t border-gray-200 pt-4">
                                        <div className="flex items-center gap-2 mb-4">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                          </svg>
                                          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                            Speaker
                                            {agenda.speakers.length > 1
                                              ? "s"
                                              : ""}
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                          {agenda.speakers.map((speaker) => (
                                            <div
                                              key={speaker.id}
                                              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                            >
                                              <Avatar className="size-14 rounded-full shrink-0 border-2 border-white shadow-sm">
                                                <AvatarImage
                                                  src={
                                                    speaker.image
                                                      ? `${domain}/${speaker.image}`
                                                      : UserAvatar
                                                  }
                                                  alt={`${speaker.first_name} ${speaker.last_name}`}
                                                  className="size-14 rounded-full object-cover object-top"
                                                />
                                                <AvatarFallback className="size-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                                  <img
                                                    src={UserAvatar}
                                                    alt="fallback"
                                                    className="size-14 rounded-full"
                                                  />
                                                </AvatarFallback>
                                              </Avatar>

                                              <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate capitalize">
                                                  {speaker.first_name}{" "}
                                                  {speaker.last_name}
                                                </p>
                                                <p className="text-sm text-gray-600 truncate capitalize">
                                                  {speaker.job_title}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate capitalize">
                                                  {speaker.company_name}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // Multi-day event: render tabs with structured cards
                      return (
                        <Tabs
                          defaultValue={`day-${dayGroups[0].dayNumber}`}
                          className="w-full"
                        >
                          {/* Modern Tab List */}
                          <TabsList className="mb-6 flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
                            {dayGroups.map((dayGroup) => (
                              <TabsTrigger
                                key={dayGroup.date}
                                value={`day-${dayGroup.dayNumber}`}
                                className="flex-1 min-w-[100px] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 font-semibold transition-all"
                              >
                                Day {dayGroup.dayNumber}
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          {dayGroups.map((dayGroup) => (
                            <TabsContent
                              key={dayGroup.date}
                              value={`day-${dayGroup.dayNumber}`}
                              className="space-y-4"
                            >
                              {dayGroup.agendas.map((agenda, index) => (
                                <div
                                  key={agenda.id}
                                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
                                >
                                  {/* Time Badge */}
                                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2">
                                    <div className="flex items-center justify-between text-white">
                                      <span className="text-sm font-semibold">
                                        Session {index + 1}
                                      </span>
                                      <span className="text-sm font-medium">
                                        {agenda.start_time}:
                                        {agenda.start_minute_time}{" "}
                                        {agenda.start_time_type} -{" "}
                                        {agenda.end_time}:
                                        {agenda.end_minute_time}{" "}
                                        {agenda.end_time_type}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="p-5">
                                    {/* Title */}
                                    <h3 className="font-bold text-xl text-gray-900 mb-3">
                                      {agenda.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 leading-relaxed mb-5">
                                      {agenda.description}
                                    </p>

                                    {/* Speakers Section */}
                                    {agenda.speakers &&
                                      agenda.speakers.length > 0 && (
                                        <div className="border-t border-gray-200 pt-4">
                                          <div className="flex items-center gap-2 ">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-5 w-5 text-gray-500"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                            >
                                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                            </svg>
                                            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                              Speaker
                                              {agenda.speakers.length > 1
                                                ? "s"
                                                : ""}
                                            </span>
                                          </div>

                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                            {agenda.speakers.map((speaker) => (
                                              <div
                                                key={speaker.id}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                              >
                                                <Avatar className="size-14 rounded-full shrink-0 border-2 border-white shadow-sm">
                                                  <AvatarImage
                                                    src={
                                                      speaker.image
                                                        ? `${domain}/${speaker.image}`
                                                        : UserAvatar
                                                    }
                                                    alt={`${speaker.first_name} ${speaker.last_name}`}
                                                    className="size-14 rounded-full object-cover object-top"
                                                  />
                                                  <AvatarFallback className="size-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                                    <img
                                                      src={UserAvatar}
                                                      alt="fallback"
                                                      className="size-14 rounded-full"
                                                    />
                                                  </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                  <p className="font-semibold text-gray-900 truncate capitalize">
                                                    {speaker.first_name}{" "}
                                                    {speaker.last_name}
                                                  </p>
                                                  <p className="text-sm text-gray-600 truncate capitalize">
                                                    {speaker.job_title}
                                                  </p>
                                                  <p className="text-xs text-gray-500 truncate capitalize">
                                                    {speaker.company_name}
                                                  </p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              ))}
                            </TabsContent>
                          ))}
                        </Tabs>
                      );
                    })()
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-300 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-500 text-lg">
                        No agenda available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NEW SECTION: Speaker Ratings - Only visible for live or past events */}
            {viewAgendaBy == 0 &&
              (isEventLive() || isEventDatePassed()) &&
              agendaData.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-lg">Rate Speakers</h3>
                  <hr className="border-t-2 border-white my-2.5!" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your feedback on the speakers from each session
                  </p>

                  {(() => {
                    const dayGroups = groupAgendasByDay(agendaData);
                    const isMultiDay = dayGroups.length > 1;

                    // Filter day groups to only include those with speakers
                    const dayGroupsWithSpeakers = dayGroups
                      .map((dayGroup) => ({
                        ...dayGroup,
                        agendas: dayGroup.agendas.filter(
                          (agenda) =>
                            agenda.speakers && agenda.speakers.length > 0,
                        ),
                      }))
                      .filter((dayGroup) => dayGroup.agendas.length > 0);

                    if (dayGroupsWithSpeakers.length === 0) {
                      return null;
                    }

                    // Single-day event: render flat list without tabs or day headings
                    if (!isMultiDay) {
                      return (
                        <div className="space-y-6">
                          {dayGroupsWithSpeakers[0]?.agendas.map((agenda) => (
                            <div
                              key={`speaker-rating-${agenda.id}`}
                              className="bg-muted/30 rounded-lg p-5 border border-border"
                            >
                              {/* Agenda Header */}
                              <div className="mb-4 pb-3 border-b border-border">
                                <h4 className="font-semibold text-base">
                                  {agenda.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {agenda.start_time}:{agenda.start_minute_time}{" "}
                                  {agenda.start_time_type} - {agenda.end_time}:
                                  {agenda.end_minute_time}{" "}
                                  {agenda.end_time_type}
                                </p>
                              </div>

                              {/* Speakers Rating Grid */}
                              <div className="space-y-5">
                                {agenda.speakers.map((speaker) => {
                                  const ratingKey = `${agenda.id}_${speaker.id}`;
                                  const currentSpeakerRating =
                                    speakerRatings[ratingKey] || 0;
                                  const currentSpeakerFeedback =
                                    speakerFeedback[ratingKey] || "";

                                  // Handler for speaker star click
                                  const handleSpeakerStarClick = (
                                    rating: number,
                                  ) => {
                                    setSpeakerRatings((prev) => ({
                                      ...prev,
                                      [ratingKey]: rating,
                                    }));
                                  };

                                  // Handler for speaker feedback change
                                  const handleSpeakerFeedbackChange = (
                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                  ) => {
                                    setSpeakerFeedback((prev) => ({
                                      ...prev,
                                      [ratingKey]: e.target.value,
                                    }));
                                  };

                                  // Handler for submit speaker rating
                                  const handleSubmitSpeakerRating =
                                    async () => {
                                      if (!appUser) {
                                        // Open auth dialog - ratings and feedback are already preserved in state
                                        setAuthDialogOpen(true);
                                        return;
                                      }

                                      const speakerRatingData = {
                                        eventUuid: currentEvent?.uuid || "",
                                        eventTitle: currentEvent?.title || "",
                                        agendaTitle: agenda.title,
                                        agendaUuid: agenda.uuid,
                                        givenBy: appUser?._id || "",
                                        givenTo: speaker.phone_number || "",
                                        rating: currentSpeakerRating,
                                        feedback: currentSpeakerFeedback,
                                      };

                                      const response = await axios.post(
                                        `${appDomain}/api/v1/tls/submit-agenda-rating`,
                                        {
                                          ...speakerRatingData,
                                        },
                                        {
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                        },
                                      );

                                      if (response.data.status) {
                                        toast(
                                          response.data.message ||
                                            "Rating submitted successfully!",
                                          {
                                            className:
                                              "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                                            icon: (
                                              <CheckCircle className="size-5" />
                                            ),
                                          },
                                        );
                                      } else {
                                        toast(
                                          response.data.message ||
                                            "Failed to submit rating",
                                          {
                                            className:
                                              "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                                            icon: (
                                              <CircleX className="size-5" />
                                            ),
                                          },
                                        );
                                      }
                                    };

                                  return (
                                    <div
                                      key={speaker.id}
                                      className="bg-background rounded-lg p-4 border border-border/50"
                                    >
                                      {/* Speaker Info */}
                                      <div className="flex gap-3 items-start mb-4">
                                        <Avatar className="size-14 rounded-full shrink-0 border-2 border-white shadow-sm">
                                          <AvatarImage
                                            src={
                                              speaker.image
                                                ? `${domain}/${speaker.image}`
                                                : UserAvatar
                                            }
                                            alt={`${speaker.first_name} ${speaker.last_name}`}
                                            className="size-14 rounded-full object-cover object-top"
                                          />
                                          <AvatarFallback className="size-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                            <img
                                              src={UserAvatar}
                                              alt="fallback"
                                              className="size-14 rounded-full"
                                            />
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <p className="font-semibold text-base capitalize">
                                            {speaker.first_name}{" "}
                                            {speaker.last_name}
                                          </p>
                                          <p className="text-sm text-muted-foreground capitalize">
                                            {speaker.job_title}
                                          </p>
                                          <p className="text-xs text-muted-foreground capitalize">
                                            {speaker.company_name}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Rating Stars */}
                                      <div className="mb-3">
                                        <p className="text-sm font-medium mb-2">
                                          Your rating:
                                        </p>
                                        <div className="flex items-center gap-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              onClick={() =>
                                                handleSpeakerStarClick(star)
                                              }
                                              className={`size-7 cursor-pointer transition-all hover:scale-110 ${
                                                star <= currentSpeakerRating
                                                  ? "fill-yellow-400 text-yellow-400"
                                                  : "text-gray-300 hover:text-yellow-200"
                                              }`}
                                            />
                                          ))}
                                          {currentSpeakerRating > 0 && (
                                            <span className="ml-2 text-sm font-medium text-muted-foreground">
                                              {currentSpeakerRating}/5
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Feedback Textarea - Only shown if session_feedback_open_text_box is 1 */}
                                      {currentEvent?.session_feedback_open_text_box ===
                                        1 && (
                                        <div className="mb-3">
                                          <label className="text-sm font-medium mb-1.5 block">
                                            Key Takeaways (optional):
                                          </label>
                                          <Textarea
                                            value={currentSpeakerFeedback}
                                            maxLength={200}
                                            onChange={
                                              handleSpeakerFeedbackChange
                                            }
                                            className="min-h-20 text-sm resize-none"
                                            placeholder="Key takeaways (Max 200 characters)..."
                                          />
                                        </div>
                                      )}

                                      {/* Submit Button */}
                                      <div className="flex justify-end">
                                        <Button
                                          onClick={handleSubmitSpeakerRating}
                                          disabled={currentSpeakerRating === 0}
                                          size="sm"
                                          className="px-5"
                                        >
                                          Submit Rating
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // Multi-day event: render tabs
                    return (
                      <Tabs
                        defaultValue={`day-${dayGroupsWithSpeakers[0].dayNumber}`}
                        className="w-full"
                      >
                        <TabsList className="mb-4">
                          {dayGroupsWithSpeakers.map((dayGroup) => (
                            <TabsTrigger
                              key={dayGroup.date}
                              value={`day-${dayGroup.dayNumber}`}
                            >
                              Day {dayGroup.dayNumber}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {dayGroupsWithSpeakers.map((dayGroup) => (
                          <TabsContent
                            key={dayGroup.date}
                            value={`day-${dayGroup.dayNumber}`}
                          >
                            <div className="space-y-6">
                              {dayGroup.agendas.map((agenda) => (
                                <div
                                  key={`speaker-rating-${agenda.id}`}
                                  className="bg-muted/30 rounded-lg p-5 border border-border"
                                >
                                  {/* Agenda Header */}
                                  <div className="mb-4 pb-3 border-b border-border">
                                    <h4 className="font-semibold text-base">
                                      {agenda.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {agenda.start_time}:
                                      {agenda.start_minute_time}{" "}
                                      {agenda.start_time_type} -{" "}
                                      {agenda.end_time}:{agenda.end_minute_time}{" "}
                                      {agenda.end_time_type}
                                    </p>
                                  </div>

                                  {/* Speakers Rating Grid */}
                                  <div className="space-y-5">
                                    {agenda.speakers.map((speaker) => {
                                      const ratingKey = `${agenda.id}_${speaker.id}`;
                                      const currentSpeakerRating =
                                        speakerRatings[ratingKey] || 0;
                                      const currentSpeakerFeedback =
                                        speakerFeedback[ratingKey] || "";

                                      // Handler for speaker star click
                                      const handleSpeakerStarClick = (
                                        rating: number,
                                      ) => {
                                        setSpeakerRatings((prev) => ({
                                          ...prev,
                                          [ratingKey]: rating,
                                        }));
                                      };

                                      // Handler for speaker feedback change
                                      const handleSpeakerFeedbackChange = (
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                      ) => {
                                        setSpeakerFeedback((prev) => ({
                                          ...prev,
                                          [ratingKey]: e.target.value,
                                        }));
                                      };

                                      // Handler for submit speaker rating
                                      const handleSubmitSpeakerRating =
                                        async () => {
                                          if (!appUser) {
                                            // Open auth dialog - ratings and feedback are already preserved in state
                                            setAuthDialogOpen(true);
                                            return;
                                          }

                                          const speakerRatingData = {
                                            eventUuid: currentEvent?.uuid || "",
                                            eventTitle:
                                              currentEvent?.title || "",
                                            agendaTitle: agenda.title,
                                            agendaUuid: agenda.uuid,
                                            givenBy: appUser?._id || "",
                                            givenTo: speaker.phone_number || "",
                                            rating: currentSpeakerRating,
                                            feedback: currentSpeakerFeedback,
                                          };

                                          const response = await axios.post(
                                            `${appDomain}/api/v1/tls/submit-agenda-rating`,
                                            {
                                              ...speakerRatingData,
                                            },
                                            {
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                            },
                                          );

                                          if (response.data.status) {
                                            toast(
                                              response.data.message ||
                                                "Rating submitted successfully!",
                                              {
                                                className:
                                                  "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                                                icon: (
                                                  <CheckCircle className="size-5" />
                                                ),
                                              },
                                            );
                                          } else {
                                            toast(
                                              response.data.message ||
                                                "Failed to submit rating",
                                              {
                                                className:
                                                  "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                                                icon: (
                                                  <CircleX className="size-5" />
                                                ),
                                              },
                                            );
                                          }
                                        };

                                      return (
                                        <div
                                          key={speaker.id}
                                          className="bg-background rounded-lg p-4 border border-border/50"
                                        >
                                          {/* Speaker Info */}
                                          <div className="flex gap-3 items-start mb-4">
                                            <Avatar className="size-16 rounded-full object-top shrink-0">
                                              <AvatarImage
                                                src={
                                                  speaker.image
                                                    ? `${domain}/${speaker.image}`
                                                    : UserAvatar
                                                }
                                                alt={`${speaker.first_name} ${speaker.last_name}`}
                                                className=" rounded-full object-cover"
                                              />
                                              <AvatarFallback className="size-16 rounded-full bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                                <img
                                                  src={UserAvatar}
                                                  alt="Fallback Avatar"
                                                  className="size-16 rounded-full object-cover object-top"
                                                />
                                              </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                              <p className="font-semibold text-base capitalize">
                                                {speaker.first_name}{" "}
                                                {speaker.last_name}
                                              </p>
                                              <p className="text-sm text-muted-foreground capitalize">
                                                {speaker.job_title}
                                              </p>
                                              <p className="text-xs text-muted-foreground capitalize">
                                                {speaker.company_name}
                                              </p>
                                            </div>
                                          </div>

                                          {/* Rating Stars */}
                                          <div className="mb-3">
                                            <p className="text-sm font-medium mb-2">
                                              Your rating:
                                            </p>
                                            <div className="flex items-center gap-1">
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                  key={star}
                                                  onClick={() =>
                                                    handleSpeakerStarClick(star)
                                                  }
                                                  className={`size-7 cursor-pointer transition-all hover:scale-110 ${
                                                    star <= currentSpeakerRating
                                                      ? "fill-yellow-400 text-yellow-400"
                                                      : "text-gray-300 hover:text-yellow-200"
                                                  }`}
                                                />
                                              ))}
                                              {currentSpeakerRating > 0 && (
                                                <span className="ml-2 text-sm font-medium text-muted-foreground">
                                                  {currentSpeakerRating}/5
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Feedback Textarea - Only shown if session_feedback_open_text_box is 1 */}
                                          {currentEvent?.session_feedback_open_text_box ===
                                            1 && (
                                            <div className="mb-3">
                                              <label className="text-sm font-medium mb-1.5 block">
                                                Key Takeaways (optional):
                                              </label>
                                              <Textarea
                                                value={currentSpeakerFeedback}
                                                onChange={
                                                  handleSpeakerFeedbackChange
                                                }
                                                className="min-h-20 text-sm resize-none"
                                                placeholder="Key takeaways..."
                                              />
                                            </div>
                                          )}

                                          {/* Submit Button */}
                                          <div className="flex justify-end">
                                            <Button
                                              onClick={
                                                handleSubmitSpeakerRating
                                              }
                                              disabled={
                                                currentSpeakerRating === 0
                                              }
                                              size="sm"
                                              className="px-5"
                                            >
                                              Submit Rating
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    );
                  })()}
                </div>
              )}
            <div
              hidden={currentEvent?.event_mode == 1}
              className="mt-10 md:hidden md:mt-[5.8rem]"
            >
              <h3 className="font-semibold text-lg">Location</h3>
              <hr className="border-t-2 border-white my-2.5!" />
              <p className="text-foreground">
                <strong>{currentEvent?.event_venue_name}</strong> <br />
                {currentEvent?.event_venue_address_2}
              </p>
              <div className="rounded-lg w-full h-full mt-2.5 p-2 overflow-hidden md:w-[300px] md:h-[300px]">
                <GoogleMap
                  latitude={center.lat}
                  longitude={center.lng}
                  isLoaded={true}
                  zoom={18}
                />
              </div>
            </div>
          </div>

          {/* Right Div */}
          <div className="md:min-w-80 max-w-80 mx-auto">
            <img
              src={domain + "/" + currentEvent?.image}
              alt="Background Image"
              className="rounded-lg w-60 mx-auto md:w-full"
            />

            <div
              hidden={currentEvent?.event_mode == 1}
              className="mt-10 hidden md:block md:mt-[5.8rem]"
            >
              <h3 className="font-semibold text-lg">Location</h3>
              <hr className="border-t-2 border-white my-2.5!" />
              <p className="text-foreground">
                <strong>{currentEvent?.event_venue_name}</strong> <br />
                {currentEvent?.event_venue_address_2}
              </p>
              <div className="rounded-lg w-full h-full mt-2.5 p-2 overflow-hidden md:w-80 md:h-80">
                <GoogleMap
                  latitude={center.lat}
                  longitude={center.lng}
                  isLoaded={true}
                  zoom={18}
                />
              </div>
            </div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-muted/80 backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                Get an Invite
              </DialogTitle>

              <div>
                {/* First Name & Last Name */}
                <div className="flex gap-5 justify-between">
                  <div className="flex mt-5 gap-2 flex-col w-full">
                    <Label className="font-semibold">
                      First Name <span className="text-secondary">*</span>
                    </Label>
                    <div className="input h-12! min-w-full! relative p-1! flex items-center justify-end">
                      <Input
                        value={userAccount.first_name}
                        onChange={handleInputChange}
                        name="first_name"
                        className="input h-full! min-w-full absolute right-0 text-base z-10"
                      />
                    </div>
                  </div>

                  <div className="flex mt-5 gap-2 flex-col w-full">
                    <Label className="font-semibold">
                      Last Name <span className="text-secondary">*</span>
                    </Label>
                    <div className="input h-12! min-w-full! relative p-1! flex items-center justify-end">
                      <Input
                        value={userAccount.last_name}
                        onChange={handleInputChange}
                        name="last_name"
                        className="input h-full! min-w-full absolute right-0 text-base z-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Mobile Number */}
                <div className="flex gap-5 flex-col justify-between mt-5">
                  <div className="flex gap-2 flex-col w-full">
                    <Label className="font-semibold">
                      Email <span className="text-secondary">*</span>
                    </Label>
                    <div className="input h-12! min-w-full! relative p-1! flex items-center justify-end">
                      <Input
                        value={userAccount.email_id}
                        onChange={handleInputChange}
                        name="email_id"
                        className="input h-full! min-w-full absolute right-0 text-base z-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-5">
                    <div className="flex gap-2 flex-col w-40">
                      <Label className="font-semibold">
                        Country Code <span className="text-secondary">*</span>
                      </Label>
                      <div className="input h-12! min-w-full! relative p-1! flex items-center justify-end">
                        <Input
                          value={userAccount.country_code}
                          onChange={handleInputChange}
                          name="country_code"
                          className="input h-full! min-w-full absolute right-0 text-base z-10"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 flex-col w-full">
                      <Label className="font-semibold">
                        Mobile Number <span className="text-secondary">*</span>
                      </Label>
                      <div className="input h-12! min-w-full! relative p-1! flex items-center justify-end">
                        <Input
                          value={userAccount.phone_number}
                          onChange={handleInputChange}
                          name="phone_number"
                          className="input h-full! min-w-full absolute right-0 text-base z-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div className="flex gap-5 justify-between mt-5">
                  <CustomComboBox
                    label="Company Name"
                    value={userAccount.company_name}
                    onValueChange={(value: string) =>
                      setUserAccount((prev) => ({
                        ...prev,
                        company_name: value,
                      }))
                    }
                    placeholder="Type or select company"
                    options={companies.map((company, index) => ({
                      id: index + 1,
                      name: company.company,
                    }))}
                    required
                  />
                </div>

                {/* Designation */}
                <div className="flex gap-5 justify-between mt-5">
                  <CustomComboBox
                    label="Designation"
                    value={userAccount.job_title}
                    onValueChange={(value: string) =>
                      setUserAccount((prev) => ({ ...prev, job_title: value }))
                    }
                    placeholder="Type or select designation"
                    options={designations.map((designation, index) => ({
                      id: index + 1,
                      name: designation.designation,
                    }))}
                    required
                  />
                </div>

                <Button
                  onClick={handleCreateAccount}
                  className="mt-5 btn mx-auto w-full"
                >
                  Submit
                </Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Authentication Dialog */}
        <AuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </React.Fragment>
  );
};

export default ExploreViewEvent;
