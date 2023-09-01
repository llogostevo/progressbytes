type Exams = {
    [key: number]: string;
};

export default function StreakTracker() {
    const data: number[] = new Array(365).fill(0).map(() => Math.floor(Math.random() * 4));
    const totalCells = 8 * 53;

    // Define the exam dates and names
    const exams: Exams = {
        15: "AP1",
        250: "GCSE Paper 1"
    };

    return (
        <div className="max-w-screen-lg mx-auto p-4 bg-gray-50 rounded-md">
            <h2 className="text-center mb-4 font-semibold text-lg">Question Attempts</h2>

            <div className="grid grid-cols-8 gap-x-0.5 gap-y-0.5">
                {/* Placeholder for empty heading */}
                <div className="flex items-center justify-center"></div>

                {/* Headers for the days of the week */}
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                    <div key={index} className="text-center flex items-center justify-center">
                        {day}
                    </div>
                ))}

                {/* Loop for week numbers and contributions */}
                {Array.from({ length: totalCells - 8 }).map((_, idx) => {
                    if (idx % 8 === 0) {
                        return (
                            <div key={`week-${idx}`} className="flex items-center justify-center">
                                {idx / 8 + 1}
                            </div>
                        );
                    }

                    const contributionIndex = idx - Math.floor(idx / 8);
                    if (contributionIndex < data.length) {
                        const level = data[contributionIndex];
                        return (
                            <div
                                key={idx}
                                className={`relative group  rounded flex items-center justify-center 
                  ${level === 0 ? 'bg-gray-200' : ''} 
                  ${level === 1 ? 'bg-teal-300' : ''}
                  ${level === 2 ? 'bg-teal-500' : ''}
                  ${level === 3 ? 'bg-teal-700' : ''}
                  `}
                            >
                                {exams[contributionIndex] && (
                                    <>
                                        <div className="absolute bottom-1 right-1 hover:cursor-help rounded-full h-2 w-2 bg-tertiaryColor group-hover:z-10">
                                            <div className="absolute -bottom-6 right-0 mb-1 px-2 py-1 text-xs rounded-md bg-black text-white opacity-0 group-hover:opacity-100 transition ease-out duration-200">
                                                {exams[contributionIndex]}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
}
