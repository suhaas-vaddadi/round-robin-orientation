import { useState, useEffect } from "react";
import ConfirmationModal from "./ui/ConfirmationModal";
import { AnsweredEmotionalScenerio, EMOTIONS } from "./types";

interface TransitionRatingProps {
  ratingPerson: string;
  scenerios: string[];
  isLoading?: boolean;
  onTransitionSubmit?: (result: AnsweredEmotionalScenerio) => void;
  onAllTransitionsComplete?: (ratings: AnsweredEmotionalScenerio[]) => void;
  loading?: boolean;
  initialData?: any;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function EmotionScenerio({
  ratingPerson,
  scenerios,
  isLoading,
  onTransitionSubmit,
  onAllTransitionsComplete,
  loading,
  initialData,
}: TransitionRatingProps) {
  const defaultRatings = EMOTIONS.reduce((acc, curr) => ({ ...acc, [curr]: 50 }), {} as Record<string, number>);
  const [ratings, setRatings] = useState<Record<string, number>>(defaultRatings);
  const [currentTransitionIndex, setCurrentTransitionIndex] = useState<number>(0);
  const [shuffledTransitions] = useState<string[]>(() => shuffleArray(scenerios));
  const [completedRatings, setCompletedRatings] = useState<AnsweredEmotionalScenerio[]>([]);
  const [showDefaultConfirm, setShowDefaultConfirm] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTransitionIndex]);

  useEffect(() => {
    if (initialData && Array.isArray(initialData) && !hasInitialized && shuffledTransitions.length > 0) {
      const prefilled: AnsweredEmotionalScenerio[] = [];
      const personPrefix = ratingPerson === "yourself" ? "Self" : "UW";
      
      for (let i = 0; i < shuffledTransitions.length; i++) {
        const scenario = shuffledTransitions[i];
        const scenarioData = initialData.filter((row: any) => row.scenerio === scenario && row.ratingPerson === ratingPerson);
        if (scenarioData.length > 0) {
           const row = scenarioData[0];
           const parsedRatings: Record<string, number> = {};
           EMOTIONS.forEach((emotion) => {
               if (row[emotion] !== undefined && row[emotion] !== null) {
                   parsedRatings[emotion] = Number(row[emotion]);
               }
           });
           
           if (Object.keys(parsedRatings).length > 0) {
               prefilled.push({
                   scenerio: scenario,
                   ratings: { ...defaultRatings, ...parsedRatings },
                   questionIndex: row.question_index ?? i
               });
           }
        }
      }
      
      if (prefilled.length > 0) {
          setCompletedRatings(prefilled);
          if (prefilled.length >= shuffledTransitions.length) {
              onAllTransitionsComplete?.(prefilled);
          } else {
              setCurrentTransitionIndex(prefilled.length);
          }
      }
      setHasInitialized(true);
    }
  }, [initialData, hasInitialized, shuffledTransitions, ratingPerson]);

  const submitScenerio = async(scenerio: string) => {
    const temp: AnsweredEmotionalScenerio = {
      scenerio: scenerio,
      ratings: { ...ratings },
      questionIndex: currentTransitionIndex
    };
    const newCompleted = [...completedRatings, temp];
    onTransitionSubmit?.(temp);
    setCompletedRatings(newCompleted);

    if(newCompleted.length === shuffledTransitions.length){
      onAllTransitionsComplete?.(newCompleted);
      return;
    }
    setCurrentTransitionIndex(currentTransitionIndex + 1);
    setRatings(defaultRatings);
  };

  const handleContinue = () => {
    if (loading || isLoading) return;
    
    const hasDefault = Object.values(ratings).some(r => r === 50);
    if (hasDefault) {
      setShowDefaultConfirm(true);
      return;
    }
    
    submitScenerio(shuffledTransitions[currentTransitionIndex]);
  };

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
    <div className="min-h-screen w-full flex flex-col items-center py-16 bg-black overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto px-8">
        <p className="text-white text-2xl mb-12">
         Given the situation, to what degree would {ratingPerson === "yourself" ? "you" : ratingPerson} feel each of these emotions?
        </p>

        <div>
          <div className="flex items-center mt-8 mb-16">
            <p className="text-white text-2xl">
              {currentTransition}
            </p>
          </div>

          <div className="space-y-16 w-full mx-auto">
            {EMOTIONS.map((emotion) => (
              <div key={emotion} className="w-full">
                <p className="text-white w-full text-center text-xl  mb-2 mr-2">{emotion}</p>
                <div
                  className={`relative w-full h-2 bg-white rounded-full ${loading || isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} mt-8`}
                  onClick={(e) => {
                    if (loading || isLoading) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const position = ((e.clientX - rect.left) / rect.width) * 100;
                    setRatings((prev) => ({ ...prev, [emotion]: Math.max(0, Math.min(100, position)) }));
                  }}
                >
                  <span className="absolute -top-10 left-0 transform -translate-x-1/2 text-white text-lg whitespace-nowrap">not at all</span>
                  <span className="absolute -top-10 left-full transform -translate-x-1/2 text-white text-lg whitespace-nowrap">extremely</span>
                  <div
                    className={`absolute w-6 h-6 bg-white rounded-full top-1/2 ${loading || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{
                      left: `${ratings[emotion]}%`,
                      transform: "translateX(-50%) translateY(-50%)",
                    }}
                    onMouseDown={(e) => {
                      if (loading || isLoading) return;
                      const sliderRect =
                        e.currentTarget.parentElement?.getBoundingClientRect();

                      const handleMouseMove = (event: MouseEvent) => {
                        if (sliderRect) {
                          const position =
                            ((event.clientX - sliderRect.left) / sliderRect.width) *
                            100;
                          setRatings((prev) => ({ ...prev, [emotion]: Math.max(0, Math.min(100, position)) }));
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

                <div className="relative w-full mt-4">
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

                <p className="text-white text-lg mt-8 text-center pt-4">
                  Selected: {Math.round(ratings[emotion])}
                </p>
              </div>
            ))}
            
            <div className="w-full flex justify-center pb-8 pt-8">
              <button
                type="button"
                onClick={handleContinue}
                disabled={loading || isLoading}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${loading || isLoading ? "bg-gray-500 text-white cursor-not-allowed" : "bg-white text-black hover:bg-gray-200"}`}
              >
                {loading || isLoading ? "Submitting..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDefaultConfirm}
        onClose={() => setShowDefaultConfirm(false)}
        onConfirm={() => {
          submitScenerio(shuffledTransitions[currentTransitionIndex]);
          setShowDefaultConfirm(false);
        }}
        message={`You have left one or more emotions at the default value of 50. Is this correct?`}
        confirmText="Continue"
        cancelText="Close"
      />
    </div>
  );
}
