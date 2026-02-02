import { create } from "zustand";
import { AgendaType } from "@/types";
import {
  deleteAgenda,
  getAgendaById,
  getEventAgendas,
  importAgenda,
  updateAgenda,
} from "@/api/agendas";
import { BasicResponse, GetEventAgendasResponse } from "@/types/api-responses";

interface EventAgendas {
  event_id: number | null;
  agendas: AgendaType[];
}

interface AgendaStore {
  allEventAgendas: EventAgendas[];
  loading: boolean;
  currentAgenda: AgendaType | null;
  getEventAgendas: (
    id: number | undefined
  ) => Promise<AgendaType[] | undefined>;
  getAgendaById: (id: string) => Promise<AgendaType | null>;
  addAgenda: (eventId: number, agenda: AgendaType) => void;
  updateAgenda: (uuid: string, formData: any) => Promise<BasicResponse>;
  deleteAgenda: (uuid: string) => Promise<BasicResponse>;
  importAgenda: (
    event_id: number,
    new_event_id: number,
    date: string
  ) => Promise<GetEventAgendasResponse>;
}

const useAgendaStore = create<AgendaStore>((set) => ({
  allEventAgendas: [],
  loading: false,
  currentAgenda: null,
 getEventAgendas: async (id: number | undefined) => {
  if (!id) return undefined;
  
//   const existingAgendas = get().allEventAgendas.find(
//     (ea) => ea.event_id === id
//   );
  
  // REMOVE THIS EARLY RETURN - it prevents fetching fresh data
  // if (existingAgendas?.event_id) return existingAgendas.agendas;

  set({ loading: true });
  try {
    const response = await getEventAgendas(id);
    
    // Update or add the event agendas
    set((state) => {
      const existingIndex = state.allEventAgendas.findIndex(
        (ea) => ea.event_id === id
      );
      
      const updatedAgendas = [...state.allEventAgendas];
      
      if (existingIndex >= 0) {
        // Update existing
        updatedAgendas[existingIndex] = {
          event_id: id,
          agendas: response.data,
        };
      } else {
        // Add new
        updatedAgendas.push({
          event_id: id,
          agendas: response.data,
        });
      }
      
      return { allEventAgendas: updatedAgendas };
    });
    
    return response.data;
  } finally {
    set({ loading: false });
  }
},
  getAgendaById: async (id: string) => {
    set({ loading: true });
    try {
      const response = await getAgendaById(id);
      if (response.status === 200) {
        set({ currentAgenda: response.data });
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching agenda:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  addAgenda: (eventId: number, agenda: AgendaType) => {
    set((state) => {
      const existingIndex = state.allEventAgendas.findIndex(
        (ea) => ea.event_id === eventId
      );
      const updatedAgendas = [...state.allEventAgendas];

      if (existingIndex >= 0) {
        updatedAgendas[existingIndex] = {
          event_id: eventId,
          agendas: [...updatedAgendas[existingIndex].agendas, agenda],
        };
      } else {
        updatedAgendas.push({
          event_id: eventId,
          agendas: [agenda],
        });
      }

      return { allEventAgendas: updatedAgendas };
    });
  },
  updateAgenda: async (uuid: string, formData: any) => {
    set({ loading: true });
    try {
      const response = await updateAgenda(uuid, formData);
      if (response.status === 200) {
        // Update the agenda in the store
        set((state) => ({
          allEventAgendas: state.allEventAgendas.map((ea) => ({
            ...ea,
            agendas: ea.agendas.map((agenda) =>
              agenda.uuid === uuid ? { ...agenda, ...formData } : agenda
            ),
          })),
          currentAgenda: null, // Reset current agenda
        }));
      }
      return response;
    } finally {
      set({ loading: false });
    }
  },
  deleteAgenda: async (uuid: string) => {
    set({ loading: true });
    try {
      const response = await deleteAgenda(uuid);
      if (response.status === 200) {
        set((state) => ({
          allEventAgendas: state.allEventAgendas.map((ea) => ({
            ...ea,
            agendas: ea.agendas
              ? ea.agendas.filter((agenda) => agenda.uuid !== uuid)
              : [],
          })),
        }));
      }
      return response;
    } finally {
      set({ loading: false });
    }
  },
  importAgenda: async (
    event_id: number,
    new_event_id: number,
    date: string
  ) => {
    set({ loading: true });
    try {
      const response = await importAgenda(event_id, new_event_id, date);
      if (response.status === 200) {
        set(() => ({
          allEventAgendas: [...response.data],
        }));
      }
      return response;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useAgendaStore;
