// utils/formatUtils.ts
export const formatNumber = (num: number): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return "0";
  }

  const numValue = Number(num);
  if (numValue >= 1000000) return (numValue / 1000000).toFixed(1) + "M";
  if (numValue >= 1000) return (numValue / 1000).toFixed(1) + "K";
  return numValue.toString();
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days === 0 ? "Today" : `${days}d ago`;
};
