import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  getUserProfile,
  registerUser,
  sendOtp,
  verifyOtp,
} from "@/app-api/auth";
import type { AppUser } from "@/types";
import { updateUserProfile } from "@/app-api/user";

interface CheckInUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  designation: string;
  company: string;
  eventName: string;
  countryCode: number;
  tenMinuteInvitationSent: boolean;
  oneDayInvitationSent: boolean;
  threeDayInvitationSent: boolean;
  __v: number;
}

interface AuthState {
  isLoggedIn: boolean;
  user: AppUser | null; // full profile
  checkinuser: CheckInUser | null; // temp user after OTP verify
  loading: boolean;
  error: string | null;
  token: string | null;
  userid: string | null;
}

const token = localStorage.getItem("klout-app-token");
const savedUser = localStorage.getItem("klout-app-user");
const userid = localStorage.getItem("klout-app-userid");

const initialState: AuthState = {
  isLoggedIn: !!token,
  user: savedUser ? JSON.parse(savedUser) : null,
  checkinuser: null,
  loading: false,
  error: null,
  token: token || null,
  userid: userid || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.checkinuser = null;
      state.token = null;
      state.userid = null;
      localStorage.removeItem("klout-app-token");
      localStorage.removeItem("klout-app-user");
      localStorage.removeItem("klout-app-userid");
    },
    updateUser: (state, action: PayloadAction<Partial<AppUser>>) => {
      // Only merge JSON-friendly values (not File/FormData)
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("klout-app-user", JSON.stringify(state.user));
      }
    },
    setUserAndToken: (
      state,
      action: PayloadAction<{ user: AppUser; token: string }>
    ) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.userid = state.user?._id;
      localStorage.setItem("klout-app-user", JSON.stringify(state.user));
      localStorage.setItem("klout-app-token", state.token as string);
      localStorage.setItem("klout-app-userid", state.userid as string);
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtp.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload?.result?.token) {
          state.token = action.payload.result.token;
          state.userid = action.payload.result.user._id;

          localStorage.setItem("klout-app-token", state.token as string);
          localStorage.setItem("klout-app-userid", state.userid as string);
        }

        if (action.payload?.result?.user?.details) {
          // Full profile returned
          state.isLoggedIn = true;
          state.user = {
            imageBaseUrl: action.payload.result.imageBaseUrl,
            ...action.payload.result.user.details,
          };
          localStorage.setItem("klout-app-user", JSON.stringify(state.user));
        } else {
          // Only temp checkin user
          state.checkinuser = action.payload?.result?.checkinUser;
        }
      })
      .addCase(verifyOtp.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Get Full Profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;

        const tempUser: AppUser = {
          imageBaseUrl: action.payload.result.imageBaseUrl,
          ...action.payload.result.details,
        };

        state.user = tempUser;
        localStorage.setItem("klout-app-user", JSON.stringify(tempUser));

        if (action.payload.result.token) {
          state.token = action.payload.result.token;
          localStorage.setItem("klout-app-token", state.token as string);
        }
      })
      .addCase(getUserProfile.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Update User Profile (image + other fields)
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;

        // FIXED: Merge the updated fields with existing user data
        // Don't replace the entire user object
        if (state.user) {
          // Preserve existing imageBaseUrl if not in response
          const imageBaseUrl =
            action.payload.imageBaseUrl || state.user.imageBaseUrl;

          state.user = {
            ...state.user, // Keep all existing fields
            ...action.payload, // Override with updated fields
            imageBaseUrl, // Ensure imageBaseUrl is preserved
          };

          localStorage.setItem("klout-app-user", JSON.stringify(state.user));
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Something went wrong";
      })

      // 🔹 Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.checkinuser = null;
        state.isLoggedIn = true;
        localStorage.setItem("klout-app-user", JSON.stringify(action.payload));

        if (action.payload.result.token) {
          state.token = action.payload.result.token;
          localStorage.setItem("klout-app-token", state.token as string);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      });
  },
});

export const { logout, updateUser, setUserAndToken } = authSlice.actions;
export default authSlice.reducer;
