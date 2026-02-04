import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import axios from "axios";
import { appUrl } from "@/constants";

interface Skill {
  _id: string;
  skills?: string;
  skill?: string;
  status?: number;
}

interface SkillsSelectorProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  onClose?: () => void;
}

const SkillsSelector: React.FC<SkillsSelectorProps> = ({
  selectedSkills,
  onSkillsChange,
  // onClose,
}) => {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelectedSkills, setTempSelectedSkills] =
    useState<string[]>(selectedSkills);

  // Helper function to get skill name from either 'skills' or 'skill' property
  const getSkillName = (data: Skill): string => {
    return data.skills || data.skill || "";
  };

  // Fetch skills from API
  const fetchSkills = async (_search: string = "") => {
    setLoading(true);
    try {
      const response = await axios.get(`${appUrl}/api/v1/skill/getlist`, {});

      const skills = response.data.result || [];
      setAvailableSkills(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Failed to load skills");
      setAvailableSkills([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchSkills();
  }, []);

  // Update temp selection when prop changes
  useEffect(() => {
    setTempSelectedSkills(selectedSkills);
  }, [selectedSkills]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSkills(searchQuery);
      } else {
        fetchSkills();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toggle skill selection
  const toggleSkill = (skillName: string) => {
    if (!skillName) return;

    const newSelection = tempSelectedSkills.includes(skillName)
      ? tempSelectedSkills.filter((s) => s !== skillName)
      : [...tempSelectedSkills, skillName];
    
    setTempSelectedSkills(newSelection);
    // Update parent immediately for real-time updates
    onSkillsChange(newSelection);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setTempSelectedSkills([]);
    onSkillsChange([]);
    setSearchQuery("");
  };

  // Filter skills based on search query
  const filteredSkills = availableSkills.filter((data) => {
    const skillName = getSkillName(data);
    return skillName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col space-y-4">
      {/* Search Input */}
      <div className="w-full">
        <Input
          type="text"
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Skills List - Responsive Grid */}
      <div className="w-full border rounded-lg p-3 sm:p-4 bg-muted/30">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading skills...</p>
            </div>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500 text-sm">No skills found</p>
          </div>
        ) : (
          <>
            {/* Skills Grid - Responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] sm:max-h-[350px] overflow-y-auto pr-2">
              {filteredSkills.map((data) => {
                const skillName = getSkillName(data);
                if (!skillName) return null;

                return (
                  <div
                    key={data._id}
                    className="flex items-center space-x-2 p-2.5 hover:bg-accent rounded-lg cursor-pointer transition-colors border border-transparent hover:border-primary/20"
                    onClick={() => toggleSkill(skillName)}
                  >
                    <Checkbox
                      checked={tempSelectedSkills.includes(skillName)}
                      onCheckedChange={() => toggleSkill(skillName)}
                      className="cursor-pointer shrink-0"
                    />
                    <label className="flex-1 capitalize cursor-pointer text-sm leading-tight">
                      {skillName}
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Selected Skills Count */}
            {/* {tempSelectedSkills.length > 0 && (
              <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                <span className="font-medium">{tempSelectedSkills.length}</span> skill
                {tempSelectedSkills.length !== 1 ? "s" : ""} selected
              </div>
            )} */}
          </>
        )}
      </div>

      {/* Clear Button */}
      {tempSelectedSkills.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="cursor-pointer"
          >
            Clear all selections
          </Button>
        </div>
      )}
    </div>
  );
};

export default SkillsSelector;