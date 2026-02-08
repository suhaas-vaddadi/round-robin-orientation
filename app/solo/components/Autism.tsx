import { useEffect, useState } from "react";
import MatrixQuestion from "./ui/MatrixQuestion";
import ConfirmationModal from "./ui/ConfirmationModal";

import { ClassifcationTaskProps } from "./types";
export default function Autism({ onContinue }: ClassifcationTaskProps) {
  const [matrixSelections, setMatrixSelections] = useState<{
    [key: number]: number;
  }>({});
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<string[]>([]);

  const originalQuestions = [
    "I often notice small sounds when others do not",
    "I usually concentrate more on the whole picture, rather than the small details",
    "I find it easy to do more than one thing at once",
    "If there is an interruption, I can switch back to what I was doing very quickly",
    "I find it easy to 'read between the lines' when someone is talking to me",
    "I know how to tell if someone listening to me is getting bored",
    "When I'm reading a story I find it difficult to work out the characters' intentions",
    "I like to collect information about categories of things (e.g. types of car, types of bird, types of train, types of plant etc)",
    "I find it easy to work out what someone is thinking or feeling just by looking at their face",
    "I find it difficult to work out people's intentions",
  ];

  useEffect(() => {
    const shuffled = [...originalQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, []);

  const handleMatrixSelectionChange = (
    rowIndex: number,
    columnIndex: number,
  ) => {
    setMatrixSelections((prev) => ({
      ...prev,
      [rowIndex]: columnIndex,
    }));
  };

  const isFormValid = () => {
    const totalQuestions = 10;
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

  const handleConfirmContinue = () => {
    setShowConfirmationModal(false);
    const data = {
      matrixSelections: matrixSelections,
      order: shuffledQuestions,
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
          <div className="grid grid-cols-1 gap-4 mb-6 max-w-2xl mx-auto"></div>
          <MatrixQuestion
            rows={shuffledQuestions}
            columns={[
              "Definitely Agree",
              "Slightly Agree",
              "Slightly Disagree",
              "Definitely Disagree",
            ]}
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
