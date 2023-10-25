"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, ChangeEvent } from 'react';

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'
import createSchoolUser from "./createSchoolUser";


export default function AddUserForm({ slug }: { slug: number; }) {

    const [formData, setFormData] = useState({
        userEmail: '',
        password: 'password',
        type: '',
        firstname: '',
        lastname: '',
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

        event.preventDefault();
        // const supabase = createClientComponentClient()


        // // THIS WAS THE METHOD USED USING AN API ROUTE< IT DOESNT WORK!!!! NEED MORE RESEARCH
        // const response = await fetch('./createUser', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(formData),
        // });


        // // Check if the response status is not OK
        // if (!response.ok) {
        //     console.error('Network response was not ok', response);
        //     return;
        // }

        // const data = await response.json();

        // if (data.error) {
        //     console.error("error");
        //     console.error(data.error);
        // } else {
        //     console.log(data.user);
        // }
    // }

    // THIS WAS TRYING TO DO IT CLIENT SIDE BUT THERE IS AN ERROR BASED ON ADMIN TOKEN
        // const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        //     email: `${formData.userEmail}`,
        //     password: `${formData.password}`,
        //     user_metadata: { 
        //         schoolid: slug, 
        //         firstname: `${formData.firstname}`, 
        //         lastname:`${formData.lastname}`,
        //         type: `${formData.type}`
        //     }, 
        //     email_confirm: true
        // })


        // if (userData) {
        //     console.log(userData)
        // } else {
        //     console.log(userError)
        //     console.log(formData)
        // }
        // console.log("submit")
        createSchoolUser(formData, slug)
    }


    return (
        <form
            onSubmit={handleFormSubmit}
            className="bg-gray-100 p-8 w-full"
        >
            <div className="mb-4">
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">User Email:</label>
                <input
                    type="text"
                    id="userEmail"
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">User Password:</label>
                <input
                    type="text"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">First Name:</label>
                <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Last Name:</label>
                <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type:</label>
                <input
                    type="text"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>

            <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Add User
            </button>
        </form>
    )
}