export const addMinutes = (date, minutes) => {
  const result = new Date(date);

  result.setTime(
    result.getTime() + minutes * 60 * 1000
  );

  return result.toISOString();
};

export const formatDateTime = (iso) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return [date, time];
}

export const sortByClosestDate = (array, dateField) => {
  if (!array) return null
  const now = Date.now();

  return [...array].sort((a, b) => {
    const dateA = Math.abs(
      new Date(a[dateField]).getTime() - now
    );

    const dateB = Math.abs(
      new Date(b[dateField]).getTime() - now
    );

    return dateA - dateB;
  });
};