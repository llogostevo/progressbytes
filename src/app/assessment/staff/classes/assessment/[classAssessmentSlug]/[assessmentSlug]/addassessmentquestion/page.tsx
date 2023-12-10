
export default function CreateAssessment() {
  return (
    <div className="add-question-container p-4 md:p-8">
    <h2 className="text-2xl md:text-3xl font-bold mb-6">Add New Question</h2>

    <form className="space-y-6">
        <div className="question-details bg-gray-100 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-gray-700">Question Number:</span>
                    <input type="text" className="mt-1 p-2 w-full rounded-md" placeholder="Enter Question Number" />
                </label>
                <label className="block">
                    <span className="text-gray-700">Question Order:</span>
                    <input type="text" className="mt-1 p-2 w-full rounded-md" placeholder="Enter Question Order" />
                </label>
                <label className="block">
                    <span className="text-gray-700">No of Marks:</span>
                    <input type="text" className="mt-1 p-2 w-full rounded-md" placeholder="Enter No of Marks" />
                </label>
            </div>

            <div className="mt-4 space-y-2">
                <label className="block">
                    <span className="text-gray-700">Unit:</span>
                    <select className="mt-1 p-2 w-full rounded-md">
                        {/* Dynamically populate options - ordered in dropdown - course will need pulling through */}
                        <option>Select Unit / Topic / Subtopic</option>
                    </select>
                </label>
            </div>
        </div>

        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md mt-6">Add Question</button>
    </form>
</div>

  )
}
