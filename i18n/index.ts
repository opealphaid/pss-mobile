import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import es from './es.json';
import en from './en.json';

const i18n = new I18n({
  es,
  en,
});

const locales = getLocales();
const deviceLanguage = locales[0]?.languageCode || 'es';

i18n.locale = deviceLanguage;
i18n.enableFallback = true;
i18n.defaultLocale = 'es';

export default i18n;
