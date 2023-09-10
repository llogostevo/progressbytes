"use client";
import { Profiles } from "@/lib/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ChangeEvent, useEffect, useState, useTransition } from "react";

export default function UpdateProfileDetails() {

    function handleFormSubmit() {
        console.log("submit clicked")
        
        // fetch the user data

        // fetch the profile data

        // populate the form with the matching profile data

        // function to handle update of data

    }
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
            <div className="max-w-lg mx-auto mt-8">
                <form onSubmit={handleFormSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                            First Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="firstName"
                            type="text"
                            placeholder="First Name"
                            name="firstName" />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="secondName">
                            Last Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="secondName"
                            type="text"
                            placeholder="Last Name"
                            name="secondName" />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="school">
                            School
                        </label>
                        <div className="relative">

                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="school"
                                type="text"
                                placeholder="Central Foundation Boys School"
                                name="school"
                                disabled />
                            <div className="absolute top-0 left-0 mt-0 p-3 pr-28 bg-gray-100 text-gray-500 text-xs rounded opacity-0 transition-opacity duration-300 ease-in-out tooltip">
                                To edit contact your administrator.
                            </div>
                        </div>

                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <div className="relative">

                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="email"
                                type="text"
                                placeholder="Central Foundation Boys School"
                                name="email"
                                disabled />
                            <div className="absolute top-0 left-0 mt-0 p-3 pr-28 bg-gray-100 text-gray-500 text-xs rounded opacity-0 transition-opacity duration-300 ease-in-out tooltip">
                                To edit contact your administrator.
                            </div>
                        </div>
                    </div>



                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>


        </div>
    )
}
