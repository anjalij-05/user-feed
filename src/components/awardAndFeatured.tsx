import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Camera } from "lucide-react";

// Types
export interface Awards {
  id: string;
  description: string;
}

export interface Featured {
  id: string;
  description: string;
  link: string;
  image: string | null;
}

// Awards Edit Component
export const EditAwards: React.FC<{
  initialAwards: Awards[];
  onSave: (awards: Awards[]) => void;
  onClose?: () => void;
}> = ({ initialAwards, onSave }) => {
  const [awards, setAwards] = useState<Awards[]>(
    initialAwards.length > 0
      ? initialAwards
      : [{ id: Date.now().toString(), description: "" }]
  );

  // Auto-save whenever awards change
  useEffect(() => {
    const validAwards = awards.filter((award) => award.description.trim());
    onSave(validAwards);
  }, [awards]);

  const addAward = () => {
    setAwards([...awards, { id: Date.now().toString(), description: "" }]);
  };

  const removeAward = (id: string) => {
    setAwards(awards.filter((award) => award.id !== id));
  };

  const updateAward = (id: string, description: string) => {
    setAwards(
      awards.map((award) =>
        award.id === id ? { ...award, description } : award
      )
    );
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        {awards.map((award, index) => (
          <div key={award.id} className="relative">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  Award {index + 1}
                </label>
                <button
                  onClick={() => removeAward(award.id)}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                  title="Delete award"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Textarea
                value={award.description}
                onChange={(e) => updateAward(award.id, e.target.value)}
                placeholder="Add your award..."
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <div className="text-right text-xs text-gray-500">
                {award.description.length}/500
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addAward}
        className="w-full cursor-pointer"
      >
        + Add Another Award
      </Button>
    </div>
  );
};

// Featured Edit Component
export const EditFeatured: React.FC<{
  initialFeatured: Featured[];
  onSave: (featured: Featured[]) => void;
  onClose?: () => void;
}> = ({ initialFeatured, onSave }) => {
  const [featured, setFeatured] = useState<Featured[]>(
    initialFeatured.length > 0
      ? initialFeatured
      : [{ id: Date.now().toString(), description: "", link: "", image: null }]
  );

  // Auto-save whenever featured changes
  useEffect(() => {
    const validFeatured = featured.filter((item) => item.description.trim());
    onSave(validFeatured);
  }, [featured]);

  const addFeatured = () => {
    setFeatured([
      ...featured,
      { id: Date.now().toString(), description: "", link: "", image: null },
    ]);
  };

  const removeFeatured = (id: string) => {
    setFeatured(featured.filter((item) => item.id !== id));
  };

  const updateFeatured = (
    id: string,
    field: keyof Featured,
    value: string | null
  ) => {
    setFeatured(
      featured.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleImageUpload = (id: string, file: File) => {
    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      updateFeatured(id, "image", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-6">
        {featured.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 space-y-4 relative bg-muted"
          >
            <button
              onClick={() => removeFeatured(item.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
              title="Delete featured item"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                value={item.description}
                onChange={(e) =>
                  updateFeatured(item.id, "description", e.target.value)
                }
                placeholder="Write few lines regarding your featured article etc."
                rows={3}
                maxLength={50}
                className="resize-none"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {item.description.length}/50
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Add a link
              </label>
              <Input
                value={item.link}
                onChange={(e) =>
                  updateFeatured(item.id, "link", e.target.value)
                }
                placeholder="Paste or type a link to a file."
                maxLength={50}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {item.link.length}/50
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Image
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt="Featured"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">
                        Click to upload image
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(item.id, file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addFeatured}
        className="w-full cursor-pointer"
      >
        + Add Another Featured Item
      </Button>
    </div>
  );
};