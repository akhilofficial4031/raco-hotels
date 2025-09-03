import { fetcher } from "../../utils/swrFetcher";
import { type PromoCode } from "../models/promo-code";

const API_URL = "/promo-codes";

export const validatePromoCode = async (
  hotelId: number,
  code: string,
): Promise<PromoCode> => {
  try {
    const response = await fetcher<{ data: { promoCode: PromoCode } }>(
      `${API_URL}/validate/${hotelId}/${code}`,
    );
    return response.data.promoCode;
  } catch {
    throw new Error("Promo code not found or expired");
  }
};
