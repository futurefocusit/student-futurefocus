export const formatDate = (date:Date) => {
  return date? date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }):'';
};
