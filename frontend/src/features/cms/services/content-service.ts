import { mutationFetcher, type MutationOptions } from "@utils/swrFetcher";

import type { HomePageContent } from "../types";

interface SaveContentResponse {
  success: boolean;
  data: HomePageContent;
  message: string;
}

/**
 * Save homepage content
 */
export const saveHomepageContent = async (
  url: string,
  options: { arg: HomePageContent },
): Promise<SaveContentResponse> => {
  const mutationOptions: MutationOptions<HomePageContent> = {
    method: "PUT",
    body: options.arg,
  };

  return mutationFetcher<SaveContentResponse, HomePageContent>(url, {
    arg: mutationOptions,
  });
};

/**
 * Get homepage content
 */
export const getHomepageContent = async (
  url: string,
): Promise<SaveContentResponse> => {
  const options: MutationOptions = {
    method: "GET",
  };

  return mutationFetcher<SaveContentResponse>(url, { arg: options });
};
