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
import { emotionTransitions } from "./components/types";
import { ClassificationTaskMainProps, TransitionRating, StepData, PartnerHistoryData, SelfFrequencyData, MatrixData, ExperienceData, StudyFeedbackData, PartnerSlidersData } from "./components/types";

function ClassificationTaskMain({
  formData: _formData,
  csvFilePath,
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

  const writeCSVRow = async (
    ratingTask: string,
    subTask: string,
    emotion1: string = "",
    emotion2: string = "",
    ratingPerson: string = "",
    response: number | string = "",
  ) => {
    return; // File saving disabled for test run
    const row = [
      _formData.dyadId,
      _formData.participantId,
      _formData.subjectInitials,
      _formData.raName,
      _formData.sessionTime,
      _formData.sessionDate,
      new Date().toISOString(),
      ratingTask,
      subTask,
      emotion1,
      emotion2,
      ratingPerson,
      response,
      trail_number.current,
      "1.0.3",
    ]
      .map(csvEscape)
      .join(",");
  };

  const [currentStep, setCurrentStep] = useState<string>("instructions");
  const [instructionIndex, setInstructionIndex] = useState<number>(0);
  const [currentPersonIndex, setCurrentPersonIndex] = useState<number>(0);
  const [shuffledPeople, setShuffledPeople] = useState<string[]>([]);
  const [allRatings, setAllRatings] = useState<TransitionRating[]>([]);
  const [showTransition, setShowTransition] = useState<boolean>(false);
  const [formOrder, setFormOrder] = useState<string[]>([]);
  const [currentFormIndex, setCurrentFormIndex] = useState<number>(0);

  const ratingPeople = [
    "yourself",
    "an average UW-Madison student",
  ];

  useEffect(() => {
    const shuffled = [...ratingPeople].sort(() => Math.random() - 0.5);
    const blockRandomized = [
      "loneliness",
      "socialConnectedness",
      "expressivity",
    ].sort(() => Math.random() - 0.5);

    const forms = [
      "emotionTransitions",
      "selfFrequency",
      blockRandomized[0],
      blockRandomized[1],
      blockRandomized[2],
      "autism",
    ];
    setShuffledPeople(shuffled);
    setFormOrder(forms);
  }, [csvFilePath, _formData]);


  useEffect(() => {
    const handleKeyPress = async (_event: KeyboardEvent) => {
      if (currentStep === "instructions") {
        if (instructionIndex + 1 >= 10) {
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
    initial: string,
    final: string,
    rating: number,
  ) => {
    const ratingPerson = shuffledPeople[currentPersonIndex];
    await writeCSVRow(
      "emotion_transitions",
      `${initial}_to_${final}`,
      initial,
      final,
      ratingPerson,
      rating,
    );
  };

  const handleAllTransitionsComplete = async (ratings: TransitionRating[]) => {
    setAllRatings((prev) => [...prev, ...ratings]);

    if (currentPersonIndex + 1 < shuffledPeople.length) {
      setShowTransition(true);
    } else {
      setCurrentFormIndex(1);
      setCurrentStep("selfFrequency");
      console.log("All ratings completed:", allRatings.concat(ratings));
    }
  };

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
      case "partnerHistory":
        const partnerData = stepData as PartnerHistoryData;
        await writeCSVRow(
          "partner_history",
          "Have you met your partner prior to today's study?",
          "",
          "",
          "",
          partnerData?.partnerHistory ? "Yes" : "No",
        );
        await writeCSVRow(
          "partner_history",
          "How long have you known your partner? (in months)",
          "",
          "",
          "",
          partnerData?.partnerHistoryMonths ?? "",
        );
        await writeCSVRow(
          "partner_history",
          "I am happy with my friendship with my partner",
          "",
          "",
          "",
          partnerData?.matrixSelections?.[0] ?? "",
        );
        await writeCSVRow(
          "partner_history",
          "My partner is fun to sit and talk with",
          "",
          "",
          "",
          partnerData?.matrixSelections?.[1] ?? "",
        );

        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "selfFrequency":
        const selfData = stepData as SelfFrequencyData;
        if (selfData && selfData.order && selfData.ratings) {
          for (const emotion of selfData.order) {
            await writeCSVRow(
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
            await writeCSVRow(
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
      case "partnerSliders":
        const slidersData = stepData as PartnerSlidersData;
        if (slidersData && slidersData.order && slidersData.sliderSelections) {
          for (const [index, question] of slidersData.order.entries()) {
            await writeCSVRow(
              "partner_sliders",
              question,
              "",
              "",
              "",
              slidersData.sliderSelections?.[index] ?? "",
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
            await writeCSVRow(
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
            await writeCSVRow(
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
            await writeCSVRow(
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
      case "studyFeedback":
        const feedbackData = stepData as StudyFeedbackData;
        await writeCSVRow(
          "study_feedback",
          "We're interested in hearing more about your experience with our study. Please share any thoughts you have below.",
          "",
          "",
          "",
          feedbackData?.text ?? "",
        );
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
                "You will be presented with pairs of emotions.",
                "The first emotion denotes the current state; the second emotion denotes the next emotional state.",
                "Your task is to estimate the likelihood of a person feeling the first emotion later feeling the second emotion.",
                "For this example, what is the chance of a person currently feeling Tired next feeling Excited?",
                "You will make your rating on a scale from 0-100%, where 0% means that there is zero chance that a person feeling tired will feel excited next, and where 100% means that a person feeling tired now will definitely feel excited next.",
                "You will be asked to provide ratings for three different people: yourself, your partner, and an average UW-Madison student.",
                "The three people will be presented in random order.",
                "For each person, please try to be as accurate as possible.",
                "This part will take approximately 30 minutes.",
                "We ask that you answer each question efficiently in order to keep your participation time within one hour.",
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
            ) : shuffledPeople.length > 0 ? (
              <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden">
                <EmotionsRating
                  emotionTransitions={emotionTransitions}
                  ratingPerson={shuffledPeople[currentPersonIndex]}
                  onTransitionSubmit={handleTransitionSubmit}
                  onAllTransitionsComplete={handleAllTransitionsComplete}
                />
              </div>
            ) : (
              <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden">
                <div className="text-center max-w-4xl mx-auto px-8">
                  <h1 className="text-white text-2xl mb-8">
                    Loading...
                  </h1>
                </div>
              </div>
            )}
          </>
        )}

        {currentStep === "selfFrequency" && (
          <SelfFrequency onContinue={(data) => handleStepComplete(data)} />
        )}

        {currentStep === "loneliness" && (
          <Loneliness onContinue={(data) => handleStepComplete(data)} />
        )}

        {currentStep === "socialConnectedness" && (
          <SocialConnectedness
            onContinue={(data) => handleStepComplete(data)}
          />
        )}

        {currentStep === "expressivity" && (
          <Expressivity onContinue={(data) => handleStepComplete(data)} />
        )}

        {currentStep === "autism" && (
          <Autism onContinue={(data) => handleStepComplete(data)} />
        )}

        {currentStep === "studyFeedback" && (
          <StudyFeedback onContinue={(data) => handleStepComplete(data)} />
        )}
      </div>
    </div>
  );
}

export default ClassificationTaskMain;
