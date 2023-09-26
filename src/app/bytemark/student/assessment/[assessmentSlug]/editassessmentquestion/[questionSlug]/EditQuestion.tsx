type Unit = {
    unittitle: string;
    unitnumber: string;
    unitid: number;
};

type Topic = {
    topictitle: string;
    topicid: number;
    unittable: Unit;
};

type Subtopic = {
    subtopictitle: string;
    subtopicid: number;
    topictable: Topic;
};

type QuestionSubtopicTable = {
    subtopictable: Subtopic;
};

type Student = {
    studentid: number;
    firstname: string;
    lastname: string;
};

type Answer = {
    answerid: number;
    questionid: number;
    studentid: number;
    mark: number;
    studenttable: Student;
};

type QuestionData = {
    questionid: number;
    assessmentid: number;
    questionnumber: string;
    questionorder: number;
    noofmarks: number;
    questionsubtopictable: QuestionSubtopicTable[];
    answertable: Answer[];
};

interface EditQuestionProps {
    questionData: QuestionData;
}
type Props = {
    questionData: QuestionData;  // Assuming you've already defined the type 'QuestionData'
};

export default function EditQuestion({ questionData }: Props) {
    return (
        <div className="edit-question-container p-4 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Edit Question Results</h2>

            <form className="space-y-6">
                <div className="question-details bg-gray-100 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-gray-700">Question Number:</span>
                            <input type="text" value={questionData.questionnumber} className="mt-1 p-2 w-full rounded-md" />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Question Order:</span>
                            <input type="text" value={questionData.questionorder} className="mt-1 p-2 w-full rounded-md" />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">No of Marks:</span>
                            <input type="text" value={questionData.noofmarks} className="mt-1 p-2 w-full rounded-md" />
                        </label>
                    </div>

                    <div className="mt-4 space-y-2">
                        <p className="text-gray-700">Unit: {questionData.questionsubtopictable[0].subtopictable.topictable.unittable.unittitle}</p>
                        <p className="text-gray-700">Topic: {questionData.questionsubtopictable[0].subtopictable.topictable.topictitle}</p>
                        <p className="text-gray-700">Subtopic: {questionData.questionsubtopictable[0].subtopictable.subtopictitle}</p>
                    </div>
                </div>

                <div className="student-results bg-gray-100 p-4 rounded-md">
                    <h3 className="text-xl font-semibold mb-4">Student Results</h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-gray-700">Students</th>
                                    <th className="px-4 py-2 text-left text-gray-700">Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questionData.answertable.map((answer) => (
                                    <tr key={answer.answerid} className="border-t">
                                        <td className="px-4 py-2">{answer.studenttable.firstname} {answer.studenttable.lastname}</td>
                                        <td className="px-4 py-2">
                                            <input type="text" value={answer.mark} className="p-2 w-20 rounded-md" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md mt-6">Save Changes</button>
            </form>
        </div>

    );
}