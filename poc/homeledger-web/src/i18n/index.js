// FILENAME: src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import frCommon from "./locales/fr/common.json";
import enCommon from "./locales/en/common.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "fr",
        debug: false,
        resources: {
            fr: {
                common: frCommon
            },
            en: {
                common: enCommon
            }
        },
        ns: ["common"],
        defaultNS: "common",
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ["localStorage", "navigator", "htmlTag"],
            caches: ["localStorage"]
        }
    });

export default i18n;