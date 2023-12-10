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
                ],
                borderWidth: 1,
            },
        ],
    };

    return <Pie data={data} />;
};

export default MyPieChart;
