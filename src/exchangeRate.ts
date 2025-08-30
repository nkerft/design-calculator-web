// Источник: cbr-xml-daily (зеркало ЦБ РФ)
// Кэшируем курс в localStorage на 1 календарный день (по дате Московского времени)

export interface ExchangeRateData {
  rate: number; // USD -> RUB
  isoDate: string; // дата в ISO от ЦБ
  storedAt: string; // локальное время сохранения
  yyyymmdd: string; // ключ дня для инвалидации
}

const STORAGE_KEY = 'usd_rub_rate_v1';

function getTodayKey(): string {
  const now = new Date();
  // Используем локальную дату пользователя; при необходимости можно сместить на МСК
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function readCache(): ExchangeRateData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ExchangeRateData;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data: ExchangeRateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export async function fetchUsdRubFromCbr(): Promise<ExchangeRateData> {
  const resp = await fetch('https://www.cbr-xml-daily.ru/daily_json.js', { cache: 'no-store' });
  if (!resp.ok) {
    throw new Error(`CBR http ${resp.status}`);
  }
  const json = await resp.json();
  const rate = Number(json?.Valute?.USD?.Value);
  const isoDate = String(json?.Date);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('CBR rate is invalid');
  }
  return {
    rate,
    isoDate,
    storedAt: new Date().toISOString(),
    yyyymmdd: getTodayKey()
  };
}

export async function getUsdToRubRate(): Promise<ExchangeRateData> {
  const cached = readCache();
  const today = getTodayKey();
  if (cached && cached.yyyymmdd === today && Number.isFinite(cached.rate) && cached.rate > 0) {
    return cached;
  }
  const fresh = await fetchUsdRubFromCbr();
  writeCache(fresh);
  return fresh;
}

export function getCachedUsdToRubRate(): number | null {
  const cached = readCache();
  const today = getTodayKey();
  if (cached && cached.yyyymmdd === today && Number.isFinite(cached.rate) && cached.rate > 0) {
    return cached.rate;
  }
  return null;
}


