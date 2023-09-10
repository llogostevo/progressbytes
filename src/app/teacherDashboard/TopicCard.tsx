
'use client'
import { useState } from 'react';

type TopicCardProps = {
  topicName: string;
  unitNumber: string;
  totalMarksAchieved: number;
  totalMarks: number;
  numberOfStudents: number;
};

function getColorBasedOnPercentage(percentage: number | typeof NaN): string {
  if (isNaN(percentage)) {
    return 'bg-gray-100';
  } else if (percentage >= 75) {
    return 'bg-green-600';
  } else if (percentage >= 70) {
    return 'bg-green-500';
  } else if (percentage >= 65) {
    return 'bg-green-200';
  } else if (percentage >= 60) {
    return 'bg-green-100';
  } else if (percentage >= 55) {
    return 'bg-yellow-300';
  } else if (percentage >= 50) {
    return 'bg-orange-300';
  } else if (percentage >= 45) {
    return 'bg-orange-400';
  } else if (percentage >= 40) {
    return 'bg-orange-500';
  } else {
    return 'bg-red-500';
  }
}


export default function TopicCard({
  topicName,
  unitNumber,
  totalMarksAchieved,
  totalMarks,
  numberOfStudents }: TopicCardProps) {

  const performancePercentage = Math.round((totalMarksAchieved / totalMarks) * 100);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const barColor = getColorBasedOnPercentage(performancePercentage);
  const displayPercentage = isNaN(performancePercentage) ? ' -- ' : `${performancePercentage}`;

  return (

    // <div className="bg-white shadow-md p-6 rounded-lg max-w-xs m-2 transition-transform transform hover:scale-105">
    <div
      className="bg-white shadow-md p-6 rounded-lg max-w-xs m-2 transition-transform transform hover:scale-105 hover:bg-gray-100 cursor-pointer"
      onMouseEnter={() => setTooltipVisible(true)} // use state to control tooltip visibility
      onMouseLeave={() => setTooltipVisible(false)} // hide tooltip when mouse leaves the card
    >
      <h2 className="text-2xl font-semibold truncate">{topicName}</h2>
      <div className="mt-1 ml-2 mb-4 text-xs">
        {unitNumber}
      </div>

      <div className="flex items-center mb-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full">
          <div className={`h-2 ${barColor} rounded-full`} style={{ width: `${displayPercentage}%` }}></div>
        </div>
        <span className="ml-4 text-lg">{displayPercentage}%</span>
      </div>

      <div className="flex items-center">
        {numberOfStudents === 0 ? (
          <span className="text-sm">- / -</span>
        ) : (
          <>
            <span className="text-sm">{(totalMarksAchieved / numberOfStudents).toFixed(2)}</span>
            <span className="ml-1 text-sm">/</span>
            <span className="ml-1 text-sm">{(totalMarks / numberOfStudents).toFixed(2)}</span>
          </>
        )}
      </div>


      {/* Tooltip */}
      {tooltipVisible && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow-lg">
          {topicName} {unitNumber}
        </div>
      )}
    </div>

  );
}