'use client'
const AssessmentModal = () => {
// const AssessmentModal = ({ isOpen, onClose }) => {
  // if (!isOpen) return null;

  const assessments = [
    {
      label: 'Needs Significant Study',
      color: 'bg-red-300',
      description: 'I\'m finding it hard to understand many of the fundamental concepts of this topic. I recognise that significant effort and time are required to become familiar with its basics.',
      action: 'Dedicate ample time to revisiting foundational resources. Utilize introductory texts, videos, or exercises. Set aside focused, uninterrupted study sessions to immerse yourself in the basics until they become clear.'
    },
    {
      label: 'Requires Revision',
      color: 'bg-yellow-300',
      description: 'I grasp some aspects of the topic, but there are noticeable gaps in my understanding that need addressing.',
      action: 'Pinpoint the specific areas or concepts that are hazy. Dedicate study sessions to these areas, making use of exercises or materials that offer a deeper dive. Regular revision of these parts will enhance clarity and retention.'
    },
    {
      label: 'Almost Secure',
      color: 'bg-green-200',
      description: 'I feel confident about most of the topic, with only a few minor areas needing further clarification or reinforcement.',
      action: 'Refine your understanding by tackling exercises or problems that challenge your weak spots. Engaging in discussions or using active recall techniques can solidify these slightly shaky areas.'
    },
    {
      label: 'Fully Secure',
      color: 'bg-green-500',
      description: 'I\'ve achieved a comprehensive understanding of this topic. I feel ready to apply the knowledge, take on advanced challenges, or even assist peers.',
      action: 'To ensure long-term retention, consider periodic revisits or practice. Creating a summary, teaching someone else, or exploring related advanced topics can further strengthen your grasp and expand your horizons.'
    },
    // ... Add the other assessments here in similar format
  ];

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg p-8 max-w-xl mx-auto relative shadow-xl">
          <button onClick={onClose} className="absolute top-2 right-2">
            &times;
          </button>
          {assessments.map((assessment, index) => (
            <div key={index} className={`p-4 ${assessment.color}`}>
              <h3 className="font-bold">{assessment.label}</h3>
              <p>{assessment.description}</p>
              <p className="mt-2 text-sm italic">{assessment.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;

