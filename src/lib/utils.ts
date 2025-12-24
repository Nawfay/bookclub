import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



interface ReadingProgress {
  realPage: number;
  percentage: string;
}

/**
 * Converts digital page count to physical page count and percentage.
 */
export function normalizeData( currentDigital: number, totalDigital: number, totalPhysical: number
): ReadingProgress {
  
  if (totalDigital === 0) {
    return { realPage: 0, percentage: "0%" };
  }

  const ratio = currentDigital / totalDigital;

  const realPage = Math.round(ratio * totalPhysical);
  const percentage = (ratio * 100).toFixed(1);

  return { realPage, percentage };
}


interface UserGoal {
  digitalStart: number;
  digitalEnd: number;
  pagesToRead: number;
}

export function convertToUserPage(
  realStart: number,
  realEnd: number,
  totalPhysical: number,
  totalDigital: number
): UserGoal {
  
  if (totalPhysical === 0) {
    return { digitalStart: 0, digitalEnd: 0, pagesToRead: 0 };
  }

  // The inverse ratio: How many digital pages equal 1 real page?
  const ratio = totalDigital / totalPhysical;

  // Convert and round
  const digitalStart = Math.round(realStart * ratio);
  const digitalEnd = Math.round(realEnd * ratio);

  return { 
    digitalStart, 
    digitalEnd,
    pagesToRead: digitalEnd - digitalStart
  };
}