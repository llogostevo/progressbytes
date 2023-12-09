'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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

export default function GradeActivity({ course }: GradeActivityProps) {
    const ITEMS_PER_PAGE = 5;

    const [grades, setGrades] = useState<GradeItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [targetGrades, setTargetGrades] = useState<string[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);


    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    // Define the specific order for GCSE and A-Level grades
    const orderForGCSE = ['9', '8', '7', '6', '5', '4', '3', '2', '1'];
    const orderForALevel = ['A*', 'A', 'B', 'C', 'D', 'E'];


    const sortGrades = (grades: Set<string>, order: string[]) => {
        const gradesArray = Array.from(grades);
        console.log("Grades Array:", gradesArray);

        return gradesArray.sort((a, b) => {
            const indexA = order.indexOf(a);
            const indexB = order.indexOf(b);
            console.log(`Comparing ${a} (${indexA}) with ${b} (${indexB})`);

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



    useEffect(() => {


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

                console.log("Unique Grades before sorting:", Array.from(uniqueGrades));


                const sortedGrades = course === 'GCSE'
                    ? sortGrades(uniqueGrades, orderForGCSE)
                    : sortGrades(uniqueGrades, orderForALevel);

                console.log("sorted grades:", sortedGrades);
                setTargetGrades(sortedGrades);
            }
        };

        fetchTargetGrades();
        const getGrades = async () => {

            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;


            let { data: historicalperformance, error, count } = await supabase
                .from('historicalperformance')
                .select(`
                    mark, 
                    questionmarks,
                    subtopic_title,
                    gcse_target,
                    alevel_target,
                    course_level, 
                    assessment_type, 
                    assessment_date
                `)
                .eq('course_level', course)

            if (historicalperformance) {
                setGrades(historicalperformance);
                setTotalItems(count !== null ? count : 0);
            } else (
                console.log(historicalperformance)
            )

        }

        getGrades()
    }, [supabase, currentPage, course])

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

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg flex flex-col space-y-4">
            <h1 className="text-xl md:text-2xl text-center font-semibold mb-2">{course} Performance</h1>

            <button
                onClick={toggleAssessmentTypeFilter}
                className={`px-2 py-1 text-xs rounded cursor-pointer ${filterAssessmentType ? 'bg-primaryColor text-white' : 'border border-primaryColor hover:bg-secondaryColor hover:text-white text-primaryColor'}`}
            >
                Toggle Exam Assessments
            </button>
            <div>
                TOGGLE DATES
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
