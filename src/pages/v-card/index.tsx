import React, { useState, useRef } from "react";
import { useAppSelector } from "@/redux/hooks";
import DummyImage from "@/assets/dummy_image.webp";
import { getUserProfileImage } from "@/lib/utils";
import logo from "@/assets/logo.webp";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const VCard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const profileImg = user?.profileImage
    ? getUserProfileImage(user.imageBaseUrl, user.profileImage)
    : DummyImage;

  const shareUrl = user?._id
    ? `https://klout.club/profile/${(user.first_name || "").toLowerCase().replace(/\s+/g, "-")}-${(user.last_name || "").toLowerCase().replace(/\s+/g, "-")}-${user._id}`
    : "https://klout.club";

  const firstName = user?.first_name || "Guest";
  const lastName = user?.last_name || "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if ("share" in navigator) {
      try {
        await navigator.share({
          title: `${firstName} ${lastName} | Klout Club`,
          text: `Check out ${firstName} ${lastName}'s profile on Klout Club`,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const domtoimage = (await import("dom-to-image-more")).default;

      const filename = `${firstName}-${lastName}-klout-card.png`
        .toLowerCase()
        .replace(/\s+/g, "-");

      // Inject a temporary <style> that resets Tailwind base borders/outlines/rings
      // which show up as grey lines in the captured image
      const resetStyle = document.createElement("style");
      resetStyle.id = "__vcard_reset__";
      resetStyle.textContent = `
        #__vcard_capture__ *,
        #__vcard_capture__ *::before,
        #__vcard_capture__ *::after {
          outline: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
          --tw-ring-color: transparent !important;
          --tw-ring-shadow: none !important;
          --tw-shadow: none !important;
        }
        #__vcard_capture__ .border,
        #__vcard_capture__ [class*="border-"] {
          border-color: transparent !important;
        }
        #__vcard_capture__ p,
        #__vcard_capture__ h1,
        #__vcard_capture__ div {
          border: none !important;
          outline: none !important;
        }
      `;
      document.head.appendChild(resetStyle);

      const blob = await domtoimage.toBlob(cardRef.current, {
        scale: 3,
        bgcolor: "#ffffff",
        style: {
          "--background": "#ffffff",
          "--foreground": "#111827",
          "--card": "#ffffff",
          "--card-foreground": "#111827",
          "--primary": "#7c3aed",
          "--primary-foreground": "#ffffff",
          "--secondary": "#f3f0ff",
          "--secondary-foreground": "#4c1d95",
          "--muted": "#f5f3ff",
          "--muted-foreground": "#6b7280",
          "--accent": "#ede9fe",
          "--accent-foreground": "#4c1d95",
          "--destructive": "#ef4444",
          "--border": "#e5e7eb",
          "--input": "#e5e7eb",
          "--ring": "#7c3aed",
        },
      });

      // Remove the reset style immediately after capture
      document.head.removeChild(resetStyle);

      if (!blob) {
        toast.error("Failed to generate image.");
        setIsDownloading(false);
        return;
      }

      const blobUrl = URL.createObjectURL(blob);

      // Only use native share on mobile devices, not desktop
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (
        isMobile &&
        navigator.canShare &&
        navigator.canShare({ files: [new File([blob], filename, { type: "image/png" })] })
      ) {
        const file = new File([blob], filename, { type: "image/png" });
        navigator
          .share({ files: [file], title: `${firstName} ${lastName} | Klout Club` })
          .catch(() => triggerDownloadLink(blobUrl, filename))
          .finally(() => {
            URL.revokeObjectURL(blobUrl);
            setIsDownloading(false);
          });
        return;
      }

      // Desktop and all other browsers — direct file download
      triggerDownloadLink(blobUrl, filename);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      toast.success("Card downloaded!");
      setIsDownloading(false);
    } catch (err) {
      // Clean up reset style if it's still in the DOM
      const leftover = document.getElementById("__vcard_reset__");
      if (leftover) document.head.removeChild(leftover);
      console.error(err);
      toast.error("Failed to download card. Please try again.");
      setIsDownloading(false);
    }
  };

  const triggerDownloadLink = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="relative flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden"
      style={{ minHeight: "calc(100vh - 112px)", width: "100%", position: "relative" }}
    >
      {/* ── Background — fixed so it truly fills the viewport ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, #ede9fe 0%, transparent 60%), radial-gradient(ellipse 70% 70% at 85% 90%, #f3e8ff 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 60% 40%, #faf5ff 0%, transparent 70%), #f9f7ff",
        }}
      />

      {/* Animated floating blobs */}
      <div
        style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}
        aria-hidden="true"
      >
        {/* Blob 1 — top-left */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-8%",
            width: "clamp(200px, 40vw, 420px)",
            height: "clamp(200px, 40vw, 420px)",
            borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%",
            background:
              "linear-gradient(135deg, rgba(167,139,250,0.30) 0%, rgba(196,181,253,0.14) 100%)",
            animation: "blobFloat1 10s ease-in-out infinite",
            filter: "blur(2px)",
          }}
        />

        {/* Blob 2 — bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "-12%",
            right: "-10%",
            width: "clamp(180px, 38vw, 400px)",
            height: "clamp(180px, 38vw, 400px)",
            borderRadius: "40% 60% 30% 70% / 60% 40% 60% 40%",
            background:
              "linear-gradient(225deg, rgba(139,92,246,0.20) 0%, rgba(216,180,254,0.15) 100%)",
            animation: "blobFloat2 13s ease-in-out infinite",
            filter: "blur(3px)",
          }}
        />

        {/* Blob 3 — center-right accent */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            right: "5%",
            width: "clamp(100px, 18vw, 200px)",
            height: "clamp(100px, 18vw, 200px)",
            borderRadius: "50% 50% 40% 60% / 40% 60% 50% 50%",
            background:
              "linear-gradient(180deg, rgba(192,132,252,0.25) 0%, rgba(167,139,250,0.12) 100%)",
            animation: "blobFloat3 8s ease-in-out infinite",
            filter: "blur(1px)",
          }}
        />

        {/* Subtle grid dots overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(139,92,246,0.12) 1px, transparent 1px)",
            backgroundSize: "clamp(24px, 4vw, 40px) clamp(24px, 4vw, 40px)",
          }}
        />

        {/* Top-right glare */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "clamp(120px, 30vw, 300px)",
            height: "clamp(120px, 30vw, 300px)",
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.60) 0%, transparent 70%)",
          }}
        />

        {/* Bottom-left glare */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "clamp(100px, 25vw, 260px)",
            height: "clamp(100px, 25vw, 260px)",
            background:
              "radial-gradient(circle at bottom left, rgba(255,255,255,0.45) 0%, transparent 70%)",
          }}
        />

        {/* Thin decorative ring — large, top-right */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            right: "-12%",
            width: "clamp(250px, 55vw, 600px)",
            height: "clamp(250px, 55vw, 600px)",
            borderRadius: "50%",
            border: "1.5px solid rgba(139,92,246,0.20)",
            animation: "ringRotate 30s linear infinite",
          }}
        />

        {/* Thin decorative ring — small, bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-8%",
            width: "clamp(160px, 32vw, 360px)",
            height: "clamp(160px, 32vw, 360px)",
            borderRadius: "50%",
            border: "1px solid rgba(167,139,250,0.22)",
            animation: "ringRotate 22s linear infinite reverse",
          }}
        />
      </div>

      {/* Keyframes injected via a <style> tag */}
      <style>{`
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33%       { transform: translate(20px, -18px) rotate(6deg) scale(1.04); }
          66%       { transform: translate(-14px, 12px) rotate(-4deg) scale(0.97); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          40%       { transform: translate(-22px, 16px) rotate(-8deg) scale(1.05); }
          70%       { transform: translate(10px, -10px) rotate(5deg) scale(0.96); }
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-10px, 14px) scale(1.08); }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Card ── */}
      <div
        className="relative w-full max-w-[500px] max-h-full"
        style={{ zIndex: 1 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={cardRef}
          id="__vcard_capture__"
          className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300"
          style={{
            boxShadow: isHovered
              ? "0 20px 60px rgba(0,0,0,0.15)"
              : "0 8px 30px rgba(0,0,0,0.10)",
            transform: isHovered ? "scale(1.01)" : "scale(1)",
          }}
        >
          {/* SVG Curved Decorative Lines */}
          <svg
            className="absolute top-0 right-0 w-full h-full"
            viewBox="0 0 700 380"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            style={{ pointerEvents: "none" }}
          >
            <ellipse cx="650" cy="80"  rx="260" ry="220" fill="none" stroke="#a855f7" strokeWidth="1.6" opacity="0.9" />
            <ellipse cx="680" cy="100" rx="310" ry="270" fill="none" stroke="#a855f7" strokeWidth="1.3" opacity="0.7" />
            <ellipse cx="710" cy="60"  rx="360" ry="320" fill="none" stroke="#a855f7" strokeWidth="1"   opacity="0.55" />
          </svg>

          {/* Card Content */}
          <div className="relative z-10 p-4 md:p-6" style={{ minHeight: "170px" }}>
            {/* Top Row */}
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
              </div>
              {user?.company && (
                <div className="flex items-start">
                  <img src={logo} alt={user.company} className="h-7 w-auto object-contain" />
                </div>
              )}
            </div>

            <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-1 uppercase tracking-tight leading-none">
              {user?.first_name || "Guest"} {user?.last_name}
            </h1>

            {user?.designation && (
              <p className="text-primary font-semibold uppercase tracking-widest mb-1" style={{ fontSize: "0.85rem", letterSpacing: "0.12em" }}>
                {user.designation}
              </p>
            )}

            {user?.company && (
              <p className="text-gray-500 capitalize text-sm mb-8">{user.company}</p>
            )}

            <div className="space-y-1 mt-3">
              <p className="text-gray-800 text-sm md:text-base font-medium">{user?.emailId || "guest@example.com"}</p>
              <p className="text-gray-800 text-sm md:text-base font-medium">{user?.mobileNumber || "Not Available"}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <Button
            onClick={() => setShowShareDialog(true)}
            className="mt-5 cursor-pointer hover:scale-103 flex items-center justify-center bg-klout-primary hover:bg-klout-primary-dark text-white rounded-xl"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="mt-5 cursor-pointer hover:scale-103 flex items-center justify-center bg-klout-primary hover:bg-klout-primary-dark text-white rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md p-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Share Your Profile</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">Share your Klout Club profile</DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-4">
            <div className="w-full overflow-hidden rounded-lg border bg-gray-50">
              <div className="flex items-center gap-2 p-3">
                <p className="text-xs text-gray-500 flex-1 w-0 truncate">{shareUrl}</p>
                <button
                  onClick={handleCopyLink}
                  className={`shrink-0 text-xs cursor-pointer font-medium px-3 py-1.5 rounded-md transition-colors ${
                    copied ? "bg-green-600 text-white" : "bg-klout-primary text-white hover:opacity-90"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Share via</p>
              <div className="flex items-start justify-around gap-2">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${firstName} ${lastName}'s profile on Klout Club: ${shareUrl}`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">WhatsApp</span>
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0077B5] flex items-center justify-center group-hover:scale-110 transition-transform shadow">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">LinkedIn</span>
                </a>

                {/* X / Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${firstName} ${lastName}'s profile on Klout Club`)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform shadow">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">X</span>
                </a>

                {/* Native Share / Email fallback */}
                {"share" in navigator ? (
                  <button onClick={handleNativeShare} className="flex flex-col cursor-pointer items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow">
                      <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-600">More</span>
                  </button>
                ) : (
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`${firstName} ${lastName} on Klout Club`)}&body=${encodeURIComponent(`Check out this profile: ${shareUrl}`)}`}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">Email</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VCard;