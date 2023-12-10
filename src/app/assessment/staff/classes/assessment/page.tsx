export default function AssessmentPage() {
    const studentNames = [
      "A. MUHAYMIN", "A. AMIN", "G. SOFIAN", "G. BENJAMIN",
      "K. KRUNAAL", "M. MOHAMMED", "S. JAKUB", "Y. YASIN", "Y. MARWAN"
      // Add more names as required
    ];
  
    return (
      <div className="container mx-auto overflow-x-auto">
        <h1 className="text-2xl font-bold mb-4">AP1 Year 13 - 12/03/23</h1>
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-800 text-center text-white">
            <tr>
              <th className="w-1/15 px-2 py-1">Order</th>
              <th className="w-1/15 px-2 py-1">Label</th>
              <th className="w-1/15 px-2 py-1">Max Mark</th>
              <th className="w-1/30 truncate px-2 py-1">Topic</th> {/* Adjusted width */}
              <th className="w-1/30 truncate px-2 py-1">Subtopic</th> {/* Adjusted width */}
              {studentNames.map(name => (
                <th key={name} className="w-1/15 truncate px-2 py-1">{name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">1.1.1</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr>
             {/* Sample Row 1 */}
             <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems ...</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr> {/* Sample Row 1 */}
            <tr>
              <td className="border px-2 py-1 text-center">1</td>
              <td className="border px-2 py-1 text-center">1ai</td>
              <td className="border px-2 py-1 text-center">6</td>
              <td className="border px-2 py-1 truncate">Systems Software</td>
              <td className="border px-2 py-1 truncate">The need for...</td> {/* Truncated for display */}
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">5</td>
              ))}
            </tr>
            {/* Add more rows as needed */}
          </tbody>
          {/* Summary Section */}
          <tbody className="text-gray-700 bg-gray-200">
            <tr>
              <td className="border px-2 py-1 text-right font-bold" colSpan={5}>Max Possible Marks</td>
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">60</td> // Dummy value
              ))}
            </tr>
            <tr>
              <td className="border px-2 py-1 text-right font-bold" colSpan={5}>Total Marks</td>
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">45</td> // Dummy value
              ))}
            </tr>
            <tr>
              <td className="border px-2 py-1 text-right font-bold" colSpan={5}>Percentage</td>
              {studentNames.map(name => (
                <td key={name} className="border px-2 py-1 text-center">75%</td> // Dummy value
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
