import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import TopicCard from "../TopicCard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SubTopicCard from "./SubTopicCard";
export const dynamic = 'force-dynamic'

export default async function DynamicSubTopicData({ params }: { params: { topicSlug: string } }) {
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

    const decodedTopicSlug = decodeURIComponent(params.topicSlug)
   
    console.log("params:")
    console.log(decodedTopicSlug)

    // Calculations for the topic data
    // Initialize an empty array for processed topics
    const processedSubtopics: any[] = [];
    if (topicData && topicData.length > 0) {
        topicData.forEach(unit => {
            unit.topictable.forEach((topic: any) => {
                console.log("topictitle:")
                console.log(topic.topictitle)
                if (topic.topictitle == decodedTopicSlug) {

                topic.subtopictable.forEach((subtopic: any) => {
                    let totalMarksForSubtopic = 0;
                    let totalMarksAchieved = 0;
                    const studentIds = new Set();

                    subtopic.questionsubtopictable.forEach((questionsubtopic: any) => {
                        const question = questionsubtopic.questiontable;
                        totalMarksForSubtopic += question.noofmarks * (question.answertable ? question.answertable.length : 0);

                        if (question.answertable && Array.isArray(question.answertable)) {
                            question.answertable.forEach((answer: any) => {
                                totalMarksAchieved += answer.mark;
                                if (answer.studenttable && answer.studenttable.studentid) {
                                    studentIds.add(answer.studenttable.studentid);
                                }
                            });
                        }
                    });

                    const percentageAchieved = (totalMarksAchieved / totalMarksForSubtopic) * 100;

                    processedSubtopics.push({
                        unit_number: unit.unitnumber,
                        subtopic_name: subtopic.subtopictitle,   // Updated to subtopic_name
                        performance: Math.round(percentageAchieved),
                        totalMarksAchieved: totalMarksAchieved,
                        totalMarks: totalMarksForSubtopic,
                        numberOfStudents: studentIds.size,
                    });
                });
            }
            });
        });

        // Sort processed subtopics
        processedSubtopics.sort((a, b) => {
            if (isNaN(a.performance) && isNaN(b.performance)) return 0;
            if (isNaN(a.performance)) return 1;
            if (isNaN(b.performance)) return -1;
            return b.performance - a.performance;
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
                {/* ... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {processedSubtopics.filter(t => t.unit_number === 'Unit 1').map(subtopic => (
                    <SubTopicCard
                        key={subtopic.subtopic_name}   // Updated to subtopic_name
                        subTopicName={subtopic.subtopic_name}   // Updated to subtopic_name
                        totalMarksAchieved={subtopic.totalMarksAchieved}
                        totalMarks={subtopic.totalMarks}
                        numberOfStudents={subtopic.numberOfStudents}
                        unitNumber={subtopic.unit_number}
                    />
                ))}
            </div>

                <h2 className="text-4xl font-bold mb-4 mt-10">Unit 2</h2>
                {/* ... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {processedSubtopics.filter(t => t.unit_number === 'Unit 2').map(subtopic => (
                    <SubTopicCard
                        key={subtopic.subtopic_name}   // Updated to subtopic_name
                        subTopicName={subtopic.subtopic_name}   // Updated to subtopic_name
                        totalMarksAchieved={subtopic.totalMarksAchieved}
                        totalMarks={subtopic.totalMarks}
                        numberOfStudents={subtopic.numberOfStudents}
                        unitNumber={subtopic.unit_number}
                    />
                ))}
            </div>
            </div>
        </div>
    )
}
