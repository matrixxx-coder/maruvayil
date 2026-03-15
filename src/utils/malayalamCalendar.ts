const ML_DIGITS = ['൦', '൧', '൨', '൩', '൪', '൫', '൬', '൭', '൮', '൯'];

function toMlNumeral(n: number): string {
  return String(n)
    .split('')
    .map((d) => ML_DIGITS[parseInt(d, 10)])
    .join('');
}

const GREG_MONTH_MAP: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

/**
 * Approximate Gregorian start dates for each Malayalam (Kollavarsham) solar month.
 * Accurate to ±1 day — exact dates shift slightly each year due to solar motion.
 */
const TRANSITIONS = [
  { m: 1,  d: 14, name: 'മകരം'     },
  { m: 2,  d: 13, name: 'കുംഭം'     },
  { m: 3,  d: 15, name: 'മീനം'      },
  { m: 4,  d: 14, name: 'മേടം'      },
  { m: 5,  d: 15, name: 'ഇടവം'      },
  { m: 6,  d: 15, name: 'മിഥുനം'    },
  { m: 7,  d: 17, name: 'കർക്കടകം' },
  { m: 8,  d: 17, name: 'ചിങ്ങം'    }, // Kollavarsham new year
  { m: 9,  d: 17, name: 'കന്നി'     },
  { m: 10, d: 17, name: 'തുലാം'     },
  { m: 11, d: 16, name: 'വൃശ്ചികം' },
  { m: 12, d: 16, name: 'ധനു'       },
];

export interface MlDate {
  year: number;
  monthMl: string;
  day: number;
  display: string;
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
  let bestName = '';
  let bestDate: Date | null = null;

  outer: for (let yo = 0; yo >= -1; yo--) {
    for (const t of [...TRANSITIONS].reverse()) {
      const tDate = new Date(gregYear + yo, t.m - 1, t.d);
      if (tDate <= inputDate && (!bestDate || tDate > bestDate)) {
        bestDate = tDate;
        bestName = t.name;
      }
    }
    if (bestDate) break outer;
  }

  if (!bestDate) return null;

  const mlDay = Math.floor((inputDate.getTime() - bestDate.getTime()) / 86_400_000) + 1;

  // KV year increments when Chingam starts (~Aug 17)
  const chingam = new Date(gregYear, 7, 17);
  const kvYear = gregYear - 825 - (inputDate >= chingam ? 0 : 1);

  return {
    year: kvYear,
    monthMl: bestName,
    day: mlDay,
    display: `കൊ.വ. ${toMlNumeral(kvYear)} ${bestName} ${toMlNumeral(mlDay)}`,
  };
}
