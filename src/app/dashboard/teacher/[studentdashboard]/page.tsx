"use client"
import StudentGradeActivity from "../../dashboardComponents/StudentGradeActivity";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function TeacherStudentDashboard({ params }: { params: { studentdashboard: string } }) {
    const studentId = Number(decodeURIComponent(params.studentdashboard));
    const [studentData, setStudentData] = useState<any[]>([])

    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()
  
    useEffect(() => {
      const getStudentData = async () => {
        
        let { data: studenttable, error } = await supabase
        .from('studenttable')
        .select('*')
        .eq('studentid', studentId)

        if (studenttable) {
            setStudentData(studenttable)

        } else if (error){
            console.log(error)

        }
      }
      console.log(studentData)
      getStudentData()
    }, [supabase])

    return (

        <div className="container mx-auto px-4 py-4">
            <h1 className="text-6xl font-semibold py-10">Student Dashboard Data</h1>
            <h2 className="text-4xl font-semibold mb-2">{`${studentData?.[0]?.firstname} ${studentData?.[0]?.lastname}`}</h2>


            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <StudentGradeActivity studentId={studentId} />
            </div>

        </div>

    )
}

