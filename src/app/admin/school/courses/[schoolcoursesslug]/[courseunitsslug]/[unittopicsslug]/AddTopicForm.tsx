"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, ChangeEvent } from 'react';

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'

import { useTransition } from "react";

export default function AddTopicForm({ slug }: { slug: number; }) {

    const [formData, setFormData] = useState({
        topicnumber: '',
        topictitle: '',
        topicdescription: '',

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
            .from('topictable')
            .insert([
                { unitid: `${slug}`, topictitle: `${formData.topictitle}`, topicnumber: `${formData.topicnumber}`, topicdescription: `${formData.topicdescription}`, },
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
                <label htmlFor="topicnumber" className="block text-sm font-medium text-gray-700">Topic Number:</label>
                <input
                    type="text"
                    id="topicnumber"
                    name="topicnumber"
                    value={formData.topicnumber}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="topictitle" className="block text-sm font-medium text-gray-700">Topic Name:</label>
                <input
                    type="text"
                    id="topictitle"
                    name="topictitle"
                    value={formData.topictitle}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="topicdescription" className="block text-sm font-medium text-gray-700">Topic Description:</label>
                <input
                    type="text"
                    id="topicdescription"
                    name="topicdescription"
                    value={formData.topicdescription}
                    onChange={handleInputChange}
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
            <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Add Unit
            </button>
        </form>
    )
}