
const GREG_MONTH_MAP: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

/**
 * Approximate Gregorian start dates for each Malayalam (Kollavarsham) solar month.
 * Accurate to ±1 day — exact dates shift slightly each year due to solar motion.
 */
const TRANSITIONS = [
  { m: 1,  d: 14, ml: 'മകരം',     en: 'Makaram'     },
  { m: 2,  d: 13, ml: 'കുംഭം',     en: 'Kumbham'     },
  { m: 3,  d: 15, ml: 'മീനം',      en: 'Meenam'      },
  { m: 4,  d: 14, ml: 'മേടം',      en: 'Medam'       },
  { m: 5,  d: 15, ml: 'ഇടവം',      en: 'Edavam'      },
  { m: 6,  d: 15, ml: 'മിഥുനം',    en: 'Mithunam'    },
  { m: 7,  d: 17, ml: 'കർക്കടകം', en: 'Karkadakam'  },
  { m: 8,  d: 17, ml: 'ചിങ്ങം',    en: 'Chingam'     }, // Kollavarsham new year
  { m: 9,  d: 17, ml: 'കന്നി',     en: 'Kanni'       },
  { m: 10, d: 17, ml: 'തുലാം',     en: 'Thulam'      },
  { m: 11, d: 16, ml: 'വൃശ്ചികം', en: 'Vrischikam'  },
  { m: 12, d: 16, ml: 'ധനു',       en: 'Dhanu'       },
];

export interface MlDate {
  year: number;
  monthMl: string;
  monthEn: string;
  day: number;
}

/**
 * Convert a date in MMM-DD-YYYY format to an approximate Malayalam (Kollavarsham) date.
 * Returns null if the input is not a valid MMM-DD-YYYY string.
 */
export function toMalayalamDate(mmmDdYyyy: string): MlDate | null {
  const parts = mmmDdYyyy.split('-');
  if (parts.length !== 3) return null;

  const gregMonth = GREG_MONTH_MAP[parts[0]];
  const gregDay = parseInt(parts[1], 10);
  const gregYear = parseInt(parts[2], 10);
  if (!gregMonth || isNaN(gregDay) || isNaN(gregYear) || gregYear < 800) return null;

  const inputDate = new Date(gregYear, gregMonth - 1, gregDay);

  // Find the most recent transition ≤ inputDate (search current then previous year)
  let best: (typeof TRANSITIONS)[0] | null = null;
  let bestDate: Date | null = null;

  outer: for (let yo = 0; yo >= -1; yo--) {
    for (const t of [...TRANSITIONS].reverse()) {
      const tDate = new Date(gregYear + yo, t.m - 1, t.d);
      if (tDate <= inputDate && (!bestDate || tDate > bestDate)) {
        bestDate = tDate;
        best = t;
      }
    }
    if (bestDate) break outer;
  }

  if (!best || !bestDate) return null;

  const mlDay = Math.floor((inputDate.getTime() - bestDate.getTime()) / 86_400_000) + 1;

  // KV year increments when Chingam starts (~Aug 17)
  const chingam = new Date(gregYear, 7, 17);
  const kvYear = gregYear - 825 - (inputDate >= chingam ? 0 : 1);

  return {
    year: kvYear,
    monthMl: best.ml,
    monthEn: best.en,
    day: mlDay,
  };
}
