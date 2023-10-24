"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, ChangeEvent } from 'react';

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'

import { useTransition } from "react";

export default function AddSubTopicForm({ slug }: { slug: number; }) {

    const [formData, setFormData] = useState({
        subtopicnumber: '',
        subtopictitle: '',
        subtopicdescription: '',

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
            .from('subtopictable')
            .insert([
                { topicid: `${slug}`, subtopictitle: `${formData.subtopictitle}`, subtopicnumber: `${formData.subtopicnumber}`, subtopicdescription: `${formData.subtopicdescription}`, },
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
                <label htmlFor="topicnumber" className="block text-sm font-medium text-gray-700">SubTopic Number:</label>
                <input
                    type="text"
                    id="subtopicnumber"
                    name="subtopicnumber"
                    value={formData.subtopicnumber}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="subtopictitle" className="block text-sm font-medium text-gray-700">SubTopic Name:</label>
                <input
                    type="text"
                    id="subtopictitle"
                    name="subtopictitle"
                    value={formData.subtopictitle}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="topicdescription" className="block text-sm font-medium text-gray-700">SubTopic Description:</label>
                <input
                    type="text"
                    id="subtopicdescription"
                    name="subtopicdescription"
                    value={formData.subtopicdescription}
                    onChange={handleInputChange}
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
            <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Add Subtopic
            </button>
        </form>
    )
}