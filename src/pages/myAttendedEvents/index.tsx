import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAttendedEvents,
  type AttendedEvent,
} from "@/app-api/attendedEvents";
import { domain } from "@/constants";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { Event } from "@/types";
import { Button } from "@/components/ui/button";

export interface AttendedEventCardProps {
  event: AttendedEvent;
  onImageError?: (eventId: string) => void;
}

export const AttendedEventCard: React.FC<AttendedEventCardProps> = ({
  event,
  onImageError,
}) => {
  const navigate = useNavigate();

  if (!event.eventImageUrl || event.eventImageUrl.trim() === "") {
    return null;
  }

  const eventImageUrl = `${domain}/${event.eventImageUrl}`;

  const handleClick = async () => {
    try {
      const response = await axios.get(`${domain}/api/all_events`);
      const filteredEvent = response.data.data.filter(
        (e: Event) => e.uuid === event.eventUUID,
      )[0];
      if (filteredEvent) {
        navigate(`/events/${filteredEvent.slug}`);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const handleImageError = () => {
    if (onImageError) {
      onImageError(event.eventUUID || event._id || "");
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative rounded-xl border border-white/50 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 h-48 cursor-pointer transform hover:-translate-y-1"
    >
      <img
        src={eventImageUrl}
        alt={event.eventTitle}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={handleImageError}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>

      {event.awardWinner && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-linear-to-r from-yellow-400 to-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <span className="text-xs">🏆</span>
            Winner
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="space-y-1.5">
          <div className="inline-block">
            <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide border border-white/30">
              {event.status}
            </span>
          </div>
          <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-lg">
            {event.eventTitle}
          </h4>
          <div className="flex items-center gap-1.5 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs">View Details</span>
            <svg
              className="w-3 h-3 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="relative rounded-xl overflow-hidden h-48 bg-gray-200 animate-pulse">
    <div className="absolute inset-0 bg-linear-to-t from-gray-300 to-transparent"></div>
    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-16"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    </div>
  </div>
);

const EVENTS_PER_PAGE = 6;

const MyAttendedEvents: React.FC = () => {
  const dispatch = useAppDispatch();
  const { events, loading } = useAppSelector((s) => s.attendedEvents);
  const { user } = useAppSelector((s) => s.auth);

  const [failedEventImages, setFailedEventImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user?.mobileNumber) {
      dispatch(fetchAttendedEvents({ mobileNumber: user.mobileNumber }));
    }
  }, [dispatch, user?.mobileNumber]);

  const handleEventImageError = (eventId: string) => {
    setFailedEventImages((prev) => [...prev, eventId]);
  };

  const eventsWithImages = useMemo(() => {
    const filtered = events.filter((event) => {
      const eventId = event.eventUUID || event._id || "";
      const hasImageUrl =
        event.eventImageUrl &&
        typeof event.eventImageUrl === "string" &&
        event.eventImageUrl.trim() !== "";
      const imageNotFailed = !failedEventImages.includes(eventId);
      return hasImageUrl && imageNotFailed;
    });
    return filtered.sort((a, b) => {
      const dateA = new Date(a.checkInTime).getTime();
      const dateB = new Date(b.checkInTime).getTime();
      return dateB - dateA;
    });
  }, [events, failedEventImages]);

  const totalPages = Math.ceil(eventsWithImages.length / EVENTS_PER_PAGE);

  const paginatedEvents = useMemo(() => {
    const indexOfLast = currentPage * EVENTS_PER_PAGE;
    const indexOfFirst = indexOfLast - EVENTS_PER_PAGE;
    return eventsWithImages.slice(indexOfFirst, indexOfLast);
  }, [eventsWithImages, currentPage]);

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-5">
            My Attended Events
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    /*
      The page wrapper uses flexbox column + min-h-screen so the inner content
      stretches to fill the viewport. The content area also grows (flex-1) so
      the pagination wrapper is always pushed to the same vertical position
      regardless of how many cards are on the current page.
    */
    <div className="p-4 lg:p-6 min-h-screen bg-background flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1">
        <div className="mb-5">
          <h3 className="text-xl lg:text-2xl font-bold mb-1.5">
            My Attended Events
          </h3>
        </div>

        {eventsWithImages.length > 0 ? (
          <div className="flex flex-col flex-1">
            {/*
              The grid has a fixed minimum height = 2 card rows (each 12rem / h-48)
              + 1 gap (1rem). This prevents the grid from shrinking on the last page
              when there are fewer than 6 events, which was causing the pagination
              to float upward.
            */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              style={{ minHeight: "25rem", alignContent: "start" }}
            >
              {paginatedEvents.map((event) => (
                <AttendedEventCard
                  key={event._id}
                  event={event}
                  onImageError={handleEventImageError}
                />
              ))}
            </div>

            {/* mt-auto pushes pagination to the very bottom of the flex column */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 sm:gap-3 mt-auto pt-8 pb-4">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="px-3 sm:px-4 cursor-pointer"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>

                <div className="flex items-center gap-1 sm:gap-2">
                  {(() => {
                    const pages: number[] = [];
                    if (totalPages <= 3) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      if (currentPage === 1) {
                        pages.push(1, 2, 3);
                      } else if (currentPage === totalPages) {
                        pages.push(totalPages - 2, totalPages - 1, totalPages);
                      } else {
                        pages.push(
                          currentPage - 1,
                          currentPage,
                          currentPage + 1,
                        );
                      }
                    }
                    return pages.map((pageNum) => (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        size="sm"
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-xs sm:text-sm cursor-pointer"
                      >
                        {pageNum}
                      </Button>
                    ));
                  })()}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="px-3 sm:px-4 cursor-pointer"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-1.5">
              No Events Yet
            </h4>
            <p className="text-gray-500 text-center text-sm max-w-md">
              Start your journey by attending exciting events and they'll appear
              here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttendedEvents;
