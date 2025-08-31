export const capitalize = (str: string): string => {
  if (!str) return "";
  if (str.split("_").length > 1) {
    return str
      .split("_")
      .map((word) => capitalize(word))
      .join(" ");
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
};
