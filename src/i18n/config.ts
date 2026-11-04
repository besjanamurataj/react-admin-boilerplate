import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enGB from "./locales/en.json";
import itIT from "./locales/it.json";
const defaultLanguage = "en-GB";

export const defaultNamespace = "default";

export const resources = {
  "en-GB": {
    [defaultNamespace]: enGB,
  },
  "it-IT": {
    [defaultNamespace]: itIT,
  },
};

i18n.use(initReactI18next).init({
  defaultNS: defaultNamespace,
  ns: [defaultNamespace],
  resources,
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
});
