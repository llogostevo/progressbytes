'use client'
// FileUploadComponent.js
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Answer {
    answerid: number;
    questionid: number;
    studentid: number;
    mark: number;
}
interface Student {
    studentid: number;
    firstname: string;
    lastname: string;
}

interface Answer {
    answerid: number;
    questionid: number;
    studentid: number;
    mark: number;
    studenttable: Student;
}

interface Question {
    questionid: number;
    questionnumber: string;
    questionorder: number;
    noofmarks: number;
    answertable: Answer[];
}

interface AssessmentCSVItem {
    assessmentid: number;
    questiontable: Question[];
}


interface FileUploadComponentProps {
    assessmentCSV: AssessmentCSVItem[] | null;
}


type CSVRow = string[];


const convertToCSV = (data: CSVRow[]): string => {
    return Papa.unparse(data, {
        header: false // Set header to false as data is array of arrays
    });
};


const downloadCSV = (csvString: string, filename: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
};




const FileUploadComponent = ({ assessmentCSV }: FileUploadComponentProps) => {


    const questionNumberToDetailsMap = new Map();
    assessmentCSV?.[0].questiontable.forEach(question => {
        questionNumberToDetailsMap.set(question.questionnumber, {
            questionId: question.questionid,
            noOfMarks: question.noofmarks
        });
    });



    const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
    // const [isLoading, setIsLoading] = useState(false);
    const supabase = createClientComponentClient();

    const [submissionMessage, setSubmissionMessage] = useState({ text: "", type: "" });
    const [uploadErrors, setUploadErrors] = useState<string[]>([]);


    useEffect(() => {
        const updateDatabase = async () => {
            if (parsedData.length > 0) {
                // setIsLoading(true);
                setSubmissionMessage({ text: "Updating...", type: "info" }); // Informational message

                try {
                    // to track errors in uploads
                    let errorsOccurred = false;
                    const tempUploadErrors = [];

                    // start the check of data for upload process
                    for (const row of parsedData) {
                        // Iterate over each question mark starting from the 4th position
                        for (const [key, value] of Object.entries(row)) {
                            // Skip non-question keys
                            if (key === 'studentid' || key === 'firstname' || key === 'lastname') {
                                continue;
                            }
                            // key is questionnumber e.g. '1i', '1ii', etc., and value is the mark
                            const questionNumber = key;
                            const mark = parseInt(value, 10); // Assuming marks are integers
                            const questionDetails = questionNumberToDetailsMap.get(questionNumber);
                            console.log("question details", questionDetails)

                            if (questionDetails && !isNaN(mark) && (mark >= 0 && mark <= questionDetails.noOfMarks)) {
                                // Now find the answer entry that matches the questionId and studentId
                                console.log("in here")
                                const answerEntry = assessmentCSV?.[0].questiontable
                                    .flatMap(qt => qt.answertable)
                                    .find(ans => ans.questionid === questionDetails.questionId && ans.studentid === parseInt(row.studentid, 10));

                                if (answerEntry) {
                                    // Perform the update
                                    const { data, error } = await supabase
                                        .from('answertable')
                                        .update({ mark })
                                        .eq('answerid', answerEntry.answerid)
                                        .select();

                                    if (error) {
                                        errorsOccurred = true;
                                        // Construct an error message string
                                        const errorMessage = `Student ${row.firstname} ${row.lastname}, Question: ${questionNumber}, Reason: ${error.message}`;
                                        // Push the error message to the temporary array
                                        tempUploadErrors.push(errorMessage);
                                    }
                                }

                            } else if (isNaN(mark)) {
                                errorsOccurred = true;
                                const errorMessage = `Student ${row.firstname} ${row.lastname}, Question: ${questionNumber}, Reason: Invalid Mark Type`;
                                tempUploadErrors.push(errorMessage);
                            } else if (mark <= 0 || mark >= questionDetails.noOfMarks) {
                                errorsOccurred = true;
                                const errorMessage = `Student ${row.firstname} ${row.lastname}, Question: ${questionNumber}, Reason: Mark out of Range`;
                                tempUploadErrors.push(errorMessage);
                            }

                        }
                    }
                    if (errorsOccurred) {
                        // Set the state with all accumulated errors
                        setUploadErrors(tempUploadErrors);
                        console.log(uploadErrors)
                        // You could also set a submission message here if needed
                        setSubmissionMessage({ text: "Errors occurred during upload.", type: "error" });
                    } else {
                        // Set a successful submission message if no errors occurred
                        setSubmissionMessage({ text: "All data uploaded successfully.", type: "success" });
                    }
                } catch (err) {
                    setSubmissionMessage({ text: "An error occurred. Please try again.", type: "error" });
                } finally {
                    // can be used for a loading action or message
                    // setIsLoading(false);                
                }
            }
        };

        updateDatabase();
    }, [parsedData]);



    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSubmissionMessage({ text: "", type: "" });
            setUploadErrors([]);

            const file = event.target.files[0];
            Papa.parse(file, {
                complete: (result) => {
                    const parsedCsvData = result.data as Record<string, any>[];
                    console.log("Parsed Data:", parsedCsvData);
                    setParsedData(parsedCsvData);
                },
                header: true,
            });
        }
    };


    // TO CREATE AND download the CSV template

    const createCSVData = (assessmentData: AssessmentCSVItem[]): CSVRow[] => {
        const sortedQuestions = assessmentData[0].questiontable.sort((a, b) => a.questionorder - b.questionorder);
        const questionNumbers = sortedQuestions.map(question => `${question.questionnumber}`);


        const questionOrderToIndexMap = new Map(sortedQuestions.map((question, index) => [question.questionorder, index]));


        const csvData = [['studentid', 'firstname', 'lastname', ...questionNumbers]];
        const studentDataMap = new Map();


        assessmentData.forEach(item => {
            item.questiontable.forEach(question => {
                question.answertable.forEach(answer => {
                    if (!studentDataMap.has(answer.studentid)) {
                        studentDataMap.set(answer.studentid, {
                            studentid: answer.studenttable.studentid,
                            firstname: answer.studenttable.firstname,
                            lastname: answer.studenttable.lastname,
                            marks: Array(questionNumbers.length).fill(null)
                        });
                    }
                    const studentData = studentDataMap.get(answer.studentid);
                    const questionIndex = questionOrderToIndexMap.get(question.questionorder);
                    if (questionIndex !== undefined) { // Check to make sure questionIndex is not undefined
                        studentData.marks[questionIndex] = answer.mark;
                    }
                });
            });
        });


        studentDataMap.forEach((data) => {
            csvData.push([data.studentid, data.firstname, data.lastname, ...data.marks]);
        });


        return csvData;
    };

    const handleDownloadCSV = () => {
        if (assessmentCSV) {
            const csvData = createCSVData(assessmentCSV);
            const csvString = convertToCSV(csvData);
            downloadCSV(csvString, 'assessment-data.csv');
        } else {
            setSubmissionMessage({ text: "An error occurred. Please try again.", type: "error" });
        }
    };

    return (
        <>
            <p>Upload File Results</p>
            <input className="my-5" type="file" accept=".csv" onChange={handleFileUpload} />
            <button onClick={handleDownloadCSV}>Download CSV Template</button>

            {/* Submission message with conditional styling */}
            {submissionMessage.text && (
                <p className={`text-center my-4 border p-3 
                ${submissionMessage.type === 'error' ? 'bg-red-500 text-white' :
                        submissionMessage.type === 'success' ? 'bg-green-500 text-white' :
                            submissionMessage.type === 'info' ? 'bg-blue-500 text-white' : ''} 
                transition-opacity ease-in-out delay-150
                ${submissionMessage.text ? 'opacity-100' : 'opacity-0'} 
                rounded-md`}
                >
                    {submissionMessage.text}
                </p>
            )}

            {/* Display upload errors */}
            {uploadErrors.length > 0 && (
                <div className="my-4 p-3 bg-red-500 text-white rounded-md">
                    <p>Some uploads failed:</p>
                    <ul>
                        {uploadErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

<p>
                {JSON.stringify(assessmentCSV)
                    .split('[')
                    .join('[\n')}
            </p>   

        </>
    )
};


export default FileUploadComponent;




