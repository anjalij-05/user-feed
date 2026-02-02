// src/api/connections.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { appUrl } from "@/constants";

/**
 * Send connection request (returns response.data)
 * backend expects form-data: connectionId = <target user id>
 */
export const sendConnectionRequest = async (
  token: string,
  userid: string,
  connectionId: string
) => {
  const url = `${appUrl}/api/v1/user/connectionRequest`;
  const formData = new FormData();
  formData.append("connectionId", connectionId);

  const response = await axios.post(url, formData, {
    headers: { userid, "x-access-token": token },
  });

  return response.data;
};

/**
 * getMyConnections: returns connectionRequests and connectionsList
 */
export const getMyConnections = createAsyncThunk(
  "connections/getMyConnections",
  async (
    {
      token,
      userId,
      latitude,
      longitude,
      distance,
    }: {
      token: string;
      userId: string;
      latitude: number;
      longitude: number;
      distance?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("latitude", latitude.toString());
      formData.append("longitude", longitude.toString());
      formData.append("distance", (distance || 50).toString());

      const res = await axios.post(
        `${appUrl}/api/v1/user/myConnectionsRequest`,
        formData,
        {
          headers: { "x-access-token": token, userid: userId },
        }
      );

      // return both arrays so the UI can find request ids & connection record ids
      return {
        connectionRequests: res.data?.result?.connectionRequests || [],
        connectionsList: res.data?.result?.connectionsList || [],
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/**
 * Cancel connection request: backend expects connectionId = request _id
 */
export const cancelConnectionRequest = async (
  token: string,
  userid: string,
  connectionId: string
) => {
  const url = `${appUrl}/api/v1/user/cancelConnectionRequest`;
  const formData = new FormData();
  formData.append("connectionId", connectionId);

  const response = await axios.post(url, formData, {
    headers: { userid, "x-access-token": token },
  });

  return response.data;
};

/**
 * checkConnectionStatus (filterList) -> createAsyncThunk, returns res.data
 */
export const checkConnectionStatus = createAsyncThunk(
  "connections/checkConnectionStatus",
  async (
    { token, userId }: { token: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post(
        `${appUrl}/api/v1/user/myConnections`,
        {},
        {
          headers: { "x-access-token": token, userid: userId },
        }
      );

      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/**
 * removeConnection (removeMyConnecton)
 * backend expects form-data: connectionId = <connection record id (connectionsList._id)>
 */
export const removeConnection = createAsyncThunk(
  "connections/removeConnection",
  async (
    {
      token,
      userId,
      connectionId,
    }: { token: string; userId: string; connectionId: string },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("connectionId", connectionId);

      const res = await axios.post(
        `${appUrl}/api/v1/user/removeMyConnecton`,
        formData,
        {
          headers: { "x-access-token": token, userid: userId },
        }
      );

      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Connection request status update
export const connectionRequestStatusUpdate = createAsyncThunk(
  "connections/statusUpdate",
  async ({
    token,
    userId,
    connectionReqId,
    notificationId,
    status,
  }: {
    token: string;
    userId: string;
    connectionReqId: string;
    notificationId: string;
    status: string; // "1" = accept | "2" = reject
  }) => {
    const res = await axios.post(
      `${appUrl}/api/v1/user/connectionRequestStatusUpdate`,
      {
        connectionReqId,
        notificationId,
        status,
      },
      {
        headers: {
          "x-access-token": token,
          userId: userId, // fixed header key
        },
      }
    );
    return res.data;
  }
);
