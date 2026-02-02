import { appDomain } from "@/constants";
import axios from "axios";
import { create } from "zustand";

interface GamificationStore {
    loading: boolean;
    createPollQuestions: (data: any) => Promise<any>;
    getPollQuestions: (userUuid: string, eventUuid: string) => Promise<any>;
    updatePollQuestion: (data: any) => Promise<any>;
    deletePollQuestion: (questionId: string) => Promise<any>;
    submitPoll: (questionId: string, data: any) => Promise<any>;
    getGamificationScore: (eventUuid: string) => Promise<any>;
}

const useGamificationStore = create<GamificationStore>((set) => ({
    loading: false,
    createPollQuestions: async (data: any) => {
        try {
            set({
                loading: true,
            });
            const response = await axios.post(`${appDomain}/api/organiser/v1/poll-wordcloud/save-poll-wordcloud`, {
                items: data,
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            return response.data;
        } catch (error) {
            console.error(error);
        } finally {
            set({
                loading: false,
            });
        }
    },
    getPollQuestions: async (userUuid: string, eventUuid: string) => {
        try {
            set({
                loading: true,
            });
            const response = await axios.post(`${appDomain}/api/organiser/v1/poll-wordcloud/get-poll-wordcloud`, {
                userUUID: userUuid,
                eventUUID: eventUuid,
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            return response.data;
        } catch (error) {
            console.error(error);
        } finally {
            set({
                loading: false,
            });
        }
    },
    updatePollQuestion: async (data: any) => {
        try {
            set({
                loading: true,
            });
            const response = await axios.patch(`${appDomain}/api/organiser/v1/poll-wordcloud/update-poll-wordcloud`, data, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            return response.data;
        } catch (error) {
            console.error(error);
        } finally {
            set({
                loading: false,
            });
        }
    },
    deletePollQuestion: async (questionId: string) => {
        try {
            set({
                loading: true,
            });
            const response = await axios.delete(`${appDomain}/api/organiser/v1/poll-wordcloud/delete-poll-wordcloud/${questionId}`, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            return response.data;
        } catch (error) {
            console.error(error);
        } finally {
            set({
                loading: false,
            });
        }
    },
    submitPoll: async (questionId: string, data: any) => {
        try {
            set({
                loading: true,
            });
            const response = await axios.post(`${appDomain}/api/organiser/v1/poll-wordcloud/submit-poll-wordcloud-answer/${questionId}`, data, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            return response.data;
        } catch (error: any) {
            if (error.status === 404) {
                return {
                    status: false,
                    message: error.response.data.message || "You are not allowed to vote for this poll"
                }
            }
        } finally {
            set({
                loading: false,
            });
        }
    },
    getGamificationScore: async (eventUuid: string) => {
        try {
            set({
                loading: true,
            });
            const response = await axios.post(`${appDomain}/api/organiser/v1/gamification/gamification-score`, {
                eventUUID: eventUuid
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            return response.data;
        } catch (error) {
            console.error(error);
        } finally {
            set({
                loading: false,
            });
        }
    }
}));

export default useGamificationStore;