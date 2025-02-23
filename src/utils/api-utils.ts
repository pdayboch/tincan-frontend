export const getBaseApiUrl = (): string => {
  // TODO: Make this a build time variable but i'm in a rush so leaving this hardcoded.
  if (process.env.NODE_ENV === "production")
    return "http://api.tincan.dayboch.com";

  return "http://api.localhost";
};
