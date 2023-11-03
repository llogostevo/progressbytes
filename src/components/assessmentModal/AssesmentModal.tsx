'use client'
import { useState } from 'react';
import StudyDetailsModal from './StudyDetailsModal';

function AssessmentModal() {
    const [isOpen, setIsOpen] = useState(false);

    function handleOpen() {
        setIsOpen(true);
    }

    function handleClose() {
        setIsOpen(false);
    }

    return (
        <div>
            <button className="border border-primaryColor hover:bg-secondaryColor hover:border-secondaryColor hover:text-white text-primaryColor font-bold py-2 px-4 rounded" onClick={handleOpen}>Open Judgment Guidance</button>
            {isOpen && (
                <div>
                    {isOpen && (
                        <div className="fixed z-10 inset-0 overflow-y-auto bg-gray-200 bg-opacity-50">
                            <div className="flex items-center justify-center min-h-screen">
                                <div className="bg-white rounded-lg p-8 max-w-3xl mx-auto relative border border-gray-300 shadow-2xl">
                                    <button
                                        onClick={handleClose}
                                        className="absolute text-2xl top-1 right-4 text-gray-700 transform transition duration-500 ease-in-out hover:rotate-90"
                                    >
                                        &times;
                                    </button>

                                    <StudyDetailsModal />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AssessmentModal;
