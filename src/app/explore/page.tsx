"use client";
import React from "react";
import { useRouter } from "next/navigation";

const brochures = [
  {
    lang: "English",
    url: "https://drive.google.com/file/d/1_DyZjtyK8rYbJOKrJRcetL_ZkBksION9/view?usp=sharing,",
    color: "#4309ac",
    icon: "🇬🇧",
    label: {
      en: "English Brochure",
      hi: "अंग्रेज़ी ब्रॉशर",
      kn: "ಇಂಗ್ಲಿಷ್ ಬ್ರೋಶರ್",
    },
  },
  {
    lang: "Hindi",
    url: "https://drive.google.com/file/d/1AXGUQp_KLSTXjqoNW1wTiFhS_Xj2UaEi/view?usp=sharing",
    color: "#e65100",
    icon: "🇮🇳",
    label: {
      en: "Hindi Brochure",
      hi: "हिंदी ब्रॉशर",
      kn: "ಹಿಂದಿ ಬ್ರೋಶರ್",
    },
  },
  {
    lang: "Kannada",
    url: "https://drive.google.com/file/d/1FHhVq871IxsmpBpQk3kcMMDpIq9UeJvM/view?usp=sharing",
    color: "#00695c",
    icon: "🇮🇳",
    label: {
      en: "Kannada Brochure",
      hi: "कन्नड़ ब्रॉशर",
      kn: "ಕನ್ನಡ ಬ್ರೋಶರ್",
    },
  },
];

const languageOptions = [
  { code: "en", label: "English", icon: "🇬🇧" },
  { code: "hi", label: "हिंदी", icon: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ", icon: "🇮🇳" },
];

type LangCode = "en" | "hi" | "kn";

const ExplorePage = () => {
  const [lang, setLang] = React.useState<LangCode>("en");
  const router = useRouter();

  const heading = {
    en: "Explore",
    hi: "एक्सप्लोर करें",
    kn: "ಅನ್ವೇಷಿಸಿ",
  };

  const subheading = {
    en: "Access detailed product information in your preferred language",
    hi: "अपनी पसंदीदा भाषा में विस्तृत उत्पाद जानकारी प्राप्त करें",
    kn: "ನಿಮ್ಮ ಆಯ್ಕೆಯ ಭಾಷೆಯಲ್ಲಿ ವಿವರವಾದ ಉತ್ಪನ್ನ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಿರಿ",
  };

  const comingSoon = {
    en: "More features and products coming soon",
    hi: "अधिक सुविधाएँ और उत्पाद जल्द आ रहे हैं",
    kn: "ಹೆಚ್ಚು ವೈಶಿಷ್ಟ್ಯಗಳು ಮತ್ತು ಉತ್ಪನ್ನಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರುತ್ತವೆ",
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-linear-to-br from-[#f5f3ff] via-[#faf8ff] to-white">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-20 flex items-center gap-1 text-[#4309ac] hover:text-[#350889] font-medium text-sm px-3 py-2 rounded-lg bg-white/80 border border-[#e0d7fc] hover:bg-[#ede7fa] shadow transition"
        aria-label="Back to Home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>
      {/* Radial lights */}
      <div className="absolute -top-32 -left-32 w-130 h-130 bg-[#4309ac]/20 rounded-full blur-[160px]" />
      <div className="absolute -bottom-40 -right-40 w-140 h-140 bg-[#e65100]/20 rounded-full blur-[180px]" />

      {/* Language Switch OUTSIDE Card */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex justify-center w-full">
        <div className="relative flex gap-1 p-1 bg-gray-100/80 rounded-full shadow-inner">
          {languageOptions.map((option) => {
            const active = lang === option.code;
            return (
              <button
                key={option.code}
                onClick={() => setLang(option.code as LangCode)}
                className={`relative px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                  active
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 z-1 rounded-full bg-[#4309ac] shadow-md" />
                )}
                <span className="z-5">{option.icon}</span>
                <span className="z-5">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Glass Card */}
      <div className="relative w-full max-w-xl rounded-4xl bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_30px_80px_-25px_rgba(67,9,172,0.35)] p-8 mt-16">
        {/* Inner highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-4xl ring-1 ring-inset ring-white/50" />

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-[#4309ac] via-[#5a20d8] to-[#7c4dff] bg-clip-text text-transparent mb-4">
            {heading[lang]}
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
            {subheading[lang]}
          </p>
        </div>

        {/* Brochure List */}
        <div className="space-y-4">
          {brochures.map((brochure, index) => (
            <a
              key={brochure.lang}
              href={brochure.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block rounded-2xl p-px transition-transform duration-300 hover:-translate-y-0.5"
              style={{
                animation: `fadeUp 0.6s ease-out ${index * 120}ms both`,
              }}
            >
              {/* Gradient border */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${brochure.color}, transparent 60%)`,
                }}
              />

              <div className="relative flex items-center justify-between bg-white rounded-[14px] px-6 py-5 shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-4">
                  {/* Accent bar */}
                  <span
                    className="h-10 w-1.5 rounded-full"
                    style={{ backgroundColor: brochure.color }}
                  />
                  <span
                    className="text-lg font-semibold"
                    style={{ color: brochure.color }}
                  >
                    {brochure.label[lang]}
                  </span>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H7"
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-linear-to-r from-[#4309ac]/10 to-[#e65100]/10 border border-[#4309ac]/20">
            <span>✨</span>
            <p className="text-sm font-medium text-gray-700">
              {comingSoon[lang]}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ExplorePage;
