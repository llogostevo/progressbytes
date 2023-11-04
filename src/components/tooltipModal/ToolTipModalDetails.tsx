'use client'
const ToolTipModalDetails = ({ toolTitle, toolDetails }: { toolTitle: string; toolDetails: string }) => {
  

  return (
    <div className="tooltip-container">
            <h3 className="font-bold">{toolTitle}</h3>
              <p className="mt-2 px-2">{toolDetails}</p>
    </div>
  );
};

export default ToolTipModalDetails;

