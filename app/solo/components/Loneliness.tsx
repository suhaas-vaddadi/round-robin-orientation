import { useEffect, useState } from "react";
import MatrixQuestion from "./ui/MatrixQuestion";
import { ClassifcationTaskProps } from "./types";
import ConfirmationModal from "./ui/ConfirmationModal";
export default function Loneliness({ onContinue }: ClassifcationTaskProps) {
  const [matrixSelections, setMatrixSelections] = useState<{
    [key: number]: number;
  }>({});
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<string[]>([]);

  const originalQuestions = [
    'How often do you feel that you are "in tune" with the people around you?',
    "How often do you feel that you lack companionship?",
    "How often do you feel that there is no one you can turn to?",
    "How often do you feel alone?",
    "How often do you feel part of a group of friends?",
    "How often do you feel that you have a lot in common with the people around you?",
    "How often do you feel that you are no longer close to anyone?",
    "How often do you feel that your interests and ideas are not shared by those around you?",
    "How often do you feel outgoing and friendly?",
    "How often do you feel close to people?",
    "How often do you feel left out?",
    "How often do you feel that your relationships with others are not meaningful?",
    "How often do you feel that no one really knows you well?",
    "How often do you feel isolated from others?",
    "How often do you feel you can find companionship when you want it?",
    "How often do you feel that there are people who really understand you?",
    "How often do you feel shy?",
    "How often do you feel that people are around you but not with you?",
    "How often do you feel that there are people you can talk to?",
    "How often do you feel that there are people you can turn to?",
  ];

  useEffect(() => {
    const shuffled = [...originalQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, []);

  const handleMatrixSelectionChange = (
    rowIndex: number,
    columnIndex: number
  ) => {
    setMatrixSelections((prev) => ({
      ...prev,
      [rowIndex]: columnIndex,
    }));
  };

  const isFormValid = () => {
    const totalQuestions = 20;
    const answeredQuestions = Object.keys(matrixSelections).length;
    return (
      answeredQuestions === totalQuestions &&
      Object.values(matrixSelections).every((selection) => selection != null)
    );
  };
  const handleContinue = () => {
    if (isFormValid()) {
      const data = {
        matrixSelections: matrixSelections,
        order: shuffledQuestions,
      };
      onContinue?.(data);
    } else {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmContinue = async () => {
    const data = {
      matrixSelections: matrixSelections,
      order: shuffledQuestions,
    };
    onContinue?.(data);
    setShowConfirmationModal(false);

  };

  const handleCancelContinue = () => {
    setShowConfirmationModal(false);
  };
  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className="bg-black p-8 text-center max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 mb-6 max-w-2xl mx-auto"></div>
          <MatrixQuestion
            rows={shuffledQuestions}
            columns={["Never", "Rarely", "Sometimes", "Always"]}
            onSelectionChange={handleMatrixSelectionChange}
            selections={matrixSelections}
          />
        </div>
      </div>

      <div className="w-full flex justify-center pb-8">
        <button
          type="button"
          onClick={handleContinue}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${"bg-white text-black hover:bg-gray-200"}`}
        >
          Continue
        </button>
      </div>

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCancelContinue}
        onConfirm={handleConfirmContinue}
      />
    </div>
  );
}
