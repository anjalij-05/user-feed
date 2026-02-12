import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { domain } from "@/constants";
import Wave from "@/components/Wave";
import { Calendar, Globe, MapPin } from "lucide-react";
import { formatDateTime, isEventLive } from "@/lib/utils";
// import { Helmet } from "react-helmet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ExploreAllEvents: React.FC = () => {
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [combinedAllEvents, setCombinedAllEvents] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);
  const [pastCurrentPage, setPastCurrentPage] = useState(1);
  const [liveCurrentPage, setLiveCurrentPage] = useState(1);
  const [allCurrentPage, setAllCurrentPage] = useState(1);
  const eventsPerPage = 10;

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${domain}/api/all_events`)
      .then((res: any) => {
        const now = new Date(); // Current datetime with time
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Today at midnight for date-only comparisons

        const filteredEvents = res.data.data;

        const upcomingEvents = filteredEvents
          .filter((event: any) => {
            // Event is upcoming if start date hasn't arrived yet and it's not currently live
            const eventStartDate = new Date(event.event_start_date);
            eventStartDate.setHours(0, 0, 0, 0);
            return eventStartDate >= today && !isEventLive(event);
          })
          .sort((a: any, b: any) => {
            return (
              new Date(a.event_start_date).getTime() -
              new Date(b.event_start_date).getTime()
            );
          });

        const pastEvents = filteredEvents
          .filter((event: any) => {
            // Event is past only when the END datetime has passed (including time)
            if (!event.event_end_date) return false;

            const endTimeParts =
              `${event.end_time}:${event.end_minute_time} ${event.end_time_type}`.match(
                /(\d+):(\d+) (AM|PM)/i,
              );
            if (!endTimeParts) return false;

            const eventEndDate = new Date(event.event_end_date);
            let endHours = parseInt(endTimeParts[1]);
            if (endTimeParts[3].toUpperCase() === "PM" && endHours < 12)
              endHours += 12;
            if (endTimeParts[3].toUpperCase() === "AM" && endHours === 12)
              endHours = 0;
            eventEndDate.setHours(endHours, parseInt(endTimeParts[2]), 0, 0);

            return eventEndDate < now; // Compare with current time, not midnight
          })
          .sort((a: any, b: any) => {
            return (
              new Date(b.event_start_date).getTime() -
              new Date(a.event_start_date).getTime()
            );
          });

        const liveEvents = filteredEvents
          .filter((event: any) => {
            return isEventLive(event);
          })
          .sort((a: any, b: any) => {
            return (
              new Date(a.event_start_date).getTime() -
              new Date(b.event_start_date).getTime()
            );
          });

        const uniqueCities: any[] = Array.from(
          new Set(
            filteredEvents.map((event: any) => {
              return event?.city?.toLowerCase();
            }),
          ),
        );

        setCities(uniqueCities);
        setAllEvents(upcomingEvents);
        setPastEvents(pastEvents);
        setLiveEvents(liveEvents);
        setCombinedAllEvents([...liveEvents, ...upcomingEvents, ...pastEvents]);
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSelectChange = (value: string) => {
    setSelectedType(value);
    if (value === "upcoming") {
      setUpcomingCurrentPage(1);
    } else if (value === "past") {
      setPastCurrentPage(1);
    } else if (value === "live") {
      setLiveCurrentPage(1);
    } else if (value === "all") {
      setAllCurrentPage(1);
    }
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setUpcomingCurrentPage(1);
    setPastCurrentPage(1);
    setLiveCurrentPage(1);
    setAllCurrentPage(1);
  };

  const filterEvents = (events: any[]) => {
    let filtered = [...events];

    if (selectedCity !== "all") {
      filtered = filtered.filter(
        (event) =>
          event?.city?.toLowerCase() === selectedCity.replace(/-/g, " "),
      );
    }

    if (selectedMode !== "all") {
      const modeValue = parseInt(selectedMode);
      filtered = filtered.filter((event) => event.event_mode === modeValue);
    }

    return filtered;
  };

  const getCurrentEvents = () => {
    const eventsToFilter =
      selectedType === "all"
        ? combinedAllEvents
        : selectedType === "upcoming"
          ? allEvents
          : selectedType === "past"
            ? pastEvents
            : liveEvents;
    const filteredEvents = filterEvents(eventsToFilter);
    const currentPage =
      selectedType === "all"
        ? allCurrentPage
        : selectedType === "upcoming"
          ? upcomingCurrentPage
          : selectedType === "past"
            ? pastCurrentPage
            : liveCurrentPage;
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    return filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  };

  const totalPages = Math.ceil(
    filterEvents(
      selectedType === "all"
        ? combinedAllEvents
        : selectedType === "upcoming"
          ? allEvents
          : selectedType === "past"
            ? pastEvents
            : liveEvents,
    ).length / eventsPerPage,
  );

  const handlePageChange = (pageNum: number) => {
    if (selectedType === "upcoming") {
      setUpcomingCurrentPage(pageNum);
    } else if (selectedType === "past") {
      setPastCurrentPage(pageNum);
    } else if (selectedType === "live") {
      setLiveCurrentPage(pageNum);
    } else if (selectedType === "all") {
      setAllCurrentPage(pageNum);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCurrentPage = () => {
    return selectedType === "all"
      ? allCurrentPage
      : selectedType === "upcoming"
        ? upcomingCurrentPage
        : selectedType === "past"
          ? pastCurrentPage
          : liveCurrentPage;
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Wave />
      </div>
    );
  }

  return (
    <React.Fragment>
      {/* <Helmet>
        <title>
          Discover & Attend Top Business Events in India | Klout Club
        </title>
        <meta
          name="title"
          content="Discover & Attend Top Business Events in India | Klout Club"
        />
        <meta
          name="description"
          content="Explore exclusive corporate events, business summits, networking meetups, and industry conferences in India with Klout Club. Find top business summits, connect with professionals, and enhance your event experience."
        />
      </Helmet> */}
      <div className="w-full min-h-screen">
        {/* All events div */}
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:p-5">
          <div className="space-y-3 sm:space-y-5 py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl font-semibold leading-tight">
              All Events
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-accent-foreground">
              Explore popular events near you, browse by category, or check out
              some of the great community calendars.
            </p>
          </div>

          <div className="mt-6 sm:mt-10">
            {/* Filters - Responsive Stack */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <Select value={selectedType} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full h-10 cursor-pointer">
                    <SelectValue placeholder="Event Sort By" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/50">
                    <SelectGroup>
                      <SelectItem value="all" className="cursor-pointer">
                        All Events
                      </SelectItem>
                      <SelectItem value="live" className="cursor-pointer">
                        Live
                      </SelectItem>
                      <SelectItem value="upcoming" className="cursor-pointer">
                        Upcoming
                      </SelectItem>
                      <SelectItem value="past" className="cursor-pointer">
                        Past
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-0">
                <Select
                  value={selectedMode}
                  onValueChange={(value) => {
                    if (value === "1") {
                      setSelectedCity("all");
                    }
                    setSelectedMode(value);
                    setUpcomingCurrentPage(1);
                    setPastCurrentPage(1);
                    setLiveCurrentPage(1);
                    setAllCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full h-10 cursor-pointer">
                    <SelectValue placeholder="Select Event Mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/50">
                    <SelectGroup>
                      <SelectItem value="all" className="cursor-pointer">
                        All
                      </SelectItem>
                      <SelectItem value="0" className="cursor-pointer">
                        Offline
                      </SelectItem>
                      <SelectItem value="1" className="cursor-pointer">
                        Online
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-0">
                <Select
                  value={selectedCity.replace(/-/g, " ")}
                  onValueChange={handleCityChange}
                  disabled={selectedMode === "1"}
                >
                  <SelectTrigger className="w-full h-10 cursor-pointer">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/50">
                    <SelectGroup>
                      <SelectItem
                        value="all"
                        className="cursor-pointer capitalize"
                      >
                        All Cities
                      </SelectItem>
                      {cities.map((city, index) => (
                        <SelectItem
                          key={index}
                          value={city}
                          className="cursor-pointer capitalize"
                        >
                          {city}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {getCurrentEvents().map((event, index) => (
                <Link
                  to={`/events/${event.slug}`}
                  key={index}
                  className="group"
                >
                  <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-muted hover transition-all duration-200 group-hover:shadow-md">
                    <img
                      src={domain + "/" + event.image}
                      alt="event"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-xs sm:text-sm text-gray-500 leading-none truncate">
                        by {event?.company_name}
                      </p>
                      <h1 className="text-sm sm:text-base font-semibold leading-tight flex items-center gap-2 truncate">
                        <span className="truncate">{event.title}</span>{" "}
                        {isEventLive(event) && (
                          <Badge
                            variant="secondary"
                            className="rounded-full text-xs py-0.5 shrink-0"
                          >
                            Live
                          </Badge>
                        )}
                        {event.paid_event === 1 && (
                          <Badge className="rounded-full text-xs shrink-0">
                            Paid
                          </Badge>
                        )}
                      </h1>
                      <div className="flex gap-2 items-center">
                        <Calendar className="w-3 h-3 shrink-0 text-accent-foreground" />
                        <p className="text-xs font-light text-accent-foreground leading-none truncate">
                          {formatDateTime(event.event_start_date)} |{" "}
                          {event.start_time}:{event.start_minute_time}{" "}
                          {event.start_time_type} - {event.end_time}:
                          {event.end_minute_time} {event.end_time_type}
                        </p>
                      </div>
                      <div
                        hidden={event.event_mode == 1}
                        className="flex gap-2 items-center"
                      >
                        <MapPin className="w-3 h-3 text-accent-foreground shrink-0" />
                        <p className="text-xs font-light text-accent-foreground leading-none truncate">
                          {event.event_venue_name}
                        </p>
                      </div>
                      <div
                        hidden={event.event_mode == 0}
                        className="flex gap-2 items-center"
                      >
                        <Globe className="w-3 h-3 text-accent-foreground shrink-0" />
                        <p className="text-xs sm:text-sm font-light text-accent-foreground leading-none truncate">
                          Online
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination - Responsive */}
            <div className="flex justify-center items-center gap-2 sm:gap-3 my-8 sm:my-10">
              <Button
                onClick={() => handlePageChange(getCurrentPage() - 1)}
                disabled={getCurrentPage() === 1}
                variant="outline"
                className="px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>

              <div className="flex items-center gap-1 sm:gap-2">
                {(() => {
                  const currentPage = getCurrentPage();
                  const pages = [];

                  // Calculate which pages to show
                  if (totalPages <= 3) {
                    // Show all pages if 3 or fewer
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Show smart pagination
                    if (currentPage === 1) {
                      // At start: show 1, 2, 3
                      pages.push(1, 2, 3);
                    } else if (currentPage === totalPages) {
                      // At end: show last 3
                      pages.push(totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      // In middle: show previous, current, next
                      pages.push(currentPage - 1, currentPage, currentPage + 1);
                    }
                  }

                  return pages.map((pageNum) => (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      size="sm"
                      variant={currentPage === pageNum ? "default" : "outline"}
                      className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-xs sm:text-sm"
                    >
                      {pageNum}
                    </Button>
                  ));
                })()}
              </div>

              <Button
                onClick={() => handlePageChange(getCurrentPage() + 1)}
                disabled={getCurrentPage() === totalPages}
                variant="outline"
                className="px-3 sm:px-4"
              >
                Next
              </Button>
            </div>

            {/* No Events Message */}
            {getCurrentEvents().length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No events found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedCity("all");
                    setSelectedMode("all");
                    setSelectedType("upcoming");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ExploreAllEvents;
