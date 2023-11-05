import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

interface StudentDataItem {
    student_id: number;
    first_name: string;
    last_name: string;
    gcse_target: string;
    alevel_target: string;
    answer_date: Date;
    answer_id: number;
    mark: number;
    questionmarks: number;
    question_id: number;
    subtopic_id: number;
    subtopic_number: string;
    subtopic_title: string;
    course_level: string;
    unit_id: number;
    unit_title: string;
    topic_id: number;
    topic_number: string;
    topic_title: string;
    subjectname: string;
    examboard: string;
    unit_number: string;
}

interface CourseAggregatedDataItem {
    student_id: number;
    first_name: string;
    last_name: string;
    total_marks_achieved: number;
    total_marks_available: number;
    percentage: number;

}

interface UnitAggregatedDataItem {
    student_id: number;
    unit_id: number;
    unit_title: string;
    first_name: string;
    last_name: string;
    total_marks_achieved: number;
    total_marks_available: number;
    percentage: number;
    unit_number: string;
}

interface TopicAggregatedDataItem {
    student_id: number;
    unit_title: string;
    first_name: string;
    last_name: string;
    total_marks_achieved: number;
    total_marks_available: number;
    percentage: number;
    unit_number: string;
    topic_number: string;
    topic_title: string;
}

interface SubTopicAggregatedDataItem {
    student_id: number;
    unit_title: string;
    first_name: string;
    last_name: string;
    subtopic_title: string;
    subtopic_number: string;
    total_marks_achieved: number;
    total_marks_available: number;
    percentage: number;
    unit_number: string;
    topic_number: string;
    topic_title: string;
}

export default async function DashboardClasses({ params }: { params: { dashboardclassid: string } }) {
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
    // if not at the correct role i.e. admin then redirect to the unauthorised page
    if (!profile || profile[0].admin == false) {
        redirect("/unauthorised")
    }

    // get class information
    let { data: classtable, error } = await supabase
        .from('classtable')
        .select('*')
        .eq('classid', decodeURIComponent(params.dashboardclassid))

    let classgroup: string | undefined;
    let level: string | undefined;

    if (classtable) {
        classgroup = classtable?.[0].classid
    } else {
        classgroup = ""
    }

    let { data: enrollmenttable, error: enrollerror } = await supabase
        .from('enrollmenttable')
        .select('studentid')
        .eq('classid', classgroup)

    if (enrollerror) {
        console.error(enrollerror);
        return;
    }

    const studentIds = (enrollmenttable || []).map(enrollment => enrollment.studentid);
    console.log(studentIds)
    let studentData: StudentDataItem[] = [];  // initializing with an empty array

    // fetch the historical performance records for those students
    if (studentIds.length > 0) {  // only proceed if studentIds is not empty
        let { data: classdashboard, error: classdasherror } = await supabase
            .from('classdashboard')
            .select('*')
            .in('student_id', studentIds)

        console.log(classdashboard);

        if (classdasherror) {
            console.error(classdasherror);
            return <p>No Data</p>;
        } else {
            studentData = classdashboard as StudentDataItem[];
        }
        // Now, `historicalperformance` contains the records for the students in the specified class
    } else {
        console.error("No students found for the specified class");
    }

    let examboard: string | undefined;
    let subjectname: string | undefined;

    if (studentData.length > 0) {
        examboard = studentData[0].examboard;
        subjectname = studentData[0].subjectname;
        level = studentData[0].course_level;

    }


    // Step 1: Identify unique students and subtopics
    const students = Array.from(new Set(studentData.map(item => item.student_id)));
    const subtopics = Array.from(new Set(studentData.map(item => item.subtopic_title)));

    // Define a type for the aggregated data
    interface AggregatedDataItem {
        subtopic: string;
        [key: number]: number;  // key is student_id, value is aggregated mark
    }

    // Step 2: Aggregate marks per student per subtopic
    const aggregatedData: AggregatedDataItem[] = subtopics.map(subtopic => {
        const subtopicData: AggregatedDataItem = { subtopic };
        students.forEach(student => {
            const studentSubtopicData = studentData.filter(item => item.student_id === student && item.subtopic_title === subtopic);
            subtopicData[student] = studentSubtopicData.reduce((total, item) => total + item.mark, 0);
        });
        return subtopicData;
    });

    const courseAggregatedData: CourseAggregatedDataItem[] = students.map(student => {
        const studentDataItems = studentData.filter(item => item.student_id === student);

        // Since all the records for a student will have the same first_name and last_name,
        // it's safe to get these values from the first record
        const first_name = studentDataItems[0]?.first_name || '';
        const last_name = studentDataItems[0]?.last_name || '';

        const total_marks_achieved = studentDataItems.reduce((total, item) => total + item.mark, 0);
        const total_marks_available = studentDataItems.reduce((total, item) => total + item.questionmarks, 0);
        const percentage = (total_marks_achieved / total_marks_available) * 100;

        return { student_id: student, first_name, last_name, total_marks_achieved, total_marks_available, percentage };
    });

    // Identify unique units
    const units = Array.from(new Set(studentData.map(item => item.unit_id)));

    const unitAggregatedData: { [key: number]: UnitAggregatedDataItem[] } = {};
    units.forEach(unit => {
        unitAggregatedData[unit] = students.map(student => {
            const studentUnitData = studentData.filter(item => item.student_id === student && item.unit_id === unit);
            const first_name = studentUnitData[0]?.first_name || '';
            const last_name = studentUnitData[0]?.last_name || '';
            const unit_title = studentUnitData[0]?.unit_title || '';
            const unit_number = studentUnitData[0]?.unit_number || '';
            const total_marks_achieved = studentUnitData.reduce((total, item) => total + item.mark, 0);
            const total_marks_available = studentUnitData.reduce((total, item) => total + item.questionmarks, 0);
            const percentage = (total_marks_achieved / total_marks_available) * 100;
            return { student_id: student, unit_id: unit, unit_number, unit_title, first_name, last_name, total_marks_achieved, total_marks_available, percentage };
        });
    });

    const sortedUnits = units.sort((a, b) => {
        const unitNumberA = unitAggregatedData[a][0]?.unit_number || '';
        const unitNumberB = unitAggregatedData[b][0]?.unit_number || '';
        return unitNumberA.localeCompare(unitNumberB, undefined, { numeric: true });
    });

    // Identify unique topics
    const topics = Array.from(new Set(studentData.map(item => item.topic_id)));

    // Aggregate data by topic
    const topicAggregatedData: { [key: number]: TopicAggregatedDataItem[] } = {};
    topics.forEach(topic => {
        topicAggregatedData[topic] = students.map(student => {
            const studentTopicData = studentData.filter(item => item.student_id === student && item.topic_id === topic);
            const first_name = studentTopicData[0]?.first_name || '';
            const last_name = studentTopicData[0]?.last_name || '';
            const topic_title = studentTopicData[0]?.topic_title || '';
            const unit_title = studentTopicData[0]?.unit_title || '';
            const unit_number = studentTopicData[0]?.unit_number || '';
            const topic_number = studentTopicData[0]?.topic_number || '';
            const total_marks_achieved = studentTopicData.reduce((total, item) => total + item.mark, 0);
            const total_marks_available = studentTopicData.reduce((total, item) => total + item.questionmarks, 0);
            const percentage = (total_marks_achieved / total_marks_available) * 100;
            return { student_id: student, unit_title, unit_number, topic_id: topic, topic_number, topic_title, first_name, last_name, total_marks_achieved, total_marks_available, percentage };
        });
    });

    // Sort topics by topic_number
    const sortedTopics = topics.sort((a, b) => {
        const topicNumberA = topicAggregatedData[a][0]?.topic_number || '';
        const topicNumberB = topicAggregatedData[b][0]?.topic_number || '';
        return topicNumberA.localeCompare(topicNumberB, undefined, { numeric: true });
    });


    // Identify unique subtopics
    const newSubtopics = Array.from(new Set(studentData.map(item => item.subtopic_id)));

    // Aggregate data by subtopic
    const subtopicAggregatedData: { [key: number]: SubTopicAggregatedDataItem[] } = {};
    newSubtopics.forEach(subtopic => {
        subtopicAggregatedData[subtopic] = students.map(student => {
            const studentSubtopicData = studentData.filter(item => item.student_id === student && item.subtopic_id === subtopic);
            const first_name = studentSubtopicData[0]?.first_name || '';
            const last_name = studentSubtopicData[0]?.last_name || '';
            const topic_title = studentSubtopicData[0]?.topic_title || '';
            const unit_title = studentSubtopicData[0]?.unit_title || '';
            const subtopic_title = studentSubtopicData[0]?.subtopic_title || '';
            const subtopic_number = studentSubtopicData[0]?.subtopic_number || '';
            const unit_number = studentSubtopicData[0]?.unit_number || '';
            const topic_number = studentSubtopicData[0]?.topic_number || '';
            const total_marks_achieved = studentSubtopicData.reduce((total, item) => total + item.mark, 0);
            const total_marks_available = studentSubtopicData.reduce((total, item) => total + item.questionmarks, 0);
            const percentage = (total_marks_achieved / total_marks_available) * 100;
            return { student_id: student, unit_title, subtopic_title, subtopic_number, unit_number, topic_number, topic_title, first_name, last_name, total_marks_achieved, total_marks_available, percentage };
        });
    });

    const sortedSubTopics = newSubtopics

    // // Sort topics by topic_number
    // const sortedSubTopics = newSubtopics.sort((a, b) => {
    //     const subtopicNumberA = subtopicAggregatedData[a][0]?.subtopic_number || '';
    //     const subtopicNumberB = subtopicAggregatedData[b][0]?.subtopic_number || '';
    //     return subtopicNumberA.localeCompare(subtopicNumberB, undefined, { numeric: true });
    // });

    return (
        <>
            {/* Course Heading */}
            <div className="header-info bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300">
                <h1 className="text-4xl mb-4 font-semibold">Dashboard: {classgroup}</h1>
                <div className="text-lg mb-4">
                    <p>Subject: {subjectname}</p>
                    <p>Level: {level}</p>
                    <p>Exam Board: {examboard}</p>
                </div>
            </div>

            {/* Course Performance drilldown */}
            <div className="overflow-x-auto bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300">
                <h2 className="text-2xl mb-4 font-semibold">Course Performance: {classgroup}</h2>
                <div className="text-sm mb-4">
                    <p>Subject: {subjectname}</p>
                    <p>Level: {level}</p>
                    <p>Exam Board: {examboard}</p>
                </div>
                <table className="min-w-full bg-white border-collapse text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border px-2 py-1 font-bold">#</th>
                            <th className="border px-2 py-1 font-bold">First Name</th>
                            <th className="border px-2 py-1 font-bold">Last Name</th>
                            <th className="border px-2 py-1 font-bold">Total Marks Achieved</th>
                            <th className="border px-2 py-1 font-bold">Total Marks Available</th>
                            <th className="border px-2 py-1 font-bold">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courseAggregatedData.map((item, index) => (
                            <tr key={index}>
                                <td className="border px-2 py-1">{item.student_id}</td>
                                <td className="border px-2 py-1">{item.first_name}</td>
                                <td className="border px-2 py-1">{item.last_name}</td>
                                <td className="border text-center px-2 py-1">{item.total_marks_achieved}</td>
                                <td className="border text-center px-2 py-1">{item.total_marks_available}</td>
                                <td className="border text-center px-2 py-1">{item.percentage.toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Unit Data Drill Down */}
            <div className="overflow-x-auto bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300">
                <h2 className="text-2xl mb-4 font-semibold">Unit Performance: {classgroup}</h2>
                <div className="text-sm mb-4">
                    <p>Subject: {subjectname}</p>
                    <p>Level: {level}</p>
                    <p>Exam Board: {examboard}</p>
                </div>
                {sortedUnits.map(unit => (
                    <div key={unit} className="unit-table-container bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300">
                        <h2 className="text-2xl mb-4 font-semibold">{unitAggregatedData[unit][0]?.unit_number || ''} - {unitAggregatedData[unit][0]?.unit_title || 'Unknown Unit'}</h2>
                        <table className="min-w-full bg-white border-collapse text-sm">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="border px-2 py-1 font-bold">#</th>
                                    <th className="border px-2 py-1 font-bold">First Name</th>
                                    <th className="border px-2 py-1 font-bold">Last Name</th>
                                    <th className="border px-2 py-1 font-bold">Total Marks Achieved</th>
                                    <th className="border px-2 py-1 font-bold">Total Marks Available</th>
                                    <th className="border px-2 py-1 font-bold">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unitAggregatedData[unit].map((item, index) => (
                                    <tr key={index}>
                                        <td className="border px-2 py-1">{item.student_id}</td>
                                        <td className="border px-2 py-1">{item.first_name}</td>
                                        <td className="border px-2 py-1">{item.last_name}</td>
                                        <td className="border text-center px-2 py-1">{item.total_marks_achieved}</td>
                                        <td className="border text-center px-2 py-1">{item.total_marks_available}</td>
                                        <td className="border text-center px-2 py-1">{item.percentage.toFixed(2)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {sortedTopics.map(topic => (
                <div key={topic} className="topic-table-container bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300">
                    <h2 className="text-2xl mb-4 font-semibold">{topicAggregatedData[topic][0]?.topic_number || ''} - {topicAggregatedData[topic][0]?.topic_title || 'Unknown Topic'}</h2>
                    <div className="text-sm mb-4">
                        <p>{topicAggregatedData[topic][0]?.unit_number || ''} - {topicAggregatedData[topic][0]?.unit_title || 'Unknown Unit'}</p>
                    </div>
                    <div className="text-sm mb-4">
                        <p>Subject: {subjectname}</p>
                        <p>Level: {level}</p>
                        <p>Exam Board: {examboard}</p>
                    </div>
                    <table className="min-w-full bg-white border-collapse text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border px-2 py-1 font-bold">#</th>
                                <th className="border px-2 py-1 font-bold">First Name</th>
                                <th className="border px-2 py-1 font-bold">Last Name</th>
                                <th className="border px-2 py-1 font-bold">Total Marks Achieved</th>
                                <th className="border px-2 py-1 font-bold">Total Marks Available</th>
                                <th className="border px-2 py-1 font-bold">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topicAggregatedData[topic].map((item, index) => (
                                <tr key={index}>
                                    <td className="border px-2 py-1">{item.student_id}</td>
                                    <td className="border px-2 py-1">{item.first_name}</td>
                                    <td className="border px-2 py-1">{item.last_name}</td>
                                    <td className="border text-center px-2 py-1">{item.total_marks_achieved}</td>
                                    <td className="border text-center px-2 py-1">{item.total_marks_available}</td>
                                    <td className="border text-center px-2 py-1">{item.percentage.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))
            }
            {/* Subtopics */}

            {sortedSubTopics.map(subtopic => (
                <div key={subtopic} className="subtopic-table-container bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300">
                    <h2 className="text-2xl mb-4 font-semibold">{subtopicAggregatedData[subtopic][0]?.subtopic_number || ''} - {subtopicAggregatedData[subtopic][0]?.subtopic_title || 'Unknown Subtopic'}</h2>
                    <div className="text-sm mb-4">
                        <p>{subtopicAggregatedData[subtopic][0]?.topic_number || ''} - {subtopicAggregatedData[subtopic][0]?.topic_title || 'Unknown Topic'}</p>
                        <p>{subtopicAggregatedData[subtopic][0]?.unit_number || ''} - {subtopicAggregatedData[subtopic][0]?.unit_title || 'Unknown Unit'}</p>
                    </div>
                    <div className="text-sm mb-4">
                        <p>Subject: {subjectname}</p>
                        <p>Level: {level}</p>
                        <p>Exam Board: {examboard}</p>
                    </div>
                    <table className="min-w-full bg-white border-collapse text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border px-2 py-1 font-bold">#</th>
                                <th className="border px-2 py-1 font-bold">First Name</th>
                                <th className="border px-2 py-1 font-bold">Last Name</th>
                                <th className="border px-2 py-1 font-bold">Total Marks Achieved</th>
                                <th className="border px-2 py-1 font-bold">Total Marks Available</th>
                                <th className="border px-2 py-1 font-bold">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subtopicAggregatedData[subtopic].map((item, index) => (
                                <tr key={index}>
                                    <td className="border px-2 py-1">{item.student_id}</td>
                                    <td className="border px-2 py-1">{item.first_name}</td>
                                    <td className="border px-2 py-1">{item.last_name}</td>
                                    <td className="border text-center px-2 py-1">{item.total_marks_achieved}</td>
                                    <td className="border text-center px-2 py-1">{item.total_marks_available}</td>
                                    <td className="border text-center px-2 py-1">{item.percentage.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </>
    );
}

