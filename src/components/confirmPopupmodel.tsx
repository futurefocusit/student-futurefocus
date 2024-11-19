
import React from "react";

interface ConfirmDeleteModalProps {
  onConfirm: () => void; // Function to confirm the delete action
  onClose: () => void; // Function to close the modal
  action:string,
  loading:boolean
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  onConfirm,
  onClose,
  action,
  loading
}) => {
  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose} 
    >
      <div
        className="bg-white p-6 rounded-lg w-80 text-center"
        onClick={(e) => e.stopPropagation()} 
      >
        <h2 className="text-xl font-semibold text-gray-800">
         {`Are you sure you want to ${action} ?`}
        </h2>
        <div className="mt-4 flex justify-between">
          <button
            onClick={onConfirm} 
            disabled={loading}
            className={`px-8 py-2  bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600`}
          >
            {loading}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
