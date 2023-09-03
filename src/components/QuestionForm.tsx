"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function QuestionForm() {

    // get the unit topics from the database
    // const units : UnitTopics[] = await allUnitTopics() 

    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>){
        
        const supabase = createClientComponentClient()

            const { error } = await supabase
            .from('questions_completed')
            .insert({ 
                no_of_marks: 3,
                marks_available: '5', 
                date_entered: 1,
                date_answered: 1,
                assessed_by: 'teacher',
                studentid: '1', 
                topic_id: '4'
            })

        


    }

    return (
        <div>
            {/* {units?.map((unit) => (
                <div>
                    <h1 className="text-4xl" key={unit.unit_id}>{unit.unit_name} </h1>
                    <ul>
                        {unit.topics?.map(topic => <li key={topic.topic_id}>{topic.topic_name}</li>)}
                    </ul>
                </div>
            ))} */}

            {/* ADD A COMPLETED QUESTION */}

            <div className="max-w-lg mx-auto mt-8">
                <form onSubmit={handleFormSubmit}  className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentName">
                            Student Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="studentName" type="text" placeholder="Student Name" name="studentName"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="topic">
                            Topic
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="topic" type="text" placeholder="Topic" name="topic"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numberOfMarks">
                            Number of Marks
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="numberOfMarks" type="number" placeholder="Number of Marks" name="numberOfMarks"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="marksAvailable">
                            Marks Available
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="marksAvailable" type="number" placeholder="Marks Available" name="marksAvailable"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateAnswered">
                            Date Answered
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="dateAnswered" type="date" name="dateAnswered"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assessedBy">
                            Assessed By
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="assessedBy" type="text" placeholder="Assessed By" name="assessedBy"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>


            {/* TABLE OF QUESTIONS ANSWERED */}
        </div>
    );
}