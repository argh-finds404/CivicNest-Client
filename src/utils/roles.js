// Mirrors the server's utils/roles.js: guest < member < moderator < admin
const RANK = { guest: 0, member: 1, moderator: 2, admin: 3 };

export const atLeast = (role, min) => (RANK[role] ?? 0) >= RANK[min];
export const isStaff = (role) => atLeast(role, "moderator");
