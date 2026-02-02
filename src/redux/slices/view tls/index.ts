import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { fetchCompanyMemberTls, fetchTlsScore } from "@/app-api/tls";
import type { AppUser } from "@/types";

interface CompanyTlsResponse {
  status: boolean;
  data: AppUser[];
}

interface TlsState {
  // TLS Score state
  score: number | null;
  factorGroup: Record<string, number>;

  // Company TLS state
  companyMembers: AppUser[];
  companyName: string | null;
  totalMembers: number;

  // Shared state
  loading: boolean;
  error: string | null;
}

const initialState: TlsState = {
  score: null,
  factorGroup: {},
  companyMembers: [],
  companyName: null,
  totalMembers: 0,
  loading: false,
  error: null,
};

const tlsSlice = createSlice({
  name: "tls",
  initialState,
  reducers: {
    clearCompanyTls: (state) => {
      state.companyMembers = [];
      state.companyName = null;
      state.totalMembers = 0;
    },
    clearTlsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch TLS Score
    builder
      .addCase(fetchTlsScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTlsScore.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.score = action.payload?.score ?? null;
        // console.log("tls", state.score);

        state.factorGroup = action.payload?.factorGroup ?? {};
        state.error = null;
      })
      .addCase(fetchTlsScore.rejected, (state, action) => {
        state.loading = false;
        if (
          typeof action.payload === "object" &&
          action.payload !== null &&
          "message" in action.payload
        ) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = action.error.message || "Failed to load TLS score";
        }
      });

    // Fetch Company Member TLS
    builder
      .addCase(fetchCompanyMemberTls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCompanyMemberTls.fulfilled,
        (state, action: PayloadAction<CompanyTlsResponse | any>) => {
          state.loading = false;
          state.companyMembers = action.payload?.data || [];
          console.log("Company Members:", state.companyMembers);
        }
      )
      .addCase(fetchCompanyMemberTls.rejected, (state, action) => {
        state.loading = false;
        if (
          typeof action.payload === "object" &&
          action.payload !== null &&
          "message" in action.payload
        ) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = action.error.message || "Failed to load company TLS";
        }
      });
  },
});

export const { clearCompanyTls, clearTlsError } = tlsSlice.actions;
export default tlsSlice.reducer;
