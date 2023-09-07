"use client";
import { Profiles, Student, TopicWithUnits } from "@/lib/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { useRouter } from 'next/navigation'

import { ChangeEvent, useEffect, useState, useTransition } from "react";

export default function QuestionForm() {

    // const router = useRouter()
    // const [isPending, startTransition] = useTransition()

    //  ############## VALIDATE DATE ################## //
    // USED TO SET DEFAULT VALUE OF TODAY and MAX TODAY
    useEffect(() => {
        // set today constant with todays date
        const today = new Date().toISOString().split('T')[0];
        // get the form element 
        const dateInput = document.getElementById('dateAnswered') as HTMLInputElement;
        // ensure there is a form element for the date (typescript)
        if (dateInput) {
            // set todays date as the default
            dateInput.defaultValue = today;
            //   set the max attribute from the drop down object as today
            dateInput.max = today;
        }
    }, []);
    //  ############## end validate > ################## //


    //  ############## VALIDATE MAX MARKS FORM CHANGE ################## //
    const [maxMarks, setMaxMarks] = useState<number>(1);

    const handleMaxMarksChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMaxMarks(Number(e.target.value));
    };
    //  ############## end validate > ################## //

    //  ############## GET DATA FOR DROP DOWNS ################## //
    // State variables for dropdown data
    const [students, setStudents] = useState<Profiles[]>([]);
    const [topics, setTopics] = useState<TopicWithUnits[]>([]);

    // Fetching data for dropdowns
    useEffect(() => {
        const fetchDropdownData = async () => {
            const supabase = createClientComponentClient();

            // Fetch all students
            const { data: students } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'Student');

            
            setStudents(students as Profiles[]);

            // Fetch topics
            const { data: topicsData } = await supabase
                .from('topics')
                .select(`
                    topic_id, 
                    topic_name, 
                    unit_id, 
                    units ( unit_id, unit_name, unit_title )`
                );

            // check there topic data before setting state
            if (topicsData) {
                setTopics(topicsData as unknown as TopicWithUnits[]);
            }
        };

        fetchDropdownData();
    }, []);


    // Get the Unit Names to group the topics in the select
    const groupedTopics = topics.reduce<{ [key: string]: TopicWithUnits[] }>((acc, topic) => {
        const unitName = `${topic.units.unit_name}: ${topic.units.unit_title}` || 'No Unit'; // Or you can use unit_id if you prefer
        if (!acc[unitName]) {
            acc[unitName] = [];
        }
        acc[unitName].push(topic);
        return acc;
    }, {});


    //  ############## end get dropdown data > ################## //

    //  ############## HANDLE FORM SUBMIT FUNCTION ################## //

    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        //  ############## VALIDATE MAX MARKS FORM SUBMIT ################## //

        //  @ts-ignore
        const marksAwarded = Number(event.target.numberOfMarks.value);
        //  @ts-ignore
        const marksAvailable = Number(event.target.marksAvailable.value);

        if (marksAwarded > marksAvailable) {
            alert('Number of Marks cannot exceed Marks Available.');
            return;
        }
        //  ############## end validate > ################## //

        //  @ts-ignore
        const no_of_marks = event.target.numberOfMarks.value;
        //  @ts-ignore
        const marks_available = event.target.marksAvailable.value;
        //  @ts-ignore
        const date_answered = event.target.dateAnswered.value;
        //  @ts-ignore
        const assessed_by = event.target.assessedBy.value;
        //  @ts-ignore
        const student_id = event.target.studentName.value;
        //  @ts-ignore
        const topic_id = event.target.topic.value;

        const supabase = createClientComponentClient()

        const { error } = await supabase
            .from('questions_completed')
            .insert({
                no_of_marks: no_of_marks,
                marks_available: marks_available,
                // date_entered: default of today,
                date_answered: date_answered,
                assessed_by: assessed_by,
                student_id: student_id,
                topic_id: topic_id
            })

        // startTransition(() => {
        //     router.refresh();

        // })

        // RESET FORM VALUES TO BE EMPTY
        //  @ts-ignore
        event.target.numberOfMarks.value = "";
        //  @ts-ignore
        event.target.marksAvailable.value = "1";
        //  @ts-ignore
        // event.target.dateAnswered.value = "";
        //  @ts-ignore
        event.target.assessedBy.value = "";
        //  @ts-ignore
        event.target.studentName.value = "";
        //  @ts-ignore
        event.target.topic.value = "";

    }
    //  ############## end handle form submit > ################## //


    //  ############## DROPDOWN DATA  ################## //
    //   GET DATA FOR DROPDOWN MENUS
    // const { data: questions_completed, error } = await supabase
    //     .from('questions_completed')
    //     .select('*')

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Add Question Marks</h1>
            {/* ADD A COMPLETED QUESTION */}

            <div className="max-w-lg mx-auto mt-8">
                <form onSubmit={handleFormSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentName">
                            Student Name
                        </label>
                        <select
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="studentName"
                            name="studentName"
                        >
                            {students.map((student) => (
                                <option key={student.profile_id} value={student.profile_id}>
                                    {student.first_name} {student.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="topic">
                            Topic
                        </label>
                        <select
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="topic"
                            name="topic"
                        >
                            {Object.keys(groupedTopics).map((unitName) => (
                                <optgroup key={unitName} label={unitName}>
                                    {groupedTopics[unitName].map((topic) => (
                                        <option key={topic.topic_id} value={topic.topic_id}>
                                            {topic.topic_name}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>



                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="marksAvailable">
                            Marks Available
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="marksAvailable"
                            type="number"
                            placeholder="Marks Available"
                            name="marksAvailable"
                            defaultValue={1} // Setting the default value to 1
                            onChange={handleMaxMarksChange} // When this input changes, handleMaxMarksChange will update maxMarks
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numberOfMarks">
                            Number of Marks
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="numberOfMarks"
                            type="number"
                            placeholder="Number of Marks"
                            name="numberOfMarks"
                            // @ts-ignore
                            max={maxMarks}
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
                        <select
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="assessedBy"
                            name="assessedBy"
                        >
                            <option value="self">Self</option>
                            <option value="peer">Peer</option>
                            <option value="teacher">Teacher</option>

                        </select>
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