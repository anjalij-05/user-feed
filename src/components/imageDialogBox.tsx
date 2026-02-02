import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface ImageDialogProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  showLoginMessage?: boolean; // New prop to control login message
}

const ImageDialog: React.FC<ImageDialogProps> = ({
  isOpen,
  imageUrl,
  onClose,
  showLoginMessage = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative p-2 bg-white rounded-lg shadow-lg max-w-[90%] max-h-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        <X
          className="absolute top-2 right-2 w-6 h-6 text-gray-800 cursor-pointer hover:text-gray-600 transition-colors z-10"
          onClick={onClose}
        />

        {showLoginMessage ? (
          // Show login message for logged-out users
          <div className="flex flex-col items-center justify-center p-8 min-w-[300px] min-h-[200px]">
            <div className="text-center space-y-4">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-800">
                Login Required
              </h3>
              <Link to="/user-login">
                <Button className="text-white bg-primary hover:scale-103 hover:bg-primary-dark cursor-pointer px-4 py-2 rounded-lg mt-4">
                  Please login to view profile images
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Show actual image for logged-in users
          <img
            src={imageUrl}
            alt="Full Size"
            className="max-w-full max-h-[80vh] rounded-lg"
          />
        )}
      </div>
    </div>
  );
};

export default ImageDialog;
