import { useState } from "react";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";
const LessonNotes = ({ currentLessonId, notes, setNotes }: any) => {
  const [savedNotes, setSavedNotes] = useState<{ [key: string]: string }>({});
  const { data } = useCustomQuery(
    `/enrollments/lesson-notes/?lesson=`,
    ["lesson-notes"]
  );
  console.log("API_ENDPOINTS.lessonNotes", API_ENDPOINTS.lessonNotes);
  const notesData = data;
  console.log("notesData", notesData);
  console.log("currentLessonId",currentLessonId)
  const handleSaveNotes = () => {
    // Save notes for current lesson
    setSavedNotes((prev) => ({
      ...prev,
      [currentLessonId]: notes,
    }));

    // Show success message (you could add a toast notification here)
    alert("Notes saved successfully!");
    console.log("Notes saved for lesson:", currentLessonId, notes);
  };
  return (
    <>
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Lesson Notes</h3>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Save Notes
              </button>
            </div>
            <textarea
              placeholder="Take notes while watching..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-40 p-3 bg-gray-800 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            />
            {savedNotes[currentLessonId] && (
              <p className="text-green-400 text-sm mt-2">
                ✓ Notes saved for this lesson
              </p>
            )}
          </div>
        </div>
      </div>
      {/* {notesData.map()} */}
    </>
  );
};
export default LessonNotes;
