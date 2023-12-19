'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';


// Define a type for the grade items
type GradeItem = {
    mark: number;
    questionmarks: number;
    subtopic_title: string;
    assessment_type: string;
    gcse_target?: string;
    alevel_target?: string;
};

// Define a type for the grade items
type HistoricalPerformance = {
    gcse_target?: string;
    alevel_target?: string;
};
// Define the props type for GradeActivity
type GradeActivityProps = {
    course: string;
};

// Define the type for the structure of each subtopic's performance
type SubtopicPerformance = {
    [key: string]: {
        totalMarks: number;
        totalQuestionMarks: number;
    };
};


const TargetGradeCheckbox = ({ grade, onChange, checked }: { grade: string; onChange: any; checked: boolean }) => (
    <label className="inline-flex items-center mt-3">
        <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" checked={checked} onChange={() => onChange(grade)} />
        <span className="ml-2 text-gray-700">{grade}</span>
    </label>
);

// Helper functions to calculate dates
const getPreviousSeptemberStartDate = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let yearOfPreviousSeptember;
    if (currentMonth >= 8) { // September is month 8 (0-indexed)
        yearOfPreviousSeptember = currentYear;
    } else {
        yearOfPreviousSeptember = currentYear - 1;
    }

    return `${yearOfPreviousSeptember}-09-01`;
};


const getLastYearStartDate = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Determine the start year based on the current month
    const startYear = currentMonth >= 8 ? currentYear - 1 : currentYear - 2;

    return `${startYear}-09-01`;
};

const getLastYearEndDate = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Determine the end year based on the current month
    const endYear = currentMonth >= 8 ? currentYear : currentYear - 1;

    return `${endYear}-08-31`;
};

const getThisWeekRange = () => {
    const now = new Date();
    const startDate = startOfWeek(now).toISOString().split('T')[0];
    const endDate = endOfWeek(now).toISOString().split('T')[0];
    return { startDate, endDate };
};

const getThisMonthRange = () => {
    const now = new Date();
    const startDate = startOfMonth(now).toISOString().split('T')[0];
    const endDate = endOfMonth(now).toISOString().split('T')[0];
    return { startDate, endDate };
};


export default function GradeActivity({ course }: GradeActivityProps) {
    const ITEMS_PER_PAGE = 5;

    const [grades, setGrades] = useState<GradeItem[]>([]);

    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [showOnRoll, setShowOnRoll] = useState(true); // State for checkbox

    const [showEnStudents, setShowEnStudents] = useState(false); // State for checkbox

    // const [currentPage, setCurrentPage] = useState(1);
    // const [totalItems, setTotalItems] = useState(0);
    const [targetGrades, setTargetGrades] = useState<string[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

    // Add state for active button and date range
    const [activeButton, setActiveButton] = useState('');

    // Set the default start date to January 1, 2010
    const defaultStartDate = new Date('2020-09-01').toISOString().split('T')[0];
    // Set the default end date to today's date
    const defaultEndDate = new Date().toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);


    const setToday = () => {
        if (activeButton === 'today') {
            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            setActiveButton('');
        } else {
            const today = new Date().toISOString().split('T')[0];
            setStartDate(today);
            setEndDate(today);
            setActiveButton('today');
        }
    };

    const setThisYear = () => {
        if (activeButton === 'thisYear') {
            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            setActiveButton('');
        } else {
            setStartDate(getPreviousSeptemberStartDate());
            setEndDate(new Date().toISOString().split('T')[0]);
            setActiveButton('thisYear');
        }
    };

    const setLastYear = () => {
        if (activeButton === 'lastYear') {
            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            setActiveButton('');
        } else {
            setStartDate(getLastYearStartDate());
            setEndDate(getLastYearEndDate());
            setActiveButton('lastYear');
        }
    };

    const setThisWeek = () => {
        const { startDate, endDate } = getThisWeekRange();
        if (activeButton === 'thisWeek') {
            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            setActiveButton('');
        } else {
            setStartDate(startDate);
            setEndDate(endDate);
            setActiveButton('thisWeek');
        }

    };

    const setThisMonth = () => {
        const { startDate, endDate } = getThisMonthRange();
        if (activeButton === 'thisMonth') {
            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            setActiveButton('');
        } else {
            setStartDate(startDate);
            setEndDate(endDate);
            setActiveButton('thisMonth');
        }
    };

    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    // Define the specific order for GCSE and A-Level grades
    const orderForGCSE = ['9', '8', '7', '6', '5', '4', '3', '2', '1'];
    const orderForALevel = ['A*', 'A', 'B', 'C', 'D', 'E'];


    const sortGrades = (grades: Set<string>, order: string[]) => {
        const gradesArray = Array.from(grades);

        return gradesArray.sort((a, b) => {
            const indexA = order.indexOf(a);
            const indexB = order.indexOf(b);

            if (indexA === -1 && indexB === -1) {
                return 0; // Both grades are not in the order array
            }
            if (indexA === -1) {
                return 1; // Only A is not in the order array, sort B before A
            }
            if (indexB === -1) {
                return -1; // Only B is not in the order array, sort A before B
            }
            return indexA - indexB; // Both grades are in the order array, sort by their order
        });
    };

    // handle the selected classes
    const handleClassCheckboxChange = (classId: string) => {
        setSelectedClasses(prevSelectedClasses =>
            prevSelectedClasses.includes(classId)
                ? prevSelectedClasses.filter(id => id !== classId)
                : [...prevSelectedClasses, classId]
        );
    };

    useEffect(() => {

        const fetchClasses = async () => {
            try {

                let { data: courseData, error: courseError } = await supabase
                    .from('coursetable')
                    .select('courseid')
                    .eq('level', course)

                const courseId = courseData?.[0].courseid;

                // Build a basic query for enrollmenttable
                let classQuery = supabase.from('enrollmenttable')
                    .select('classid')
                    .eq("courseid", courseId)


                // If showing only on-roll students, add the 'offroll' filter
                if (showOnRoll) {
                    classQuery = classQuery.eq('offroll', false);
                }

                // Execute the query
                const { data: classesData, error } = await classQuery;

                if (error) {
                    throw error;
                }

                // Extract distinct class IDs
                const distinctClasses = Array.from(new Set(classesData.map(cls => cls.classid)));
                setClasses(distinctClasses);
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };

        fetchClasses();
        // Function to sort grades based on the predefined order
        const sortGrades = (grades: Set<string>, order: string[]) => {
            return Array.from(grades).sort((a, b) => order.indexOf(a) - order.indexOf(b));
        };

        // Function to extract the relevant target grade based on the course
        const getTargetGrade = (item: HistoricalPerformance, course: string): string | undefined => {
            const targetGrade = course === 'GCSE' ? item.gcse_target : item.alevel_target;
            if (targetGrade === undefined || targetGrade === null) {
                return undefined;
            }
            return targetGrade.toString();
        }


        const fetchTargetGrades = async () => {
            let { data, error } = await supabase
                .from('historicalperformance')
                .select('gcse_target, alevel_target');

            if (data) {
                const uniqueGrades = new Set(
                    data.map(item => getTargetGrade(item, course))
                        .filter(Boolean) as string[]
                );



                const sortedGrades = course === 'GCSE'
                    ? sortGrades(uniqueGrades, orderForGCSE)
                    : sortGrades(uniqueGrades, orderForALevel);

                setTargetGrades(sortedGrades);
            }
        };

        fetchTargetGrades();
        const getGrades = async () => {

            let studentIds: string[] = [];

            // Fetch all student IDs from the enrollmenttable, optionally filtered by classid
            let enrollmentQuery = supabase
                .from('enrollmenttable')
                .select('studentid');

            if (selectedClasses.length > 0) {
                enrollmentQuery = enrollmentQuery.in('classid', selectedClasses);
            }

            let { data: enrolledStudents, error: enrolledError } = await enrollmentQuery;

            if (enrolledError) {
                console.error('Error fetching enrolled students:', enrolledError);
                return;
            }

            studentIds = enrolledStudents ? enrolledStudents.map(student => student.studentid) : [];

            // If showOnRoll is true, further filter the student IDs by on-roll status
            if (showOnRoll) {
                let { data: onRollStudents, error: onRollError } = await supabase
                    .from('enrollmenttable')
                    .select('studentid')
                    .eq('offroll', false)
                    .in('studentid', studentIds); // Filter by already fetched student IDs

                if (onRollError) {
                    console.error('Error fetching on-roll students:', onRollError);
                    return;
                }

                studentIds = onRollStudents ? onRollStudents.map(student => student.studentid) : [];

            }

            // Additional filter based on 'showEnStudents' checkbox
            if (showEnStudents) {
                let { data: enStudents, error: enErrorStudents } = await supabase
                    .from('studenttable')
                    .select('studentid')
                    .eq('en', true)
                    .in('studentid', studentIds); // Filter by already fetched student IDs

                if (enErrorStudents) {
                    console.error('Error fetching en students:', enErrorStudents);
                    return;
                }

                studentIds = enStudents ? enStudents.map(student => student.studentid) : [];
            }




            let { data: historicalperformance, error, count } = await supabase
                .from('historicalperformance')
                .select(`
                    student_id,
                    mark, 
                    questionmarks,
                    subtopic_title,
                    gcse_target,
                    alevel_target,
                    course_level, 
                    assessment_type, 
                    assessment_date
                `)
                .in('student_id', studentIds)
                .eq('course_level', course)
                .gte('assessment_date', startDate) // Greater than or equal to startDate
                .lte('assessment_date', endDate)


            if (historicalperformance) {
                setGrades(historicalperformance);
                // setTotalItems(count !== null ? count : 0);
            } else (
                console.log(error)
            )

        }

        getGrades()
    }, [supabase, course, startDate, endDate, showOnRoll, showEnStudents, selectedClasses])

    // New state for toggling filtered assessments
    const [filterAssessmentType, setFilterAssessmentType] = useState(false);

    // Filter the assessments based on the selected target grades
    // Filter the assessments based on the selected target grades and assessment type
    const filteredAssessments = grades.filter(assessment => {
        // Check if the grade matches the selected target grades
        const targetGradeMatches = course === 'GCSE' ? assessment.gcse_target?.toString() : assessment.alevel_target;
        const isTargetGrade = targetGradeMatches !== undefined && (selectedGrades.length === 0 || selectedGrades.includes(targetGradeMatches));

        // Check if the assessment type should be filtered
        const isExamAssessment = !filterAssessmentType || assessment.assessment_type === "Assessment";

        return isTargetGrade && isExamAssessment;
    });


    // Toggle the state for filterAssessmentType
    const toggleAssessmentTypeFilter = () => {
        setFilterAssessmentType(!filterAssessmentType);
    };

    let percentage = 0;

    if (filteredAssessments && filteredAssessments.length > 0) {
        let totalMarks = 0;
        let totalQuestionMarks = 0;

        filteredAssessments.forEach(item => {
            totalMarks += item.mark;
            totalQuestionMarks += item.questionmarks;

        });

        if (totalQuestionMarks > 0) {
            percentage = (totalMarks / totalQuestionMarks) * 100;
        }

    } else {
        console.log('No data available to calculate percentage');
    }


    // Function to calculate and sort subtopic percentages
    const calculateSubtopicPercentages = () => {
        const subtopicPerformance: SubtopicPerformance = {};

        filteredAssessments.forEach(item => {
            const subtopic = item.subtopic_title;
            if (!subtopicPerformance[subtopic]) {
                subtopicPerformance[subtopic] = { totalMarks: 0, totalQuestionMarks: 0 };
            }
            subtopicPerformance[subtopic].totalMarks += item.mark;
            subtopicPerformance[subtopic].totalQuestionMarks += item.questionmarks;
        });

        const subtopicPercentages = Object.keys(subtopicPerformance).map(subtopic => {
            const { totalMarks, totalQuestionMarks } = subtopicPerformance[subtopic];
            const percentage = totalQuestionMarks > 0 ? (totalMarks / totalQuestionMarks) * 100 : 0;
            return { subtopic, percentage };
        });

        // Sorting by percentage
        subtopicPercentages.sort((a, b) => b.percentage - a.percentage);
        return subtopicPercentages;
    };

    const subtopicPercentages = calculateSubtopicPercentages();
    const top5Subtopics = subtopicPercentages.slice(0, 5);
    const bottom5Subtopics = subtopicPercentages.slice(-5);


    // Handler for checking/unchecking a grade
    const handleGradeSelectionChange = (grade: string) => {
        if (selectedGrades.includes(grade)) {
            setSelectedGrades(selectedGrades.filter(g => g !== grade));
        } else {
            setSelectedGrades([...selectedGrades, grade]);
        }
    };

    const handleDateChange = () => {
        setActiveButton('');
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg flex flex-col space-y-4">
            <h1 className="text-xl md:text-2xl text-center font-semibold mb-2">{course} Performance</h1>

            <button
                onClick={toggleAssessmentTypeFilter}
                className={`px-2 py-1 text-xs rounded cursor-pointer ${filterAssessmentType ? 'bg-primaryColor text-white' : 'border border-primaryColor hover:bg-secondaryColor hover:text-white text-primaryColor'}`}
            >
                Toggle Exam Assessments
            </button>
            <div className="my-2 md:my-4 border p-4 rounded-lg">
                <div className="flex flex-row flex-wrap gap-4 items-center mt-4">
                    {/* Buttons */}
                    <button onClick={setToday} className={`px-2 py-1 text-xs rounded cursor-pointer ${activeButton === 'today' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}`}>Today</button>
                    <button onClick={setThisYear} className={`px-2 py-1 text-xs rounded cursor-pointer ${activeButton === 'thisYear' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}`}>This Year</button>
                    <button onClick={setLastYear} className={`px-2 py-1 text-xs rounded cursor-pointer ${activeButton === 'lastYear' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}`}>Last Year</button>
                    <button onClick={setThisWeek} className={`px-2 py-1 text-xs rounded cursor-pointer ${activeButton === 'thisWeek' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}`}>This Week</button>
                    <button onClick={setThisMonth} className={`px-2 py-1 text-xs rounded cursor-pointer ${activeButton === 'thisMonth' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}`}>This Month</button>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
                    {/* Date inputs */}
                    <input type="date" id="startDate" name="startDate" value={startDate} onChange={(e) => { setStartDate(e.target.value); handleDateChange(); }} className="form-input border rounded-md shadow-sm mt-1 w-full" />
                    <input type="date" id="endDate" name="endDate" value={endDate} onChange={(e) => { setEndDate(e.target.value); handleDateChange(); }} className="form-input border rounded-md shadow-sm mt-1 w-full" />
                </div>
            </div>
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    checked={showOnRoll}
                    onChange={(e) => setShowOnRoll(e.target.checked)}
                    className="mr-2"
                />
                <label>Show Only On Roll Students</label>
            </div>
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    checked={showEnStudents}
                    onChange={(e) => setShowEnStudents(e.target.checked)}
                    className="mr-2"
                />
                <label>Show Only Ed Need Students</label>
            </div>
            <div className="flex flex-col mb-4">
                {classes.map((classId, idx) => (
                    <label key={idx} className="flex items-center mb-1">
                        <input
                            type="checkbox"
                            checked={selectedClasses.includes(classId)}
                            onChange={() => handleClassCheckboxChange(classId)}
                            className="mr-2"
                        />
                        <Link href={`../bytemark/staff/learningchecklist/${classId}`}>{classId}</Link>
                    </label>
                ))}
            </div>
            <div>
                <h1>Filter Target:</h1>
                <div className="flex flex-wrap gap-2">
                    {targetGrades.map((grade, index) => (
                        <TargetGradeCheckbox
                            key={index}
                            grade={grade}
                            checked={selectedGrades.includes(grade)}
                            onChange={handleGradeSelectionChange}
                        />
                    ))}
                </div>
            </div>
            <p className="text-4xl md:text-6xl font-bold text-center">{`${percentage.toFixed(2)}%`}</p>

            <div className="flex flex-col space-y-2">
                <h2 className="text-lg font-semibold">Top 5 Subtopics</h2>
                {top5Subtopics.map((subtopic, index) => (
                    <div className="text-[13px] text-gray-500 py-3" key={index}>
                        {subtopic.subtopic} - <span className=' text-green-600'>{subtopic.percentage.toFixed(2)}%</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col space-y-2">
                <h2 className="text-lg font-semibold">Bottom 5 Subtopics</h2>
                {bottom5Subtopics.map((subtopic, index) => (
                    <div className="text-[13px] text-gray-500 py-3" key={index}>
                        {subtopic.subtopic} - <span className=' text-red-700'>{subtopic.percentage.toFixed(2)}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
