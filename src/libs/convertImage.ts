export const convertImageUrlToBase64 = (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Needed for cross-origin images
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
          data[i + 3] = 0; 
        }
      }

      
      ctx.putImageData(imageData, 0, 0);

      const base64String = canvas.toDataURL("image/png"); 
      resolve(base64String);
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
};
