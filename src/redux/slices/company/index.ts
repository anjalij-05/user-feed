import { createSlice } from "@reduxjs/toolkit";
import { fetchCompanies, fetchDesignation } from "@/app-api/company";

interface CompanyState {
  companies: any[];
  designations: any[];
  companiesLoading: boolean;
  designationsLoading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  companies: [],
  designations: [],
  companiesLoading: false,
  designationsLoading: false,
  error: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearCompanies: (state) => {
      state.companies = [];
    },
    clearDesignations: (state) => {
      state.designations = [];
    },
  },
  extraReducers: (builder) => {
    // Companies
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.companiesLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companiesLoading = false;
        console.log(action.payload.data.companies);

        state.companies = action.payload.data?.companies || [];
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.companiesLoading = false;
        state.error = action.payload as string;
      });

    // Designations
    builder
      .addCase(fetchDesignation.pending, (state) => {
        state.designationsLoading = true;
        state.error = null;
      })
      .addCase(fetchDesignation.fulfilled, (state, action) => {
        state.designationsLoading = false;
        console.log(action.payload.data.designations);
        state.designations = action.payload?.data?.designations || [];
      })
      .addCase(fetchDesignation.rejected, (state, action) => {
        state.designationsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCompanies, clearDesignations } = companySlice.actions;
export default companySlice.reducer;
