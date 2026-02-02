import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAttendedEvents } from "@/app-api/attendedEvents";
import axios from "axios";
import {
  Loader2,
  Calendar,
  MapPin,
  Users,
  Search,
  ExternalLink,
} from "lucide-react";
import { domain } from "@/constants";
import { getUserProfileImage } from "@/lib/utils";
import type { AttendeeType, EventType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";

interface LiveEventData {
  id: number;
  uuid: string;
  title: string;
  description: string;
  event_start_date: string;
  event_end_date: string;
  event_venue_name: string;
  event_venue_address_1: string;
  event_venue_address_2: string;
  city: string;
  state: string;
  country: string;
  start_time: string;
  start_minute_time: string;
  start_time_type: string;
  start_time_format: string;
  end_time: string;
  end_minute_time: string;
  end_time_type: string;
  event_date: string;
  image: string;
  status: number;
}

interface AttendeeStats {
  total_attendees: number;
  speakerCount: number;
  agendaCount: number;
}

interface AttendedEvent {
  _id: string;
  mobileNumber: number;
  eventUUID: string;
  eventTitle: string;
  status: string;
  checkInTime: string;
}

const EventHighlight: React.FC = () => {
  const dispatch = useAppDispatch();
  const { events } = useAppSelector((s) => s.attendedEvents);
  const { user } = useAppSelector((s) => s.auth);
  const [joinedAttendees, setJoinedAttendees] = useState<AttendeeType[]>([]);
  const [liveEventData, setLiveEventData] = useState<EventType | null>(null);
  const [attendeeStats, setAttendeeStats] = useState<AttendeeStats | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [latestAttendedEvent, setLatestAttendedEvent] =
    useState<AttendedEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [debugInfo, setDebugInfo] = useState<any>(null);
  const navigate = useNavigate();

  // Fetch attended events
  useEffect(() => {
    // console.log("EventHighlight - User mobile:", user?.mobileNumber);
    if (user?.mobileNumber) {
      dispatch(fetchAttendedEvents({ mobileNumber: user.mobileNumber }));
    }
  }, [dispatch, user?.mobileNumber]);

  // Process events and fetch live event data
  useEffect(() => {
    if (events.length > 0) {
      const sortedEvents = [...events].sort((a, b) => {
        const dateA = new Date(a.checkInTime);
        const dateB = new Date(b.checkInTime);
        return dateB.getTime() - dateA.getTime();
      });

      const latestEvent = sortedEvents[0];
      setLatestAttendedEvent(latestEvent);
      // console.log("EventHighlight - Latest attended event:", latestEvent);

      // Fetch live event data
      if (latestEvent.eventUUID) {
        fetchLiveEventData(latestEvent.eventUUID);
      }
    }
  }, [events]);

  const fetchLiveEventData = async (eventUUID: string) => {
    setLoading(true);

    try {
      const response = await axios.get(`${domain}/api/event/${eventUUID}`);
      // setDebugInfo(response.data);

      // The actual event data is inside response.data.data
      const eventData = response.data.data;

      if (eventData) {
        // Check if event is currently live based on dates and times
        const isLive = checkIfEventIsLive(eventData);

        if (isLive) {
          setLiveEventData(eventData);

          // Fetch attendee stats
          await fetchAttendeeStats(latestAttendedEvent?.eventUUID as string);
        } else {
          setLiveEventData(null);
          // console.log("EventHighlight - Event is NOT live, hiding card");
        }
      } else {
        setLiveEventData(null);
      }
    } catch (err: any) {
      console.error("EventHighlight - Error fetching live event data:", err);
      setLiveEventData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendee statistics
  const fetchAttendeeStats = async (eventUUID: string) => {
    try {
      // console.log(
      //   "EventHighlight - Fetching attendee stats for UUID:",
      //   eventUUID
      // );

      const response = await axios.post(
        `${domain}/api/totalattendees-list/${eventUUID}`
      );

      // console.log("EventHighlight - Attendee Stats Response:", response.data);

      if (response.data && response.data.data) {
        const attendees = response.data.data;
        const totalAttendees = response.data.total_attendees || 0;

        // Count speakers (panelist, speaker, etc.)
        const speakerStatuses = ["speaker"];
        const speakerCount = attendees.filter((attendee: any) =>
          speakerStatuses.includes(attendee.status?.toLowerCase())
        ).length;

        // Count unique agendas/sessions from break_out_room_and_time
        const agendaCount = attendees.reduce((count: number, attendee: any) => {
          if (
            attendee.break_out_room_and_time &&
            Array.isArray(attendee.break_out_room_and_time)
          ) {
            return count + attendee.break_out_room_and_time.length;
          }
          return count;
        }, 0);

        setAttendeeStats({
          total_attendees: totalAttendees,
          speakerCount,
          agendaCount,
        });

        // console.log("EventHighlight - Stats calculated:", {
        //   totalAttendees,
        //   speakerCount,
        //   agendaCount,
        // });
      }
    } catch (err: any) {
      console.error("EventHighlight - Error fetching attendee stats:", err);
      // Don't set error here, just log it - we can still show the event without stats
    }
  };

  // Helper function to check if event is currently live
  const checkIfEventIsLive = (eventData: any): boolean => {
    try {
      const now = new Date();

      // Parse start date and time
      const startDate = new Date(eventData.event_start_date);
      const [startHour, startMinute] = eventData.start_time_format
        .split(":")
        .map(Number);
      startDate.setHours(startHour, startMinute, 0, 0);

      // Parse end date and time
      const endDate = new Date(eventData.event_end_date);
      // If no end time format, assume end of day
      if (eventData.end_time && eventData.end_minute_time) {
        let endHour = parseInt(eventData.end_time);
        const endMinute = parseInt(eventData.end_minute_time);

        // Convert 12-hour format to 24-hour if needed
        if (eventData.end_time_type === "PM" && endHour !== 12) {
          endHour += 12;
        } else if (eventData.end_time_type === "AM" && endHour === 12) {
          endHour = 0;
        }

        endDate.setHours(endHour, endMinute, 0, 0);
      } else {
        endDate.setHours(23, 59, 59, 999);
      }

      // console.log("EventHighlight - Time check:", {
      //   now: now.toISOString(),
      //   startDate: startDate.toISOString(),
      //   endDate: endDate.toISOString(),
      //   isAfterStart: now >= startDate,
      //   isBeforeEnd: now <= endDate,
      // });

      // Event is live if current time is between start and end
      return now >= startDate && now <= endDate;
    } catch (error) {
      console.error("EventHighlight - Error checking if event is live:", error);
      return false;
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Date TBD";
    }
  };

  // Format time helper
  const formatEventTime = (eventData: LiveEventData) => {
    try {
      const startTime = `${eventData.start_time}:${eventData.start_minute_time} ${eventData.start_time_type}`;
      const endTime = `${eventData.end_time}:${eventData.end_minute_time} ${eventData.end_time_type}`;
      return `${startTime} - ${endTime}`;
    } catch {
      return "";
    }
  };

  // Filter attendees based on search query
  const filteredAttendees = joinedAttendees.filter((attendee) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const fullName =
      `${attendee.first_name} ${attendee.last_name}`.toLowerCase();
    const email = attendee.email_id?.toLowerCase() || "";
    const phone = attendee.phone_number?.toLowerCase() || "";

    return (
      fullName.includes(query) || email.includes(query) || phone.includes(query)
    );
  });

  // Debug mode - Show when in development (comment out in production)
  // const isDevelopment = process.env.NODE_ENV === "development";

  // Show debug info in development
  // if (isDevelopment && debugInfo && !liveEventData) {
  //   return (
  //     <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-gray-600 to-gray-700 p-6 text-white shadow-xl border-2 border-yellow-400">
  //       <div className="space-y-3">
  //         <div className="flex items-center gap-2">
  //           <span className="inline-flex items-center rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-black">
  //             DEBUG MODE
  //           </span>
  //           <h3 className="text-lg font-bold">Event Status</h3>
  //         </div>
  //         <div className="bg-black/30 rounded-lg p-4 text-xs font-mono">
  //           <p className="mb-2">
  //             <strong>User Mobile:</strong> {user?.mobileNumber || "Not found"}
  //           </p>
  //           <p className="mb-2">
  //             <strong>Events Count:</strong> {events.length}
  //           </p>
  //           {latestAttendedEvent && (
  //             <>
  //               <p className="mb-2">
  //                 <strong>Latest Event UUID:</strong>{" "}
  //                 {latestAttendedEvent.eventUUID}
  //               </p>
  //               <p className="mb-2">
  //                 <strong>Event Title:</strong> {latestAttendedEvent.eventTitle}
  //               </p>
  //             </>
  //           )}
  //           <p className="mb-2">
  //             <strong>API Response:</strong>
  //           </p>
  //           <pre className="overflow-auto max-h-40 text-[10px]">
  //             {JSON.stringify(debugInfo, null, 2)}
  //           </pre>
  //         </div>
  //         {error && <p className="text-red-300 text-sm">⚠️ {error}</p>}
  //         <p className="text-sm text-gray-300">
  //           💡 This debug card appears because the event is not live. Remove or
  //           comment out the debug section for production.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  useEffect(() => {
    if (!latestAttendedEvent?.eventUUID) return;

    axios
      .post(
        `${domain}/api/totalattendees-list/${latestAttendedEvent.eventUUID}`
      )
      .then((res) => {
        if (res.data.status === 200) {
          setJoinedAttendees(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching joined attendees:", err);
      });
  }, [latestAttendedEvent?.eventUUID]);

  // Loading state
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-xl">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading event details...</span>
        </div>
      </div>
    );
  }

  // Don't render if no live event
  if (!liveEventData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Live Event Box */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-indigo-100 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-green-500 px-3 py-1 text-xs font-bold backdrop-blur-sm shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                LIVE NOW
              </span>
              {latestAttendedEvent?.status && (
                <span className="inline-flex capitalize items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  {latestAttendedEvent.status}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              {liveEventData.title}
            </h1>

            <p className="max-w-2xl text-indigo-100 text-sm md:text-base">
              {liveEventData.description || "You are confirmed for this event."}
            </p>

            <div className="flex flex-wrap gap-3 text-sm">
              {liveEventData.event_start_date && (
                <div className="flex items-center gap-1.5 text-indigo-200">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(liveEventData.event_start_date)}
                    {liveEventData.event_end_date &&
                      liveEventData.event_start_date !==
                        liveEventData.event_end_date &&
                      ` - ${formatDate(liveEventData.event_end_date)}`}
                  </span>
                </div>
              )}
              {formatEventTime(liveEventData) && (
                <div className="flex items-center gap-1.5 text-indigo-200">
                  <span>🕒 {formatEventTime(liveEventData)}</span>
                </div>
              )}
              {(liveEventData.event_venue_name || liveEventData.city) && (
                <div className="flex items-center gap-1.5 text-indigo-200">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {liveEventData.event_venue_name || liveEventData.city}
                  </span>
                </div>
              )}
            </div>

            {/* Add View Event Link */}
            {liveEventData.slug && (
              <Link
                to={`/events/${liveEventData.slug}`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
              >
                <span>View Event Details</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </div>

          {attendeeStats && (
            <div className="flex items-center gap-3 md:gap-4">
              {attendeeStats.speakerCount > 0 && (
                <div className="text-center rounded-xl bg-white/10 p-3 backdrop-blur-sm min-w-[70px]">
                  <p className="text-xl md:text-2xl font-bold">
                    {attendeeStats.speakerCount}
                  </p>
                  <p className="text-xs text-indigo-200">Speakers</p>
                </div>
              )}
              <div className="text-center rounded-xl bg-white/10 p-3 backdrop-blur-sm min-w-[70px]">
                <p className="text-xl md:text-2xl font-bold">
                  {attendeeStats.total_attendees}
                </p>
                <p className="text-xs text-indigo-200">Attendees</p>
              </div>
              {attendeeStats.agendaCount > 0 && (
                <div className="text-center rounded-xl bg-white/10 p-3 backdrop-blur-sm min-w-[70px]">
                  <p className="text-xl md:text-2xl font-bold">
                    {attendeeStats.agendaCount}
                  </p>
                  <p className="text-xs text-indigo-200">Sessions</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Featured Attendees Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Checked in Attendees
            </h2>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                View all ({joinedAttendees.length}) →
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  All Attendees ({filteredAttendees.length})
                </DialogTitle>
                <DialogDescription>
                  Browse all attendees who have joined this event
                </DialogDescription>
              </DialogHeader>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Attendee Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              {/* Attendee List */}
              <div className="flex-1 capitalize overflow-y-auto space-y-3 pr-2">
                {filteredAttendees.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      No attendees found matching your search
                    </p>
                  </div>
                ) : (
                  filteredAttendees.map((attendee) => (
                    <div
                      key={attendee._id}
                      className="group relative overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
                    >
                      <div
                        className="flex items-start gap-4 cursor-pointer"
                        onClick={() => navigate(`/profile/${attendee.first_name}-${attendee.last_name}-${attendee._id}`)}
                      >
                        <div className="relative h-14 w-14 shrink-0">
                          {attendee?.image?.trim() ? (
                            <img
                              src={getUserProfileImage(
                                user?.imageBaseUrl as string,
                                attendee.image
                              )}
                              alt={`${attendee.first_name} ${attendee.last_name}`}
                              className="h-full w-full rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                            />
                          ) : (
                            <div className="h-full uppercase w-full rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg ring-2 ring-white dark:ring-gray-800">
                              {attendee.first_name.charAt(0)}
                              {attendee.last_name.charAt(0)}
                            </div>
                          )}
                          {attendee.check_in === 1 && (
                            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800">
                              <span className="h-2 w-2 rounded-full bg-white"></span>
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {attendee.first_name} {attendee.last_name}
                            </h3>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0
                                ${
                                  attendee.status.toLowerCase() === "speaker" ||
                                  attendee.status.toLowerCase() === "panelist"
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                    : attendee.status.toLowerCase() ===
                                      "sponsor"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                    : "bg-blue-100 text-primary dark:bg-blue-900/30 dark:text-primary-light"
                                }`}
                            >
                              {attendee.status}
                            </span>
                          </div>

                          {attendee.job_title && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {attendee.job_title}
                            </p>
                          )}

                          {attendee.company_name && (
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate mb-2">
                              {attendee.company_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {joinedAttendees.slice(0, 3).map((attendee) => (
            <div
              key={attendee._id}
              className="group relative overflow-hidden capitalize rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
            >
              <div
                className="flex items-start gap-4"
                onClick={() => navigate(`/profile/${attendee.first_name}-${attendee.last_name}-${attendee._id}`)}
              >
                <div className="relative h-12 w-12 shrink-0">
                  {attendee?.image ? (
                    <img
                      src={getUserProfileImage(
                        user?.imageBaseUrl as string,
                        attendee.image
                      )}
                      alt={`${attendee.first_name} ${attendee.last_name}`}
                      className="h-full w-full rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                    />
                  ) : (
                    <div className="h-full w-full capitalize rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-gray-800">
                      {attendee.first_name.charAt(0)}
                      {attendee.last_name.charAt(0)}
                    </div>
                  )}
                  {attendee.check_in === 1 && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate capitalize font-medium text-gray-900 dark:text-white">
                      {attendee.first_name} {attendee.last_name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0
                        ${
                          attendee.status.toLowerCase() === "speaker" ||
                          attendee.status.toLowerCase() === "panelist"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : attendee.status.toLowerCase() === "sponsor"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-blue-100 text-primary dark:bg-blue-900/30 dark:text-primary"
                        }`}
                    >
                      {attendee.status}
                    </span>
                  </div>
                  {attendee.job_title && (
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {attendee.job_title}
                    </p>
                  )}
                  {attendee.company_name && (
                    <p className="truncate text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {attendee.company_name}
                    </p>
                  )}
                </div>
              </div>

              {/* <div className="mt-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="flex-1 rounded-lg bg-gray-100 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
                  View Profile
                </button>
                <button className="flex-1 rounded-lg bg-indigo-50 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors">
                  Connect
                </button>
              </div> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventHighlight;
