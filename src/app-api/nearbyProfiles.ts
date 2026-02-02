import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { appUrl } from "@/constants";

interface FetchNearbyProfilesParams {
  token?: string | undefined;
  userId?: string | undefined;
  latitude?: number;
  longitude?: number;
  distance?: number;
  page?: number;
  isPublic?: boolean;
  mobileNumber?: string;
}

export const fetchPublicProfileById = async (profileId: string) => {
  const response = await axios.post(
    `${appUrl}/api/v1/user/user-profile`,
    { id: profileId },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

// Thunk to fetch nearby profiles (logged-in or public) with pagination
export const fetchNearbyProfilesThunk = createAsyncThunk(
  "user/fetchNearbyProfiles",
  async (params: FetchNearbyProfilesParams, { rejectWithValue }) => {
    const {
      token,
      userId,
      latitude,
      longitude,
      distance = 50,
      page = 1,
      mobileNumber,
    } = params;

    try {
      let response;

      // Check if location is available
      const hasLocation =
        latitude !== undefined &&
        longitude !== undefined &&
        !isNaN(latitude) &&
        !isNaN(longitude);

      if (!hasLocation) {
        // Use no-location API when location is not available
        if (mobileNumber) {
          response = await axios.post(
            `${appUrl}/api/v1/user/no-location-profiles`,
            {
              mobileNumber,
              page,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        } else {
          return rejectWithValue(
            "Mobile number required when location is not available."
          );
        }
      } else {
        // Use location-based APIs when location is available
        const payload = { latitude, longitude, distance };

        if (token && userId) {
          // Logged-in user API with pagination
          response = await axios.post(
            `${appUrl}/api/v1/user/nearby-Profiles?page=${page}`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
                "x-access-token": token,
                userid: userId,
              },
            }
          );
        } else {
          // Public API with pagination
          response = await axios.post(
            `${appUrl}/api/v1/user/nearbyProfilesPublic?page=${page}`,
            payload,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }

      // Return response with pagination metadata
      return {
        ...response.data,
        currentPage: page,
        isPublic: !token || !userId,
        isNoLocation: !hasLocation,
        hasLocation,
        isLocationDenied: !hasLocation && (!token || !userId), // ADD THIS
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch profiles"
      );
    }
  }
);

/**
 * Fetch user profile details (for logged-in users only)
 */
export const fetchProfileDetails = async (
  token: string,
  loggedInUserId: string,
  targetUserId: string,
  lat?: number,
  lng?: number,
  distance: number = 50
) => {
  const formData = new FormData();
  formData.append("userId", targetUserId);

  if (lat !== undefined && lng !== undefined) {
    formData.append("latitude", lat.toString());
    formData.append("longitude", lng.toString());
    formData.append("distance", distance.toString());
  }

  const res = await axios.post(
    `${appUrl}/api/v1/user/getUserProfileDetails`,
    formData,
    {
      headers: {
        "x-access-token": token,
        userid: loggedInUserId,
      },
    }
  );

  return res.data;
};
