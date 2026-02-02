import { configureStore } from "@reduxjs/toolkit";
import { eventSlice } from "@/redux/slices/event";
import userSlice from "@/redux/slices/nearByProfiles";
import agendaSlice from "@/redux/slices/agenda";
import authReducer from "@/redux/slices/auth";
import companySlice from "@/redux/slices/company";
import connectionsSlice from "@/redux/slices/connections";
import notificationSlice from "@/redux/slices/notification";
import tlsSlice from "@/redux/slices/view tls";
import chatSlice from "@/redux/slices/chat";
import attendedEventsReducer from "@/redux/slices/attendedEvents";
import blockUserReducer from "@/redux/slices/blockUser";
import eventImageReducer from "@/redux/slices/eventImage";

export const store = configureStore({
  reducer: {
    nearByProfiles: userSlice,
    event: eventSlice.reducer,
    details: agendaSlice,
    auth: authReducer,
    company: companySlice,
    chat: chatSlice,
    connection: connectionsSlice,
    notification: notificationSlice,
    tls: tlsSlice,
    attendedEvents: attendedEventsReducer,
    blockUser: blockUserReducer,
    eventImages: eventImageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
