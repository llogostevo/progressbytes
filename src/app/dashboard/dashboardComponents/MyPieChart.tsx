import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the required components for ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

// Define the type for the data object
type PieChartData = {
    name: string;
    value: number;
}

// Define the type for the props
interface MyPieChartProps {
    pieChartData: PieChartData[];
}


const getFontSizeClass = (chartWidth: number): string => {
    if (chartWidth < 640) return 'text-xs'; // Tailwind class for small screens
    if (chartWidth < 768) return 'text-sm'; // Tailwind class for medium screens
    return 'text-base'; // Default Tailwind class
};

const MyPieChart: React.FC<MyPieChartProps> = ({ pieChartData }) => {
    const data = {
        labels: pieChartData.map(item => item.name),
        datasets: [
            {
                data: pieChartData.map(item => item.value),
                backgroundColor: [
                    '#FC8181', // Tailwind red-400
                    '#F6E05E', // Tailwind yellow-400
                    '#68D391', // Tailwind green-300
                    '#38A169', // Tailwind green-600
                ], borderColor: [
                    'rgba(255, 255, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        maintainAspectRatio: true,
        responsive: true
    };

    return (

            <Pie data={data} options={chartOptions} />

    )
};

export default MyPieChart;
