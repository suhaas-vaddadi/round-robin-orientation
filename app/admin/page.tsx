"use client";

import { useState, useEffect } from "react";

type CompletionStatus = {
  autism: boolean;
  emotionScenerio: boolean;
  expressivity: boolean;
  loneliness: boolean;
  selfFrequency: boolean;
  socialConnectedness: boolean;
  availability: boolean;
  demographics: boolean;
  sessionState: number | null;
};

export default function AdminView() {
  const [participantId, setParticipantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<CompletionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Available times state for searching
  const [availableTimes, setAvailableTimes] = useState<{session_date: string, session_time: string}[]>([]);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | "">("");
  const [participantsForTime, setParticipantsForTime] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Available times state for managing
  type ManagedTime = { session_date: string; session_time: string; status: 'unchanged' | 'added' | 'deleted' };
  const [managedTimes, setManagedTimes] = useState<ManagedTime[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [manageLoading, setManageLoading] = useState(false);

  // Fetch available times on load
  const fetchTimes = async () => {
    try {
      const res = await fetch('/api/admin/available_times');
      if (res.ok) {
        const json = await res.json();
        const times = json.data || [];
        setAvailableTimes(times);
        setManagedTimes(times.map((t: any) => ({ ...t, status: 'unchanged' })));
      }
    } catch (err) {
      console.error("Failed to load available times", err);
    }
  };

  useEffect(() => {
    fetchTimes();
  }, []);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId.trim()) return;

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch(`/api/admin/check_completion?participant_id=${participantId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch completion status");
      }
      
      const json = await res.json();
      setStatus(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ChecklistItem = ({ label, isCompleted }: { label: string; isCompleted: boolean }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
          isCompleted ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}
      >
        {isCompleted ? "✓" : "✗"}
      </div>
      <span className={`text-lg font-medium ${isCompleted ? "text-green-400" : "text-red-400"}`}>
        {label}
      </span>
    </div>
  );

  const handleAddManagedTime = () => {
    if (!newDate.trim() || !newTime.trim()) return;
    setManagedTimes([...managedTimes, { session_date: newDate.trim(), session_time: newTime.trim(), status: 'added' }]);
    setNewDate("");
    setNewTime("");
  };

  const handleToggleManagedTimeStatus = (index: number) => {
    const updated = [...managedTimes];
    const item = updated[index];
    if (item.status === 'added') {
      // Remove it completely if it was just added locally
      updated.splice(index, 1);
    } else if (item.status === 'unchanged') {
      item.status = 'deleted';
    } else if (item.status === 'deleted') {
      item.status = 'unchanged';
    }
    setManagedTimes(updated);
  };

  const handleSaveTimes = async () => {
    setManageLoading(true);
    try {
      const added = managedTimes.filter(t => t.status === 'added');
      const deleted = managedTimes.filter(t => t.status === 'deleted');

      const res = await fetch('/api/admin/available_times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ added, deleted })
      });

      if (res.ok) {
        alert("Available times updated successfully!");
        setNewDate("");
        setNewTime("");
        await fetchTimes(); // Refresh arrays
      } else {
        alert("Failed to update available times");
      }
    } catch (err) {
      alert("Error saving available times");
    } finally {
      setManageLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Admin Dashboard</h1>

        <form onSubmit={handleCheck} className="flex flex-col space-y-4 mb-8 border-b border-gray-700 pb-8">
          <label className="text-white text-lg font-medium">Check Participant Progress:</label>
          <div className="flex space-x-4">
            <input
              type="text"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              placeholder="e.g., P001"
              className="flex-1 p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Checking..." : "Check Status"}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>

        {status && (
          <div className="border border-gray-700 bg-gray-800 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Completion Status for <span className="text-blue-400">{participantId}</span>
            </h2>

            {status.sessionState !== null && (
              <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 font-medium">Current Phase: </span>
                  <span className="text-xl font-bold text-white ml-2">{status.sessionState === 0 ? "Scheduler" : status.sessionState === 1 ? "Orientation" : status.sessionState === 2 ? "Conversation" : "Completed"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-400">Change to:</label>
                  <select
                    className="p-2 bg-gray-800 text-white rounded border border-gray-600 focus:outline-none"
                    value={status.sessionState}
                    onChange={async (e) => {
                       const newState = parseInt(e.target.value);
                       try {
                         const res = await fetch('/api/admin/check_completion', {
                           method: 'PUT',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ participant_id: participantId, session_state: newState })
                         });
                         if (res.ok) {
                           // reload status visually
                           setStatus({ ...status, sessionState: newState });
                         } else {
                            alert("Failed to update session state");
                         }
                       } catch (err) {
                          alert("Failed to change state");
                       }
                    }}
                  >
                    <option value={0}>Scheduler</option>
                    <option value={1}>Orientation</option>
                    <option value={2}>Conversation</option>
                    <option value={3}>Completed</option>
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium text-white mb-4 border-b border-gray-700 pb-2">Scheduler</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ChecklistItem label="Demographics" isCompleted={status.demographics} />
                  <ChecklistItem label="Availability" isCompleted={status.availability} />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium text-white mb-4 border-b border-gray-700 pb-2">Orientation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ChecklistItem label="Emotion Scenario" isCompleted={status.emotionScenerio} />
                  <ChecklistItem label="Self Frequency" isCompleted={status.selfFrequency} />
                  <ChecklistItem label="Loneliness" isCompleted={status.loneliness} />
                  <ChecklistItem label="Social Connectedness" isCompleted={status.socialConnectedness} />
                  <ChecklistItem label="Expressivity" isCompleted={status.expressivity} />
                  <ChecklistItem label="Autism" isCompleted={status.autism} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 border border-gray-700 bg-gray-800 rounded-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Search Available Participants
          </h2>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <select
              value={selectedTimeIndex}
              onChange={(e) => setSelectedTimeIndex(e.target.value === "" ? "" : Number(e.target.value))}
              className="flex-1 p-3 bg-gray-900 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-white transition-colors"
            >
              <option value="">-- Select a Session Time --</option>
              {availableTimes.map((t, idx) => (
                <option key={idx} value={idx}>
                  {t.session_date} at {t.session_time}
                </option>
              ))}
            </select>
            <button
              onClick={async () => {
                if (selectedTimeIndex === "") return;
                const selected = availableTimes[selectedTimeIndex as number];
                setSearchLoading(true);
                try {
                  const res = await fetch(`/api/admin/available_times?session_date=${encodeURIComponent(selected.session_date)}&session_time=${encodeURIComponent(selected.session_time)}`);
                  if (res.ok) {
                    const json = await res.json();
                    setParticipantsForTime(json.data || []);
                  }
                } catch (e) {
                  console.error("Search failed", e);
                } finally {
                  setSearchLoading(false);
                }
              }}
              disabled={searchLoading || selectedTimeIndex === ""}
              className={`px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors ${
                (searchLoading || selectedTimeIndex === "") ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>

          {participantsForTime.length > 0 ? (
            <div>
              <h3 className="text-xl text-white font-medium mb-4">Available Participants:</h3>
              <ul className="space-y-2">
                {participantsForTime.map((p, idx) => (
                  <li key={idx} className="p-3 bg-gray-900 rounded-lg text-green-400 font-bold border border-gray-700">
                    {p.participant_id}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-gray-400 italic">No participants found for this time.</div>
          )}
        </div>

        <div className="mt-8 border border-gray-700 bg-gray-800 rounded-xl p-8 shadow-2xl mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6">Manage Available Times</h2>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <input
              type="text"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              placeholder="Session Date (e.g., Saturday, March 1st)"
              className="flex-1 p-3 bg-gray-900 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-white transition-colors"
            />
            <input
              type="text"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="Session Time (e.g., 2:00 PM - 4:30 PM)"
              className="flex-1 p-3 bg-gray-900 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-white transition-colors"
            />
            <button
              onClick={handleAddManagedTime}
              disabled={!newDate.trim() || !newTime.trim()}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>

          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2 rounded-lg bg-gray-900 p-4 border border-gray-700">
            {managedTimes.length === 0 ? (
               <div className="text-gray-400 italic">No available times currently in the database.</div>
            ) : (
              managedTimes.map((time, idx) => {
                let colorClass = "text-white";
                if (time.status === 'deleted') colorClass = "text-red-500 line-through";
                if (time.status === 'added') colorClass = "text-blue-400";

                return (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
                    <span className={`font-medium ${colorClass}`}>
                      {time.session_date} <span className="text-gray-500 mx-1">|</span> {time.session_time}
                      {time.status === 'added' && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">New</span>}
                      {time.status === 'deleted' && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">Pending Delete</span>}
                    </span>
                    <button
                      onClick={() => handleToggleManagedTimeStatus(idx)}
                      className={`px-4 py-1.5 rounded font-medium text-sm transition-colors ${
                        time.status === 'deleted' 
                          ? 'bg-gray-600 text-white hover:bg-gray-500' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {time.status === 'deleted' ? 'Undo' : time.status === 'added' ? 'Remove' : 'Delete'}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-700">
             <button
               onClick={handleSaveTimes}
               disabled={manageLoading || managedTimes.every(t => t.status === 'unchanged')}
               className={`px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg ${
                 (manageLoading || managedTimes.every(t => t.status === 'unchanged')) ? 'opacity-50 cursor-not-allowed' : ''
               }`}
             >
               {manageLoading ? 'Saving...' : 'Save Changes'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}