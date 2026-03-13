/**
 * Format a date string into a human-readable format.
 *
 * @param {string} dateString - ISO date string
 * @param {Object} [options] - Intl.DateTimeFormat options override
 * @returns {string|null} Formatted date or null if input is falsy
 */
export const formatDate = (dateString, options) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(
    undefined,
    options || {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
};

/**
 * Get Tailwind CSS classes for a game status badge.
 *
 * @param {string} status - Game status (planned, started, ended, processed)
 * @returns {string} Tailwind class string
 */
export const getStatusClasses = (status) => {
  const map = {
    planned: "bg-status-playing-bg text-status-playing",
    started: "bg-status-pending-bg text-status-pending",
    ended: "bg-status-ended-bg text-status-delivering",
    processed: "bg-status-processed-bg text-status-processed",
  };
  return map[status?.toLowerCase()] || "bg-asphalt text-snow-dim";
};

/**
 * Map game status to a border color hex value.
 *
 * @param {string} status - Game status
 * @returns {string} Hex color code
 */
export const getStatusBorderColor = (status) => {
  const map = {
    started: "#f59e0b",
    ended: "#a78bfa",
    processed: "#34d399",
    planned: "#60a5fa",
  };
  return map[status?.toLowerCase()] || "#2e2e2e";
};
