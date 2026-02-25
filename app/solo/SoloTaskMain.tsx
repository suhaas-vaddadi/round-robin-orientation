import { useEffect, useRef, useState } from "react";
import PressKeyPrompt from "./components/ui/PressKeyPrompt";
import Instructions from "./components/ui/Instructions";
import EmotionsRating from "./components/EmotionsRating";
import SelfFrequency from "./components/SelfFrequency";
import Loneliness from "./components/Loneliness";
import SocialConnectedness from "./components/SocialConnectedness";
import Expressivity from "./components/Expressivity";
import StudyFeedback from "./components/StudyFeedback";
import Autism from "./components/Autism";
import { emotionalScenerios } from "./components/types";
import { ClassificationTaskMainProps, StepData, SelfFrequencyData, MatrixData, AnsweredEmotionalScenerio } from "./components/types";

function ClassificationTaskMain({
  formData: _formData,
  onComplete,
}: ClassificationTaskMainProps) {
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

  const writeToCloudSQL = async (
    ratingTask: string,
    subTask: string,
    emotion1: string = "",
    emotion2: string = "",
    ratingPerson: string = "",
    response: number | string = "",
  ) => {
    try {
      // Example implementation using Google Cloud SQL logic (e.g. via an API route)
      const payload = {
        ratingTask,
        subTask,
        emotion1,
        emotion2,
        ratingPerson,
        response,
        timestamp: new Date().toISOString()
      };
      
      await fetch('/api/db/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'survey_results',
          data: payload
        })
      });
    } catch (e) {
      console.error("Failed to write to Cloud SQL:", e);
    }
  };

  const [currentStep, setCurrentStep] = useState<string>("instructions");
  const [instructionIndex, setInstructionIndex] = useState<number>(0);
  const [currentPersonIndex, setCurrentPersonIndex] = useState<number>(0);
  const [allRatings, setAllRatings] = useState<AnsweredEmotionalScenerio[]>([]);
  const [showTransition, setShowTransition] = useState<boolean>(false);
  const [currentFormIndex, setCurrentFormIndex] = useState<number>(0);

    const ratingPeople = [
    "yourself",
    "an average UW-Madison student",
  ];
    const [shuffledPeople] = useState<string[]>(() =>
    [...ratingPeople].sort(() => Math.random() - 0.5),
  );
  const [blockRandomized] = useState<string[]>(() =>
    ["loneliness", "socialConnectedness", "expressivity"].sort(
      () => Math.random() - 0.5,
    ),
  );

  const formOrder = [
    "emotionTransitions",
    "selfFrequency",
    blockRandomized[0],
    blockRandomized[1],
    blockRandomized[2],
    "autism",
  ];

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
          for (const emotion of selfData.order) {
            await writeToCloudSQL(
              "self_frequency",
              `How often do you feel ${emotion}?`,
              "",
              "",
              "",
              selfData.ratings?.[emotion] ?? "",
            );
          }
        }
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
          console.log(formOrder[currentFormIndex + 1]);
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
          for (const [index, question] of lonelinessData.order.entries()) {
            await writeToCloudSQL(
              "loneliness",
              question,
              "",
              "",
              "",
              lonelinessData.matrixSelections?.[index] ?? "",
            );
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
      case "autism":
        const autismData = stepData as MatrixData;
        if (autismData && autismData.order && autismData.matrixSelections) {
          for (const [index, question] of autismData.order.entries()) {
            await writeToCloudSQL(
              "autism",
              question,
              "",
              "",
              "",
              autismData.matrixSelections?.[index] ?? "",
            );
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
          for (const [index, question] of socialData.order.entries()) {
            await writeToCloudSQL(
              "social_connectedness",
              question,
              "",
              "",
              "",
              socialData.matrixSelections?.[index] ?? "",
            );
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
          for (const [index, question] of expressivityData.order.entries()) {
            await writeToCloudSQL(
              "expressivity",
              question,
              "",
              "",
              "",
              expressivityData.matrixSelections?.[index] ?? "",
            );
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
      default:
        break;
    }
  };


  useEffect(() => {
    const handleKeyPress = async (_event: KeyboardEvent) => {
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
  }, [currentStep, instructionIndex, showTransition, onComplete]);

  const handleTransitionSubmit = async (
    result: AnsweredEmotionalScenerio
  ) => {
    const ratingPerson = shuffledPeople[currentPersonIndex];
    await writeToCloudSQL(
      "emotion_rating",
      result.scenerio,
      result.emotion,
      "",
      ratingPerson,
      result.rating,
    );
  };

  const handleAllTransitionsComplete = async (ratings: AnsweredEmotionalScenerio[]) => {
    setAllRatings((prev) => [...prev, ...ratings]);

    if (currentPersonIndex + 1 < shuffledPeople.length) {
      setShowTransition(true);
    } else {
      setCurrentFormIndex(1);
      setCurrentStep("selfFrequency");
      console.log("All ratings completed:", allRatings.concat(ratings));
    }
  };


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
                "Your task is to estimate the [likelihood/intensity] a person would feel the given emotion in each scenario.",
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
                    You have completed all emotion transition ratings for{" "}
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
                <EmotionsRating
                  ratingPerson={shuffledPeople[currentPersonIndex]}
                  scenerios={emotionalScenerios}
                  onTransitionSubmit={handleTransitionSubmit}
                  onAllTransitionsComplete={handleAllTransitionsComplete}
                />
              </div>
             )}
          </>
        )}

        {currentStep === "selfFrequency" && (
          <SelfFrequency onContinue={(data) => handleStepComplete(data as StepData)} />
        )}

        {currentStep === "loneliness" && (
          <Loneliness onContinue={(data) => handleStepComplete(data as StepData)} />
        )}

        {currentStep === "socialConnectedness" && (
          <SocialConnectedness
            onContinue={(data) => handleStepComplete(data as StepData)}
          />
        )}

        {currentStep === "expressivity" && (
          <Expressivity onContinue={(data) => handleStepComplete(data as StepData)} />
        )}

        {currentStep === "autism" && (
          <Autism onContinue={(data) => handleStepComplete(data as StepData)} />
        )}

        {currentStep === "studyFeedback" && (
          <StudyFeedback onContinue={(data) => handleStepComplete(data as StepData)} />
        )}
      </div>
    </div>
  );
}

export default ClassificationTaskMain;
