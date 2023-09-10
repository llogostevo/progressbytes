import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import TopicCard from "./TopicCard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TeacherDashboard() {
    // check logged in as teacher
    // get assessment data
    // graphs for each topic
    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    // get the users sessions
    const { data: { user } } = await supabase.auth.getUser()

    // check if user is logged in and redirect to page if they are not
    if (!user) {
        redirect("/")
    }

    // check if profile exists in DB
    const { data: profile, error: profileError } = await supabase
        .from('profilestable')
        .select('*')
        .eq('profileid', user.id)

    // check if profile exists in DB, if not redirect to unauthorised
    // if not at the correct role then redirect to the unauthorised page
    if (!profile) {
        redirect("/unauthorised")
    }


    // const topics = [
    //     { unit_number: '1', topic_name: 'Algorithms', performance: 75, totalMarks: 90 },
    //     { unit_number: '1', topic_name: 'Processor', performance: 88, totalMarks: 90 },
    //     { unit_number: '1', topic_name: 'Computing Related Legislation', performance: 60, totalMarks: 90 },
    //     { unit_number: '1', topic_name: 'Input, output and storage', performance: 82, totalMarks: 90 },
    //     { unit_number: '1', topic_name: 'Databases', performance: 90, totalMarks: 90 },
    //     // ... add more topics as needed for testing
    // ];


    const { data: topicData, error: topicError } = await supabase
        .from('unittable')
        .select(`
        *,
        topictable (
            *,
            subtopictable (
            *,
            questionsubtopictable (
                *,
                questiontable (
                *,
                answertable (*, 
                studenttable (*)
                    )
                )
            )
            )
        )
        `);
    if (topicError) {
        console.error('Error:', topicError);
    }

    // Calculations for the topic data
    // Initialize an empty array for processed topics
    const processedTopics: any[] = [];
    if (topicData && topicData.length > 0) {


        topicData.forEach(unit => {
            // For each unit, loop through its topics
            unit.topictable.forEach((topic: any) => {

                let totalMarksForTopic = 0; // Total available marks for the topic
                let totalMarksAchieved = 0; // Total marks achieved for the topic
                let numberOfStudents = 0;   // Initialize here

                // Use a Set to store unique student IDs
                const studentIds = new Set();

                // For each topic, loop through its subtopics
                topic.subtopictable.forEach((subtopic: any) => {
                    // For each subtopic, loop through its question-subtopic associations
                    subtopic.questionsubtopictable.forEach((questionsubtopic: any) => {
                        // Access the question directly as it's an object, not an array
                        const question = questionsubtopic.questiontable;
                        // Calculate total marks for the question based on number of answers
                        totalMarksForTopic += question.noofmarks * (question.answertable ? question.answertable.length : 0);

                        // If there's an answertable, sum the marks achieved
                        if (question.answertable && Array.isArray(question.answertable)) {
                            question.answertable.forEach((answer: any) => {
                                totalMarksAchieved += answer.mark;
                                // Add student ID to the set
                                if (answer.studenttable && answer.studenttable.studentid) {
                                    studentIds.add(answer.studenttable.studentid);
                                }
                            });
                        }
                        numberOfStudents = studentIds.size;
                    });
                });

                // Calculate percentage achieved for the topic
                const percentageAchieved = (totalMarksAchieved / totalMarksForTopic) * 100;


                // Push the processed topic to the array
                processedTopics.push({
                    unit_number: unit.unitnumber,
                    topic_name: topic.topictitle,
                    performance: Math.round(percentageAchieved),
                    totalMarksAchieved: totalMarksAchieved,
                    totalMarks: totalMarksForTopic,
                    numberOfStudents: numberOfStudents,
                });
            });

        });

        processedTopics.sort((a, b) => {
            if (isNaN(a.performance) && isNaN(b.performance)) return 0;  // Both are NaN, so consider them equal
            if (isNaN(a.performance)) return 1;   // a is NaN, so it should come after b
            if (isNaN(b.performance)) return -1;  // b is NaN, so a should come before b
            return b.performance - a.performance; // Otherwise, sort in descending order of performance
        });
    }

    return (
        <div>
            <div className="container mx-auto px-4 py-6">
                {/* THIS IS FOR ALL DATA */}
                {/* <h1 className="text-4xl font-bold mb-8">All Performance</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {processedTopics.map((topic) => (
                        <TopicCard
                            key={topic.topic_name}
                            topicName={topic.topic_name}
                            totalMarksAchieved={topic.totalMarksAchieved}
                            totalMarks={topic.totalMarks}
                            unitNumber={topic.unit_number}
                        />
                    ))}
                </div> */}


                {/* THESE FILTERS DISPLAY THE SPECIFIC UNIT NUMBER */}
                <h2 className="text-4xl font-bold mb-4">Unit 1</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {processedTopics.filter(t => t.unit_number === 'Unit 1').map((topic) => (
                        <TopicCard
                            key={topic.topic_name}
                            topicName={topic.topic_name}
                            totalMarksAchieved={topic.totalMarksAchieved}
                            totalMarks={topic.totalMarks}
                            numberOfStudents={topic.numberOfStudents}
                            unitNumber={topic.unit_number}
                        />
                    ))}
                </div>

                <h2 className="text-4xl font-bold mb-4 mt-10">Unit 2</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {processedTopics.filter(t => t.unit_number === 'Unit 2').map((topic) => (
                        <TopicCard
                            key={topic.topic_name}
                            topicName={topic.topic_name}
                            totalMarksAchieved={topic.totalMarksAchieved}
                            numberOfStudents={topic.numberOfStudents}
                            totalMarks={topic.totalMarks}
                            unitNumber={topic.unit_number}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
