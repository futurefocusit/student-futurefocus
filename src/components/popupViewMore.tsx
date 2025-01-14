// PopupViewMore.tsx
import React from "react";

interface PopupViewMoreProps {
  rentedMaterial
  onClose: () => void;
}

const PopupViewMore: React.FC<PopupViewMoreProps> = ({
  rentedMaterial,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-2">Rented Material Details</h2>
        <p>
          <strong>Material Name:</strong>{" "}
          {rentedMaterial.materialId.materialName}
        </p>
        <p>
          <strong>Amount:</strong> {rentedMaterial.amount}
        </p>
        <p>
          <strong>Date Rented:</strong> {rentedMaterial.rentDate}
        </p>
        <p>
          <strong>Date Return:</strong> {rentedMaterial.returnDate}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {rentedMaterial.returned ? "Returned" : "Not Returned"}
        </p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PopupViewMore;
