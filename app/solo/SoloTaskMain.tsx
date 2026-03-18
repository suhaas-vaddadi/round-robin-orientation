import { useEffect, useRef, useState } from "react";
import PressKeyPrompt from "./components/ui/PressKeyPrompt";
import Instructions from "./components/ui/Instructions";
import EmotionScenerio from "./components/EmotionScenerio";
import SelfFrequency from "./components/SelfFrequency";
import Loneliness from "./components/Loneliness";
import SocialConnectedness from "./components/SocialConnectedness";
import Expressivity from "./components/Expressivity";
import { yourselfEmotionalScenerios, averageUWEmotionalScenerios } from "./components/types";
import { ClassificationTaskMainProps, StepData, SelfFrequencyData, MatrixData, AnsweredEmotionalScenerio } from "./components/types";

function ClassificationTaskMain({
  formData: _formData,
  onComplete,
}: ClassificationTaskMainProps) {
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const trail_number = useRef<number>(1);
  const csvEscape = (value: unknown) => {
    const s = value !== undefined && value !== null ? String(value) : "";
    if (
      s.includes(",") ||
      s.includes('"') ||
      s.includes("\n") ||
      s.includes("\r")
    ) {
      const noNewlines = s.replace(/\r?\n|\r/g, " ");
      const escapedQuotes = noNewlines.replace(/"/g, '""');
      return `"${escapedQuotes}"`;
    }
    return s;
  };

  const [currentStep, setCurrentStep] = useState<string>("instructions");
  const [instructionIndex, setInstructionIndex] = useState<number>(0);
  const [currentPersonIndex, setCurrentPersonIndex] = useState<number>(0);
  const [allRatings, setAllRatings] = useState<AnsweredEmotionalScenerio[]>([]);
  const [showTransition, setShowTransition] = useState<boolean>(false);
  const [currentFormIndex, setCurrentFormIndex] = useState<number>(0);

  // Data fetching and UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState<boolean>(true);
  
  // Initial Data
  const [initialDataStore, setInitialDataStore] = useState<any>({});

  const ratingPeople = [
    "yourself",
    "an average UW-Madison student",
  ];
  const [shuffledPeople] = useState<string[]>(() =>
    shuffleArray(ratingPeople)
  );
  const [blockRandomized] = useState<string[]>(() =>
    shuffleArray(["loneliness", "socialConnectedness", "expressivity"])
  );

  const formOrder = [
    "emotionTransitions",
    "selfFrequency",
    blockRandomized[0],
    blockRandomized[1],
    blockRandomized[2]
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsFetchingInitialData(true);
        const participantId = _formData.participantId;
        
        const [resEmotions, resLoneliness, resSelfFrequency, resSocial, resExpressivity] = await Promise.all([
          fetch(`/api/emotion_rating?participant_id=${participantId}`),
          fetch(`/api/loneliness?participant_id=${participantId}`),
          fetch(`/api/self_frequency?participant_id=${participantId}`),
          fetch(`/api/social_connectedness?participant_id=${participantId}`),
          fetch(`/api/expressivity?participant_id=${participantId}`)
        ]);

        const parseData = async (res: Response) => {
           if (res.ok) {
              const json = await res.json();
              return json.data || [];
           }
           return [];
        };

        const emotionsData = await parseData(resEmotions);
        const lonelinessData = await parseData(resLoneliness);
        const selfFrequencyData = await parseData(resSelfFrequency);
        const socialData = await parseData(resSocial);
        const expressivityData = await parseData(resExpressivity);

        setInitialDataStore({
           emotions: emotionsData,
           loneliness: lonelinessData,
           selfFrequency: selfFrequencyData,
           socialConnectedness: socialData,
           expressivity: expressivityData
        });

      } catch (e) {
        console.error("Failed to load initial data", e);
      } finally {
        setIsFetchingInitialData(false);
      }
    };
    if (_formData.participantId) {
      loadInitialData();
    }
  }, [_formData.participantId]);


  const handleTransitionKeyPress = () => {
    setShowTransition(false);
    setCurrentPersonIndex((prev) => prev + 1);
  };

  const handleStepComplete = async (stepData?: StepData) => {
    switch (currentStep) {
      case "instructions":
        setCurrentStep("ratings");
        break;
      case "ratings":
        setCurrentStep(formOrder[currentFormIndex]);
        break;
      case "selfFrequency":
        const selfData = stepData as SelfFrequencyData;
        if (selfData && selfData.order && selfData.ratings) {
          try {
            setIsSubmitting(true);
            const payload = selfData.order.map((emotion, index) => ({
                question: `How often do you feel ${emotion}?`,
                rating: typeof selfData.ratings?.[emotion] === 'number' ? selfData.ratings[emotion] : null,
                index: index
            }));
            await fetch(`/api/self_frequency`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    participant_id: _formData.participantId,
                    ratings: payload
                })
            });
          } finally {
            setIsSubmitting(false);
          }
        }
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "loneliness":
        const lonelinessData = stepData as MatrixData;
        if (
          lonelinessData &&
          lonelinessData.order &&
          lonelinessData.matrixSelections
        ) {
          try {
            setIsSubmitting(true);
            const payload = lonelinessData.order.map((question, index) => ({
                question: question,
                rating: typeof lonelinessData.matrixSelections?.[index] === 'number' ? lonelinessData.matrixSelections[index] : null,
                index: index
            }));
            await fetch(`/api/loneliness`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    participant_id: _formData.participantId,
                    ratings: payload
                })
            });
          } finally {
            setIsSubmitting(false);
          }
        }
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;

      case "socialConnectedness":
        const socialData = stepData as MatrixData;
        if (socialData && socialData.order && socialData.matrixSelections) {
           try {
             setIsSubmitting(true);
             const payload = socialData.order.map((question, index) => ({
                question: question,
                rating: typeof socialData.matrixSelections?.[index] === 'number' ? socialData.matrixSelections[index] : null,
                index: index
             }));
             await fetch(`/api/social_connectedness`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    participant_id: _formData.participantId,
                    ratings: payload
                })
             });
           } finally {
             setIsSubmitting(false);
           }
        }
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "expressivity":
        const expressivityData = stepData as MatrixData;
        if (
          expressivityData &&
          expressivityData.order &&
          expressivityData.matrixSelections
        ) {
           try {
              setIsSubmitting(true);
              const payload = expressivityData.order.map((question, index) => ({
                  question: question,
                  rating: typeof expressivityData.matrixSelections?.[index] === 'number' ? expressivityData.matrixSelections[index] : null,
                  index: index
              }));
              await fetch(`/api/expressivity`, {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({
                     participant_id: _formData.participantId,
                     ratings: payload
                 })
              });
           } finally {
              setIsSubmitting(false);
           }
        }
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "studyFeedback":
        const feedbackData = stepData as Record<string, any>;
        if (feedbackData) {
            try {
               setIsSubmitting(true);
               const payload = [feedbackData.feedback ?? ""];
               await fetch(`/api/study_feedback`, {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify({
                       participant_id: _formData.participantId,
                       feedbacks: payload
                   })
               });
            } finally {
               setIsSubmitting(false);
            }
        }
        setCurrentStep("completed");
        onComplete?.();
        break;
      default:
        break;
    }
  };


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep, instructionIndex, currentPersonIndex, showTransition]);

  useEffect(() => {
    const handleKeyPress = async (_event: KeyboardEvent) => {
      // disable keypress actions if submitting
      if (isSubmitting) return;

      if (currentStep === "instructions") {
        if (instructionIndex + 1 >= 3) {
          handleStepComplete();
          return;
        }
        setInstructionIndex((i) => i + 1);
        return;
      }

      if (currentStep === "ratings" && showTransition && _event.key === " ") {
        _event.preventDefault();
        handleTransitionKeyPress();
        return;
      }

      if (currentStep === "completed") {
        onComplete?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentStep, instructionIndex, showTransition, onComplete, isSubmitting]);

  const handleTransitionSubmit = async (
    result: AnsweredEmotionalScenerio
  ) => {
    // We do NOT post single transition lines anymore. They are added to the list and all handled in handleAllTransitionsComplete
  };

  const handleAllTransitionsComplete = async (ratings: AnsweredEmotionalScenerio[]) => {
    const ratingPerson = shuffledPeople[currentPersonIndex];

    setAllRatings((prev) => [...prev, ...ratings]);

    // Construct the payload for all ratings of this person
    try {
        setIsSubmitting(true);
        const payload = ratings.map((r) => ({
            ratingTask: "emotion_rating",
            scenerio: r.scenerio.text,
            ratingPerson: ratingPerson,
            anger: typeof r.ratings.Anger === 'number' ? r.ratings.Anger : null,
            guilt: typeof r.ratings.Guilt === 'number' ? r.ratings.Guilt : null,
            sadness: typeof r.ratings.Sadness === 'number' ? r.ratings.Sadness : null,
            sympathy: typeof r.ratings.Sympathy === 'number' ? r.ratings.Sympathy : null,
            happiness: typeof r.ratings.Happiness === 'number' ? r.ratings.Happiness : null,
            anxiety: typeof r.ratings.Anxiety === 'number' ? r.ratings.Anxiety : null,
            boredom: typeof r.ratings.Boredom === 'number' ? r.ratings.Boredom : null,
            interest: typeof r.ratings.Interest === 'number' ? r.ratings.Interest : null,
            relief: typeof r.ratings.Relief === 'number' ? r.ratings.Relief : null,
            questionIndex: r.questionIndex
        }));
        await fetch(`/api/emotion_rating`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                participant_id: _formData.participantId,
                ratingPerson: ratingPerson,
                ratings: payload
            })
        });
    } catch (e) {
        console.error("Error submitting emotion ratings", e);
    } finally {
        setIsSubmitting(false);
    }

    if (currentPersonIndex + 1 < shuffledPeople.length) {
      setShowTransition(true);
    } else {
      setCurrentFormIndex(1);
      setCurrentStep("selfFrequency");
      console.log("All ratings completed:", allRatings.concat(ratings));
    }
  };

  if (isFetchingInitialData) {
    return (
      <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
        <h1 className="text-white text-2xl animate-pulse">Loading participant data...</h1>
      </div>
    );
  }

  if (currentStep === "completed") {
    onComplete?.();
    return null;
  }

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className=" w-full mx-auto px-8">
        {currentStep === "instructions" && (
          <div className="overflow-hidden h-screen justify-center items-center">
            <Instructions
              onBack={() => setInstructionIndex((i) => Math.max(0, i - 1))}
              instructionIndex={instructionIndex}
              groupSize={3}
              instructions={[
                "You will be presented with a set of scenarios.",
                "Your task is to estimate the likelihood a person would feel the given emotion in each scenario.",
                "You will give these estimates on a scale of 0 (not at all) to 100 (extremely)."
              ]}
            />
          </div>
        )}

        {currentStep === "ratings" && (
          <>
            {showTransition ? (
              <div className="min-h-screen w-full flex flex-col justify-center items-center bg-black overflow-hidden">
                <div className=" max-w-4xl mx-auto">
                  <h1 className="text-white text-2xl">Phase Complete!</h1>
                  <p className="text-white text-2xl pt-32">
                    You have completed all emotion scenerio ratings for{" "}
                    {shuffledPeople[currentPersonIndex]}.
                  </p>
                  <p className="text-white text-2xl pt-32">
                    You will now be rating{" "}
                    {shuffledPeople[currentPersonIndex + 1]}.
                  </p>
                  <div className="">
                    <PressKeyPrompt
                      keyLabel="Space"
                      text="to continue to the next person"
                      
                    />
                  </div>
                </div>
              </div>
            ) :  (
              <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden">
                <EmotionScenerio
                  key={shuffledPeople[currentPersonIndex]}
                  ratingPerson={shuffledPeople[currentPersonIndex]}
                  scenerios={shuffledPeople[currentPersonIndex] === "yourself" ? yourselfEmotionalScenerios : averageUWEmotionalScenerios}
                  onTransitionSubmit={handleTransitionSubmit}
                  onAllTransitionsComplete={handleAllTransitionsComplete}
                  loading={isSubmitting}
                  initialData={initialDataStore.emotions || []}
                />
              </div>
             )}
          </>
        )}

        {currentStep === "selfFrequency" && (
          <SelfFrequency 
             onContinue={(data) => handleStepComplete(data as StepData)} 
             loading={isSubmitting}
             initialData={initialDataStore.selfFrequency || []}
          />
        )}

        {currentStep === "loneliness" && (
          <Loneliness 
             onContinue={(data) => handleStepComplete(data as StepData)} 
             loading={isSubmitting}
             initialData={initialDataStore.loneliness || []}
          />
        )}

        {currentStep === "socialConnectedness" && (
          <SocialConnectedness
            onContinue={(data) => handleStepComplete(data as StepData)}
            loading={isSubmitting}
            initialData={initialDataStore.socialConnectedness || []}
          />
        )}

        {currentStep === "expressivity" && (
          <Expressivity 
             onContinue={(data) => handleStepComplete(data as StepData)} 
             loading={isSubmitting}
             initialData={initialDataStore.expressivity || []}
          />
        )}



      </div>
    </div>
  );
}

export default ClassificationTaskMain;

