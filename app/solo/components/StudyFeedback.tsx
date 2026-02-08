import { useState } from "react";
import { ClassifcationTaskProps } from "./types";
import ConfirmationModal from "./ui/ConfirmationModal";

export default function StudyFeedback({ onContinue }: ClassifcationTaskProps) {
  const [textInput, setTextInput] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  const isFormValid = () => textInput.trim() !== "";

  const handleContinue = () => {
    if (isFormValid()) {
      const data = {
        text: textInput,
      };
      onContinue?.(data);
    } else {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmContinue = () => {
    setShowConfirmationModal(false);
    const data = {
      text: textInput,
    };
    onContinue?.(data);
  };

  const handleCancelContinue = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className="bg-black p-8 text-center max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="mt-6">
          <label className="block text-white text-2xl mb-6 mt-32">
            We’re interested in hearing more about your experience with our
            study. Please share any thoughts you have below.
          </label>
          <textarea
            value={textInput}
            placeholder="Please respond here..."
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full h-56 p-4 text-white bg-gray-800 border border-white rounded-lg resize-none focus:outline-none focus:border-blue-400 text-xl"
            autoFocus
          />
        </div>
      </div>
      <div className="w-full flex justify-center pb-8">
        <button
          type="button"
          onClick={handleContinue}
          className="px-8 py-3 rounded-lg font-semibold transition-colors bg-white text-black hover:bg-gray-200"
        >
          Continue
        </button>
      </div>
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCancelContinue}
        onConfirm={handleConfirmContinue}
        message="There are unanswered questions on this page. Would you like to continue?"
        confirmText="Continue"
        cancelText="Close"
      />
    </div>
  );
}
