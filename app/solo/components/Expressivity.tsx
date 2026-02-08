import { useEffect, useState } from "react";
import MatrixQuestion from "./ui/MatrixQuestion";
import { ClassifcationTaskProps } from "./types";
import ConfirmationModal from "./ui/ConfirmationModal";

export default function Expressivity({ onContinue }: ClassifcationTaskProps) {
  const [matrixSelections, setMatrixSelections] = useState<{
    [key: number]: number;
  }>({});
  const [shuffledRows, setShuffledRows] = useState<string[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  const originalRows = [
    "My body reacts very strongly to emotional situations.",
    "I am an emotionally expressive person.",
    "When I'm happy, my feelings show.",
    "I experience my emotions very strongly.",
    "I sometimes cry during sad movies.",
    "I have strong emotions.",
    "I am sometimes unable to hide my feelings, even though I would like to.",
    "No matter how nervous or upset I am, I tend to keep a calm exterior.",
    "I've learned it is better to suppress my anger than to show it.",
    "It is difficult for me to hide my fear.",
    "I laugh out loud when someone tells me a joke that I think is funny.",
    "People often do not know what I am feeling.",
    "What I'm feeling is written all over my face.",
    "There have been times when I have not been able to stop crying even though I tried to stop.",
    "Whenever I feel positive emotions, people can easily see exactly what I am feeling.",
    "Whenever I feel negative emotions, people can easily see exactly what I am feeling.",
  ];

  useEffect(() => {
    const shuffled = [...originalRows].sort(() => Math.random() - 0.5);
    setShuffledRows(shuffled);
  }, []);

  const columns = [
    "Strongly Disagree",
    "Disagree",
    "Somewhat Disagree",
    "Neither Agree nor Disagree",
    "Somewhat Agree",
    "Agree",
    "Strongly Agree",
  ];

  const handleMatrixSelectionChange = (
    rowIndex: number,
    columnIndex: number,
  ) => {
    setMatrixSelections((prev) => ({ ...prev, [rowIndex]: columnIndex }));
  };

  const isFormValid = () => {
    return (
      Object.keys(matrixSelections).length === originalRows.length &&
      Object.values(matrixSelections).every((selection) => selection != null)
    );
  };

  const handleContinue = () => {
    if (isFormValid()) {
      const data = {
        matrixSelections: matrixSelections,
        order: shuffledRows,
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
      order: shuffledRows,
    };
    onContinue?.(data);
  };

  const handleCancelContinue = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className="bg-black  p-8 text-center max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="mt-6">
          <MatrixQuestion
            rows={shuffledRows}
            columns={columns}
            selections={matrixSelections}
            onSelectionChange={handleMatrixSelectionChange}
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
      />
    </div>
  );
}
