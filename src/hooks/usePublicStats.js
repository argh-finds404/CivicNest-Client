import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const OPEN_STATUSES = new Set(["open", "pending", "in_review", "action_taken"]);

/** Public counts plus recent issues/events (GET /public/stats), shared and cached */
export default function usePublicStats() {
  const axiosPublic = useAxiosPublic();
  return useQuery({
    queryKey: ["publicStats"],
    queryFn: async () => (await axiosPublic.get("/public/stats")).data?.data,
    staleTime: 60 * 1000,
  });
}

/** Turn public stats into pins for the 3D neighbourhood */
export function statsToPins(stats, { issues = true, events = true } = {}) {
  if (!stats) return [];
  const withArea = (title, area) => (area ? `${title} · ${area}` : title);
  return [
    ...(issues ? stats.recentIssues || [] : []).map((issue) => ({
      id: `i-${issue._id}`,
      kind: OPEN_STATUSES.has(issue.status) ? "open" : issue.status === "solved" ? "solved" : null,
      label: withArea(issue.title, issue.area),
      href: `/issues/${issue._id}`,
    })),
    ...(events ? stats.nextEvents || [] : []).map((event) => ({
      id: `e-${event._id}`,
      kind: "event",
      label: withArea(event.title, event.area),
      href: `/cleanup-events/${event._id}`,
    })),
  ].filter((p) => p.kind);
}
