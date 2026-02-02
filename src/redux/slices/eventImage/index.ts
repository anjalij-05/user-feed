// src/redux/slices/eventImagesSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";

// Define image type (adjust according to API response)
interface EventImage {
  id?: string;
  _id?: string;
  imageUrl: string;
  createdAt?: string;
}

interface EventImagesState {
  images: EventImage[];
  matchedImages: EventImage[];
  loading: boolean;
  matchedLoading: boolean;
  error: string | null;
  matchedError: string | null;
}

interface FetchImagesPayload {
  eventUuid: string;
  userId: string;
}

interface FetchMatchImagesPayload {
  eventUuid: string;
  userId: string;
  imageUrl: string;
}

// Initial state
const initialState: EventImagesState = {
  images: [],
  matchedImages: [],
  loading: false,
  matchedLoading: false,
  error: null,
  matchedError: null,
};

// Async thunk to fetch all event images
export const fetchEventImages = createAsyncThunk<
  EventImage[],
  FetchImagesPayload,
  { rejectValue: string }
>("eventImages/fetch", async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      "https://additional.klout.club/api/v1/faces/all-photos",
      {
        eventUuid: payload.eventUuid,
        userId: payload.userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data || [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch images"
    );
  }
});

// Async thunk to fetch matched face images
export const fetchMatchImages = createAsyncThunk<
  EventImage[],
  FetchMatchImagesPayload,
  { rejectValue: string }
>("matchImages/fetch", async (payload, { rejectWithValue }) => {
  try {
    // Ensure the imageUrl is in the correct S3 format
    let formattedImageUrl = payload.imageUrl;

    // If the URL doesn't start with https://, assume it needs the S3 domain
    if (
      !formattedImageUrl.startsWith("https://") &&
      !formattedImageUrl.startsWith("http://")
    ) {
      // Check if it already has the klout prefix
      if (!formattedImageUrl.startsWith("klout/")) {
        formattedImageUrl = `klout/${formattedImageUrl}`;
      }
      formattedImageUrl = `https://klout-image.s3.amazonaws.com/${formattedImageUrl}`;
    }

    const response = await axios.post(
      "https://additional.klout.club/api/v1/faces/match-image",
      {
        eventUuid: payload.eventUuid,
        userId: payload.userId,
        imageUrl: formattedImageUrl,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // The API returns data in matchedFaces array, not data
    const matchedFaces = response.data.matchedFaces || [];

    // Transform the response to match EventImage interface
    // Use _id as id for compatibility
    const transformedFaces = matchedFaces.map((face: any) => ({
      id: face._id,
      _id: face._id,
      imageUrl: face.imageUrl,
      createdAt: face.createdAt,
    }));

    console.log("Matched faces received:", transformedFaces);

    return transformedFaces;
  } catch (error: any) {
    console.error("Error fetching matched images:", error);
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch matched images"
    );
  }
});

export const eventImagesSlice = createSlice({
  name: "eventImages",
  initialState,
  reducers: {
    clearMatchedImages: (state) => {
      state.matchedImages = [];
      state.matchedError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Event Images
      .addCase(fetchEventImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchEventImages.fulfilled,
        (state, action: PayloadAction<EventImage[]>) => {
          state.loading = false;
          state.images = action.payload;
        }
      )
      .addCase(fetchEventImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch images";
      })
      // Fetch Matched Images
      .addCase(fetchMatchImages.pending, (state) => {
        state.matchedLoading = true;
        state.matchedError = null;
      })
      .addCase(
        fetchMatchImages.fulfilled,
        (state, action: PayloadAction<EventImage[]>) => {
          state.matchedLoading = false;
          state.matchedImages = action.payload;
          console.log("Matched images set in state:", action.payload);
        }
      )
      .addCase(fetchMatchImages.rejected, (state, action) => {
        state.matchedLoading = false;
        state.matchedError = action.payload || "Failed to fetch matched images";
        console.error("Error state:", action.payload);
      });
  },
});

export const { clearMatchedImages } = eventImagesSlice.actions;
export default eventImagesSlice.reducer;
