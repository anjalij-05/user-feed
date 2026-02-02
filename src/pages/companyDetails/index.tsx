import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCompanies } from "@/app-api/company";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Globe, Users } from "lucide-react";
import LinkedinImage from "@/assets/linkedin.webp";
import { fetchCompanyEvents } from "@/app-api/company";

const CompanyDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { companies, companiesLoading } = useAppSelector((s) => s.company);
  const { companyEvents, loading: eventsLoading } = useAppSelector(
    (s) => s.event
  );
  // console.log("events:", companyEvents);

  const { companyName } = useParams<{ companyName: string }>();
  const decodedName = decodeURIComponent(companyName || "");
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  // Fetch companies on mount
  useEffect(() => {
    if (!decodedName) return;
    dispatch(fetchCompanies(decodedName));
  }, [dispatch, decodedName]);

  const companyDetails = useMemo(() => {
    if (!companies.length || !decodedName) return null;

    // Search by company name OR mappedTo array
    return companies.find((c) => {
      const companyNameMatch =
        c.company.trim().toLowerCase() === decodedName.trim().toLowerCase();

      // Check if mappedTo exists and search in it
      const mappedToMatch =
        c.mappedTo && Array.isArray(c.mappedTo)
          ? c.mappedTo.some(
              (mapped: string) =>
                mapped.trim().toLowerCase() === decodedName.trim().toLowerCase()
            )
          : false;

      return companyNameMatch || mappedToMatch;
    });
  }, [companies, decodedName]);

  useEffect(() => {
    setLogoError(false);
    setBannerError(false);
  }, [companyDetails?.companyLogo]);

  useEffect(() => {
    if (!companyDetails?.isRegistered) return;

    // isRegistered is your user_id
    dispatch(fetchCompanyEvents(companyDetails.isRegistered));
  }, [dispatch, companyDetails]);

  const sortedEvents = useMemo(() => {
    if (!companyEvents || companyEvents.length === 0) return [];

    return [...companyEvents].sort(
      (a: any, b: any) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );
  }, [companyEvents]);

  const visibleEvents = useMemo(() => {
    if (showAllEvents) return sortedEvents;
    return sortedEvents.slice(0, 4);
  }, [sortedEvents, showAllEvents]);

  const getCompanyInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length >= 2)
      return words[0][0].toUpperCase() + words[1][0].toUpperCase();
    return words[0][0].toUpperCase();
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getEventImage = (image?: string) =>
    image ? `${import.meta.env.VITE_API_URL}/${image}` : "";

  const handleFetchEmployees = () => {
    if (!companyDetails?.company) {
      return;
    }

    const encodedCompanyName = encodeURIComponent(companyDetails.company);
    navigate(`/company/${encodedCompanyName}/employees`);
  };

  if (companiesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!companyDetails) {
    return (
      <div className="text-center mt-6 px-4">
        <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <h1 className="text-2xl font-bold mb-2">{decodedName}</h1>
        <p className="text-gray-600 mb-4">No company details found</p>
        <Link to="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  console.log("Company Details:", {
    name: companyDetails.company,
    hasLogo: !!companyDetails.companyLogo,
    logo: companyDetails.companyLogo,
  });

  return (
    <div className="max-w-3xl mx-auto bg-muted rounded-2xl shadow my-6 overflow-hidden">
      {/* Header with background image */}
      <div className="relative">
        {/* Background banner with company logo OR company name */}
        <div
          className={`h-48 md:h-64 relative ${
            companyDetails.companyLogo && !bannerError
              ? "bg-cover bg-center"
              : ""
          }`}
          style={
            companyDetails.companyLogo && !bannerError
              ? {
                  backgroundImage: `url(${companyDetails.companyLogo})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}
          }
        >
          {/* Hidden image to detect banner load errors */}
          {companyDetails.companyLogo && !bannerError && (
            <img
              src={companyDetails.companyLogo}
              alt=""
              className="hidden"
              onError={() => setBannerError(true)}
            />
          )}

          {/* Show company name if no logo OR if banner image fails */}
          {(!companyDetails.companyLogo || bannerError) &&
            companyDetails.company && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/90">
                <h2 className="text-4xl md:text-5xl font-bold text-white capitalize text-center px-4 drop-shadow-lg">
                  {companyDetails.company}
                </h2>
              </div>
            )}

          {/* Overlay for better contrast if logo exists and loaded successfully */}
          {companyDetails.companyLogo && !bannerError && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30"></div>
          )}
        </div>

        {/* Avatar positioned to overlap the banner */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-white rounded-full shadow-lg bg-white">
            {companyDetails.companyLogo && !logoError ? (
              <AvatarImage
                src={companyDetails.companyLogo}
                alt={companyDetails.company}
                onError={() => setLogoError(true)}
              />
            ) : null}
            <AvatarFallback className="bg-primary capitalize text-white text-3xl md:text-4xl font-bold flex items-center justify-center">
              {getCompanyInitials(companyDetails.company)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Company info section - with padding top for avatar overlap */}
      <div className="pt-16 px-6 pb-6">
        <h1 className="text-2xl md:text-3xl capitalize font-bold text-foreground text-center mb-2">
          {companyDetails.company}
        </h1>

        {companyDetails.industry && (
          <p className="mt-1 text-muted-foreground capitalize text-center">
            {companyDetails.industry} | {companyDetails.companySize}
          </p>
        )}

        {companyDetails.headquarters && (
          <p className="mt-1 text-muted-foreground capitalize text-center">
            {companyDetails.headquarters}
          </p>
        )}

        {/* Company's employee list button */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleFetchEmployees}
            className="bg-primary capitalize cursor-pointer hover:bg-klout-primary-dark text-white px-6 py-3 flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            View Employees on {companyDetails.company}
          </Button>
        </div>

        {/* Links section with Tooltips */}
        <div className="flex mt-6 justify-center gap-4 md:gap-8 flex-wrap">
          <TooltipProvider>
            {/* Website */}
            {companyDetails.website && (
              <div className="grid place-content-center px-6 py-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={
                        companyDetails.website.startsWith("http")
                          ? companyDetails.website
                          : `https://${companyDetails.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium text-center hover:underline"
                    >
                      <div className="flex items-center justify-center">
                        <Globe className="w-10 h-10 text-accent-foreground cursor-pointer hover:scale-105 transition-transform" />
                      </div>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visit Website</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* LinkedIn */}
            {companyDetails.profileUrl && (
              <div className="flex flex-col items-center gap-2 px-6 py-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      className="text-primary font-medium text-center"
                      target="_blank"
                      rel="noreferrer"
                      href={
                        companyDetails.profileUrl.startsWith("http")
                          ? companyDetails.profileUrl
                          : `https://${companyDetails.profileUrl}`
                      }
                    >
                      <div className="w-12 h-12 flex items-center justify-center">
                        <img
                          src={LinkedinImage}
                          alt="LinkedIn Profile"
                          width={40}
                          height={40}
                          className="hover:scale-105 transition-transform"
                        />
                      </div>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View LinkedIn Profile</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </TooltipProvider>
        </div>

        {/* Overview Section */}
        {companyDetails.overview && (
          <>
            <hr className="my-6 border-gray-200" />
            <div className="mt-4">
              <h3 className="text-xl font-bold text-foreground mb-3">
                Overview
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {companyDetails.overview}
              </p>
            </div>
          </>
        )}

        {/* Events Section */}
        <div className="flex items-center justify-between mb-3 mt-6">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Events
          </h3>
          {sortedEvents.length > 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllEvents((prev) => !prev)}
              className="text-primary hover:bg-primary hover:text-white"
            >
              {showAllEvents ? "Show Less" : "View All Events"}
            </Button>
          )}
        </div>
        {eventsLoading ? (
          <p className="text-center text-muted-foreground">Loading events...</p>
        ) : visibleEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleEvents.map((event: any) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="border rounded-xl overflow-hidden bg-background hover:shadow-md transition"
                >
                  {event.image && (
                    <img
                      src={getEventImage(event.image)}
                      alt={event.title}
                      className="w-full h-40 object-cover"
                    />
                  )}

                  <div className="p-3 bg-accent-foreground/10">
                    <h4 className="font-semibold text-foreground line-clamp-2">
                      {event.title}
                    </h4>

                    <p className="text-sm text-muted-foreground mt-1">
                      📅 {formatDate(event.event_date)} • ⏰ {event.start_time}:
                      {event.start_minute_time} {event.start_time_type}
                    </p>

                    <p className="text-sm text-muted-foreground mt-1">
                      📍 {event.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center">
            No events available for this company
          </p>
        )}

        {/* News Section */}
        <hr className="my-6 border-gray-200" />
        <h3 className="text-xl font-bold text-foreground mb-3">News</h3>
        {companyDetails.news && companyDetails.news.length > 0 ? (
          <div className="space-y-3">
            {companyDetails.news.map((newsItem: any) => (
              <a
                key={newsItem._id}
                href={
                  newsItem.link.startsWith("http")
                    ? newsItem.link
                    : `https://${newsItem.link}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-lg border border-gray-200 hover:bg-accent transition"
              >
                <p className="font-semibold text-foreground mb-1">
                  {newsItem.title}
                </p>
                <p className="text-primary text-sm truncate">{newsItem.link}</p>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recent news available</p>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
