"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import {
  ArrowLeft,
  TrendingUp,
  Droplets,
  Sparkles,
  Info,
  Layers,
  Thermometer,
  Calculator,
  Compass,
  CheckCircle
} from "lucide-react";

interface MandiPriceEntry {
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

const CROP_METADATA: Record<
  string,
  {
    cropId: string;
    cropNameEn: string;
    cropNameKn: string;
    icon: string;
    image: string;
    minRainfallMm: number;
    maxRainfallMm: number;
    minTempC: number;
    maxTempC: number;
    minSoilPh: number;
    maxSoilPh: number;
    preferredSoilTexture: string;
    typicalInputCostPerAcre: number;
    typicalYieldQPerAcre: number;
    growthDurationDays: number;
    waterRequirementLevel: string;
    typicalPriceBand: { low: number; high: number; modal: number };
    advisoryTips: { en: string[]; kn: string[] };
  }
> = {
  tomato: {
    cropId: "tomato",
    cropNameEn: "Tomato",
    cropNameKn: "ಟೊಮ್ಯಾಟೋ",
    icon: "🍅",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=800",
    minRainfallMm: 400.0,
    maxRainfallMm: 800.0,
    minTempC: 18.0,
    maxTempC: 32.0,
    minSoilPh: 6.0,
    maxSoilPh: 7.5,
    preferredSoilTexture: "Sandy Loam",
    typicalInputCostPerAcre: 52000.0,
    typicalYieldQPerAcre: 180.0,
    growthDurationDays: 110,
    waterRequirementLevel: "MEDIUM",
    typicalPriceBand: { low: 800.0, high: 1500.0, modal: 1200.0 },
    advisoryTips: {
      en: [
        "Prepare nursery beds 25-30 days before transplanting.",
        "Apply neem cake to soil to prevent nematode infestation.",
        "Staking is highly recommended for indeterminate varieties to prevent fruit rotting.",
        "Ensure uniform irrigation; dry spells followed by heavy watering causes blossom end rot."
      ],
      kn: [
        "ನಾಟಿ ಮಾಡುವ ೨೫-೩೦ ದಿನಗಳ ಮೊದಲು ನರ್ಸರಿ ಪಾತಿಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ.",
        "ಚಿತ್ರಕ್ರಿಮಿ ಮತ್ತು ನೆಮಟೋಡ್ ಬಾಧೆಯನ್ನು ತಡೆಗಟ್ಟಲು ಮಣ್ಣಿಗೆ ಬೇವಿನ ಹಿಂಡಿ ಹಾಕಿ.",
        "ಹಣ್ಣು ಕೊಳೆಯುವುದನ್ನು ತಡೆಯಲು ಬೆಳೆಗಳಿಗೆ ಕೋಲುಗಳನ್ನು ನೆಟ್ಟು ಆಧಾರ ನೀಡುವುದು ಸೂಕ್ತ.",
        "ಏಕರೂಪದ ನೀರಾವರಿಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ; ಒಣ ಹಂಗಾಮಿನ ನಂತರ ಭಾರಿ ನೀರುಣಿಸುವಿಕೆಯಿಂದ ಕಾಯಿ ಒಡೆಯುತ್ತದೆ."
      ]
    }
  },
  ragi: {
    cropId: "ragi",
    cropNameEn: "Ragi (Finger Millet)",
    cropNameKn: "ರಾಗಿ",
    icon: "🌾",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800",
    minRainfallMm: 300.0,
    maxRainfallMm: 600.0,
    minTempC: 15.0,
    maxTempC: 35.0,
    minSoilPh: 5.0,
    maxSoilPh: 8.2,
    preferredSoilTexture: "Sandy Loam",
    typicalInputCostPerAcre: 12000.0,
    typicalYieldQPerAcre: 15.0,
    growthDurationDays: 120,
    waterRequirementLevel: "LOW",
    typicalPriceBand: { low: 3500.0, high: 4200.0, modal: 3840.0 },
    advisoryTips: {
      en: [
        "Excellent drought-tolerant crop suitable for dryland agriculture in Kolar.",
        "Maintain optimum plant spacing of 30cm x 10cm.",
        "Apply organic farmyard manure generously during soil preparation.",
        "Harvest when the earheads turn light brown."
      ],
      kn: [
        "ಕೋಲಾರ ಜಿಲ್ಲೆಯ ಖುಷ್ಕಿ ಬೇಸಾಯಕ್ಕೆ ಸೂಕ್ತವಾದ ಅತ್ಯುತ್ತಮ ಬರನಿರೋಧಕ ಬೆಳೆ.",
        "ಸಸಿಗಳ ನಡುವೆ ೩೦ ಸೆಂ.ಮೀ x ೧೦ ಸೆಂ.ಮೀ ಸೂಕ್ತ ಅಂತರವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.",
        "ಮಣ್ಣು ಸಿದ್ಧಪಡಿಸುವಾಗ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರವನ್ನು ಹೇರಳವಾಗಿ ಅನ್ವಯಿಸಿ.",
        "ತೆನೆಗಳು ತಿಳಿ ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿದಾಗ ಕೊಯ್ಲು ಮಾಡಿ."
      ]
    }
  },
  groundnut: {
    cropId: "groundnut",
    cropNameEn: "Groundnut",
    cropNameKn: "ನೆಲಗಡಲೆ",
    icon: "🥜",
    image: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&q=80&w=800",
    minRainfallMm: 350.0,
    maxRainfallMm: 700.0,
    minTempC: 20.0,
    maxTempC: 30.0,
    minSoilPh: 6.0,
    maxSoilPh: 7.5,
    preferredSoilTexture: "Sandy Loam",
    typicalInputCostPerAcre: 18000.0,
    typicalYieldQPerAcre: 12.0,
    growthDurationDays: 115,
    waterRequirementLevel: "LOW",
    typicalPriceBand: { low: 5500.0, high: 6800.0, modal: 6300.0 },
    advisoryTips: {
      en: [
        "Treat seeds with Trichoderma viride before sowing to prevent root rot.",
        "Apply Gypsum at 200 kg/acre during pegging stage to improve pod filling.",
        "Keep the field weed-free during the first 45 days.",
        "Harvest when the inner shell turns dark brown."
      ],
      kn: [
        "ಬೇರು ಕೊಳೆ ರೋಗ ತಡೆಗಟ್ಟಲು ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಬೀಜಗಳಿಗೆ ಟ್ರೈಕೋಡರ್ಮಾ ವಿರಿಡೆಯಿಂದ ಉಪಚರಿಸಿ.",
        "ಕಾಯಿ ತುಂಬುವಿಕೆಯನ್ನು ಸುಧಾರಿಸಲು ಮೊಗ್ಗು ಬಿಡುವ ಹಂತದಲ್ಲಿ ಎಕರೆಗೆ ೨೦೦ ಕೆಜಿ ಜಿಪ್ಸಮ್ ಅನ್ವಯಿಸಿ.",
        "ಮೊದಲ ೪೫ ದಿನಗಳವರೆಗೆ ಹೊಲವನ್ನು ಕಳೆ ಮುಕ್ತವಾಗಿಡಿ.",
        "ಕಾಯಿಯ ಒಳಭಾಗವು ಕಡು ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿದಾಗ ಕೊಯ್ಲು ಮಾಡಿ."
      ]
    }
  },
  maize: {
    cropId: "maize",
    cropNameEn: "Maize",
    cropNameKn: "ಮೆಕ್ಕೆಜೋಳ",
    icon: "🌽",
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800",
    minRainfallMm: 400.0,
    maxRainfallMm: 900.0,
    minTempC: 18.0,
    maxTempC: 35.0,
    minSoilPh: 5.8,
    maxSoilPh: 7.5,
    preferredSoilTexture: "Clay Loam",
    typicalInputCostPerAcre: 16000.0,
    typicalYieldQPerAcre: 28.0,
    growthDurationDays: 110,
    waterRequirementLevel: "MEDIUM",
    typicalPriceBand: { low: 1800.0, high: 2400.0, modal: 2100.0 },
    advisoryTips: {
      en: [
        "Deep plowing is essential to break hard subsoil layers.",
        "Ensure high nitrogen fertilizer split dosage at knee-high and silking stages.",
        "Monitor for Fall Armyworm regularly and apply bio-pesticides early.",
        "Harvest when the grain moisture levels drop below 20%."
      ],
      kn: [
        "ಗಟ್ಟಿ ಮಣ್ಣಿನ ಪದರಗಳನ್ನು ಒಡೆಯಲು ಆಳವಾದ ಉಳುಮೆ ಅತ್ಯಗತ್ಯ.",
        "ಮೊಳಕಾಲಿನ ಎತ್ತರ ಹಾಗೂ ತೆನೆ ಬರುವ ಹಂತಗಳಲ್ಲಿ ಸಾರಜನಕ ಗೊಬ್ಬರದ ವಿಭಜಿತ ಪ್ರಮಾಣವನ್ನು ಅನ್ವಯಿಸಿ.",
        "ಕತ್ತರಿ ಹುಳು ಬಾಧೆಯನ್ನು ನಿಯಮಿತವಾಗಿ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ ಮತ್ತು ಜೈವಿಕ ಕೀಟನಾಶಕಗಳನ್ನು ಸಿಂಪಡಿಸಿ.",
        "ಧಾನ್ಯದ ತೇವಾಂಶವು ಶೇ.೨೦ ಕ್ಕಿಂತ ಕಡಿಮೆಯಾದಾಗ ಕೊಯ್ಲು ಮಾಡಿ."
      ]
    }
  },
  onion: {
    cropId: "onion",
    cropNameEn: "Onion",
    cropNameKn: "ಈರುಳ್ಳಿ",
    icon: "🧅",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83766a4?auto=format&fit=crop&q=80&w=800",
    minRainfallMm: 350.0,
    maxRainfallMm: 700.0,
    minTempC: 15.0,
    maxTempC: 30.0,
    minSoilPh: 6.0,
    maxSoilPh: 7.5,
    preferredSoilTexture: "Sandy Loam",
    typicalInputCostPerAcre: 28000.0,
    typicalYieldQPerAcre: 80.0,
    growthDurationDays: 120,
    waterRequirementLevel: "MEDIUM",
    typicalPriceBand: { low: 1500.0, high: 3000.0, modal: 2100.0 },
    advisoryTips: {
      en: [
        "Optimum transplanting depth should be 2.5 - 3 cm.",
        "Apply sulphur at 15kg/acre to increase onion bulb size and pungency.",
        "Stop irrigation 10-15 days before harvest to prevent bulb rot.",
        "Provide thorough shade curing after harvest for long storage life."
      ],
      kn: [
        "ನಾಟಿಯ ಸೂಕ್ತ ಆಳವು ೨.೫ - ೩ ಸೆಂ.ಮೀ ಇರಬೇಕು.",
        "ಈರುಳ್ಳಿ ಗಾತ್ರ ಮತ್ತು ಖಾರವನ್ನು ಹೆಚ್ಚಿಸಲು ಎಕರೆಗೆ ೧೫ ಕೆಜಿ ಗಂಧಕವನ್ನು (Sulphur) ಅನ್ವಯಿಸಿ.",
        "ಗೆಡ್ಡೆ ಕೊಳೆಯುವುದನ್ನು ತಡೆಯಲು ಕೊಯ್ಲಿಗೆ ೧೦-೧೫ ದಿನಗಳ ಮೊದಲು ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ.",
        "ದೀರ್ಘ ಸಂಗ್ರಹಣೆಗಾಗಿ ಕೊಯ್ಲಿನ ನಂತರ ನೆರಳಿನಲ್ಲಿ ಚೆನ್ನಾಗಿ ಒಣಗಿಸಿ."
      ]
    }
  },
  chilli: {
    cropId: "chilli",
    cropNameEn: "Chilli",
    cropNameKn: "ಮೆಣಸಿನಕಾಯಿ",
    icon: "🌶️",
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=800",
    minRainfallMm: 400.0,
    maxRainfallMm: 800.0,
    minTempC: 20.0,
    maxTempC: 35.0,
    minSoilPh: 6.0,
    maxSoilPh: 7.5,
    preferredSoilTexture: "Loam",
    typicalInputCostPerAcre: 32000.0,
    typicalYieldQPerAcre: 15.0,
    growthDurationDays: 150,
    waterRequirementLevel: "MEDIUM",
    typicalPriceBand: { low: 12000.0, high: 18000.0, modal: 15000.0 },
    advisoryTips: {
      en: [
        "Prevent sucking pests (thrips/mites) using organic neem seed kernel extracts.",
        "Drip irrigation combined with fertigation gives 40% higher yields.",
        "Harvest green chillies 3-4 times, or allow full ripening for red chillies.",
        "Maintain excellent drainage to prevent damping-off nursery diseases."
      ],
      kn: [
        "ಬೇವಿನ ಬೀಜದ ಹಿಂಡಿ ಸಾರ ಬಳಸಿ ಹೀರುವ ಕೀಟಗಳನ್ನು (ನುಸಿಗಳು) ನಿಯಂತ್ರಿಸಿ.",
        "ಹನಿ ನೀರಾವರಿ ಹಾಗೂ ರಸಾವರಿ ಪದ್ಧತಿಯಿಂದ ಶೇ.೪೦ ರಷ್ಟು ಹೆಚ್ಚಿನ ಇಳುವರಿ ಪಡೆಯಬಹುದು.",
        "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿಯನ್ನು ೩-೪ ಬಾರಿ ಕೊಯ್ಲು ಮಾಡಿ, ಅಥವಾ ಒಣ ಮೆಣಸಿನಕಾಯಿಗೆ ಪೂರ್ಣ ಹಣ್ಣಾಗಲು ಬಿಡಿ.",
        "ನರ್ಸರಿಯಲ್ಲಿ ಸಸಿ ಕೊಳೆಯುವ ರೋಗ ತಡೆಯಲು ಉತ್ತಮ ನೀರು ಹರಿವನ್ನು ನಿರ್ವಹಿಸಿ."
      ]
    }
  }
};

export default function CropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "kn">("kn");
  const [farmAcres, setFarmAcres] = useState<string>("1");

  const cropId = (params?.id as string) || "tomato";
  const crop = CROP_METADATA[cropId] || CROP_METADATA.tomato;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("krishisetu_lang");
      if (storedLang === "en" || storedLang === "kn") setLang(storedLang);
    }
  }, []);

  // Fetch live Mandi prices for this commodity
  const { data: mandiPrices, isLoading: isPricesLoading } = useQuery<MandiPriceEntry[]>({
    queryKey: ["mandiPrices", crop.cropNameEn],
    queryFn: () => fetchJson<MandiPriceEntry[]>(`/api/v1/prices?commodity=${crop.cropNameEn}`)
  });

  const acres = parseFloat(farmAcres) || 0;
  const estimatedYieldQ = acres * crop.typicalYieldQPerAcre;
  const estimatedInputCost = acres * crop.typicalInputCostPerAcre;
  const expectedModalPrice = crop.typicalPriceBand.modal;
  const estimatedGrossRevenue = estimatedYieldQ * expectedModalPrice;
  const estimatedNetReturn = estimatedGrossRevenue - estimatedInputCost;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(lang === "kn" ? "kn-IN" : "en-US").format(num);
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-textPrimary flex flex-col font-sans relative selection:bg-brand-green-100">
      {/* Demo Header */}
      <div className="bg-brand-saffron text-white text-xs font-semibold py-1 px-4 text-center z-50 flex items-center justify-center gap-2 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>
          {lang === "kn"
            ? "ಕೃಷಿ ತಜ್ಞರ ಸಲಹಾ ಕೇಂದ್ರ - Live Kolar Agronomy Rules"
            : "Agronomy Expert Hub · Live Kolar Rules Matrix"}
        </span>
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white shadow-lg overflow-hidden border-x border-brand-border pb-10 relative">
        {/* Header Hero banner */}
        <div
          className="h-[30vh] bg-cover bg-center relative flex items-end p-6"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(26,46,31,0.9)), url('${crop.image}')`
          }}
        >
          <button
            onClick={() => router.push("/")}
            className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-brand-green-700 font-bold p-2.5 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setLang((l) => (l === "en" ? "kn" : "en"))}
            className="absolute top-4 right-4 bg-brand-green-700 text-white font-bold px-3 py-1.5 rounded-full shadow-lg text-xs"
          >
            {lang === "en" ? "ಕನ್ನಡ" : "English"}
          </button>

          <div className="w-full">
            <span className="text-3xl block">{crop.icon}</span>
            <h1 className="text-white text-3xl font-extrabold leading-tight tracking-wide font-kannada">
              {lang === "kn" ? crop.cropNameKn : crop.cropNameEn}
            </h1>
            <p className="text-brand-cream/80 text-xs font-semibold uppercase mt-0.5 tracking-wider">
              {crop.cropNameEn} · {crop.growthDurationDays} {lang === "kn" ? "ದಿನಗಳು" : "Days duration"}
            </p>
          </div>
        </div>

        {/* Tab Views */}
        <div className="flex-1 p-5 space-y-6 overflow-y-auto">
          {/* Agronomy matrix Grid */}
          <div className="bg-brand-cream/40 rounded-card border border-brand-border p-4 space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-brand-textSecondary tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-brand-green-700" />
              {lang === "kn" ? "ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನ ಅಗತ್ಯತೆಗಳು" : "Agronomic Soil Requirements"}
            </h3>
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="bg-white p-3 rounded-input border border-brand-border">
                <span className="text-brand-textMuted font-bold block">{lang === "kn" ? "ಮಣ್ಣಿನ ರಚನೆ" : "Soil Texture"}</span>
                <span className="font-extrabold text-brand-textPrimary mt-0.5 block">{crop.preferredSoilTexture}</span>
              </div>
              <div className="bg-white p-3 rounded-input border border-brand-border">
                <span className="text-brand-textMuted font-bold block">{lang === "kn" ? "ಮಣ್ಣಿನ pH ಮಟ್ಟ" : "Soil pH Level"}</span>
                <span className="font-extrabold text-brand-textPrimary mt-0.5 block">{crop.minSoilPh} - {crop.maxSoilPh}</span>
              </div>
              <div className="bg-white p-3 rounded-input border border-brand-border">
                <span className="text-brand-textMuted font-bold block">{lang === "kn" ? "ತಾಪಮಾನ ಶ್ರೇಣಿ" : "Temp Bounds"}</span>
                <span className="font-extrabold text-brand-textPrimary mt-0.5 block flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-brand-saffron" />
                  {crop.minTempC}°C - {crop.maxTempC}°C
                </span>
              </div>
              <div className="bg-white p-3 rounded-input border border-brand-border">
                <span className="text-brand-textMuted font-bold block">{lang === "kn" ? "ನೀರಾವರಿ ಅಗತ್ಯತೆ" : "Water Level"}</span>
                <span className="font-extrabold text-brand-green-700 mt-0.5 block flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-brand-green-700" />
                  {crop.waterRequirementLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Slider Widget */}
          <div className="bg-white rounded-card border-2 border-brand-green-700/20 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase text-brand-textSecondary tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-brand-green-700" />
                {lang === "kn" ? "ಲಾಭ ಮತ್ತು ಆದಾಯ ಅಂದಾಜು ಯಂತ್ರ" : "Economic Returns Estimator"}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-green-100 text-brand-green-800 rounded border border-brand-green-700/20 uppercase tracking-wider">
                {lang === "kn" ? "ಲೆಕ್ಕಾಚಾರ" : "Calculator"}
              </span>
            </div>

            {/* Farm size input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-brand-textSecondary">
                {lang === "kn" ? "ನಿಮ್ಮ ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)" : "Enter Farm Size (Acres)"}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={farmAcres}
                  onChange={(e) => setFarmAcres(e.target.value)}
                  className="w-full h-12 px-4 bg-brand-cream/40 border border-brand-border rounded-input font-bold text-lg focus:outline-none focus:border-brand-green-700 text-center"
                />
                <span className="h-12 px-4 bg-brand-cream/80 border border-brand-border rounded-input flex items-center justify-center font-bold text-xs">
                  {lang === "kn" ? "ಎಕರೆ" : "Acres"}
                </span>
              </div>
            </div>

            {/* Dynamic Results Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-2 text-xs border-t border-brand-border/60">
              <div className="p-3 bg-brand-cream/40 rounded-input border border-brand-border">
                <span className="text-brand-textSecondary block">{lang === "kn" ? "ಅಂದಾಜು ಒಟ್ಟು ಫಸಲು" : "Est. Total Yield"}</span>
                <span className="text-lg font-extrabold text-brand-textPrimary block mt-1">
                  {estimatedYieldQ.toFixed(1)} q
                </span>
                <span className="text-[9px] text-brand-textMuted block mt-0.5">
                  ({crop.typicalYieldQPerAcre} q/acre average)
                </span>
              </div>

              <div className="p-3 bg-brand-cream/40 rounded-input border border-brand-border">
                <span className="text-brand-textSecondary block">{lang === "kn" ? "ಅಂದಾಜು ಹೂಡಿಕೆ ವೆಚ್ಚ" : "Est. Input Cost"}</span>
                <span className="text-lg font-extrabold text-brand-danger block mt-1">
                  ₹{formatNumber(estimatedInputCost)}
                </span>
                <span className="text-[9px] text-brand-textMuted block mt-0.5">
                  (₹{formatNumber(crop.typicalInputCostPerAcre)}/acre average)
                </span>
              </div>

              <div className="col-span-2 p-4 bg-brand-green-100/50 border border-brand-green-700/10 rounded-input flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-brand-green-800 tracking-wider block">
                    {lang === "kn" ? "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ (Net Return)" : "Projected Net Returns"}
                  </span>
                  <span className="text-xl font-black text-brand-green-800 mt-1 block">
                    ₹{formatNumber(estimatedNetReturn)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-brand-textSecondary block">{lang === "kn" ? "ಒಟ್ಟು ಆದಾಯ" : "Gross Revenue"}</span>
                  <span className="font-bold text-brand-textPrimary block">₹{formatNumber(estimatedGrossRevenue)}</span>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-brand-textMuted leading-relaxed text-center block">
              * Calculations are estimates based on local ICAR crop guidelines and average Mandi modal price of ₹{formatNumber(expectedModalPrice)}/q.
            </p>
          </div>

          {/* Mandi Integration panel */}
          <div className="bg-white rounded-card border border-brand-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase text-brand-textSecondary tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-green-700" />
                {lang === "kn" ? "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ವರದಿ" : "Live Mandi Rates Report"}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-saffron/10 text-brand-saffron rounded border border-brand-saffron/20 uppercase tracking-wider">
                {lang === "kn" ? "ನೈಜ ದರ" : "Live Rates"}
              </span>
            </div>

            {isPricesLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-brand-textSecondary">
                <div className="w-6 h-6 border-3 border-brand-green-700 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">{lang === "kn" ? "ದರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Loading market prices..."}</span>
              </div>
            ) : mandiPrices && mandiPrices.length > 0 ? (
              <div className="space-y-3">
                {mandiPrices.slice(0, 3).map((price, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-brand-cream/30 border border-brand-border rounded-input flex items-center justify-between text-xs font-tabular"
                  >
                    <div>
                      <span className="font-bold text-brand-textPrimary block">{price.market} Mandi</span>
                      <span className="text-[10px] text-brand-textSecondary block">Variety: {price.variety}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-brand-green-800 block">₹{price.modalPrice}/q</span>
                      <span className="text-[9px] text-brand-textMuted block">Min: ₹{price.minPrice} · Max: ₹{price.maxPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-brand-cream/40 border border-brand-border rounded-input text-center text-xs text-brand-textSecondary flex items-center gap-2 justify-center">
                <Info className="w-4 h-4 text-brand-textMuted" />
                <span>
                  {lang === "kn"
                    ? "ಪ್ರಸ್ತುತ ಕೋಲಾರ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಯಾವುದೇ ಸಕ್ರಿಯ ತರಕಾರಿಗಳ ಬಿಡ್ಡ್ ಕಂಡುಬಂದಿಲ್ಲ."
                    : "No active government mandi auctions found for this crop in Kolar district today."}
                </span>
              </div>
            )}
          </div>

          {/* Expert agronomy tips */}
          <div className="bg-white rounded-card border border-brand-border p-5 space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-brand-textSecondary tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-green-700" />
              {lang === "kn" ? "ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆಗಳು" : "Expert Agronomy & Planting Tips"}
            </h3>
            <div className="space-y-3">
              {(lang === "kn" ? crop.advisoryTips.kn : crop.advisoryTips.en).map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-brand-textPrimary leading-relaxed">
                  <CheckCircle className="w-4.5 h-4.5 text-brand-green-700 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
