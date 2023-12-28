"use client";
import { useState, ChangeEvent } from 'react';

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'


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

    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        console.log(formData);


        const response = await fetch(`/api/createSchoolUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, schoolid: slug }),
        })

        const data = await response.json()

        if (response.ok) {
            console.log(data.user)
            console.log("response good")

        } else {
            console.error(data.error)
            console.log("response error")

        }

    }

    return (
        <form
            onSubmit={handleFormSubmit}
            className="bg-gray-100 p-8 w-full mb-10"
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
                <div className="mt-1">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            id="student"
                            name="type"
                            value="Student"
                            checked={formData.type === 'Student'}
                            onChange={handleInputChange}
                            required
                            className="form-radio"
                        />
                        <span className="ml-2">Student</span>
                    </label>
                    <label className="inline-flex items-center ml-4">
                        <input
                            type="radio"
                            id="teacher"
                            name="type"
                            value="Teacher"
                            checked={formData.type === 'Teacher'}
                            onChange={handleInputChange}
                            required
                            className="form-radio"
                        />
                        <span className="ml-2">Teacher</span>
                    </label>
                    <label className="inline-flex items-center ml-4">
                        <input
                            type="radio"
                            id="admin"
                            name="type"
                            value="Admin"
                            checked={formData.type === 'School Admin'}
                            onChange={handleInputChange}
                            required
                            className="form-radio"
                        />
                        <span className="ml-2">School Admin</span>
                    </label>
                    <label className="inline-flex items-center ml-4">
                        <input
                            type="radio"
                            id="admin"
                            name="type"
                            value="Admin"
                            checked={formData.type === 'Super Admin'}
                            onChange={handleInputChange}
                            required
                            className="form-radio"
                        />
                        <span className="ml-2">Super Admin</span>
                    </label>

                    {/* Conditionally render GCSE and A-level fields when "Student" is selected */}
                    {formData.type === 'Student' && (
                        <div className="mt-4 p-4 border rounded-md">
                            <h4 className="mb-2 font-semibold text-gray-800">Student Target Details:</h4>
                            <div className="mb-4">
                                <label htmlFor="gcseTarget" className="block text-sm font-medium text-gray-700">GCSE Target Grade:</label>
                                <select
                                    id="gcseTarget"
                                    name="gcseTarget"
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 w-full border rounded-md"
                                >
                                    <option value="">Select Grade</option>
                                    {[...Array(9)].reverse().map((_, idx) => (
                                        <option key={idx} value={9 - idx}>{9 - idx}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="aLevelTarget" className="block text-sm font-medium text-gray-700">A-level Target Grade:</label>
                                <select
                                    id="aLevelTarget"
                                    name="aLevelTarget"
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 w-full border rounded-md"
                                >
                                    <option value="">Select Grade</option>
                                    {['A*', 'A', 'B', 'C', 'D', 'E'].map(grade => (
                                        <option key={grade} value={grade}>{grade}</option>
                                    ))}
                                </select>
                            </div>
                            {/* NEW DROP DOWN FOR SEN */}
                            <div className="mb-4">
                                <label htmlFor="sen" className="block text-sm font-medium text-gray-700">Educational Need:</label>
                                <select
                                    id="sen"
                                    name="sen"
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 w-full border rounded-md"
                                >
                                    <option value="">Educational Need</option>
                                    {["TRUE", "FALSE"].map(sen => (
                                        <option key={sen} value={sen}>{sen}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="assessmentStatus" className="block text-sm font-medium text-gray-700">Assessment Creation Access</label>
                                <select
                                    id="assessmentStatus"
                                    name="assessmentStatus"
                                    onChange={handleInputChange}
                                    className="mt-1 p-2 w-full border rounded-md"
                                >
                                    <option value="">Allow Student to Create Assessments</option>
                                    {["TRUE", "FALSE"].map(assessmentStatus => (
                                        <option key={assessmentStatus} value={assessmentStatus}>{assessmentStatus}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}


                </div>
            </div>


            <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Add User
            </button>
        </form>
    )
}