import { useState, useEffect } from "react";
import PressKeyPrompt from "./ui/PressKeyPrompt";
import ConfirmationModal from "./ui/ConfirmationModal";
import { EmotionalScenerio, AnsweredEmotionalScenerio } from "./types";



interface TransitionRatingProps {
  ratingPerson: string;
  scenerios: EmotionalScenerio[];
  onTransitionSubmit?: (result: AnsweredEmotionalScenerio) => void;
  onAllTransitionsComplete?: (ratings: AnsweredEmotionalScenerio[]) => void;
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
  scenerios,
  onTransitionSubmit,
  onAllTransitionsComplete,
}: TransitionRatingProps) {
  const [rating, setRating] = useState<number>(50);
  const [currentTransitionIndex, setCurrentTransitionIndex] =
    useState<number>(0);
  const [shuffledTransitions] = useState<EmotionalScenerio[]>(() => shuffleArray(scenerios));
  const [completedRatings, setCompletedRatings] = useState<AnsweredEmotionalScenerio[]>([]);
  const [canSubmitAtMs, setCanSubmitAtMs] = useState<number>(0);
  const [showDefaultConfirm, setShowDefaultConfirm] = useState<boolean>(false);




  useEffect(() => {
    setCanSubmitAtMs(Date.now() + 500);
  })


    const submitScenerio = async(scenerio: EmotionalScenerio) => {
    const temp: AnsweredEmotionalScenerio = {
      emotion: scenerio.emotion,
      scenerio: scenerio.scenerio,
      rating: rating
    }
    const newCompleted = [...completedRatings, temp];
    onTransitionSubmit?.(temp);
    setCompletedRatings(newCompleted);

    if(newCompleted.length === shuffledTransitions.length){
      onAllTransitionsComplete?.(newCompleted);
      return;
    }
    setCurrentTransitionIndex(currentTransitionIndex + 1);
    setRating(50);
  }


  useEffect(() => {


    const handleKeyPress = (event: KeyboardEvent) => {
      
      if (
        event.key === "Tab" &&
        Date.now() >= canSubmitAtMs
      ) {
        event.preventDefault();

        if (rating === 50) {
          setShowDefaultConfirm(true);
          return;
        }
        else{
          submitScenerio(scenerios[currentTransitionIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [rating, currentTransitionIndex, shuffledTransitions, canSubmitAtMs, completedRatings.length, scenerios, onTransitionSubmit, completedRatings, onAllTransitionsComplete]);

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
      <div className="w-full max-w-4xl mx-auto px-8">
        <p className="text-white text-2xl mb-12">
         Given the situation, to what degree would {ratingPerson} feel {currentTransition.emotion}?
        </p>

        <div>

          <div className="h-24 flex items-center mt-8 mb-24">
            <p className="text-white text-2xl">
              {currentTransition.scenerio}
            </p>
          </div>

          <div className="space-y-8 w-full mx-auto">
            <div
              className="relative w-full h-2 bg-white rounded-full cursor-pointer mt-8"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const position = ((e.clientX - rect.left) / rect.width) * 100;
                setRating(Math.max(0, Math.min(100, position)));
              }}
            >
              <span className="absolute -top-10 left-0 transform -translate-x-1/2 text-white text-lg whitespace-nowrap">not at all</span>
              <span className="absolute -top-10 left-full transform -translate-x-1/2 text-white text-lg whitespace-nowrap">extremely</span>
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

            <p className="text-white text-2xl mt-32 text-center">
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
          submitScenerio(scenerios[currentTransitionIndex]);
          setShowDefaultConfirm(false);
        }}
        message={`You have selected the default value of 50. Is this correct for the ${currentTransition.emotion} for ${ratingPerson}?`}
        confirmText="Continue"
        cancelText="Close"
      />
    </div>
  );
}
