import React, { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function EventImageLightbox() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const { images, loading, error } = useAppSelector(
    (state) => state.eventImages
  );

  const openLightbox = (index: any) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex === null || prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex === null || prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      if (e.key === "ArrowLeft") {
        setSelectedImageIndex((prevIndex) =>
          prevIndex === null || prevIndex === 0
            ? images.length - 1
            : prevIndex - 1
        );
      }
      if (e.key === "ArrowRight") {
        setSelectedImageIndex((prevIndex) =>
          prevIndex === null || prevIndex === images.length - 1
            ? 0
            : prevIndex + 1
        );
      }
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, images.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white mt-4">Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Event Images Gallery
        </h1>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openLightbox(index)}
              className="relative overflow-hidden rounded-lg cursor-pointer group"
            >
              <img
                src={image.imageUrl}
                alt={`Event ${index + 1}`}
                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-semibold">
                  Click to view
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
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

            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center px-4">
              <img
                src={images[selectedImageIndex].imageUrl}
                alt={`Slide ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
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

            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
