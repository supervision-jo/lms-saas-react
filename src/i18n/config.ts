// Core i18next library.
import i18n from "i18next";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import translationEN from "../locales/en/translation.json";
import translationAR from "../locales/ar/translation.json";
import homeEN from "../locales/en/home.json";
import homeAR from "../locales/ar/home.json";
import instructorDashboardEN from "../locales/en/instructorDashboard.json";
import instructorDashboardAR from "../locales/ar/instructorDashboard.json";
import studentDashboardEN from "../locales/en/studentDashboard.json";
import studentDashboardAR from "../locales/ar/studentDashboard.json";

const resources = {
  en: {
    translation: translationEN,
    home: homeEN,
    instructorDashboard: instructorDashboardEN,
    studentDashboard: studentDashboardEN,
  },
  ar: {
    translation: translationAR,
    home: homeAR,
    instructorDashboard: instructorDashboardAR,
    studentDashboard: studentDashboardAR,
  }
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
    ns: ["translation", "home", "instructorDashboard", "studentDashboard"],
    defaultNS: "translation",
    supportedLngs: Object.keys(supportedLngs),
    // debug: import.meta.env.DEV,
    // interpolation: {
    //   escapeValue: false,
    // },
  });

export default i18n;
