import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAttendedEvents, type AttendedEvent } from "@/app-api/attendedEvents";
import { domain } from "@/constants";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Event } from "@/types";

export interface AttendedEventCardProps {
  event: AttendedEvent;
  onImageError?: (eventId: string) => void;
}

export const AttendedEventCard: React.FC<AttendedEventCardProps> = ({ event, onImageError }) => {
  const navigate = useNavigate();

  // Safety check - should never reach here if parent filters correctly
  if (!event.eventImageUrl || event.eventImageUrl.trim() === "") {
    return null;
  }

  const eventImageUrl = `${domain}/${event.eventImageUrl}`;

  const handleClick = async() => {
    try {
      const response = await axios.get(`${domain}/api/all_events`);
      const filteredEvent = response.data.data.filter((e: Event) => e.uuid === event.eventUUID)[0];
      if (filteredEvent) {
        navigate(`/events/${filteredEvent.slug}`);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const handleImageError = () => {
    // Call parent function to remove this event from display
    if (onImageError) {
      onImageError(event.eventUUID || event._id || "");
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative rounded-2xl border border-white/50 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 h-72 cursor-pointer transform hover:-translate-y-2"
    >
      {/* Image with zoom effect */}
      <img
        src={eventImageUrl}
        alt={event.eventTitle}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={handleImageError}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Award badge */}
      {event.awardWinner && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-linear-to-r from-yellow-400 to-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
            <span className="text-sm">🏆</span>
            Winner
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 transform transition-transform duration-300">
        <div className="space-y-3">
          {/* Status badge */}
          <div className="inline-block">
            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide border border-white/30">
              {event.status}
            </span>
          </div>
          
          {/* Title */}
          <h4 className="font-bold text-white text-lg leading-tight line-clamp-2 drop-shadow-lg">
            {event.eventTitle}
          </h4>
          
          {/* Hover indicator */}
          <div className="flex items-center gap-2 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm">View Details</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="relative rounded-2xl overflow-hidden h-72 bg-gray-200 animate-pulse">
    <div className="absolute inset-0 bg-linear-to-t from-gray-300 to-transparent"></div>
    <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
      <div className="h-6 bg-gray-300 rounded w-20"></div>
      <div className="h-5 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>
);

const MyAttendedEvents: React.FC = () => {
  const dispatch = useAppDispatch();
  const { events, loading } = useAppSelector((s) => s.attendedEvents);
  const { user } = useAppSelector((s) => s.auth);
  
  const [failedEventImages, setFailedEventImages] = useState<string[]>([]);

  useEffect(() => {
    if (user?.mobileNumber) {
      dispatch(fetchAttendedEvents({ mobileNumber: user.mobileNumber }));
    }
  }, [dispatch, user?.mobileNumber]);

  const handleEventImageError = (eventId: string) => {
    setFailedEventImages((prev) => [...prev, eventId]);
  };

  // Filter events with valid images and sort by checkInTime (latest first)
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

    // Sort by checkInTime - newest first
    return filtered.sort((a, b) => {
      const dateA = new Date(a.checkInTime).getTime();
      const dateB = new Date(b.checkInTime).getTime();
      return dateB - dateA; // Descending order (latest first)
    });
  }, [events, failedEventImages]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen bg-linear-to-br bg-background">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl lg:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8">
            My Attended Events
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-linear-to-br bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-2xl lg:text-3xl font-bold bg-linear-to-r  bg-clip-text  mb-2">
            My Attended Events
          </h3>
          {/* <p className="text-gray-600">Your event journey and achievements</p> */}
        </div>
        {/* Events Grid */}
        {eventsWithImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsWithImages.map((event) => (
              <AttendedEventCard 
                key={event._id} 
                event={event}
                onImageError={handleEventImageError}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 mb-6 rounded-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">No Events Yet</h4>
            <p className="text-gray-500 text-center max-w-md">
              Start your journey by attending exciting events and they'll appear here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttendedEvents;