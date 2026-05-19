"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import {
  ArrowLeft,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Sparkles,
  AlertCircle,
  MapPin
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

const COMMODITIES = ["Tomato", "Ragi", "Groundnut", "Maize", "Onion", "Chilli"];
const DISTRICTS = ["Kolar", "Chickballapur", "Tumkur", "Bangalore Rural"];

export default function MandiPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "kn">("kn");
  const [selectedCommodity, setSelectedCommodity] = useState("Tomato");
  const [selectedDistrict, setSelectedDistrict] = useState("Kolar");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: prices, isLoading, error } = useQuery<MandiPriceEntry[]>({
    queryKey: ["mandi-prices", selectedCommodity, selectedDistrict],
    queryFn: () =>
      fetchJson<MandiPriceEntry[]>(
        `/api/v1/prices?commodity=${selectedCommodity}&district=${selectedDistrict}&days=14`
      )
  });

  const filteredPrices = (prices || []).filter((p) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.market.toLowerCase().includes(q) ||
      p.commodity.toLowerCase().includes(q) ||
      p.variety.toLowerCase().includes(q)
    );
  });

  const avgModal =
    filteredPrices.length > 0
      ? Math.round(filteredPrices.reduce((s, p) => s + p.modalPrice, 0) / filteredPrices.length)
      : null;

  const maxModal = filteredPrices.length > 0 ? Math.max(...filteredPrices.map((p) => p.modalPrice)) : null;
  const minModal = filteredPrices.length > 0 ? Math.min(...filteredPrices.map((p) => p.minPrice)) : null;

  return (
    <div className="min-h-screen bg-brand-cream text-brand-textPrimary flex flex-col font-sans selection:bg-brand-green-100 relative">
      {/* Demo banner */}
      <div className="bg-brand-saffron text-white text-xs font-semibold py-1 px-4 text-center z-50 flex items-center justify-center gap-2 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>
          {lang === "kn"
            ? "ಸರ್ಕಾರಿ Agmarknet ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು - ಲೈವ್"
            : "Government Agmarknet Market Prices · Live"}
        </span>
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white shadow-lg border-x border-brand-border">
        {/* Header */}
        <header className="h-16 border-b border-brand-border px-6 flex items-center justify-between sticky top-0 z-30 bg-white">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-brand-green-700 font-semibold transition-all hover:scale-[1.02]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{lang === "kn" ? "ಹಿಂದಕ್ಕೆ" : "Back"}</span>
          </button>
          <h1 className="text-lg font-bold text-brand-textPrimary">
            {lang === "kn" ? "ಮಂಡಿ ಬೆಲೆಗಳು" : "Mandi Prices"}
          </h1>
          <button
            onClick={() => setLang((l) => (l === "en" ? "kn" : "en"))}
            className="w-10 h-8 font-bold border border-brand-green-700 text-brand-green-800 rounded-full bg-brand-green-100 text-xs flex items-center justify-center"
          >
            {lang === "en" ? "ಕ" : "EN"}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
          {/* Filter Controls */}
          <div className="space-y-3">
            {/* Commodity Selector */}
            <div>
              <label className="block text-xs font-bold text-brand-textSecondary uppercase tracking-wider mb-2">
                {lang === "kn" ? "ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ" : "Select Commodity"}
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {COMMODITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCommodity(c)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedCommodity === c
                        ? "bg-brand-green-700 text-white border-brand-green-700 shadow-sm"
                        : "bg-white text-brand-textSecondary border-brand-border hover:border-brand-green-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* District Selector */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-textMuted flex-shrink-0" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="flex-1 h-10 px-3 bg-brand-cream/40 border border-brand-border rounded-input text-sm font-medium focus:outline-none focus:border-brand-green-700"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textMuted" />
              <input
                type="text"
                placeholder={lang === "kn" ? "ಮಾರುಕಟ್ಟೆ ಹುಡುಕಿ..." : "Search market or variety..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-brand-cream/40 border border-brand-border rounded-input text-sm font-medium focus:outline-none focus:border-brand-green-700"
              />
            </div>
          </div>

          {/* Summary Stats */}
          {avgModal !== null && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-brand-green-100/60 p-3 rounded-card border border-brand-green-700/10 text-center">
                <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">
                  {lang === "kn" ? "ಸರಾಸರಿ" : "Avg Modal"}
                </span>
                <span className="text-xl font-bold font-tabular text-brand-green-800 block mt-1">
                  ₹{avgModal}
                </span>
                <span className="text-[9px] text-brand-textMuted">/q</span>
              </div>
              <div className="bg-brand-cream/60 p-3 rounded-card border border-brand-border text-center">
                <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">
                  {lang === "kn" ? "ಗರಿಷ್ಠ" : "Max"}
                </span>
                <span className="text-xl font-bold font-tabular text-brand-textPrimary block mt-1">
                  ₹{maxModal}
                </span>
                <span className="text-[9px] text-brand-textMuted">/q</span>
              </div>
              <div className="bg-brand-cream/60 p-3 rounded-card border border-brand-border text-center">
                <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">
                  {lang === "kn" ? "ಕನಿಷ್ಠ" : "Min"}
                </span>
                <span className="text-xl font-bold font-tabular text-brand-textPrimary block mt-1">
                  ₹{minModal}
                </span>
                <span className="text-[9px] text-brand-textMuted">/q</span>
              </div>
            </div>
          )}

          {/* Price List */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-brand-textSecondary">
              <div className="w-8 h-8 rounded-full border-4 border-brand-green-700 border-t-transparent animate-spin" />
              <p className="text-sm font-medium">
                {lang === "kn" ? "ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Fetching live Agmarknet prices..."}
              </p>
            </div>
          ) : error ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
              <AlertCircle className="w-10 h-10 text-brand-danger" />
              <p className="text-sm font-semibold text-brand-danger">
                {lang === "kn" ? "ಬೆಲೆ ಲೋಡ್ ವಿಫಲವಾಗಿದೆ" : "Could not load mandi prices"}
              </p>
              <p className="text-xs text-brand-textMuted">
                {lang === "kn" ? "ನೆಟ್‌ವರ್ಕ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." : "Check your connection and try again."}
              </p>
            </div>
          ) : filteredPrices.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
              <IndianRupee className="w-10 h-10 text-brand-textMuted" />
              <p className="text-sm font-semibold text-brand-textSecondary">
                {lang === "kn" ? "ಯಾವುದೇ ಬೆಲೆ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ" : "No price data available"}
              </p>
              <p className="text-xs text-brand-textMuted">
                {lang === "kn"
                  ? "ಬೇರೆ ಬೆಳೆ ಅಥವಾ ಜಿಲ್ಲೆ ಆಯ್ಕೆ ಮಾಡಿ."
                  : "Try a different commodity or district filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-brand-textMuted font-semibold">
                {filteredPrices.length} {lang === "kn" ? "ಮಾರುಕಟ್ಟೆಗಳು" : "markets found"}
              </p>
              {filteredPrices.map((entry, idx) => {
                const spread = entry.maxPrice - entry.minPrice;
                const isHigh = entry.modalPrice > (avgModal || 0);
                const isLow = entry.modalPrice < (avgModal || 0);
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-card border border-brand-border p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-brand-textPrimary text-sm leading-tight">
                          {entry.market}
                        </h3>
                        <p className="text-xs text-brand-textMuted mt-0.5">
                          {entry.district}, {entry.state}
                        </p>
                        <p className="text-[10px] text-brand-textMuted mt-0.5">
                          {entry.variety} · Grade: {entry.grade || "FAQ"} ·{" "}
                          {new Date(entry.arrivalDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short"
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {isHigh ? (
                          <TrendingUp className="w-4 h-4 text-brand-green-700" />
                        ) : isLow ? (
                          <TrendingDown className="w-4 h-4 text-brand-danger" />
                        ) : (
                          <Minus className="w-4 h-4 text-brand-textMuted" />
                        )}
                        <span
                          className={`text-xs font-bold ${
                            isHigh
                              ? "text-brand-green-700"
                              : isLow
                              ? "text-brand-danger"
                              : "text-brand-textMuted"
                          }`}
                        >
                          {isHigh ? "Above avg" : isLow ? "Below avg" : "At avg"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-brand-border pt-3">
                      <div className="text-center">
                        <span className="text-[10px] text-brand-textSecondary font-semibold block">
                          {lang === "kn" ? "ಕನಿಷ್ಠ" : "Min"}
                        </span>
                        <span className="font-bold text-brand-textPrimary text-sm block mt-0.5">
                          ₹{entry.minPrice}
                        </span>
                      </div>
                      <div className="text-center border-x border-brand-border">
                        <span className="text-[10px] font-bold text-brand-green-700 block">
                          {lang === "kn" ? "ಮಾಡಲ್" : "Modal"}
                        </span>
                        <span className="font-extrabold text-brand-green-800 text-lg block mt-0.5">
                          ₹{entry.modalPrice}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-brand-textSecondary font-semibold block">
                          {lang === "kn" ? "ಗರಿಷ್ಠ" : "Max"}
                        </span>
                        <span className="font-bold text-brand-textPrimary text-sm block mt-0.5">
                          ₹{entry.maxPrice}
                        </span>
                      </div>
                    </div>

                    {/* Spread bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-brand-textMuted font-semibold">
                        <span>₹{entry.minPrice}</span>
                        <span className="text-brand-green-700">
                          {lang === "kn" ? "ಬೆಲೆ ಏರಿಳಿತ ±" : "Spread ±"}
                          ₹{Math.round(spread / 2)}
                        </span>
                        <span>₹{entry.maxPrice}</span>
                      </div>
                      <div className="w-full h-1.5 bg-brand-cream rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-saffron/50 via-brand-green-700 to-brand-saffron/50 rounded-full"
                          style={{
                            marginLeft: `${Math.max(0, ((entry.modalPrice - entry.minPrice) / Math.max(spread, 1)) * 100 - 10)}%`,
                            width: "20%"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Data Source */}
          <p className="text-center text-[10px] text-brand-textMuted leading-relaxed pt-2">
            {lang === "kn"
              ? "ಡೇಟಾ: ಕೇಂದ್ರ ಸರ್ಕಾರ Agmarknet API (data.gov.in)"
              : "Data: Government of India Agmarknet API via data.gov.in"}
          </p>
        </div>
      </div>
    </div>
  );
}
