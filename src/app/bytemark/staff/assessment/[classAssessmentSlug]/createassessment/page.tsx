import AddAssessementForm from "./AddAssessementForm";


export default async function CreateAssessment({ params }: { params: { classId: string } }) {

    const classId = decodeURIComponent(params.classId);


return (
    <>
    <p>{params.classId}</p>
    <AddAssessementForm classId={classId} />
    </>
)

}