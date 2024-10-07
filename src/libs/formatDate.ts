export const formatMonth = (dateString: string) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long" } as const;
  return date.toLocaleDateString("en-US", options);
};
