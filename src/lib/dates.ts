export default function formatDateToCustom(dateString: Date) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().substr(-2);  // Get the last two digits of the year
  
    return `${day}-${month}-${year}`;
  }