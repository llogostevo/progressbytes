'use client'
import { useState } from 'react';
import ToolTipModalDetails from './ToolTipModalDetails';

function ToolTipModalButton({ toolTitle, toolDetails }: { toolTitle: string; toolDetails: string }) {
    const [isOpen, setIsOpen] = useState(false);

    function handleOpen() {
        setIsOpen(true);
    }

    function handleClose() {
        setIsOpen(false);
    }

    return (
        <div>
            <button className="bg-white border border-primaryColor rounded-full w-7 h-7 flex items-center justify-center text-primaryColor hover:bg-primaryColor hover:text-white" onClick={handleOpen}>?</button>
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

                                    <ToolTipModalDetails toolTitle={toolTitle} toolDetails={toolDetails} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ToolTipModalButton;
