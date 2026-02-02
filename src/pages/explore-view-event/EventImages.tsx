import { Button } from "@/components/ui/button";
import { additionalDomain, domain, photoBucketUrl } from "@/constants";
import { cn, getImageUrl } from "@/lib/utils";
import axios from "axios";
import DummyImage from "@/assets/dummy_image.webp";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Wave from "@/components/Wave";
import { AttendeeType } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
} from "lucide-react";
import { saveAs } from "file-saver";

interface EventImagesProps {
  eventUuid: string;
  userId: number;
  userImage: string;
}

const EventImages: React.FC<EventImagesProps> = ({
  eventUuid,
  userId,
  userImage,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [userImages, setUserImages] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("eventImages");
  const [loading, setLoading] = useState<boolean>(false);
  const [delegateAttendees, setDelegateAttendees] = useState<AttendeeType[]>(
    []
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // ✅ ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS

  // Fetch user images
  useEffect(() => {
    if (userImages.length > 0) return;
    setLoading(true);
    const imageUrl: string = `${photoBucketUrl}/${userImage}`;

    axios
      .post(`${additionalDomain}/api/v1/faces/match-image`, {
        eventUuid,
        userId,
        imageUrl,
      })
      .then((response) => {
        const images = response.data.matchedFaces.map(
          (item: any) => item.imageUrl
        );
        setUserImages(images);
      })
      .catch((error) => {
        console.error("Error fetching user images:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [eventUuid, userId, userImage, userImages.length]);

  // Fetch event images
  useEffect(() => {
    axios
      .post(`${additionalDomain}/api/v1/faces/all-photos`, {
        eventUuid,
        userId,
      })
      .then((response) => {
        const images = response.data.data.map((item: any) => item.imageUrl);
        setEventImages(images);
      })
      .catch((error) => {
        console.error("Error fetching event images:", error);
      });
  }, [eventUuid, userId]);

  // Fetch delegate attendees
  useEffect(() => {
    if (delegateAttendees.length > 0) return;

    axios
      .post(`${domain}/api/totalattendees-list/${eventUuid}`)
      .then((res) => {
        if (res.data.status === 200) {
          setDelegateAttendees(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching joined attendees:", err);
      });
  }, [eventUuid, delegateAttendees.length]);

  // Reset zoom when changing images
  useEffect(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [selectedImageIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      const currentImages = getCurrentImages();

      if (e.key === "ArrowLeft") {
        setSelectedImageIndex((prev) =>
          prev === 0 ? currentImages.length - 1 : prev! - 1
        );
      }
      if (e.key === "ArrowRight") {
        setSelectedImageIndex((prev) =>
          prev === currentImages.length - 1 ? 0 : prev! + 1
        );
      }
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, selectedTab, eventImages.length, userImages.length]);

  // ✅ NOW conditional returns are safe - all hooks have been called
  if (loading) {
    return <Wave />;
  }

  // Lightbox functions
  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const goToPrevious = () => {
    const currentImages = getCurrentImages();
    setSelectedImageIndex((prevIndex) =>
      prevIndex === null || prevIndex === 0
        ? currentImages.length - 1
        : prevIndex - 1
    );
  };

  const goToNext = () => {
    const currentImages = getCurrentImages();
    setSelectedImageIndex((prevIndex) =>
      prevIndex === null || prevIndex === currentImages.length - 1
        ? 0
        : prevIndex + 1
    );
  };

  const getCurrentImages = () => {
    if (selectedTab === "eventImages") return eventImages;
    if (selectedTab === "myImages") return userImages;
    return [];
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // Single image download
//  const handleDownload = async (imgPath: string) => {
//   try {
//     const fullUrl = `${photoBucketUrl}/${imgPath}`;
//     const filename = imgPath.split('/').pop() || `image-${Date.now()}.jpg`;
    
//     const response = await fetch(fullUrl, { mode: 'cors' });
//     if (!response.ok) throw new Error('Failed to fetch image');
    
//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(url);
//     document.body.removeChild(a);
//   } catch (error) {
//     console.error('Error downloading image:', error);
//     // Fallback: open in new tab
//     window.open(`${photoBucketUrl}/${imgPath}`, '_blank');
//   }
// };

  async function handleDownload(
    imageUrl: string,
    fileName?: string
  ): Promise<void> {
    console.log("The downloading image URL is:", imageUrl);
    try {
      const response = await fetch(imageUrl, {
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download =
        fileName || imageUrl.split("/").pop() || "downloaded-image";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Image download failed:", error);
    }

    const link = document.createElement("a");
    link.href = imageUrl;
    link.target = "_blank";
    link.download = fileName || imageUrl.split("/").pop() || "image";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Download all images
  const handleDownloadAllImages = async () => {
    const currentImages = getCurrentImages();

    if (currentImages.length === 0) {
      alert("No images to download");
      return;
    }

    if (currentImages.length > 10) {
      const confirmed = window.confirm(
        `You are about to download ${currentImages.length} images. Continue?`
      );
      if (!confirmed) return;
    }

    for (let i = 0; i < currentImages.length; i++) {
      const imagePath = currentImages[i];
      const imageUrl = `${photoBucketUrl}/${imagePath}`;
      const filename = imagePath.split("/").pop() || `image-${i + 1}.jpg`;

      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        saveAs(blob, filename);

        // Small delay to avoid browser blocking
        await new Promise((res) => setTimeout(res, 300));
      } catch (error) {
        console.error(`Failed to download image ${i + 1}:`, error);
      }
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const currentImages = getCurrentImages();

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg">Event Details</h3>
      <hr className="border-t-2 border-white my-2.5" />

      <Tabs
        defaultValue="eventImages"
        className="w-full"
        value={selectedTab}
        onValueChange={(value) => {
          setSelectedTab(value);
          setShowAll(false);
        }}
      >
        <TabsList className="h-10 mx-auto my-5">
          <TabsTrigger value="eventImages">Event Image</TabsTrigger>
          <TabsTrigger value="myImages">My Images</TabsTrigger>
          <TabsTrigger value="delegateImages">Delegate Images</TabsTrigger>
        </TabsList>

        <TabsContent value="eventImages">
          <div className="flex justify-end mb-3">
            <Button
              onClick={handleDownloadAllImages}
              className="flex items-center gap-2"
              size="sm"
            >
              <Download size={16} />
              Download All Images
            </Button>
          </div>
          <div
            className={cn(
              "grid grid-cols-3 relative gap-4",
              showAll ? "max-h-full" : "max-h-96 overflow-hidden"
            )}
          >
            {eventImages.map((src: string, index) => (
              <img
                key={index}
                src={`${photoBucketUrl}/${src}`}
                alt={`Event Image ${index + 1}`}
                loading="lazy"
                onClick={() => openLightbox(index)}
                className="w-full h-auto object-cover aspect-square rounded cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
            <div
              className={cn(
                "absolute w-full bottom-0 p-7 grid place-content-center",
                !showAll && "bg-linear-to-b from-transparent to-primary/50"
              )}
            >
              <Button onClick={() => setShowAll((prev) => !prev)}>
                {showAll ? "Show Less Images" : "Show All Images"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="myImages">
          <div className="flex justify-end mb-3">
            <Button
              onClick={handleDownloadAllImages}
              className="flex items-center gap-2"
              size="sm"
            >
              <Download size={16} />
              Download All Images
            </Button>
          </div>
          <div
            hidden={userImage.length === 0}
            className={cn(
              "grid grid-cols-3 relative gap-4",
              showAll ? "max-h-full" : "max-h-96 overflow-hidden"
            )}
          >
            {userImages.map((src: string, index) => (
              <img
                key={index}
                src={`${photoBucketUrl}/${src}`}
                alt={`Event Image ${index + 1}`}
                loading="lazy"
                onClick={() => openLightbox(index)}
                className="w-full h-auto object-cover aspect-square rounded cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
            <div
              className={cn(
                "absolute w-full bottom-0 p-7 grid place-content-center",
                !showAll && "bg-linear-to-b from-transparent to-primary/50"
              )}
            >
              <Button onClick={() => setShowAll((prev) => !prev)}>
                {showAll ? "Show Less Images" : "Show All Images"}
              </Button>
            </div>
          </div>
          <p hidden={userImage.length !== 0} className="py-10">
            No Images Found.
          </p>
        </TabsContent>

        <TabsContent value="delegateImages">
          <div
            hidden={delegateAttendees.length === 0}
            className={cn(
              "grid grid-cols-3 relative gap-4",
              showAll ? "max-h-full" : "max-h-96 overflow-hidden"
            )}
          >
            {delegateAttendees.map((item: AttendeeType, index) =>
              item?.image?.trim() ? (
                <div key={index} className="flex flex-col capitalize">
                  <img
                    src={getImageUrl(item.image) || DummyImage}
                    alt={`Event Image ${index + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-cover aspect-square rounded"
                  />
                  <div className="p-2 text-sm flex flex-col gap-1 justify-center min-h-[72px]">
                    <h4
                      className="font-semibold text-sm leading-5 line-clamp-2"
                      title={`${item.first_name} ${item.last_name}`}
                    >
                      {item.first_name} {item.last_name}
                    </h4>
                    <p
                      className="text-xs text-gray-300 line-clamp-1"
                      title={item.job_title || "Position not specified"}
                    >
                      {item.job_title || "Position not specified"}
                    </p>
                    <p
                      className="text-xs text-gray-300 line-clamp-1"
                      title={item.company_name || "Company not specified"}
                    >
                      {item.company_name || "Company not specified"}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={index} className="flex flex-col capitalize">
                  <img
                    src={DummyImage}
                    alt={`Event Image ${index + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-cover aspect-square rounded"
                  />
                  <div className="p-2 text-sm flex flex-col gap-1 justify-center min-h-[72px]">
                    <h4
                      className="font-semibold text-sm leading-5 line-clamp-2"
                      title={`${item.first_name} ${item.last_name}`}
                    >
                      {item.first_name} {item.last_name}
                    </h4>
                    <p
                      className="text-xs text-gray-300 line-clamp-1"
                      title={item.job_title || "Position not specified"}
                    >
                      {item.job_title || "Position not specified"}
                    </p>
                    <p
                      className="text-xs text-gray-300 line-clamp-1"
                      title={item.company_name || "Company not specified"}
                    >
                      {item.company_name || "Company not specified"}
                    </p>
                  </div>
                </div>
              )
            )}
            <div
              className={cn(
                "absolute w-full bottom-0 p-7 grid place-content-center",
                !showAll && "bg-linear-to-b from-transparent to-primary/50"
              )}
            >
              <Button onClick={() => setShowAll((prev) => !prev)}>
                {showAll ? "Show Less Images" : "Show All Images"}
              </Button>
            </div>
          </div>
          <p hidden={delegateAttendees.length !== 0} className="py-10">
            No Images Found.
          </p>
        </TabsContent>
      </Tabs>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && currentImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X size={32} />
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 5}
                className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Zoom in"
              >
                <ZoomIn size={24} />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Zoom out"
              >
                <ZoomOut size={24} />
              </button>
              <button
                onClick={handleResetZoom}
                disabled={zoomLevel === 1}
                className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Reset zoom"
              >
                <RotateCcw size={24} />
              </button>
              <button
                onClick={() =>
                  handleDownload(
                    `${photoBucketUrl}/${currentImages[selectedImageIndex]}`
                  )
                }
                className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70 transition-all"
                aria-label="Download image"
              >
                <Download size={24} />
              </button>
            </div>

            {/* Main Image */}
            <div
              className="relative w-full h-full flex items-center justify-center px-4 overflow-hidden"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                cursor:
                  zoomLevel > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
              }}
            >
              <img
                src={`${photoBucketUrl}/${currentImages[selectedImageIndex]}`}
                alt={`Slide ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform select-none"
                style={{
                  transform: `scale(${zoomLevel}) translate(${
                    position.x / zoomLevel
                  }px, ${position.y / zoomLevel}px)`,
                  transformOrigin: "center center",
                }}
                draggable={false}
              />

              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 text-white hover:text-gray-300 transition-colors disabled:opacity-50"
                aria-label="Previous image"
              >
                <ChevronLeft size={48} />
              </button>

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="absolute right-4 text-white hover:text-gray-300 transition-colors disabled:opacity-50"
                aria-label="Next image"
              >
                <ChevronRight size={48} />
              </button>
            </div>

            {/* Image Counter and Zoom Level */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded">
              <span>
                {selectedImageIndex + 1} / {currentImages.length}
              </span>
              {zoomLevel > 1 && (
                <span className="border-l border-white pl-4">
                  {Math.round(zoomLevel * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventImages;