import { ArrowLeft, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

type Slide = {
  url: string;
  caption?: string;
};

type ImageSliderProps = {
  slides: Slide[];
  index?: number; // Optional: fallback to 0
};

const ImageSlider: React.FC<ImageSliderProps> = ({ slides, index = 0 }) => {
  const [current, setCurrent] = useState(() =>
    Math.max(0, Math.min(index, slides.length - 1))
  );

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Image */}
      <div className="overflow-hidden rounded-lg">
        <img
          src={slides[current].url}
          alt={`Slide ${current + 1}`}
          className="w-96 max-h-96 mx-auto object-cover transition duration-500"
        />
      </div>

      {/* Caption */}
      {slides[current].caption && (
        <div className="text-center mt-2 text-white text-sm sm:text-base">
          {slides[current].caption}
        </div>
      )}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 text-gray-800 p-2 rounded-full shadow"
      >
     <FaArrowLeft  className="text-2xl"/>
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2  right-4 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 text-gray-800 p-2 rounded-full shadow"
      >
       <FaArrowRight  className="text-2xl"/>
      </button>

      {/* Dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full ${i === current ? "bg-gray-800" : "bg-gray-400"
              }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
