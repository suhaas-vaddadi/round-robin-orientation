"use client";
import { useState } from "react";

interface ParticipantFormProps {
  formData: {
    participantId: string;
    fullName: string;
    raName: string;
    sessionTime: string;
    sessionDate: string;
  };
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

function ParticipantForm({
  formData,
  onChange,
  onSubmit,
}: ParticipantFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStartSession = async () => {
    if (!formData.participantId) {
      setErrorMsg("Please enter a Participant ID");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/check_session?participant_id=${formData.participantId}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to check session state.");
        setLoading(false);
        return;
      }

      // change this back to 0 and 1 after testing
      if (data.session_state === 1) {
        setErrorMsg("You have not completed the scheduler yet. If you think it is a mistake, double check your participant id or alert the researcher.");
      } else if (data.session_state === 0) {
        onSubmit();
      } else if (data.session_state > 1) {
        setErrorMsg("The session is already completed and you cannot edit values.");
      } else {
        setErrorMsg("Invalid session state.");
      }
    } catch (err) {
       console.error(err);
       setErrorMsg("An error occurred while checking session state.");
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black cursor-auto overflow-hidden h-screen">
      <div className="text-center max-w-2xl mx-auto px-8">
        <h1 className="text-white text-4xl font-bold mb-8">
          {`Please Enter Your Information`}
        </h1>
        <p className="text-white text-lg mb-8">
          {`You should find the information for your session in the email you received.`}
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-lg mb-2">
                Participant ID:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.participantId}
                onChange={(e) => onChange("participantId", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-white text-lg mb-2">
                Full Name:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.fullName}
                onChange={(e) => onChange("fullName", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-lg mb-2">RA Name:</label>
              <input
                autoComplete="off"
                type="text"
                value={formData.raName}
                onChange={(e) => onChange("raName", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-lg mb-2">
                Session Date:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.sessionDate}
                onChange={(e) => onChange("sessionDate", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-white text-lg mb-2">
                Session Time:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.sessionTime}
                onChange={(e) => onChange("sessionTime", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 p-4 text-center bg-red-900 border border-red-500 rounded-lg text-white font-semibold">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleStartSession}
            disabled={loading}
            className={`w-full px-8 py-4 text-white text-xl border border-white transition-colors mt-6 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
          >
            {loading ? "Checking..." : "Start Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParticipantForm;
