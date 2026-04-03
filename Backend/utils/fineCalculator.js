export const calculateFine = (dueDate, returnDate) => {
  const diffTime = Math.abs(returnDate - dueDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (returnDate > dueDate) {
    // Assuming $1 per day for fine
    return diffDays * 1; 
  }
  return 0;
};
