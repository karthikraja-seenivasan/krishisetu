"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Language, translations } from "@/lib/dictionary";
import type { CropRecommendation, ListingResponse, MandiPriceEntry, Season } from "@/lib/api-types";
import {
  getCropRecommendations,
  getFarmerListings,
  getMandiPrices,
  getWeather,
  registerFarmer,
  weatherChartData,
} from "@/lib/krishisetu-api";
import {
  Sprout,
  CloudSun,
  Phone,
  User,
  Tag,
  Home as HomeIcon,
  Mic,
  ArrowLeft,
  Check,
  MapPin,
  X,
  Sparkles,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  ShoppingBag,
  Info,
  Calendar,
  IndianRupee,
  CheckCircle2
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from "recharts";

// Coordinate presets for Districts in Karnataka
interface District {
  nameEn: string;
  nameKn: string;
  lat: number;
  lon: number;
}

const DISTRICTS: District[] = [
  { nameEn: "Kolar", nameKn: "ಕೋಲಾರ", lat: 13.13, lon: 78.13 },
  { nameEn: "Chickballapur", nameKn: "ಚಿಕ್ಕಬಳ್ಳಾಪುರ", lat: 13.43, lon: 77.73 },
  { nameEn: "Bangalore Rural", nameKn: "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ", lat: 13.23, lon: 77.70 },
  { nameEn: "Tumakuru", nameKn: "ತುಮಕೂರು", lat: 13.34, lon: 77.10 }
];

type ScreenState = "WELCOME" | "ONBOARDING" | "DASHBOARD";
type SeasonType = Season;
type ActiveTabType = "home" | "crops" | "sell" | "profile";

export default function App() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("WELCOME");
  const [lang, setLang] = useState<Language>("kn");
  const [activeTab, setActiveTab] = useState<ActiveTabType>("home");
  const [season, setSeason] = useState<SeasonType>("KHARIF");

  // Onboarding form state
  const [farmerName, setFarmerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<District>(DISTRICTS[0]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; terms?: string; submit?: string }>({});

  // Registered UUID of farmer from backend
  const [farmerId, setFarmerId] = useState<string | null>(null);

  // Voice assistant state
  const [isMicOpen, setIsMicOpen] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Mandi Price Search
  const [mandiSearch, setMandiSearch] = useState("");

  const t = translations[lang];

  // Initialize and check local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("krishisetu_farmer_id");
      const storedLang = localStorage.getItem("krishisetu_lang") as Language;
      const storedName = localStorage.getItem("krishisetu_farmer_name");
      const storedPhone = localStorage.getItem("krishisetu_farmer_phone");

      if (storedId) {
        setFarmerId(storedId);
        setCurrentScreen("DASHBOARD");
      }
      if (storedLang === "en" || storedLang === "kn") {
        setLang(storedLang);
      }
      if (storedName) setFarmerName(storedName);
      if (storedPhone) setPhoneNumber(storedPhone);
    }
  }, []);

  // Queries using TanStack Query v5 syntax
  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    error: weatherError
  } = useQuery({
    queryKey: ["weather", selectedDistrict.lat, selectedDistrict.lon],
    queryFn: () => getWeather(selectedDistrict.lat, selectedDistrict.lon),
    enabled: currentScreen === "DASHBOARD",
  });

  const {
    data: cropRecommendations,
    isLoading: isCropsLoading,
    error: cropsError
  } = useQuery<CropRecommendation[]>({
    queryKey: ["crops", selectedDistrict.lat, selectedDistrict.lon, season],
    queryFn: () =>
      getCropRecommendations(selectedDistrict.lat, selectedDistrict.lon, season),
    enabled: currentScreen === "DASHBOARD" && activeTab === "crops",
  });

  const {
    data: activeListings,
    isLoading: isListingsLoading
  } = useQuery<ListingResponse[]>({
    queryKey: ["listings", farmerId],
    queryFn: () => getFarmerListings(farmerId!),
    enabled: !!farmerId && currentScreen === "DASHBOARD" && activeTab === "sell",
  });

  const {
    data: allMandiPrices,
    isLoading: isPricesLoading
  } = useQuery<MandiPriceEntry[]>({
    queryKey: ["allPrices", selectedDistrict.nameEn],
    queryFn: () => getMandiPrices("Tomato", selectedDistrict.nameEn),
    enabled: currentScreen === "DASHBOARD" && activeTab === "sell",
  });

  const handleLanguageToggle = () => {
    const nextLang = lang === "en" ? "kn" : "en";
    setLang(nextLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("krishisetu_lang", nextLang);
    }
  };

  const validateAndSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};

    if (farmerName.trim().length < 2) {
      errors.name = t.onboardingErrorName;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      errors.phone = t.onboardingErrorPhone;
    }
    if (!agreeTerms) {
      errors.terms = "Please accept the local weather advisor agreement";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const regResponse = await registerFarmer({
        name: farmerName,
        phone: phoneNumber,
        district: selectedDistrict.nameEn,
        preferredLang: lang,
      });

      setFarmerId(regResponse.id);
      if (typeof window !== "undefined") {
        localStorage.setItem("krishisetu_farmer_id", regResponse.id);
        localStorage.setItem("krishisetu_farmer_name", farmerName);
        localStorage.setItem("krishisetu_farmer_phone", phoneNumber);
        localStorage.setItem("krishisetu_lang", lang);
      }
      setFormErrors({});
      setCurrentScreen("DASHBOARD");
    } catch {
      setFormErrors({
        submit:
          lang === "kn"
            ? "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. API ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ."
            : "Registration failed. Ensure the API is running on port 8080.",
      });
    }
  };

  // Helper to format large numbers cleanly
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(lang === "kn" ? "kn-IN" : "en-US").format(num);
  };

  // Mock voice responses to simulate interactive farmer onboarding or query flow
  const handleMicTap = () => {
    setIsListening(true);
    setVoiceText(t.micListening);
    setTimeout(() => {
      setIsListening(false);
      setVoiceText(
        lang === "kn"
          ? "ಕೋಲಾರ ಜಿಲ್ಲೆಯಲ್ಲಿ ಈ ಖಾರಿಫ್ ಹಂಗಾಮಿಗೆ ಟೊಮ್ಯಾಟೋ ಮತ್ತು ರಾಗಿ ಬೆಳೆಗಳು ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿವೆ."
          : "Tomato and Ragi are highly recommended for Kolar district this Kharif season."
      );
    }, 2000);
  };

  // Filter mandi prices matching search term
  const filteredMandiPrices = allMandiPrices
    ? allMandiPrices.filter((p) =>
        p.commodity.toLowerCase().includes(mandiSearch.toLowerCase()) ||
        p.market.toLowerCase().includes(mandiSearch.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-brand-cream text-brand-textPrimary flex flex-col font-sans selection:bg-brand-green-100 relative">
      {/* 🔴 Global Demo Header */}
      <div className="bg-brand-saffron text-white text-xs font-semibold py-1 px-4 text-center z-50 flex items-center justify-center gap-2 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>{t.demoTag}</span>
      </div>

      {/* 📱 1. WELCOME SCREEN */}
      {currentScreen === "WELCOME" && (
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white shadow-lg overflow-hidden border-x border-brand-border">
          {/* Top 40% Sunset crop image */}
          <div
            className="h-[40vh] bg-cover bg-center relative flex items-end p-6"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(26,46,31,0.9)), url('https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=800')"
            }}
          >
            <div className="w-full">
              <h1 className="text-white text-4xl font-bold font-kannada leading-tight tracking-wide">
                {lang === "kn" ? "ಕೃಷಿಸೇತು" : "KrishiSetu"}
              </h1>
              <p className="text-brand-cream/80 text-lg font-medium mt-1">
                {t.tagline}
              </p>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-between">
            {/* Language Selection Buttons */}
            <div className="mt-4 space-y-4">
              <label className="block text-brand-textSecondary text-sm font-semibold tracking-wide uppercase">
                {lang === "kn" ? "ಭಾಷೆಯನ್ನು ಆರಿಸಿ / Choose Language" : "Choose Language / ಭಾಷೆಯನ್ನು ಆರಿಸಿ"}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLang("kn")}
                  className={`h-16 rounded-button font-kannada font-semibold text-lg flex items-center justify-center border-2 transition-all ${
                    lang === "kn"
                      ? "border-brand-green-700 bg-brand-green-100 text-brand-green-800 shadow-sm"
                      : "border-brand-border hover:border-brand-green-700 bg-white"
                  }`}
                >
                  ಕನ್ನಡ
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`h-16 rounded-button font-sans font-semibold text-lg flex items-center justify-center border-2 transition-all ${
                    lang === "en"
                      ? "border-brand-green-700 bg-brand-green-100 text-brand-green-800 shadow-sm"
                      : "border-brand-border hover:border-brand-green-700 bg-white"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="space-y-4 mt-8">
              <button
                onClick={() => setCurrentScreen("ONBOARDING")}
                className="w-full h-14 bg-brand-green-700 hover:bg-brand-green-800 active:scale-[0.98] text-white rounded-button font-bold text-lg flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {t.getStarted}
              </button>
              <p className="text-center text-xs text-brand-textMuted tracking-wider font-semibold">
                SECURE INTERFACE · METEOROLOGICAL rules matrix
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 📱 2. ONBOARDING SCREEN */}
      {currentScreen === "ONBOARDING" && (
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white shadow-lg border-x border-brand-border">
          {/* Header */}
          <header className="h-16 border-b border-brand-border px-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen("WELCOME")}
              className="flex items-center gap-1.5 text-brand-green-700 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.back}</span>
            </button>
            <h2 className="text-lg font-bold text-brand-textPrimary font-kannada">
              {t.brandName}
            </h2>
            <button
              onClick={handleLanguageToggle}
              className="px-3 py-1 text-sm font-bold border border-brand-green-700 text-brand-green-800 rounded-full bg-brand-green-100"
            >
              {lang === "en" ? "ಕ" : "EN"}
            </button>
          </header>

          {/* Form */}
          <form onSubmit={validateAndSubmitOnboarding} className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-textPrimary leading-tight">
                  {t.onboardingTitle}
                </h2>
                <p className="text-brand-textSecondary text-sm mt-1 leading-relaxed">
                  {t.onboardingSub}
                </p>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-brand-textPrimary text-base font-semibold">
                  {t.farmerNameLabel}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-textMuted" />
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder={t.farmerNamePlaceholder}
                    className={`w-full h-14 pl-12 pr-4 bg-brand-cream/40 border rounded-input font-medium transition-all ${
                      formErrors.name ? "border-brand-danger" : "border-brand-border"
                    }`}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-brand-danger text-sm flex items-center gap-1.5 font-medium mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{formErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="block text-brand-textPrimary text-base font-semibold">
                  {t.phoneNumberLabel}
                </label>
                <div className="relative flex">
                  <div className="h-14 px-4 bg-brand-cream/80 border-y border-l border-brand-border rounded-l-input flex items-center text-brand-textSecondary font-bold text-lg select-none">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-textMuted" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={t.phoneNumberPlaceholder}
                      maxLength={10}
                      className={`w-full h-14 pl-12 pr-4 bg-brand-cream/40 border-y border-r rounded-r-input font-medium transition-all ${
                        formErrors.phone ? "border-brand-danger" : "border-brand-border"
                      }`}
                    />
                  </div>
                </div>
                {formErrors.phone && (
                  <p className="text-brand-danger text-sm flex items-center gap-1.5 font-medium mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{formErrors.phone}</span>
                  </p>
                )}
              </div>

              {/* District Field */}
              <div className="space-y-2">
                <label className="block text-brand-textPrimary text-base font-semibold">
                  {t.districtLabel}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-textMuted" />
                  <select
                    value={selectedDistrict.nameEn}
                    onChange={(e) => {
                      const matched = DISTRICTS.find((d) => d.nameEn === e.target.value);
                      if (matched) setSelectedDistrict(matched);
                    }}
                    className="w-full h-14 pl-12 pr-4 bg-brand-cream/40 border border-brand-border rounded-input font-medium appearance-none focus:outline-none focus:border-brand-green-700"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d.nameEn} value={d.nameEn}>
                        {lang === "kn" ? d.nameKn : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="relative flex items-start gap-3 mt-4">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-5 h-5 text-brand-green-700 border-brand-border rounded focus:ring-brand-green-700 bg-brand-cream/40"
                  />
                </div>
                <label htmlFor="terms" className="text-brand-textSecondary text-sm font-medium leading-normal cursor-pointer select-none">
                  {t.agreeToTerms}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 space-y-3">
              {formErrors.submit && (
                <p className="text-brand-danger text-sm flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formErrors.submit}</span>
                </p>
              )}
              <button
                type="submit"
                className="w-full h-14 bg-brand-green-700 hover:bg-brand-green-800 active:scale-[0.98] text-white rounded-button font-bold text-lg flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {t.continue}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📱 3. DASHBOARD SCREEN */}
      {currentScreen === "DASHBOARD" && (
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-brand-cream shadow-lg border-x border-brand-border pb-16">
          {/* Top Sticky Bar */}
          <header className="h-16 bg-white border-b border-brand-border px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <Sprout className="w-7 h-7 text-brand-green-700 animate-pulse" />
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-brand-textPrimary font-sans">
                  {t.brandName}
                </h1>
                <p className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider">
                  Kolar Advisory Hub
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Active District Tag */}
              <span className="text-xs font-bold px-2.5 py-1 bg-brand-green-100 text-brand-green-800 rounded-full flex items-center gap-1 border border-brand-green-700/20">
                <MapPin className="w-3 h-3 text-brand-green-700" />
                {lang === "kn" ? selectedDistrict.nameKn : selectedDistrict.nameEn}
              </span>

              {/* Language toggle pill */}
              <button
                onClick={handleLanguageToggle}
                className="w-10 h-8 font-bold border border-brand-green-700 text-brand-green-800 rounded-full bg-brand-green-100 text-xs flex items-center justify-center"
              >
                {lang === "en" ? "ಕ" : "EN"}
              </button>
            </div>
          </header>

          {/* Tab Views Container */}
          <main className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Tab 1: HOME */}
            {activeTab === "home" && (
              <div className="space-y-6">
                {/* Weather Advisory Card */}
                <div className="bg-white rounded-card border border-brand-border p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-brand-textPrimary flex items-center gap-2">
                        <CloudSun className="w-5 h-5 text-brand-saffron" />
                        {t.weatherPanelTitle}
                      </h3>
                      <p className="text-brand-textSecondary text-xs">
                        {t.weatherSub}
                      </p>
                    </div>
                    {weatherData && (
                      <span className="text-xs font-bold px-2 py-0.5 bg-brand-saffron/10 text-brand-saffron rounded border border-brand-saffron/20">
                        {weatherData.condition}
                      </span>
                    )}
                  </div>

                  {isWeatherLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3 text-brand-textSecondary">
                      <div className="w-8 h-8 rounded-full border-4 border-brand-green-700 border-t-transparent animate-spin"></div>
                      <p className="text-sm font-medium">{t.loadingWeather}</p>
                    </div>
                  ) : weatherError ? (
                    <div className="py-6 text-center text-brand-danger flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8" />
                      <p className="text-sm font-semibold">{t.errorLoading}</p>
                    </div>
                  ) : (
                    weatherData && (
                      <div className="space-y-5">
                        {/* Temperature & Climatic Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-brand-cream/40 p-4 rounded-input border border-brand-border">
                            <span className="text-xs font-bold text-brand-textSecondary uppercase tracking-wider block">
                              {t.tempLabel}
                            </span>
                            <span className="text-3xl font-bold font-tabular text-brand-textPrimary block mt-1">
                              {weatherData.currentTemperature.toFixed(1)}°C
                            </span>
                            <span className="text-xs text-brand-textMuted mt-1 block">
                              Min: {weatherData.minTemperature}°C · Max: {weatherData.maxTemperature}°C
                            </span>
                          </div>

                          <div className="bg-brand-cream/40 p-4 rounded-input border border-brand-border">
                            <span className="text-xs font-bold text-brand-textSecondary uppercase tracking-wider block">
                              {t.humidityLabel}
                            </span>
                            <span className="text-3xl font-bold font-tabular text-brand-textPrimary block mt-1">
                              {weatherData.precipitationProbability}%
                            </span>
                            <span className="text-xs text-brand-textMuted mt-1 block">
                              {lang === "kn" ? "ಮಳೆಯ ಸಾಧ್ಯತೆ" : "Rain probability today"}
                            </span>
                          </div>
                        </div>

                        {/* Forecast Chart */}
                        <div className="space-y-2">
                          <span className="text-sm font-bold text-brand-textSecondary block">
                            {lang === "kn" ? "೭-ದಿನದ ತಾಪಮಾನ ಮುನ್ಸೂಚನೆ" : "7-Day Temperature Forecast"}
                          </span>
                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={weatherChartData(weatherData)}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                              >
                                <XAxis dataKey="time" tick={{ fill: "#5B5249", fontSize: 11 }} />
                                <YAxis tick={{ fill: "#5B5249", fontSize: 11 }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#FFFFFF",
                                    border: "1px solid #E8E2D5",
                                    borderRadius: "8px"
                                  }}
                                />
                                <Bar dataKey="temperature" fill="#2D7A3A" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* NASA Power Climatology Context */}
                {weatherData && (
                  <div className="bg-white rounded-card border border-brand-border p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-brand-textPrimary flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-brand-green-700" />
                        {t.climatologyTitle}
                      </h3>
                      <p className="text-brand-textSecondary text-xs">
                        {t.climatologySub}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-brand-green-100/40 p-3 rounded-input border border-brand-green-700/10">
                        <span className="text-xs font-semibold text-brand-textSecondary block">30-Yr Precip Mean</span>
                        <span className="text-xl font-bold font-tabular text-brand-green-800 mt-1 block">
                          {weatherData.historicalAveragePrecipitation.toFixed(1)} mm
                        </span>
                      </div>
                      <div className="bg-brand-green-100/40 p-3 rounded-input border border-brand-green-700/10">
                        <span className="text-xs font-semibold text-brand-textSecondary block">30-Yr Temp Mean</span>
                        <span className="text-xl font-bold font-tabular text-brand-green-800 mt-1 block">
                          {weatherData.historicalAverageTemperature.toFixed(1)}°C
                        </span>
                      </div>
                    </div>

                    <div className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { month: "Jan", rain: 5 },
                            { month: "Mar", rain: 20 },
                            { month: "May", rain: 60 },
                            { month: "Jul", rain: 110 },
                            { month: "Sep", rain: weatherData.historicalAveragePrecipitation },
                            { month: "Nov", rain: 30 }
                          ]}
                          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                        >
                          <XAxis dataKey="month" tick={{ fill: "#5B5249", fontSize: 10 }} />
                          <YAxis tick={{ fill: "#5B5249", fontSize: 10 }} />
                          <Area type="monotone" dataKey="rain" stroke="#2D7A3A" fill="#E4F0E5" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Micro advisor info footer */}
                <div className="text-center text-xs text-brand-textMuted leading-relaxed">
                  Weather fetched live from Open-Meteo & NASA POWER.<br />
                  Soil parameters default to Kolar Sandy Loam (pH 6.7).
                </div>
              </div>
            )}

            {/* Tab 2: CROPS RECOMMENDATIONS */}
            {activeTab === "crops" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-brand-textPrimary font-kannada">
                    {t.recommendationsTitle}
                  </h2>
                  <p className="text-brand-textSecondary text-sm mt-1">
                    {t.recommendationsSub}
                  </p>
                </div>

                {/* Season Toggle Pills */}
                <div className="flex gap-2 p-1.5 bg-brand-cream border border-brand-border rounded-input">
                  {(["KHARIF", "RABI", "SUMMER"] as SeasonType[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeason(s)}
                      className={`flex-1 py-3 text-center rounded-button font-bold text-sm transition-all uppercase tracking-wider ${
                        season === s
                          ? "bg-brand-green-700 text-white shadow-sm"
                          : "text-brand-textSecondary hover:bg-brand-green-100/50"
                      }`}
                    >
                      {lang === "kn"
                        ? s === "KHARIF"
                          ? "ಖಾರಿಫ್"
                          : s === "RABI"
                            ? "ರಬಿ"
                            : "ಬೇಸಿಗೆ"
                        : s}
                    </button>
                  ))}
                </div>

                {/* Recommendations List */}
                {isCropsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-brand-textSecondary">
                    <div className="w-8 h-8 rounded-full border-4 border-brand-green-700 border-t-transparent animate-spin"></div>
                    <p className="text-sm font-medium">{t.loadingCrops}</p>
                  </div>
                ) : cropsError ? (
                  <div className="py-8 text-center text-brand-danger flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-10 h-10" />
                    <p className="text-sm font-semibold">{t.errorLoading}</p>
                  </div>
                ) : (
                  cropRecommendations && (
                    <div className="space-y-4">
                      {cropRecommendations.map((rec) => {
                        const isHigh = rec.suitabilityScore >= 80;
                        const scoreBg = isHigh ? "bg-brand-success text-white" : "bg-brand-warning text-brand-textPrimary";

                        return (
                          <div
                            key={rec.cropId}
                            onClick={() => router.push(`/crops/${rec.cropId}`)}
                            className="bg-white rounded-card border border-brand-border p-5 space-y-4 hover:border-brand-green-700/40 cursor-pointer active:scale-[0.99] hover:shadow-md transition-all duration-200"
                          >
                            {/* Title & Score Indicator */}
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-brand-textPrimary flex items-center gap-1.5">
                                  <span>{lang === "kn" ? rec.cropNameKn : rec.cropNameEn}</span>
                                  <span className="text-[10px] text-brand-green-700 bg-brand-green-100 font-bold px-1.5 py-0.5 rounded">
                                    {lang === "kn" ? "ವಿವರ ನೋಡಿ" : "View"}
                                  </span>
                                </h3>
                                <span className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
                                  {rec.cropNameEn}
                                </span>
                              </div>
                              <div className={`px-3.5 py-1.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-1.5 ${scoreBg}`}>
                                <Check className="w-4 h-4 stroke-[3px]" />
                                <span>
                                  {t.suitabilityScore}: {rec.suitabilityScore}
                                </span>
                              </div>
                            </div>

                            {/* Yield / Cost Specifications Grid */}
                            <div className="grid grid-cols-3 gap-2 py-2 border-y border-brand-border/60 text-center font-tabular">
                              <div>
                                <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">
                                  {t.typicalYield}
                                </span>
                                <span className="text-base font-bold text-brand-textPrimary mt-0.5 block">
                                  {rec.expectedYieldQPerAcre} q/acre
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">
                                  {t.typicalPrice}
                                </span>
                                <span className="text-base font-bold text-brand-textPrimary mt-0.5 block">
                                  ₹{formatNumber(rec.expectedPriceBandPerQ.modal)}/q
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">
                                  {t.inputCost}
                                </span>
                                <span className="text-base font-bold text-brand-textPrimary mt-0.5 block">
                                  ₹{formatNumber(rec.inputCostPerAcre)}
                                </span>
                              </div>
                            </div>

                            {/* Economic Projection return */}
                            <div className="bg-brand-green-100/50 rounded-input p-4 border border-brand-green-700/10 flex items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider block">
                                  {t.projectedNetReturn}
                                </span>
                                <span className="text-lg font-bold text-brand-green-800 mt-1 block">
                                  ₹{formatNumber(rec.projectedNetReturnPerAcre.low)} - ₹{formatNumber(rec.projectedNetReturnPerAcre.high)}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-brand-green-700 uppercase tracking-wider px-2 py-0.5 bg-brand-green-100 rounded border border-brand-green-700/20">
                                per acre
                              </span>
                            </div>

                            {/* Advisor Rationale */}
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-brand-textSecondary uppercase tracking-wider block">
                                {t.rationaleTitle}
                              </span>
                              <p className="text-brand-textPrimary text-sm leading-relaxed bg-brand-cream/40 p-3 rounded-input border border-brand-border">
                                {rec.rationale}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Tab 3: HIGH-FIDELITY INTERACTIVE MARKETPLACE */}
            {activeTab === "sell" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-brand-textPrimary font-kannada">
                    {lang === "kn" ? "ನಿಮ್ಮ ಬೆಳೆ ಮಾರಿ" : "Sell Your Produce"}
                  </h2>
                  <p className="text-brand-textSecondary text-sm mt-1">
                    {lang === "kn"
                      ? "ಸ್ಥಳೀಯ ಕೋಲಾರ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ನೋಡಿ ಮತ್ತು ಹೊಸ ಉತ್ಪನ್ನದ ಕೊಡುಗೆ ಪಟ್ಟಿ ಮಾಡಿ."
                      : "Check regional Kolar mandi rates and post offers directly to verified buyers."}
                  </p>
                </div>

                {/* Create Listing FAB / CTA Card */}
                <div className="bg-white rounded-card border-2 border-brand-green-700/30 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-green-100 text-brand-green-700 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-textPrimary">
                        {lang === "kn" ? "ಹೊಸ ಬೆಳೆ ಕೊಡುಗೆ ಪೋಸ್ಟ್ ಮಾಡಿ" : "Post a New Harvest"}
                      </h4>
                      <p className="text-xs text-brand-textSecondary">
                        {lang === "kn" ? "ಸುಲಭವಾಗಿ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ ಮೂಲಕ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ" : "Simulated camera upload to secure storage"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/listings/new")}
                    className="w-full h-12 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-button font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{lang === "kn" ? "ಹೊಸ ಕೊಡುಗೆ ಸೃಷ್ಟಿಸಿ" : "Create New Offer"}</span>
                  </button>
                </div>

                {/* Farmer's Active Listings Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase text-brand-textSecondary tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-green-700" />
                    {lang === "kn" ? "ನನ್ನ ಸಕ್ರಿಯ ಉತ್ಪನ್ನ ಕೊಡುಗೆಗಳು" : "My Active Crop Offers"}
                  </h3>

                  {isListingsLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-brand-textSecondary text-xs">
                      <div className="w-6 h-6 border-3 border-brand-green-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>{lang === "kn" ? "ಪಟ್ಟಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : "Loading offers..."}</span>
                    </div>
                  ) : activeListings && activeListings.length > 0 ? (
                    <div className="space-y-3.5">
                      {activeListings.map((listing) => (
                        <div
                          key={listing.id}
                          className="bg-white rounded-card border border-brand-border p-4 flex gap-4 hover:border-brand-green-700/40 transition-all duration-200 shadow-sm"
                        >
                          <div className="w-20 h-20 bg-brand-cream rounded-input overflow-hidden flex-shrink-0 relative border border-brand-border">
                            {listing.photoUrl ? (
                              <img src={listing.photoUrl} alt={listing.cropId} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-2xl uppercase text-brand-textMuted bg-brand-cream">
                                {listing.cropId.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-0.5">
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-base text-brand-textPrimary uppercase">
                                  {listing.cropId}
                                </h4>
                                <span className="px-2 py-0.5 bg-brand-success text-white text-[9px] font-bold rounded uppercase tracking-wider">
                                  {lang === "kn" ? "ತೆರೆದಿದೆ" : "Active"}
                                </span>
                              </div>
                              <p className="text-xs text-brand-textSecondary font-semibold">
                                {lang === "kn" ? "ಪ್ರಮಾಣ" : "Volume"}: {listing.quantityQ} Quintal
                              </p>
                              <p className="text-xs text-brand-green-800 font-bold">
                                {lang === "kn" ? "ನಿರೀಕ್ಷಿತ ಬೆಲೆ" : "Expected Price"}: ₹{formatNumber(listing.expectedPricePerQ)}/q
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-brand-textMuted font-bold">
                              <Calendar className="w-3 h-3 text-brand-textMuted" />
                              <span>
                                {lang === "kn" ? "ಕೊಯ್ಲು ದಿನಾಂಕ" : "Harvest"}: {listing.harvestDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-card border border-brand-border p-6 text-center text-xs text-brand-textSecondary flex flex-col items-center justify-center gap-2">
                      <Info className="w-5 h-5 text-brand-textMuted" />
                      <span>
                        {lang === "kn"
                          ? "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಬೆಳೆ ಆಫರ್ ಪೋಸ್ಟ್ ಮಾಡಿಲ್ಲ."
                          : "No active harvest offerings posted yet. Tap Create New Offer above."}
                      </span>
                    </div>
                  )}
                </div>

                {/* Mandi Rates Lookup Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase text-brand-textSecondary tracking-wider flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-brand-green-700" />
                      {lang === "kn" ? "ಸರ್ಕಾರಿ ಮಾರುಕಟ್ಟೆ ದರಗಳು (Agmarknet)" : "Agmarknet Live Mandi Rates"}
                    </h3>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={lang === "kn" ? "ಬೆಳೆ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಹುಡುಕಿ..." : "Search crop or mandi market..."}
                      value={mandiSearch}
                      onChange={(e) => setMandiSearch(e.target.value)}
                      className="w-full h-12 px-4 bg-white border border-brand-border rounded-input text-sm font-semibold focus:outline-none focus:border-brand-green-700"
                    />
                    {mandiSearch && (
                      <button
                        onClick={() => setMandiSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-textMuted hover:text-brand-textPrimary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isPricesLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-brand-textSecondary text-xs">
                      <div className="w-6 h-6 border-3 border-brand-green-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>{lang === "kn" ? "ದರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Loading Agmarknet indices..."}</span>
                    </div>
                  ) : filteredMandiPrices.length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {filteredMandiPrices.map((price, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-white border border-brand-border rounded-input flex items-center justify-between text-xs font-tabular shadow-sm hover:border-brand-green-700/20"
                        >
                          <div>
                            <span className="font-extrabold text-brand-textPrimary block">
                              {price.commodity}
                            </span>
                            <span className="text-[10px] text-brand-textSecondary block uppercase font-bold tracking-tight">
                              {price.market} Mandi · {price.variety}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-brand-green-800 block text-sm">
                              ₹{formatNumber(price.modalPrice)}/q
                            </span>
                            <span className="text-[9px] text-brand-textMuted block font-semibold">
                              Min: ₹{price.minPrice} · Max: ₹{price.maxPrice}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-card border border-brand-border p-5 text-center text-xs text-brand-textSecondary flex items-center gap-2 justify-center">
                      <Info className="w-4 h-4 text-brand-textMuted" />
                      <span>
                        {lang === "kn"
                          ? "ಯಾವುದೇ ಹೊಂದಾಣಿಕೆಯ ಬೆಳೆ ಬೆಲೆ ಸೂಚಿಕೆ ಕಂಡುಬಂದಿಲ್ಲ."
                          : "No matching mandi price index found."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-brand-textPrimary font-kannada">
                    {lang === "kn" ? "ನನ್ನ ಪ್ರೊಫೈಲ್" : "Farmer Profile"}
                  </h2>
                  <p className="text-brand-textSecondary text-sm mt-1">
                    Your digital agricultural identity card.
                  </p>
                </div>

                <div className="bg-white rounded-card border border-brand-border p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-brand-green-700 text-white rounded-input flex items-center justify-center font-bold text-2xl uppercase shadow-md">
                      {farmerName.charAt(0) || "B"}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-textPrimary">
                        {farmerName || "Basappa Gowda"}
                      </h3>
                      <p className="text-brand-textSecondary text-sm flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-green-700" />
                        {lang === "kn" ? selectedDistrict.nameKn : selectedDistrict.nameEn} District
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-brand-border pt-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-textSecondary font-medium">Registered Phone</span>
                      <span className="text-brand-textPrimary font-bold">+91 {phoneNumber || "9876543210"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-textSecondary font-medium">District Farm Coordinates</span>
                      <span className="text-brand-textPrimary font-bold font-tabular">
                        {selectedDistrict.lat}° N, {selectedDistrict.lon}° E
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-textSecondary font-medium">Assigned Soil Profile</span>
                      <span className="text-brand-textPrimary font-bold">Sandy Loam (pH 6.7)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-textSecondary font-medium">Farmer ID UUID</span>
                      <span className="text-[10px] text-brand-textMuted font-mono select-all">
                        {farmerId || "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.clear();
                    }
                    setCurrentScreen("WELCOME");
                    setFarmerId(null);
                    setFarmerName("");
                    setPhoneNumber("");
                    setAgreeTerms(false);
                    setActiveTab("home");
                  }}
                  className="w-full h-14 border-2 border-brand-danger text-brand-danger hover:bg-brand-danger/5 rounded-button font-bold text-base transition-all active:scale-[0.99]"
                >
                  {lang === "kn" ? "ಪ್ರೊಫೈಲ್ ಅಳಿಸಿ ಹೊರಹೋಗಿ" : "Reset Profile & Log Out"}
                </button>
              </div>
            )}
          </main>

          {/* Persistent Mic FAB Button */}
          <button
            onClick={() => setIsMicOpen(true)}
            className="fixed bottom-20 right-6 w-14 h-14 bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all z-40"
          >
            <Mic className="w-6 h-6 animate-bounce" />
          </button>

          {/* Voice Assistant Modal */}
          {isMicOpen && (
            <div className="fixed inset-0 bg-brand-textPrimary/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-white rounded-card w-full max-w-sm p-6 border border-brand-border space-y-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => {
                    setIsMicOpen(false);
                    setVoiceText("");
                  }}
                  className="absolute top-4 right-4 text-brand-textSecondary hover:text-brand-textPrimary"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-extrabold text-brand-textPrimary">
                    {t.micLabel}
                  </h3>
                  <p className="text-brand-textSecondary text-sm">
                    {t.micSub}
                  </p>
                </div>

                <div className="bg-brand-cream rounded-input p-4 min-h-[100px] flex items-center justify-center text-center text-base font-semibold leading-relaxed text-brand-green-800 border border-brand-border">
                  {voiceText || (lang === "kn" ? "ಮಾತನಾಡಲು ಕೆಳಗಿನ ಮೈಕ್ ಸ್ಪರ್ಶಿಸಿ..." : "Tap mic button below to talk...")}
                </div>

                <div className="flex-col flex gap-2">
                  <div className="flex justify-center">
                    <button
                      onClick={handleMicTap}
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all ${
                        isListening
                          ? "bg-brand-danger text-white animate-pulse"
                          : "bg-brand-green-700 text-white hover:bg-brand-green-800"
                      }`}
                    >
                      <Mic className="w-7 h-7" />
                    </button>
                  </div>
                  {voiceText && (
                    <button
                      onClick={() => {
                        setIsMicOpen(false);
                        setVoiceText("");
                        setActiveTab("crops");
                      }}
                      className="text-xs font-bold text-brand-green-700 underline text-center mt-2 cursor-pointer"
                    >
                      {lang === "kn" ? "ಬೆಳೆ ತಜ್ಞರ ಶಿಫಾರಸುಗಳನ್ನು ವೀಕ್ಷಿಸಿ" : "View recommended crops matching this guidance"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Sticky Navigation */}
          <nav className="h-16 bg-white border-t border-brand-border fixed bottom-0 left-0 right-0 max-w-md mx-auto w-full flex z-35">
            {[
              { id: "home", labelEn: "Home", labelKn: "ಮುಖ", icon: HomeIcon },
              { id: "crops", labelEn: "Crops", labelKn: "ಬೆಳೆಗಳು", icon: Sprout },
              { id: "sell", labelEn: "Sell", labelKn: "ಮಾರಾಟ", icon: Tag },
              { id: "profile", labelEn: "Profile", labelKn: "ಪ್ರೊಫೈಲ್", icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTabType)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 text-center transition-all"
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-brand-green-700 stroke-[2.5px]" : "text-brand-textSecondary"}`} />
                  <span className={`text-[11px] font-bold ${isActive ? "text-brand-green-700" : "text-brand-textSecondary"}`}>
                    {lang === "kn" ? tab.labelKn : tab.labelEn}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
