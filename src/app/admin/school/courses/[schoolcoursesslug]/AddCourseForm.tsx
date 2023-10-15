"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, ChangeEvent } from 'react';

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'

import { useTransition } from "react";

export default function CommentForm({ slug }: { slug: string; }) {

    const [formData, setFormData] = useState({
        level: 'GCSE',
        courseName: '',
        examBoard: 'OCR'
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // create the router hook to trigger a page refresh
    const router = useRouter()


    // async function to handle the form submission
    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        // prevent refresh of the page on submit
        event.preventDefault();

        // Create a Supabase client configured to use cookies
        const supabase = createClientComponentClient()

        // carry out the update of the database table from the form data
        const { data, error } = await supabase
            .from('coursetable')
            .insert([
                { schoolid: `${slug}`, level: `${formData.level}`, examboard: `${formData.examBoard}`, subjectname: `${formData.courseName}`, },
            ])
            .select()

        if (data) {
            console.log(data)
        } else {
            console.log(error)
            console.log(formData)
        }
        console.log("submit")
    }


    return (
        <form
            onSubmit={handleFormSubmit}
            className="bg-gray-100 p-8 w-full"
        >
            <div className="mb-4">
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">Level:</label>
                <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="mt-1 p-2 w-full border rounded-md"
                >
                    <option value="GCSE">GCSE</option>
                    <option value="A Level">A Level</option>
                    <option value="L2 Voc">L2 Vocational</option>
                    <option value="L3 Voc">L3 Vocational</option>
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="examBoard" className="block text-sm font-medium text-gray-700">Exam Board:</label>
                <select
                    id="examBoard"
                    name="examBoard"
                    value={formData.examBoard}
                    onChange={handleInputChange}
                    className="mt-1 p-2 w-full border rounded-md"
                >
                    <option value="OCR">OCR</option>
                    <option value="Pearsons">Pearsons</option>
                    <option value="AQA">AQA</option>
                    <option value="WJEC">WJEC</option>
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">Course Name:</label>
                <input
                    type="text"
                    id="courseName"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
            
            <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Add Course
            </button>
        </form>
    )
}