export const formatPhoneNumberForWhatsApp = (phoneNumber: string, country: string): string => {
  if (!phoneNumber) return '';

  let cleaned = phoneNumber.replace(/\D/g, '');

  if (!cleaned) return '';

  const countryDialingCodes: Record<string, string> = {
    'Pakistan': '92',
    'India': '91',
    'USA': '1',
    'United States': '1',
    'UK': '44',
    'United Kingdom': '44',
    'Canada': '1',
    'Australia': '61',
    'Saudi Arabia': '966',
    'UAE': '971',
    'United Arab Emirates': '971',
    'Qatar': '974',
    'Oman': '968',
    'Bahrain': '973',
    'Kuwait': '965',
    'Bangladesh': '880',
    'Sri Lanka': '94',
    'Nepal': '977',
    'Malaysia': '60',
    'Singapore': '65',
    'South Africa': '27',
    'Afghanistan': '93',
  };

  const prefix = countryDialingCodes[country];

  // If we don't know the country, and it does not start with +, just return it (it might already have a code, or might be invalid)
  if (!prefix) {
      // If user typed '00', maybe they meant '+', so strip '00'
      if (cleaned.startsWith('00')) return cleaned.substring(2);
      return cleaned;
  }

  // Look for common local prefixes like '0' in international dialing formats
  if (cleaned.startsWith('0') && !cleaned.startsWith('00')) {
      cleaned = cleaned.substring(1);
  }

  // If the cleaned number already starts with the country code, return it
  if (cleaned.startsWith(prefix)) {
      return cleaned;
  }

  // Otherwise, prepend the country dial code
  return `${prefix}${cleaned}`;
};
