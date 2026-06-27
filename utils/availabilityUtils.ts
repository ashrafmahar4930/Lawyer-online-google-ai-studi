import { LawyerProfile } from '../types';

/**
 * Checks whether a lawyer is currently available based on their configured office timings and days.
 * If office hours are not set, defaults to available (true).
 */
export const isLawyerAvailable = (profile: LawyerProfile): boolean => {
  if (!profile.officeTimingStart || !profile.officeTimingEnd) {
    return true;
  }

  try {
    const now = new Date();
    
    // Get current day of week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysOfWeek[now.getDay()];

    // Check if current day is a working day
    if (profile.officeDays && profile.officeDays.length > 0) {
      if (!profile.officeDays.includes(currentDay)) {
        return false;
      }
    }

    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    // Parse timing strings (e.g., "09:00" and "17:00")
    const [startH, startM] = profile.officeTimingStart.split(':').map(Number);
    const [endH, endM] = profile.officeTimingEnd.split(':').map(Number);

    const startTimeInMinutes = startH * 60 + (startM || 0);
    const endTimeInMinutes = endH * 60 + (endM || 0);

    // Check if timing crosses midnight (e.g. night shift 22:00 to 06:00)
    if (endTimeInMinutes < startTimeInMinutes) {
      return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes;
    }

    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  } catch (e) {
    console.warn("Could not determine lawyer availability:", e);
    return true; // Fallback to always-online on parsing failure
  }
};

/**
 * Returns a human-friendly Urdu or English string representing the status.
 */
export const getAvailabilityStatusText = (profile: LawyerProfile, isUrdu: boolean = false): { text: string; colorClass: string; isAvailable: boolean } => {
  const isAvailable = isLawyerAvailable(profile);
  
  if (isAvailable) {
    return {
      text: isUrdu ? 'کال اور پیغامات کے لیے دستیاب' : 'Available for Call & Chat',
      colorClass: 'text-green-600 bg-green-50 border-green-200',
      isAvailable: true
    };
  } else {
    return {
      text: isUrdu ? 'ابھی دستیاب نہیں (صرف پیغام بھیجیں)' : 'Unavailable right now (Messages only)',
      colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
      isAvailable: false
    };
  }
};
