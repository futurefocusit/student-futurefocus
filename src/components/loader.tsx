import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
          <div
            className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin-fast"
            style={{
              animationDirection: "reverse",
              clipPath: "polygon(50% 0%, 50% 50%, 100% 50%, 100% 0%)",
            }}
          />
        </div>
        <Loader2 className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
      </div>
      <p className="mt-4 text-lg font-medium text-gray-600 animate-pulse">
        Loading...
      </p>
      <style jsx global>{`
        @keyframes spin-fast {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-fast {
          animation: spin-fast 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
