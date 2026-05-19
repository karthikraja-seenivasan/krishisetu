export type Language = "en" | "kn";

export const translations = {
  en: {
    brandName: "KrishiSetu",
    tagline: "From field to market",
    demoTag: "Demo · Real weather, real recommendations",
    getStarted: "Get Started →",
    continue: "Continue →",
    back: "Back",
    
    // Onboarding Screen
    onboardingTitle: "Create Farmer Profile",
    onboardingSub: "Help us customize weather & crop recommendations for your farm.",
    farmerNameLabel: "Farmer's Full Name",
    farmerNamePlaceholder: "e.g., Basappa Gowda",
    phoneNumberLabel: "Phone Number",
    phoneNumberPlaceholder: "10-digit mobile number",
    districtLabel: "Select District",
    districtSelect: "Choose your district",
    agreeToTerms: "I agree to receive local weather alerts & advisory messages",
    onboardingErrorName: "Name must be at least 2 characters",
    onboardingErrorPhone: "Please enter a valid 10-digit mobile number",
    onboardingErrorDistrict: "Please select your district",
    
    // Dashboard Header / Bottom Nav
    home: "Home",
    crops: "Crops",
    sell: "Sell",
    profile: "Profile",
    micLabel: "What do you need help with?",
    micSub: "Tap and ask anything about crops or weather",
    micListening: "Listening...",
    
    // Weather Card
    weatherPanelTitle: "Kolar Weather Advisor",
    weatherSub: "Real-time satellite & station data",
    tempLabel: "Temperature",
    precipLabel: "Precipitation",
    windLabel: "Wind Speed",
    humidityLabel: "Humidity",
    climatologyTitle: "NASA Power Climatology",
    climatologySub: "30-year average context for Kolar",
    currentCondition: "Current Condition",
    
    // Recommendations Card
    recommendationsTitle: "Recommended Crops",
    recommendationsSub: "Top ranked options based on soil & weather matrix rules",
    suitabilityScore: "Suitability Score",
    projectedNetReturn: "Projected Net Return",
    typicalYield: "Typical Yield",
    typicalPrice: "Typical Price Band",
    inputCost: "Input Cost",
    rationaleTitle: "AI Advisor Rationale",
    loadingCrops: "Loading optimal crops...",
    loadingWeather: "Fetching current Kolar climate...",
    errorLoading: "Failed to load data. Please ensure the backend is running.",
  },
  kn: {
    brandName: "ಕೃಷಿಸೇತು",
    tagline: "ರೈತರ ಬೆಳೆಯಿಂದ ಬಜಾರಿಗೆ",
    demoTag: "ಪ್ರಾಯೋಗಿಕ · ನೈಜ ಹವಾಮಾನ, ಬೆಳೆ ಶಿಫಾರಸುಗಳು",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ →",
    continue: "ಮುಂದುವರಿಸಿ →",
    back: "ಹಿಂದೆ",
    
    // Onboarding Screen
    onboardingTitle: "ರೈತರ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ",
    onboardingSub: "ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸೂಕ್ತವಾದ ಹವಾಮಾನ ಮತ್ತು ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಲು ಸಹಾಯ ಮಾಡಿ.",
    farmerNameLabel: "ರೈತರ ಪೂರ್ಣ ಹೆಸರು",
    farmerNamePlaceholder: "ಉದಾ: ಬಸಪ್ಪ ಗೌಡ",
    phoneNumberLabel: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    phoneNumberPlaceholder: "೧೦ ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    districtLabel: "ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
    districtSelect: "ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಆರಿಸಿ",
    agreeToTerms: "ಸ್ಥಳೀಯ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಸಲಹೆ ಸಂದೇಶಗಳನ್ನು ಪಡೆಯಲು ನಾನು ಒಪ್ಪುತ್ತೇನೆ",
    onboardingErrorName: "ಹೆಸರು ಕನಿಷ್ಠ ೨ ಅಕ್ಷರ ಇರಬೇಕು",
    onboardingErrorPhone: "ದಯವಿಟ್ಟು ಸರಿಯಾದ ೧೦ ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    onboardingErrorDistrict: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
    
    // Dashboard Header / Bottom Nav
    home: "ಮುಖಪುಟ",
    crops: "ಬೆಳೆಗಳು",
    sell: "ಮಾರಾಟ",
    profile: "ಪ್ರೊಫೈಲ್",
    micLabel: "ಏನು ಸಹಾಯ ಬೇಕು?",
    micSub: "ಬೆಳೆಗಳು ಅಥವಾ ಹವಾಮಾನದ ಬಗ್ಗೆ ಕೇಳಲು ಸ್ಪರ್ಶಿಸಿ",
    micListening: "ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...",
    
    // Weather Card
    weatherPanelTitle: "ಕೋಲಾರ ಹವಾಮಾನ ಸಲಹೆಗಾರ",
    weatherSub: "ನೈಜ-ಸಮಯದ ಉಪಗ್ರಹ ಮತ್ತು ಕೇಂದ್ರದ ಡೇಟಾ",
    tempLabel: "ತಾಪಮಾನ",
    precipLabel: "ಮಳೆ ಪ್ರಮಾಣ",
    windLabel: "ಗಾಳಿಯ ವೇಗ",
    humidityLabel: "ಆರ್ದ್ರತೆ",
    climatologyTitle: "ನಾಸಾ ಪವರ್ ಹವಾಮಾನ ಇತಿಹಾಸ",
    climatologySub: "ಕೋಲಾರದ ೩೦ ವರ್ಷಗಳ ಸರಾಸರಿ ಇತಿಹಾಸ",
    currentCondition: "ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿ",
    
    // Recommendations Card
    recommendationsTitle: "ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು",
    recommendationsSub: "ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನ ಸೂತ್ರಗಳ ಆಧಾರದ ಮೇಲೆ ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳು",
    suitabilityScore: "ಹೊಂದಾಣಿಕೆಯ ಅಂಕ",
    projectedNetReturn: "ಅಂದಾಜು ನಿವ್ವಳ ಆದಾಯ",
    typicalYield: "ಸರಾಸರಿ ಇಳುವರಿ",
    typicalPrice: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಶ್ರೇಣಿ",
    inputCost: "ಬಂಡವಾಳ ವೆಚ್ಚ",
    rationaleTitle: "ಸಲಹೆಗಾರರ ವಿವರಣೆ",
    loadingCrops: "ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    loadingWeather: "ಕೋಲಾರದ ಹವಾಮಾನ ವಿವರಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
    errorLoading: "ಡೇಟಾವನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ. ಹಿನ್ನೆಲೆ ಸೇವೆ ಚಾಲನೆಯಲ್ಲಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
  }
};
