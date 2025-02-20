export const getBaseApiUrl = (): string => {
  if (process.env.NODE_ENV === 'production') return 'http://api.tincan.com'

  return 'http://api.localhost';
};
