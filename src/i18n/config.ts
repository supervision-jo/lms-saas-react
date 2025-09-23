// Core i18next library.
import i18n from "i18next";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import translationEN from "../locales/en/translation.json";
import translationAR from "../locales/ar/translation.json";

const resources = {
  en: {
    translation: translationEN,
  },
  ar: {
    translation: translationAR,
  },
};

export const supportedLngs = {
  en: "English",
  ar: "Arabic (العربية)",
};

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("i18nextLng") || "en",
    fallbackLng: "en",
    ns: ["translation"],
    defaultNS: "translation",
    supportedLngs: Object.keys(supportedLngs),
    // debug: import.meta.env.DEV,
    // interpolation: {
    //   escapeValue: false,
    // },
  });

export default i18n;
