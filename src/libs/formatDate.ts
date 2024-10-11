export const formatMonth = (dateString: string) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long" } as const;
  return date.toLocaleDateString("en-US", options);
};
export const isToday=(date:string) =>{
  const today = new Date();
  // Set hours, minutes, seconds, and milliseconds to zero for comparison
  today.setHours(0, 0, 0, 0);

  const givenDate = new Date(date);
  givenDate.setHours(0, 0, 0, 0);

  return today.getTime() === givenDate.getTime();
}