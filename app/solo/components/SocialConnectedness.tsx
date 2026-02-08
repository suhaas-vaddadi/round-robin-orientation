import { useEffect, useState } from "react";
import MatrixQuestion from "./ui/MatrixQuestion";
import { ClassifcationTaskProps } from "./types";
import ConfirmationModal from "./ui/ConfirmationModal";

export default function SocialConnectedness({
  onContinue,
}: ClassifcationTaskProps) {
  const [matrixSelections, setMatrixSelections] = useState<{
    [key: number]: number;
  }>({});
  const [shuffledRows, setShuffledRows] = useState<string[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  const originalRows = [
    "I feel disconnected from the world around me.",
    "My friends feel like family.",
    "I don't feel I participate with anyone or any group.",
    "I feel distant from people.",
    "Even around people I know, I don't feel that I really belong.",
    "I find myself actively involved in people's lives.",
    "I see people as friendly and approachable.",
    "I am in tune with the world.",
    "I am able to connect with other people.",
    "I feel like an outsider.",
    "I fit well in new situations.",
    "I catch myself losing a sense of connectedness with society.",
    "I don't feel related to most people.",
    "I feel comfortable in the presence of strangers.",
    "I see myself as a loner.",
    "I have little sense of togetherness with my peers.",
    "I feel close to people.",
    "I am able to relate to my peers.",
    "Even among my friends, there is no sense of brother/sisterhood.",
    "I feel understood by the people I know.",
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
    columnIndex: number
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
      <div className="bg-black p-8 text-center max-w-7xl mx-auto flex-1 flex flex-col justify-center">
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
