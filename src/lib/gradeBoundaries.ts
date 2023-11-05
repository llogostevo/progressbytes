// gradeBoundaries.ts

interface GradeBoundary {
    grade: string;
    percentage: number;
}

const gradeGCSEBoundaries: GradeBoundary[] = [
    { grade: '9', percentage: 84 },
    { grade: '8', percentage: 75 },
    { grade: '7', percentage: 67 },
    { grade: '6', percentage: 57 },
    { grade: '5', percentage: 49 },
    { grade: '4', percentage: 40 },
    { grade: '3', percentage: 29 },
    { grade: '2', percentage: 22 },
    { grade: '1', percentage: 8 },
    { grade: 'U', percentage: 0 },
];

function getGCSEGrade(percentage: number): string {
    for (const boundary of gradeGCSEBoundaries) {
        if (percentage >= boundary.percentage) {
            return boundary.grade;
        }
    }
    return 'U';  // Default to 'U' if percentage is less than the lowest boundary
}

const gradeALeveloundaries: GradeBoundary[] = [
    { grade: 'A*', percentage: 82 },
    { grade: 'A', percentage: 72 },
    { grade: 'B', percentage: 60 },
    { grade: 'C', percentage: 48 },
    { grade: 'D', percentage: 36 },
    { grade: 'E', percentage: 25 },
    { grade: 'U', percentage: 0 },
];

function getAlevelGrade(percentage: number): string {
    for (const boundary of gradeALeveloundaries) {
        if (percentage >= boundary.percentage) {
            return boundary.grade;
        }
    }
    return 'U';  // Default to 'U' if percentage is less than the lowest boundary
}

export { gradeGCSEBoundaries, getGCSEGrade, gradeALeveloundaries, getAlevelGrade };
