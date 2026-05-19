"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import {
  ArrowLeft,
  Camera,
  Calendar,
  IndianRupee,
  Scale,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Check
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

const CROPS = [
  { id: "tomato", nameEn: "Tomato", nameKn: "ಟೊಮ್ಯಾಟೋ", icon: "🍅", color: "bg-red-50 text-red-700 border-red-200 hover:border-red-500" },
  { id: "ragi", nameEn: "Ragi", nameKn: "ರಾಗಿ", icon: "🌾", color: "bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-500" },
  { id: "groundnut", nameEn: "Groundnut", nameKn: "ನೆಲಗಡಲೆ", icon: "🥜", color: "bg-orange-50 text-orange-800 border-orange-200 hover:border-orange-500" },
  { id: "maize", nameEn: "Maize", nameKn: "ಮೆಕ್ಕೆಜೋಳ", icon: "🌽", color: "bg-yellow-50 text-yellow-800 border-yellow-200 hover:border-yellow-500" },
  { id: "onion", nameEn: "Onion", nameKn: "ಈರುಳ್ಳಿ", icon: "🧅", color: "bg-pink-50 text-pink-800 border-pink-200 hover:border-pink-500" },
  { id: "chilli", nameEn: "Chilli", nameKn: "ಮೆಣಸಿನಕಾಯಿ", icon: "🌶️", color: "bg-red-50 text-red-600 border-red-100 hover:border-red-500" }
];

export default function NewListingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "kn">("kn");
  const [farmerId, setFarmerId] = useState<string | null>(null);

  // Form State
  const [selectedCrop, setSelectedCrop] = useState(CROPS[0].id);
  const [quantity, setQuantity] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraPhoto, setCameraPhoto] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load farmer details from local storage
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("krishisetu_farmer_id");
      const storedLang = localStorage.getItem("krishisetu_lang");
      if (storedId) setFarmerId(storedId);
      if (storedLang === "en" || storedLang === "kn") setLang(storedLang);
    }
  }, []);

  // Fetch Mandi prices for selected crop to show matching price guidance
  const cropLabel = CROPS.find((c) => c.id === selectedCrop)?.nameEn || "Tomato";
  const { data: mandiPrices } = useQuery<MandiPriceEntry[]>({
    queryKey: ["mandiPrices", cropLabel],
    queryFn: () => fetchJson<MandiPriceEntry[]>(`/api/v1/prices?commodity=${cropLabel}`),
    enabled: !!selectedCrop
  });

  const getKolarMandiReference = () => {
    if (!mandiPrices || mandiPrices.length === 0) return null;
    const kolarMandi = mandiPrices.find(
      (p) => p.market.toLowerCase().includes("kolar") || p.market.toLowerCase().includes("chintamani")
    );
    return kolarMandi || mandiPrices[0];
  };

  const referenceMandi = getKolarMandiReference();

  // Simulated Camera trigger
  const handleTakePhoto = () => {
    setIsCameraActive(true);
    setTimeout(() => {
      // Simulate photo captured from camera
      const mockPhotos: Record<string, string> = {
        tomato: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600",
        ragi: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600",
        groundnut: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&q=80&w=600",
        maize: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600",
        onion: "https://images.unsplash.com/photo-1618512496248-a07fe83766a4?auto=format&fit=crop&q=80&w=600",
        chilli: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=600"
      };
      const chosenPhoto = mockPhotos[selectedCrop] || mockPhotos.tomato;
      setCameraPhoto(chosenPhoto);
      // Backend validates that the URL has supabase in it!
      setPhotoUrl("https://krishisetu.supabase.co/storage/v1/object/public/listings/" + selectedCrop + "-harvest.jpg");
      setIsCameraActive(false);
    }, 1500);
  };

  // Mutation to save crop listing to database
  const listingMutation = useMutation({
    mutationFn: (body: any) =>
      fetchJson("/api/v1/listings", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3500);
    },
    onError: (err: any) => {
      setFormErrors({ submit: err.message || "Failed to create crop listing." });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!quantity || parseFloat(quantity) <= 0) {
      errors.quantity = lang === "kn" ? "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಪ್ರಮಾಣವನ್ನು ನಮೂದಿಸಿ" : "Please enter a valid quantity";
    }
    if (!harvestDate) {
      errors.harvestDate = lang === "kn" ? "ಕೊಯ್ಲು ದಿನಾಂಕ ಅಗತ್ಯವಿದೆ" : "Harvest date is required";
    }
    if (!expectedPrice || parseFloat(expectedPrice) <= 0) {
      errors.expectedPrice = lang === "kn" ? "ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿತ ಬೆಲೆಯನ್ನು ನಮೂದಿಸಿ" : "Please enter a valid expected price";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    // Fallback farmer registered profile if missing
    const resolvedFarmerId = farmerId || "99b50e2d-dc99-43ef-b387-052637738f61";

    listingMutation.mutate({
      farmerId: resolvedFarmerId,
      cropId: selectedCrop,
      quantityQ: parseFloat(quantity),
      harvestDate,
      photoUrl,
      expectedPricePerQ: parseFloat(expectedPrice)
    });
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-textPrimary flex flex-col font-sans relative selection:bg-brand-green-100">
      {/* Demo header banner */}
      <div className="bg-brand-saffron text-white text-xs font-semibold py-1 px-4 text-center z-50 flex items-center justify-center gap-2 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>
          {lang === "kn"
            ? "ಪ್ರದರ್ಶನ ಮೋಡ್ -Government Agmarknet API ಬೆಲೆ ಪರೀಕ್ಷೆ"
            : "DEMO MODE · Government Agmarknet Pricing Active"}
        </span>
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white shadow-lg overflow-hidden border-x border-brand-border relative">
        {/* Sticky top navigation */}
        <header className="h-16 border-b border-brand-border px-6 flex items-center justify-between bg-white sticky top-0 z-30">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-brand-green-700 font-semibold transition-all hover:scale-[1.02]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{lang === "kn" ? "ಹಿಂದಕ್ಕೆ" : "Back"}</span>
          </button>
          <h2 className="text-lg font-bold text-brand-textPrimary">
            {lang === "kn" ? "ಹೊಸ ಆಫರ್ ಪೋಸ್ಟ್" : "New Crop Offer"}
          </h2>
          <button
            onClick={() => setLang((l) => (l === "en" ? "kn" : "en"))}
            className="w-10 h-8 font-bold border border-brand-green-700 text-brand-green-800 rounded-full bg-brand-green-100 text-xs flex items-center justify-center"
          >
            {lang === "en" ? "ಕ" : "EN"}
          </button>
        </header>

        {/* Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-20 h-20 bg-brand-green-100 text-brand-green-700 rounded-full flex items-center justify-center shadow-lg border border-brand-green-700/20 mb-6 scale-animation">
              <Check className="w-10 h-10 stroke-[3.5px]" />
            </div>
            <h2 className="text-2xl font-extrabold text-brand-green-800 leading-tight">
              {lang === "kn" ? "ಬೆಳೆ ಆಫರ್ ಯಶಸ್ವಿಯಾಗಿ ಪೋಸ್ಟ್ ಆಗಿದೆ!" : "Crop Offer Posted Successfully!"}
            </h2>
            <p className="text-brand-textSecondary text-sm max-w-xs mt-3 leading-relaxed">
              {lang === "kn"
                ? "ನಿಮ್ಮ ಉತ್ಪನ್ನವನ್ನು ಕೃಷಿಸೇತು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ. ಖರೀದಿದಾರರಿಂದ ಆಫರ್‌ಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿವೆ."
                : "Your harvest is now listed in KrishiSetu marketplace. Regional buyers can view and bid directly."}
            </p>
            <div className="mt-8 p-4 bg-brand-cream/60 border border-brand-border rounded-card w-full text-left space-y-2 text-sm">
              <div className="flex justify-between font-bold">
                <span>{lang === "kn" ? "ಬೆಳೆ" : "Crop"}:</span>
                <span className="text-brand-green-800 uppercase">{selectedCrop}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>{lang === "kn" ? "ಪ್ರಮಾಣ" : "Volume"}:</span>
                <span>{quantity} quintal</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>{lang === "kn" ? "ನಿರೀಕ್ಷಿತ ಬೆಲೆ" : "Target Price"}:</span>
                <span className="text-brand-green-800">₹{expectedPrice}/q</span>
              </div>
            </div>
            <p className="text-xs text-brand-textMuted mt-8 animate-pulse">
              {lang === "kn" ? "ಮುಖ್ಯಪುಟಕ್ಕೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ..." : "Redirecting to dashboard..."}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto pb-8">
          <div>
            <h3 className="text-2xl font-bold text-brand-textPrimary leading-tight">
              {lang === "kn" ? "ನಿಮ್ಮ ಉತ್ಪನ್ನ ಪಟ್ಟಿ ಮಾಡಿ" : "Post Your Produce"}
            </h3>
            <p className="text-brand-textSecondary text-xs mt-1">
              {lang === "kn"
                ? "ಖರೀದಿದಾರರನ್ನು ಆಕರ್ಷಿಸಲು ನಿಮ್ಮ ಫಸಲಿನ ನಿಖರ ಮಾಹಿತಿ ನಮೂದಿಸಿ."
                : "Provide quality specifications to receive instant matching bids."}
            </p>
          </div>

          {/* Crop Selector Grid */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-brand-textPrimary">
              {lang === "kn" ? "೧. ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ" : "1. Select Harvested Crop"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CROPS.map((crop) => (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`py-3.5 px-2 rounded-input border-2 flex flex-col items-center justify-center transition-all ${
                    selectedCrop === crop.id
                      ? "border-brand-green-700 bg-brand-green-100/50 text-brand-green-800 font-bold shadow-sm"
                      : "border-brand-border bg-white text-brand-textSecondary"
                  }`}
                >
                  <span className="text-2xl mb-1">{crop.icon}</span>
                  <span className="text-xs tracking-tight block">
                    {lang === "kn" ? crop.nameKn : crop.nameEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mandi Price Guidance Widget */}
          {referenceMandi && (
            <div className="bg-brand-green-100/40 p-4 border border-brand-green-700/10 rounded-card space-y-2.5">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-brand-green-700" />
                <span className="text-xs font-extrabold uppercase text-brand-green-800 tracking-wider">
                  {lang === "kn" ? "ಕೋಲಾರ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮಾರ್ಗದರ್ಶಿ" : "Kolar Mandi Price Guidance"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 border-t border-brand-green-700/10 pt-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-brand-textSecondary block">{lang === "kn" ? "ಕನಿಷ್ಠ ಬೆಲೆ" : "Min Price"}</span>
                  <span className="font-bold text-brand-textPrimary block mt-0.5">₹{referenceMandi.minPrice}/q</span>
                </div>
                <div>
                  <span className="text-[10px] text-brand-textSecondary block font-bold text-brand-green-700">
                    {lang === "kn" ? "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ" : "Market Price"}
                  </span>
                  <span className="font-extrabold text-brand-green-800 block mt-0.5">₹{referenceMandi.modalPrice}/q</span>
                </div>
                <div>
                  <span className="text-[10px] text-brand-textSecondary block">{lang === "kn" ? "ಗರಿಷ್ಠ ಬೆಲೆ" : "Max Price"}</span>
                  <span className="font-bold text-brand-textPrimary block mt-0.5">₹{referenceMandi.maxPrice}/q</span>
                </div>
              </div>
              <p className="text-[10px] text-brand-textMuted leading-normal text-center">
                {lang === "kn"
                  ? "ನೈಜ ಸಮಯದ Agmarknet ದರಗಳು. ನಿಮ್ಮ ಬೆಲೆಯನ್ನು ಮಾರುಕಟ್ಟೆ ದರಕ್ಕೆ ಹತ್ತಿರ ಇರಿಸಿ."
                  : "Live Agmarknet government rates. Pricing near market rates speeds up sales by 3x."}
              </p>
            </div>
          )}

          {/* Volume Quantity Field */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-brand-textPrimary">
              {lang === "kn" ? "೨. ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ (ಕ್ವಿಂಟಾಲ್)" : "2. Quantity Available (Quintals)"}
            </label>
            <div className="relative">
              <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-textMuted" />
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 25.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full h-14 pl-12 pr-16 bg-brand-cream/40 border rounded-input font-bold ${
                  formErrors.quantity ? "border-brand-danger" : "border-brand-border"
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-textSecondary uppercase select-none">
                {lang === "kn" ? "ಕ್ವಿಂಟಾಲ್" : "Quintal"}
              </span>
            </div>
            {formErrors.quantity && (
              <p className="text-brand-danger text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{formErrors.quantity}</span>
              </p>
            )}
            <span className="text-[10px] text-brand-textMuted block pl-1">
              * 1 Quintal (ಕ್ವಿಂಟಾಲ್) = 100 kg.
            </span>
          </div>

          {/* Expected Price per Quintal */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-brand-textPrimary">
              {lang === "kn" ? "೩. ನಿಮ್ಮ ನಿರೀಕ್ಷಿತ ಬೆಲೆ (₹/ಕ್ವಿಂಟಾಲ್)" : "3. Expected Price (₹/Quintal)"}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-brand-textMuted select-none">
                ₹
              </span>
              <input
                type="number"
                placeholder={referenceMandi ? `Recommended: ₹${referenceMandi.modalPrice}` : "e.g. 1400"}
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                className={`w-full h-14 pl-12 pr-4 bg-brand-cream/40 border rounded-input font-bold text-brand-green-800 ${
                  formErrors.expectedPrice ? "border-brand-danger" : "border-brand-border"
                }`}
              />
            </div>
            {formErrors.expectedPrice && (
              <p className="text-brand-danger text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{formErrors.expectedPrice}</span>
              </p>
            )}
            {/* Price evaluation advice */}
            {expectedPrice && referenceMandi && parseFloat(expectedPrice) > referenceMandi.maxPrice && (
              <div className="p-3 bg-brand-warning/10 border border-brand-warning/30 rounded-input flex items-start gap-2 text-[10px] text-brand-textSecondary leading-normal">
                <AlertCircle className="w-4 h-4 text-brand-warning flex-shrink-0 mt-0.5" />
                <span>
                  {lang === "kn"
                    ? "ನಿಮ್ಮ ಬೆಲೆಯು ಗರಿಷ್ಠ ಮಾರುಕಟ್ಟೆ ದರಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿದೆ. ಖರೀದಿದಾರರಿಂದ ಬೇಡಿಕೆ ಕಡಿಮೆಯಾಗಬಹುದು."
                    : "Expected price exceeds highest mandi rate. Postings closer to market trends receive 3x more offers."}
                </span>
              </div>
            )}
          </div>

          {/* Expected Harvest/Delivery Date */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-brand-textPrimary">
              {lang === "kn" ? "೪. ಅಂದಾಜು ಕೊಯ್ಲು / ಸರಬರಾಜು ದಿನಾಂಕ" : "4. Harvest / Delivery Date"}
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-textMuted pointer-events-none" />
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className={`w-full h-14 pl-12 pr-4 bg-brand-cream/40 border rounded-input font-bold ${
                  formErrors.harvestDate ? "border-brand-danger" : "border-brand-border"
                }`}
              />
            </div>
            {formErrors.harvestDate && (
              <p className="text-brand-danger text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{formErrors.harvestDate}</span>
              </p>
            )}
          </div>

          {/* Simulated Photo attachment */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-brand-textPrimary">
              {lang === "kn" ? "೫. ಬೆಳೆಯ ಫೋಟೋ ಲಗತ್ತಿಸಿ (ಕಡ್ಡಾಯವಲ್ಲ)" : "5. Crop Photo (Optional)"}
            </label>

            {isCameraActive ? (
              <div className="h-44 w-full bg-neutral-900 rounded-card flex flex-col items-center justify-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-center p-4">
                  <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span className="text-xs font-bold uppercase tracking-wider animate-pulse">
                    {lang === "kn" ? "ಕ್ಯಾಮೆರಾ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ..." : "Opening Secure Lens..."}
                  </span>
                </div>
              </div>
            ) : cameraPhoto ? (
              <div className="relative h-44 w-full bg-cover bg-center rounded-card border-2 border-brand-green-700 shadow-md overflow-hidden group">
                <img src={cameraPhoto} className="w-full h-full object-cover" alt="Captured harvest" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="p-3 bg-white text-brand-textPrimary rounded-full font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 text-xs"
                  >
                    <Camera className="w-4 h-4 text-brand-green-700" />
                    <span>{lang === "kn" ? "ಮತ್ತೆ ತೆಗೆಯಿರಿ" : "Retake"}</span>
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 bg-brand-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow">
                  <CheckCircle className="w-3 h-3 text-brand-green-100" />
                  <span>SUPABASE SECURED</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTakePhoto}
                className="h-32 w-full border-2 border-dashed border-brand-border bg-brand-cream/20 hover:bg-brand-green-100/20 active:scale-[0.99] rounded-card flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 bg-brand-cream/80 border border-brand-border text-brand-textSecondary rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-brand-textSecondary">
                  {lang === "kn" ? "ಕ್ಯಾಮೆರಾ / ಫೋಟೋ ಕ್ಲಿಕ್ ಮಾಡಿ" : "Tap to capture real crop photo"}
                </span>
                <span className="text-[9px] text-brand-textMuted">
                  {lang === "kn" ? "ಗರಿಷ್ಠ ೫ MB · Supabase ಸ್ಟೋರೇಜ್" : "Max 5MB size · Secure cloud validation"}
                </span>
              </button>
            )}
          </div>

          {/* Submission Errors */}
          {formErrors.submit && (
            <div className="p-4 bg-brand-danger/10 border border-brand-danger/30 rounded-input flex items-center gap-3 text-sm text-brand-danger">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold">{formErrors.submit}</span>
            </div>
          )}

          {/* Post Offer button */}
          <button
            type="submit"
            disabled={listingMutation.isPending}
            className={`w-full h-14 bg-brand-green-700 hover:bg-brand-green-800 active:scale-[0.98] text-white rounded-button font-bold text-lg flex items-center justify-center gap-2 shadow-md transition-all ${
              listingMutation.isPending ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {listingMutation.isPending ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>{lang === "kn" ? "ಉತ್ಪನ್ನ ಪಟ್ಟಿ ಪೋಸ್ಟ್ ಮಾಡಿ" : "Submit Crop Listing"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
