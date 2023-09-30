export default function formatDateToCustom(dateString: any) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString();  // Get the last two digits of the year
  
    return `${day}-${month}-${year}`;
  }