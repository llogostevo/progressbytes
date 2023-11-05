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
    subtopic_title: string;
    course_level: string;
    unit_id: number;
    unit_title: string;
    topic_id: number;
    topic_number: number;
    topic_title: string;
    subjectname: string;
    examboard: string;
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
    unittitle: number;
    first_name: string;
    last_name: string;
    total_marks_achieved: number;
    total_marks_available: number;
    percentage: number;
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

    // Step 3: Constructing the Table
    return (
        <>

            <div className="header-info bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300">
                <h1 className="text-4xl mb-4 font-semibold">Dashboard: {classgroup}</h1>
                <div className="text-lg mb-4">
                    <p>Subject: {subjectname}</p>
                    <p>Level: {level}</p>
                    <p>Exam Board: {examboard}</p>
                </div>

            </div>
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
            <table>
                <thead>
                    <tr>
                        <th>Subtopic</th>
                        {students.map(student => (
                            <th key={student}>Student {student}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {aggregatedData.map((subtopicData, index) => (
                        <tr key={index}>
                            <td>{subtopicData.subtopic}</td>
                            {students.map(student => (
                                <td key={student}>{subtopicData[student]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

