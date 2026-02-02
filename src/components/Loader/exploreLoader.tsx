import { MapPin, Users, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ExploreLoader = () => {
  return (
    <div className="max-w-7xl mx-auto mt-5 bg-white rounded-xl shadow-lg p-8">
      {/* Map Skeleton */}
      <div className="w-full h-[300px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg mb-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <MapPin className="w-16 h-16 text-blue-400 animate-bounce" />
            <div className="absolute -inset-4">
              <div className="w-24 h-24 border-4 border-blue-300 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
        </div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="w-full sm:w-1/2 flex gap-2">
          <Skeleton className="flex-1 h-10 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-lg" />
        </div>
      </div>

      {/* Loading Text */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <p className="text-lg font-medium text-gray-700">
          Discovering nearby professionals...
        </p>
      </div>

      {/* Profile Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between border rounded-xl p-4 shadow-md bg-gray-50"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* Avatar Skeleton */}
              <Skeleton className="w-20 h-20 rounded-full" />

              {/* Text Content Skeleton */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>

            {/* Action Button Skeleton */}
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-16 h-12 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Pulsing Connection Indicator */}
      <div className="fixed bottom-8 right-8 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-blue-200">
        <div className="relative">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
        </div>
        <span className="text-sm font-medium text-gray-700">Searching...</span>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default ExploreLoader;