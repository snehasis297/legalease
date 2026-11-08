export const ID_REGEX = {
  AADHAAR: /^[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}$|^[2-9]{1}[0-9]{11}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  VOTER_ID: /^[A-Z]{3}[0-9]{7}$/,
  PASSPORT: /^[A-Z][0-9]{7}$/,
  DRIVING_LICENSE: /^[A-Z]{2}[0-9]{2}[0-9]{11}$/,
};

export const validateGovtId = (type, value) => {
  if (!type || !value) return false;
  const regex = ID_REGEX[type];
  if (!regex) return false;
  return regex.test(value.trim().toUpperCase());
};

export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Empty', color: 'bg-gray-600' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-danger' };
  if (score <= 4) return { score: 2, label: 'Moderate', color: 'bg-warning' };
  return { score: 3, label: 'Strong', color: 'bg-success' };
};
