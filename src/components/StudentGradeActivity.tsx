'use client'

// ISSUE WITH USE EFFECT AND REPEATED CALL


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

type Units = {
    unitid: number;
    unittitle: string;
    unitnumber: string;

};

// Define a type for the grade items
type HistoricalPerformance = {
    gcse_target?: string;
    alevel_target?: string;
};
// Define the props type for GradeActivity
type GradeActivityProps = {
    course: string;
    studentId: number;
};

// Define the type for the structure of each subtopic's performance
type SubtopicPerformance = {
    [key: string]: {
        totalMarks: number;
        totalQuestionMarks: number;
    };
};

interface CourseData {
    courseid: string;
    subjectname: string;
    level: string;
    examboard: string;
}


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

function extractUniqueCourseIds(coursesData: CourseData[]): (string)[] {
    // Create a new Set to store unique course IDs
    const uniqueCourseIds = new Set<string>();

    for (const course of coursesData) {
        uniqueCourseIds.add(course.courseid);
    }

    return Array.from(uniqueCourseIds);
}

export default function StudentGradeActivity({ studentId }: { studentId: number }) {
    // ################ REACT STATES ################ 

    const [grades, setGrades] = useState<GradeItem[]>([]);
    const [units, setUnits] = useState<Units[]>([]);
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]); // State to manage selected units

    const [courses, setCourses] = useState<CourseData[]>([]); // State to store courses
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]); // State to manage selected courses

    // Add state for active button and date range
    const [activeButton, setActiveButton] = useState('');

    // state for sorting the data 
    const [sortingMethod, setSortingMethod] = useState('percentage'); // default to sorting by percentage
    const [sliderValue, setSliderValue] = useState(0);


    // ################ Helper functions ################ 
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

    // ################ end helper ################

    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    const fetchGradesForSelectedCourses = async (courseIds: string[]) => {

        // Clear grades if no courses are selected
        if (courseIds.length === 0) {
            setGrades([]);
            return;
        }

        try {
            let { data: gradesData, error: gradesError } = await supabase
                .from('historicalperformance')
                .select('*')
                .eq('student_id', studentId)
                .in('course_id', courseIds)
                .gte('assessment_date', startDate)
                .lte('assessment_date', endDate)
                .in('unit_id', selectedUnitIds)

            if (gradesError) {
                console.error('Error fetching grades:', gradesError);
                return;
            }

            setGrades(gradesData || []);
        } catch (error) {
            console.error('Error fetching grades for selected courses:', error);
        }
    };


    const fetchCourseIds = async (): Promise<{ courseid: any; }[]> => {
        try {
            let { data: enrollmentData, error: enrollmentError } = await supabase
                .from('enrollmenttable')
                .select('courseid, offroll')
                .eq('studentid', studentId)
                .eq('offroll', false);

            if (enrollmentError) {
                console.error('Error fetching enrollment data:', enrollmentError);
                return []; // Return an empty array in case of error
            }

            if (enrollmentData && enrollmentData.length > 0) {
                setSelectedCourseIds([enrollmentData[0].courseid])
            } else {
                setSelectedCourseIds([])
            }


            // Ensure that the function returns an array even if enrollmentData is undefined
            return enrollmentData?.map(enrollment => enrollment.courseid) || [];
        } catch (error) {
            console.error('Error in fetchCourseIds:', error);
            return []; // Return an empty array in case of error
        }
    };

    const fetchCourses = async () => {
        const courseIds = await fetchCourseIds(); // Get the course IDs from step 1

        if (courseIds.length === 0) {
            setCourses([]); // Set to empty array if no course IDs
            setSelectedCourseIds([]); // Clear any selections
            return;
        }

        let { data: coursesData, error: coursesError } = await supabase
            .from('coursetable')
            .select('courseid, subjectname, level, examboard')
            .in('courseid', courseIds); // Fetch courses where courseid is in the array of IDs

        if (coursesError) {
            console.error('Error fetching courses:', coursesError);
            return;
        }

        setCourses(coursesData || []);
    };

    const fetchUnits = async () => {
        const courseIds = selectedCourseIds // Get the course IDs from the selectedCourses

        if (courseIds.length === 0) {
            setUnits([]); // Set to empty array if no course IDs
            setSelectedUnitIds([]); // Clear any selections
            return;
        }

        let { data: unitData, error: unitDataError } = await supabase
            .from('unittable')
            .select('unitid, unitnumber, unittitle')
            .in('courseid', courseIds); // Fetch units where courseid is in the array of IDs

        if (unitData) {
            console.log(unitData)
        } else if (unitDataError) {
            console.error('Error fetching courses:', unitDataError);
            return;
        }

        setUnits(unitData || []);

    };

    /* 
        multiple use effects required
        fetchcourses updates selectedCourseIds which is based on the fetched courses
        fetchgradesforselectedcourses depends on the selectedcourseids
        when this updates it triggers the useeffect again due to selected courseids being a dependency
        if they were in one useeffect it would result in a cyclic response which would halt the site functionality
        i.e fetchcourses -> update sleected courses -> fetch grades -> update courses based on new grades -> and so on
        seperating the two allows each one to manage its own concerns
    */
    useEffect(() => {
        fetchCourses();
    }, [studentId, startDate, endDate]); // Dependencies for fetching courses

    useEffect(() => {
        fetchGradesForSelectedCourses(selectedCourseIds); // Fetch and set the grade data for selected courses
    }, [selectedCourseIds, selectedUnitIds]); // Dependency on selectedCourseIds

    useEffect(() => {
        fetchUnits(); // Fetch and set the list of courses
    }, [selectedCourseIds]); // Dependencies for fetching courses

    useEffect(() => {
        const allUnitIds = units.map(unit => unit.unitid);
        setSelectedUnitIds(allUnitIds);
    }, [units]); // Re-run this effect if the units array changes

    // New state for toggling filtered assessments
    const [filterAssessmentType, setFilterAssessmentType] = useState(false);

    // Filter the assessments based on an "assessment" type, showing only the exam assemssents
    const filteredAssessments = grades.filter(assessment => {
        const isExamAssessment = !filterAssessmentType || assessment.assessment_type === "Assessment";
        return isExamAssessment;
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
            return { subtopic, percentage, totalMarks, totalQuestionMarks };
        });

        subtopicPercentages.sort((a, b) => {
            if (b.percentage === a.percentage) {
                return b.totalQuestionMarks - a.totalQuestionMarks; // Secondary sort by total marks tested if percentages are equal
            }
            return b.percentage - a.percentage; // Primary sort by percentage
        });

        return subtopicPercentages;
    };




    const subtopicPercentages = calculateSubtopicPercentages();
    const maxTotalMarks = Math.max(...subtopicPercentages.map(subtopic => subtopic.totalQuestionMarks));
    const filteredSubtopics = subtopicPercentages.filter(subtopic => subtopic.totalQuestionMarks >= sliderValue);

    const top5Subtopics = filteredSubtopics.slice(0, 5);
    const bottom5Subtopics = filteredSubtopics.slice(-5);


    const handleUnitCheckboxChange = (unitId: number, checked: boolean) => {
        setSelectedUnitIds(prevIds => {
            if (checked) {
                // Add unitId if checked
                return [...prevIds, unitId];
            } else {
                // Prevent unchecking if it's the last checked checkbox
                if (prevIds.length === 1) {
                    return prevIds;
                }
                // Remove unitId if unchecked
                return prevIds.filter(id => id !== unitId);
            }
        });
    };


    const handleCourseSelectionChange = (courseId: string) => {
        // If courseId is an empty string (the "Select a course" option), clear the selection
        if (!courseId) {
            setSelectedCourseIds([]);
        } else {
            setSelectedCourseIds([courseId]);
        }
    };

    const handleDateChange = () => {
        setActiveButton('');
    };

    return (

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg flex flex-col space-y-4">
            {/* <div className="text-4xl md:text-6xl font-bold text-center">{`${}`}</div> */}

            <div className="text-4xl my-10 md:text-6xl font-bold text-center">{`${percentage.toFixed(2)}%`}</div>

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


                {/* Course selection details */}
                <div className='mt-10'>
                    <select
                        id="courseSelect"
                        className="form-select block w-full p-2 border rounded"
                        value={selectedCourseIds[0] || ""}
                        onChange={e => handleCourseSelectionChange(e.target.value)}
                    >
                        <option value="">Select a course</option>
                        {courses.map((course, idx) => (
                            <option key={idx} value={course.courseid}>
                                {course.level} {course.subjectname} - {course.examboard}
                            </option>
                        ))}
                    </select>

                    <div className="ml-10 mt-4 flex flex-col mb-4">
                        {units.map((unit, idx) => (
                            <label key={idx} className="flex items-center mb-1">
                                <input
                                    type="checkbox"
                                    checked={selectedUnitIds.includes(unit.unitid)}
                                    onChange={e => handleUnitCheckboxChange(unit.unitid, e.target.checked)}
                                    className={`mr-2 ${selectedUnitIds.length === 1 && selectedUnitIds.includes(unit.unitid) ? 'bg-gray-400 border-gray-400' : 'bg-blue-600 border-blue-600'}`}
                                    // Disable the checkbox if it's the last one checked
                                    disabled={selectedUnitIds.length === 1 && selectedUnitIds.includes(unit.unitid)}
                                />
                                <Link href={`../learningchecklist/student/${unit.unitid}`}>{unit.unitnumber} - {unit.unittitle}</Link>

                            </label>
                        ))}
                    </div>
                </div>
            </div>


            <div className="flex flex-col space-y-2">

                <h2 className="text-2xl font-semibold my-10">Subtopic KPI's</h2>
                <div className="mx-5">
                    <div className="mb-5 bg-gray-300 rounded-lg p-5">
                        <div className="flex flex-col space-y-4">
                            <label htmlFor="totalMarksSlider" className=" ">Adjust Minimum Assessed Marks Threshold: <span className="bg-gray-200 rounded-lg p-2">{sliderValue}</span></label>
                            <input
                                type="range"
                                id="totalMarksSlider"
                                className="slider h-2 flex-1 rounded-lg appearance-none cursor-pointer bg-gray-400"
                                min="0"
                                max={maxTotalMarks}
                                value={sliderValue}
                                onChange={(e) => setSliderValue(Number(e.target.value))}
                            />
                            <div className="flex">
                                <div className="flex-1">0</div>
                                <div className="flex-1 text-center">{Math.floor(maxTotalMarks / 2)}</div>
                                <div className="flex-1 text-right">{maxTotalMarks}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <h2 className="text-lg font-semibold">Top 5 Subtopics</h2>
                        {top5Subtopics.map((subtopic, index) => (
                            <div className="text-[13px] text-gray-500 py-3" key={index}>
                                {subtopic.subtopic} - <span className=' text-green-600'>{subtopic.percentage.toFixed(2)}% ({subtopic.totalMarks} / {subtopic.totalQuestionMarks})</span>
                            </div>
                        ))}
                    </div>



                    <div className="flex flex-col space-y-2">
                        <h2 className="text-lg font-semibold">Bottom 5 Subtopics</h2>
                        {bottom5Subtopics.map((subtopic, index) => (
                            <div className="text-[13px] text-gray-500 py-3" key={index}>
                                {subtopic.subtopic} - <span className=' text-red-700'>{subtopic.percentage.toFixed(2)}% ({subtopic.totalMarks} / {subtopic.totalQuestionMarks})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div >
    )
}
