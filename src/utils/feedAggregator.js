/**
 * Utility to aggregate feed events for display.
 * Groups redundant event types (like volunteer RSVPs or issue resolutions) to prevent cluttering the feed.
 */
export function aggregateFeed(feedItems) {
  if (!feedItems || feedItems.length === 0) return [];

  const result = [];
  const joinedItems = [];
  const solvedItems = [];

  for (const item of feedItems) {
    if (item.type === 'drive_joined') {
      joinedItems.push(item);
    } else if (item.type === 'issue_solved') {
      solvedItems.push(item);
    } else {
      result.push(item);
    }
  }

  // Aggregate drive_joined
  if (joinedItems.length > 0) {
    if (joinedItems.length === 1) {
      result.push(joinedItems[0]);
    } else {
      const latestItem = joinedItems.reduce((latest, current) => 
        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
      , joinedItems[0]);

      // Sum all volunteer counts
      const totalCount = joinedItems.reduce((sum, item) => sum + (item.data?.count || 1), 0);

      result.push({
        _id: `summary_joined_${latestItem._id}`,
        type: 'drive_joined_summary',
        createdAt: latestItem.createdAt,
        data: {
          count: totalCount,
          driveTitle: latestItem.data?.driveTitle,
          area: latestItem.data?.area
        }
      });
    }
  }

  // Aggregate issue_solved
  if (solvedItems.length > 0) {
    if (solvedItems.length === 1) {
      result.push(solvedItems[0]);
    } else {
      const latestItem = solvedItems.reduce((latest, current) => 
        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
      , solvedItems[0]);

      result.push({
        _id: `summary_solved_${latestItem._id}`,
        type: 'issue_solved_summary',
        createdAt: latestItem.createdAt,
        data: {
          count: solvedItems.length,
          title: latestItem.data?.title,
          area: latestItem.data?.area
        }
      });
    }
  }

  // Sort by createdAt descending so the aggregated items align with chronological order
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
