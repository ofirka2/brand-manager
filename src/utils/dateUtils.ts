export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isOverdue(deadline: string): boolean {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  deadlineDate.setHours(0, 0, 0, 0); // Reset time to start of day
  return deadlineDate < today;
}

export function getDaysUntilDeadline(deadline: string): number {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  deadlineDate.setHours(0, 0, 0, 0); // Reset time to start of day
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getTasksByDeadline(tasks: any[], days: number): any[] {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  futureDate.setHours(23, 59, 59, 999); // Set to end of day
  
  return tasks.filter(task => {
    const deadline = new Date(task.deadline);
    deadline.setHours(23, 59, 59, 999); // Set to end of day
    return deadline <= futureDate && !isOverdue(task.deadline);
  });
}