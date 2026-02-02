import { useState, useEffect, useCallback } from "react";
import PressKeyPrompt from "./ui/PressKeyPrompt";
import ConfirmationModal from "./ui/ConfirmationModal";

interface Transition {
  initial: string;
  final: string;
}

interface TransitionRatingProps {
  ratingPerson: string;
  emotionTransitions: Transition[];
  onTransitionSubmit?: (initial: string, final: string, rating: number) => void;
  onAllTransitionsComplete?: (ratings: TransitionRating[]) => void;
}

interface TransitionRating {
  initial: string;
  final: string;
  rating: number;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function EmotionsRating({
  ratingPerson,
  emotionTransitions,
  onTransitionSubmit,
  onAllTransitionsComplete,
}: TransitionRatingProps) {
  const [rating, setRating] = useState<number>(50);
  const [currentTransitionIndex, setCurrentTransitionIndex] =
    useState<number>(0);
  const [shuffledTransitions, setShuffledTransitions] = useState<Transition[]>(
    [],
  );
  const [completedRatings, setCompletedRatings] = useState<TransitionRating[]>(
    [],
  );
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [canSubmitAtMs, setCanSubmitAtMs] = useState<number>(0);
  const [showDefaultConfirm, setShowDefaultConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (emotionTransitions.length > 0) {
      const shuffled = shuffleArray(emotionTransitions);
      setShuffledTransitions(shuffled);
    }
  }, [emotionTransitions]);

  const handleTransitionSubmit = useCallback(
    (initial: string, final: string, ratingValue: number) => {
      const newRating: any = {
        initial,
        final,
        rating: ratingValue,
        person: ratingPerson,
      };

      setCompletedRatings((prev) => [...prev, newRating]);

      onTransitionSubmit?.(initial, final, ratingValue);

      if (currentTransitionIndex + 1 >= shuffledTransitions.length) {
        setIsComplete(true);
        onAllTransitionsComplete?.(completedRatings.concat([newRating]));
      } else {
        setCurrentTransitionIndex((prev) => prev + 1);
        setRating(50);
      }
    },
    [
      currentTransitionIndex,
      shuffledTransitions.length,
      onTransitionSubmit,
      onAllTransitionsComplete,
      completedRatings,
    ],
  );

  useEffect(() => {
    setCanSubmitAtMs(Date.now() + 500);
  }, [currentTransitionIndex]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.key === "Tab" &&
        !isComplete &&
        shuffledTransitions.length > 0 &&
        Date.now() >= canSubmitAtMs
      ) {
        event.preventDefault();
        const currentTransition = shuffledTransitions[currentTransitionIndex];

        if (rating === 50) {
          setShowDefaultConfirm(true);
          return;
        }

        handleTransitionSubmit(
          currentTransition.initial,
          currentTransition.final,
          rating,
        );
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    rating,
    currentTransitionIndex,
    shuffledTransitions,
    handleTransitionSubmit,
    isComplete,
    canSubmitAtMs,
  ]);

  if (shuffledTransitions.length === 0) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden">
        <div className="text-center max-w-4xl mx-auto px-8">
          <h1 className="text-white text-4xl font-bold mb-8">
            Loading transitions...
          </h1>
        </div>
      </div>
    );
  }

  const currentTransition = shuffledTransitions[currentTransitionIndex];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden">
      <div className=" max-w-4xl mx-auto px-8">
        <p className="text-white text-2xl mb-32">
          Please rate the likelihood (0%-100%) of the following emotion
          transition for {ratingPerson}:
        </p>

        <div>
          <p className="text-white text-2xl text-center mb-16">
            {currentTransition.initial} → {currentTransition.final}
          </p>

          <div className="space-y-8">
            <div
              className="relative w-full h-2 bg-white rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const position = ((e.clientX - rect.left) / rect.width) * 100;
                setRating(Math.max(0, Math.min(100, position)));
              }}
            >
              <div
                className="absolute w-6 h-6 bg-white rounded-full top-1/2 cursor-pointer"
                style={{
                  left: `${rating}%`,
                  transform: "translateX(-50%) translateY(-50%)",
                }}
                onMouseDown={(e) => {
                  const sliderRect =
                    e.currentTarget.parentElement?.getBoundingClientRect();

                  const handleMouseMove = (event: MouseEvent) => {
                    if (sliderRect) {
                      const position =
                        ((event.clientX - sliderRect.left) / sliderRect.width) *
                        100;
                      setRating(Math.max(0, Math.min(100, position)));
                    }
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                  };

                  document.addEventListener("mousemove", handleMouseMove);
                  document.addEventListener("mouseup", handleMouseUp);
                }}
              />
            </div>

            <div className="relative w-full">
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => (
                <span
                  key={value}
                  className="absolute text-white text-sm text-center"
                  style={{
                    left: `${value}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {value}
                </span>
              ))}
            </div>

            <p className="text-white text-2xl mt-40 text-center">
              Selected: {Math.round(rating)}%
            </p>

            <PressKeyPrompt keyLabel="Tab" text="to submit and continue" />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDefaultConfirm}
        onClose={() => setShowDefaultConfirm(false)}
        onConfirm={() => {
          setShowDefaultConfirm(false);
          handleTransitionSubmit(
            currentTransition.initial,
            currentTransition.final,
            rating,
          );
        }}
        message={`You have selected the default value of 50. Is this correct for the transition between ${currentTransition.initial} to ${currentTransition.final} for ${ratingPerson}?`}
        confirmText="Continue"
        cancelText="Close"
      />
    </div>
  );
}
