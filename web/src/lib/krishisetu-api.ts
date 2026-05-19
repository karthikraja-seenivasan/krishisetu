import { fetchJson } from "@/lib/api-client";
import type {
  CropRecommendationsResponse,
  CropRecommendation,
  FarmerResponse,
  ListingResponse,
  MandiPriceEntry,
  Season,
  WeatherSummary,
} from "@/lib/api-types";

export function getWeather(lat: number, lon: number): Promise<WeatherSummary> {
  return fetchJson<WeatherSummary>(`/api/v1/weather?lat=${lat}&lon=${lon}`);
}

export async function getCropRecommendations(
  lat: number,
  lon: number,
  season: Season
): Promise<CropRecommendation[]> {
  const response = await fetchJson<CropRecommendationsResponse>(
    `/api/v1/crops/recommend?lat=${lat}&lon=${lon}&season=${season}`
  );
  return response.recommendations;
}

export function getMandiPrices(
  commodity = "Tomato",
  district = "Kolar",
  days = 14
): Promise<MandiPriceEntry[]> {
  const params = new URLSearchParams({
    commodity,
    district,
    days: String(days),
  });
  return fetchJson<MandiPriceEntry[]>(`/api/v1/prices?${params}`);
}

export function registerFarmer(body: {
  name: string;
  phone: string;
  district: string;
  preferredLang: string;
}): Promise<FarmerResponse> {
  return fetchJson<FarmerResponse>("/api/v1/farmers", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getFarmerListings(farmerId: string): Promise<ListingResponse[]> {
  return fetchJson<ListingResponse[]>(`/api/v1/listings/farmer/${farmerId}`);
}

export function createListing(body: {
  farmerId: string;
  cropId: string;
  quantityQ: number;
  harvestDate: string;
  photoUrl?: string;
  expectedPricePerQ: number;
}): Promise<ListingResponse> {
  return fetchJson<ListingResponse>("/api/v1/listings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Chart-friendly rows from daily forecast DTOs. */
export function weatherChartData(weather: WeatherSummary) {
  return weather.dailyForecasts.map((d) => ({
    time: d.date.slice(5),
    temperature: d.maxTemp,
    precipitationProbability: d.precipitationProbability,
  }));
}
