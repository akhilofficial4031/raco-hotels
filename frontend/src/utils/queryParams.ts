export const convertJsonToQueryParams = <T extends object>(
  params: T,
): string => {
  const query = Object.entries(params)
    .filter(([, value]) => {
      if (typeof value === "string") {
        return value.trim() !== "";
      }
      return value !== null && value !== undefined;
    })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string | number | boolean)}`,
    )
    .join("&");

  return query ? `?${query}` : "";
};
