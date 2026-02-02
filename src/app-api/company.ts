import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { appUrl, domain } from "@/constants";

export const fetchCompanies = createAsyncThunk<
  any, // Return type (adjust to your API response type)
  string | undefined // Argument type (optional string)
>("company/fetchCompanies", async (search = "", { rejectWithValue }) => {
  try {
    const res = await axios.get(
      `${appUrl}/api/mapping/v1/company-master/all-company`,
      {
        params: {
          page: 1,
          search,
          industry: "",
          employeeSize: "",
          logo: "undefined",
        },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || "Failed to fetch companies");
  }
});

export const fetchDesignation = createAsyncThunk<any, string | undefined>(
  "company/fetchDesignation",
  async (search = "", { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${appUrl}/api/mapping/v1/designation-master/all-designation`,
        {
          params: { page: 1, search },
        }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch designations"
      );
    }
  }
);

// Fetch company-specific events (POST /api/all-events with user_id)
export const fetchCompanyEvents = createAsyncThunk<Event[], string>(
  "events/fetchCompanyEvents",
  async (userId: string) => {
    const response = await axios.post(`${domain}/api/all-events`, {
      user_id: userId
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  }
);