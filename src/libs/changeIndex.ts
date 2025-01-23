export const changeIndex=(array:any, currentIndex:number, newIndex:number) =>{
  if (!Array.isArray(array)) {
    throw new TypeError("Expected an array");
  }

 
  if (
    currentIndex < 0 ||
    currentIndex >= array.length ||
    newIndex < 0 ||
    newIndex >= array.length
  ) {
    console.error("Invalid indices");
    return;
  }

  const item = array.splice(currentIndex, 1)[0];

  array.splice(newIndex, 0, item);
}