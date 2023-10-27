"use client";
import { useState, ChangeEvent, useEffect } from 'react';

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function getMostRecentSeptemberFirst() {
    const today = new Date();
    let year = today.getFullYear();
    // If today's date is before September 1, use the previous year
    if (today < new Date(year, 8, 1)) {
        year -= 1;
    }
    // Format the date as YYYY-MM-DD for the input
    return `${year}-09-01`;
}

export default function EnrollStudentForm({ slug }: { slug: string; }) {

    // COURSE ID HERE NEEDS CHECKING
    // IS THERE AN ISSUE WITH STUDENT ID AS IT IS BEING STORED AS A STRING AND SHOULD BE AN INT
    // NEED TO MAKE THE DEFUALT VALUE OF THE DROP DOWN BLANK
    const [formData, setFormData] = useState({
        studentid: '',
        examyear: 2024,
        startdate: getMostRecentSeptemberFirst(),
        offroll: 'No',
        courseid: ''
    });

    const [students, setStudents] = useState<any[]>([]);  // Added students state
    const [courses, setCourses] = useState<any[]>([]);


    useEffect(() => {
        // Fetch students data here
        const fetchStudents = async () => {
            const supabase = createClientComponentClient();
            // Fetch studentids that are already enrolled in the given class
            const { data: enrolledStudents, error: enrolledError } = await supabase
                .from('enrollmenttable')
                .select('studentid')
                .eq('classid', decodeURIComponent(slug));  // assuming slug is the class id
            console.log(decodeURIComponent(slug))

            if (enrolledError) {
                console.error("Error fetching enrolled students:", enrolledError);
                return;
            }

            const enrolledStudentIds = enrolledStudents.map((e: any) => e.studentid);
            console.log(enrolledStudentIds)
            // Fetch students not enrolled in the class
            const { data: studentdata, error: studenterror } = await supabase
                .from('studenttable')
                .select('*')
                .not('studentid', 'in', `(${enrolledStudentIds.join(",")})`);

            if (studentdata) {
                setStudents(studentdata);
            } else if (studenterror) {
                console.error("Error fetching students:", studenterror);
            }
        };
        fetchStudents();

        // Fetch courses data
        const fetchCourses = async () => {
            const supabase = createClientComponentClient();
            const { data: courseData, error: courseError } = await supabase
                .from('coursetable')
                .select('*');

            if (courseData) {
                setCourses(courseData);
            } else if (courseError) {
                console.error("Error fetching courses:", courseError);
            }
        };

        fetchCourses();

    }, [slug]);  // Depend on slug so this effect runs whenever slug changes




    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Check if the input field is "examyear", and if so, convert it to a number
        const updatedValue = name === "examyear" || name === "studentid" || name === "courseid" ? parseInt(value, 10) : value;

        setFormData((prevData) => ({
            ...prevData,
            [name]: updatedValue
        }));
    };

    // create the router hook to trigger a page refresh
    const router = useRouter()

    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        console.log(formData);

        // Create a Supabase client configured to use cookies
        const supabase = createClientComponentClient()

        // carry out the update of the database table from the form data
        const { data: enrollmentdata, error: enrollmenterror } = await supabase
            .from('enrollmenttable')
            .insert([
                { studentid: formData.studentid, classid: `${decodeURIComponent(slug)}`, courseid: formData.courseid, examyear: formData.examyear, startdate: `${formData.startdate}`, offroll: `false` },
            ])
            .select()

        if (enrollmentdata) {
            console.log(enrollmentdata)

            // Reset formData to initial values after successful submission
            setFormData({
                studentid: '',
                examyear: 2024,
                startdate: getMostRecentSeptemberFirst(),
                offroll: 'No',
                courseid: ''
            });
        } else {
            console.log("Submission Error:" + JSON.stringify(enrollmenterror, null, 2))
            console.log(formData)
        }
        console.log("submit")

    }

    return (
        <form
            onSubmit={handleFormSubmit}
            className="bg-gray-100 p-8 w-full mb-10"
        >
            <div className="mb-4">
                <label htmlFor="studentid" className="block text-sm font-medium text-gray-700">Student:</label>
                <select
                    id="studentid"
                    name="studentid"
                    value={formData.studentid}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                >
                    <option value="" disabled selected>Select a student</option>  {/* Added this line */}
                    {students.map((student: any) => (
                        <option key={student.studentid} value={student.studentid}>
                            {student.studentid}: {student.firstname} {student.lastname}
                        </option>
                    ))}
                </select>
            </div>


            <div className="mb-4">
                <label htmlFor="examyear" className="block text-sm font-medium text-gray-700">Exam Year:</label>
                <select
                    id="examyear"
                    name="examyear"
                    value={formData.examyear}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="courseid" className="block text-sm font-medium text-gray-700">Course:</label>
                <select
                    id="courseid"
                    name="courseid"
                    value={formData.courseid}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                >
                    <option value="" disabled selected>Select a course</option>
                    {courses.map((course: any) => (
                        <option key={course.courseid} value={course.courseid}>
                            {course.subjectname} {course.level} {course.examboard}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="startdate" className="block text-sm font-medium text-gray-700">Start Date:</label>
                <input
                    type="date"
                    id="startdate"
                    name="startdate"
                    value={formData.startdate}
                    onChange={handleInputChange}
                    required
                    placeholder="DD/MM/YYYY"
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>



            <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Add User
            </button>
        </form>
    )
}