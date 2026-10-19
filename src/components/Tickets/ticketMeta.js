// Labels and colour tones for ticket statuses and priorities
export const STATUS = {
  OPEN: { label: "Open", tone: "cn-tone-hydrant", icon: "ri-inbox-2-line" },
  TRIAGED: { label: "Accepted", tone: "cn-tone-sky", icon: "ri-check-double-line" },
  IN_PROGRESS: { label: "In progress", tone: "cn-tone-signal", icon: "ri-tools-line" },
  RESOLVED: { label: "Resolved", tone: "cn-tone-canopy", icon: "ri-checkbox-circle-line" },
  REJECTED: { label: "Closed", tone: "cn-tone-stone", icon: "ri-close-circle-line" },
};
export const PRIORITY = {
  LOW: { label: "Low", tone: "cn-tone-stone" },
  NORMAL: { label: "Normal", tone: "cn-tone-sky" },
  HIGH: { label: "High", tone: "cn-tone-signal" },
  URGENT: { label: "Urgent", tone: "cn-tone-hydrant" },
};
