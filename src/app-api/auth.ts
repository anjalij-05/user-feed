import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { appUrl } from "@/constants";
import type { RegisterForm } from "@/pages/validation/registerSchema";

// Send OTP API
export const sendOtp = createAsyncThunk<
  any,
  { country_code: string; phone: string },
  { rejectValue: string }
>("auth/sendOtp", async ({ country_code, phone }, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${appUrl}/api/v1/user/sendOtp`, {
      countryCode: country_code,
      mobileNumber: phone,
    });

    console.log("Send OTP Response:", res.data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to send OTP");
  }
});

// Verify OTP API
export const verifyOtp = createAsyncThunk<
  any,
  { country_code: string; phone: string; otp: string },
  { rejectValue: string }
>(
  "auth/verifyOtp",
  async ({ country_code, phone, otp }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${appUrl}/api/v1/user/verifyOtp`, {
        countryCode: country_code,
        mobileNumber: phone,
        OTP: otp,
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "OTP verification failed");
    }
  }
);

// get full user profile
export const getUserProfile = createAsyncThunk<
  any,
  { token: string; userid: string }, // currently strict
  { rejectValue: string }
>("auth/getUserProfile", async ({ token, userid }, { rejectWithValue }) => {
  if (!token || !userid) {
    return rejectWithValue("Missing token or userid");
  }
  try {
    const res = await axios.post(
      `${appUrl}/api/v1/user/getFullProfileDetails`,
      {},
      {
        headers: {
          "x-access-token": token,
          userid: userid,
        },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data || "Failed to fetch user profile"
    );
  }
});

// Register User API

export const registerUser = createAsyncThunk<
  any, // returned data type
  RegisterForm | FormData,
  { rejectValue: string }
>("auth/registerUser", async (data, { rejectWithValue }) => {
  try {
    const isFormData = data instanceof FormData;

    const res = await axios.post(`${appUrl}/api/v1/user/register`, data, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });

    // Ensure profileImage key exists in returned data
    let returnedData = res.data;

    if (!returnedData.profileImage && data instanceof FormData) {
      const file = data.get("profileImage") as File;
      if (file) {
        // temporarily map file name as profileImage (frontend can replace with URL)
        returnedData = { ...returnedData, profileImage: file.name };
      }
    }
    console.log("Register Response:", returnedData);
    return returnedData;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to register user");
  }
});

// Delete User API
export const deleteAccountAPI = async (userid?: string) => {
  if (!userid) throw new Error("User ID not found");

  try {
    const res = await axios.delete(`${appUrl}/api/v1/user/users/${userid}`, {});
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data || "Failed to delete account");
  }
};


