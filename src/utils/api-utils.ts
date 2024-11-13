export const getBaseApiUrl = (): string => {
  if (process.env.NODE_ENV === 'production') return 'http://api.tincan.com'
  
  return 'http://127.0.0.1:3005';
};