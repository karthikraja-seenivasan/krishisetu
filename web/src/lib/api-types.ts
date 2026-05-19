/** Types aligned with Spring Boot API DTOs (Jackson camelCase). */

export type Season = "KHARIF" | "RABI" | "SUMMER";

export interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  weatherCode: number;
  precipitationProbability: number;
}

export interface WeatherSummary {
  latitude: number;
  longitude: number;
  currentTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  precipitationProbability: number;
  weatherCode: number;
  condition: string;
  historicalAverageTemperature: number;
  historicalAveragePrecipitation: number;
  dailyForecasts: DailyForecast[];
}

export interface ExpectedPriceBand {
  low: number;
  high: number;
  modal: number;
}

export interface ProjectedNetReturnPerAcre {
  low: number;
  high: number;
}

export interface CropRecommendation {
  cropId: string;
  cropNameEn: string;
  cropNameKn: string;
  suitabilityScore: number;
  rationale: string;
  expectedYieldQPerAcre: number;
  expectedPriceBandPerQ: ExpectedPriceBand;
  inputCostPerAcre: number;
  projectedNetReturnPerAcre: ProjectedNetReturnPerAcre;
}

export interface CropRecommendationsResponse {
  season: Season;
  recommendations: CropRecommendation[];
}

export interface FarmerResponse {
  id: string;
  name: string;
  district: string;
  preferredLang: string;
  createdAt: string;
}

export interface ListingResponse {
  id: string;
  farmerId: string;
  cropId: string;
  quantityQ: number;
  harvestDate: string;
  photoUrl: string | null;
  expectedPricePerQ: number;
  status: string;
  createdAt: string;
}

export interface MandiPriceEntry {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}
