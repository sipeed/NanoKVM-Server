import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getLanguage } from '@/lib/cookie.ts';

import { resources } from './resources';

const lng = getLanguage();

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng,

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })
  .then();

export default i18n;
