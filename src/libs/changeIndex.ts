export const changeIndex=(array, currentIndex, newIndex) =>{
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

  // Remove the item from the current index
  const item = array.splice(currentIndex, 1)[0];

  // Insert the item at the new index
  array.splice(newIndex, 0, item);
}