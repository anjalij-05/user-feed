import { appUrl } from "@/constants";
import axios from "axios";

export interface RatingPayload {
  eventUuid: string;
  userId: number;
  mobileNumber: number | string;
  overallEventExperience: number;
  speakerOrPenalistQuality: number;
  organisationAndTimeManagement: number;
  venueAndOngroundManagemant: number;
  opportunityForNetworking: number;
  eventCommunication: number;
  relevanceTopicDiscuss: number;
}

export interface ShowRatingPayload {
  eventUuid: string;
  userId: number;
  //   mobileNumber: number | string;
}

export interface RatingResponse {
  success: boolean;
  message?: string;
  rating?: {
    overallEventExperience: number;
    speakerOrPenalistQuality: number;
    organisationAndTimeManagement: number;
    venueAndOngroundManagemant: number;
    opportunityForNetworking: number;
    eventCommunication: number;
    relevanceTopicDiscuss: number;
  };
  data?: any;
}

export const fetchEventRating = async (payload: ShowRatingPayload) => {
  try {
    const response = await axios.post(
      `${appUrl}/api/organiser/v1/event-rating/show-event-rating`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    if (data?.data) {
      const {
        avgOverallEventExperience,
        avgSpeakerOrPenalistQuality,
        avgOrganisationAndTimeManagement,
        avgVenueAndOngroundManagemant,
        avgOpportunityForNetworking,
        avgEventCommunication,
        avgRelevanceTopicDiscuss,
      } = data.data;

      // compute overall average
      const total =
        avgOverallEventExperience +
        avgSpeakerOrPenalistQuality +
        avgOrganisationAndTimeManagement +
        avgVenueAndOngroundManagemant +
        avgOpportunityForNetworking +
        avgEventCommunication +
        avgRelevanceTopicDiscuss;

      const overallAverage = total / 7;

      return {
        ...data,
        overallAverage: Number(overallAverage.toFixed(1)), // e.g. 4.1
      };
    }

    return data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch event rating"
    );
  }
};

/**
 * Submit/Create a new event rating
 */
export const createEventRating = async (
  payload: RatingPayload
): Promise<RatingResponse> => {
  try {
    const response = await axios.post(
      `${appUrl}/api/organiser/v1/event-rating/create-event-rating`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to submit event rating"
    );
  }
};
