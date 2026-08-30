import vi from '../locales/vi';

const t = (key: string) => vi[key] || key;

export function useTranslation() {
  return { t };
}