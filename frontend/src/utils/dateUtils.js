export const formatDate = (date, options = {}) => {
  if (!date) return "N/A";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return new Date(date).toLocaleDateString("en-US", defaultOptions);
};

export const formatDateTime = (date, options = {}) => {
  if (!date) return "N/A";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return new Date(date).toLocaleDateString("en-US", defaultOptions);
};

export const formatRelativeTime = (date) => {
  if (!date) return "N/A";

  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now - target) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  return formatDate(date);
};

export const isToday = (date) => {
  const today = new Date();
  const target = new Date(date);

  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  );
};

export const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(date);

  return (
    yesterday.getFullYear() === target.getFullYear() &&
    yesterday.getMonth() === target.getMonth() &&
    yesterday.getDate() === target.getDate()
  );
};
