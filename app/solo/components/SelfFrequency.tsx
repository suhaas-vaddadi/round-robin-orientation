import { useState, useEffect } from "react";
import MatrixSlider from "./ui/MatrixSlider";
import { ClassifcationTaskProps } from "./types";
import ConfirmationModal from "./ui/ConfirmationModal";

export default function SelfFrequency({ onContinue, loading, initialData }: ClassifcationTaskProps) {
  const [sliderSelections, setSliderSelections] = useState<{
    [key: string]: number;
  }>({});
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [touchedRows, setTouchedRows] = useState<Set<string>>(new Set());

  const [shuffledEmotions] = useState(() => {
    const emotions = [
      "Anger", "Sadness", "Happiness",
      "Guilt", "Sympathy", "Anxiety",
      "Boredom", "Interest", "Relief"
    ];
    return [...emotions].sort(() => Math.random() - 0.5);
  });

  useEffect(() => {
    if (initialData && Array.isArray(initialData)) {
      const initSels: { [key: string]: number } = {};
      const initTouched = new Set<string>();
      initialData.forEach((row: any) => {
         const match = row.subTask?.match(/How often do you feel (.*?)\?/);
         if (match && match[1]) {
             initSels[match[1]] = Number(row.response);
             initTouched.add(match[1]);
         }
      });
      if (Object.keys(initSels).length > 0) {
          setSliderSelections(initSels);
          setTouchedRows(initTouched);
      }
    }
  }, [initialData]);

  const handleSliderSelectionChange = (rowIndex: number, value: number) => {
    if (loading) return;
    const emotion = shuffledEmotions[rowIndex];
    setSliderSelections((prev) => ({
      ...prev,
      [emotion]: value,
    }));
    setTouchedRows((prev) => {
      const next = new Set(prev);
      next.add(emotion);
      return next;
    });
  };

  const isFormValid = () => {
    const totalEmotions = 9;
    return touchedRows.size === totalEmotions;
  };

  const handleContinue = () => {
    if (loading) return;
    if (isFormValid()) {
      onContinue?.({ ratings: sliderSelections, order: shuffledEmotions });
    } else {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmContinue = () => {
    setShowConfirmationModal(false);
    onContinue?.({ ratings: sliderSelections, order: shuffledEmotions });
  };

  const handleCancelContinue = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className="bg-black p-8 text-center max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <MatrixSlider
          leftLabel="Never"
          rightLabel="All the time"
          defaultSelection={50}
          title="In this part of the study, you will be asked to estimate how often YOU experience each of the previously seen states. (1-100: 1 = Never 100 = All the time)"
          rows={shuffledEmotions}
          onSelectionChange={handleSliderSelectionChange}
          selections={sliderSelections}
        />
      </div>

      {/* Continue Button */}
      <div className="w-full flex justify-center pb-8">
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${loading ? "bg-gray-500 text-white cursor-not-allowed" : "bg-white text-black hover:bg-gray-200"}`}
        >
          {loading ? "Submitting..." : "Continue"}
        </button>
      </div>

      {/* Confirmation Modal */}
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
