"use client";
import { useState } from "react";
import ParticipantForm from "./components/ParticipantInfo";
import ClassificationTaskMain from "./solo/SoloTaskMain";
import FinishScreen from "./solo/components/FinishScreen";

type Screen = "participant info" | "individual difference" | "completed";
export default function Home() {
  const [screen, setScreen] = useState<Screen>("participant info");
  const [formData, setFormData] = useState({
    dyadId: "",
    participantId: "",
    subjectInitials: "",
    raName: "",
    sessionTime: "",
    sessionDate: "",
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleParticipantSubmit = () => {
    setScreen("individual difference");
  };

  return (
    <div>
      {screen == "participant info" && (
        <ParticipantForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleParticipantSubmit}
        />
      )}
      {screen == "individual difference" && (
        <ClassificationTaskMain
          formData={formData}
          csvFilePath={"disabled"}
          onComplete={() => setScreen("completed")}
        />
      )}
      {screen == "completed" && (
        <FinishScreen />
      )}
    </div>
  );
}
