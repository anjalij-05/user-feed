import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { appUrl } from "@/constants";
import type { User } from "firebase/auth";

interface TlsParams {
  mobileNumber: number;
}

export const fetchTlsScore = createAsyncThunk(
  "tls/fetchScore",
  async ({ mobileNumber }: TlsParams, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${appUrl}/api/v1/tls/view-tls`,
        { mobileNumber },
        { headers: { "Content-Type": "application/json" } }
      );

      // API response shape should be like { result: { tlsScore: ... } }
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch TLS score" }
      );
    }
  }
);

// Fetch TLS for comparison (two users)
export const fetchTlsComparison = async (mobile1: number, mobile2: number) => {
  try {
    const [tls1, tls2] = await Promise.all([
      fetchTlsScore({ mobileNumber: mobile1 }),
      fetchTlsScore({ mobileNumber: mobile2 }),
    ]);
    return { tls1, tls2 };
  } catch (err) {
    console.error("Failed TLS comparison:", err);
    return null;
  }
};

interface CompanyTlsParams {
  company: string;
}

interface CompanyTlsResponse {
  status: boolean;
  result: {
    company: string;
    members: User[];
    totalMembers: number;
  };
}

// Fetch company member TLS scores
export const fetchCompanyMemberTls = createAsyncThunk(
  "tls/fetchCompanyMemberTls",
  async ({ company }: CompanyTlsParams, { rejectWithValue }) => {
    try {
      const res = await axios.post<CompanyTlsResponse>(
        `${appUrl}/api/v1/tls/company-member-tls`,
        { company },
        { headers: { "Content-Type": "application/json" } }
      );

      return res.data || null;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch company TLS scores" }
      );
    }
  }
);
