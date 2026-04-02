// ─── Dummy Data ─────────────────────────────────────────────────────────────
// Used by: AdminDashboard, AnalyticsCharts, Leaderboard
// Author: Siddu Siddartha Reddy

export const DUMMY_STATS = {
  total: 248,
  resolved: 174,
  pending: 41,
  inProgress: 33,
  avgResolutionDays: 3.2,
  resolvedThisWeek: 28,
  newThisMonth: 62,
  criticalOpen: 9,
};

export const DUMMY_CATEGORY_DATA = {
  labels: ['Potholes', 'Street Lights', 'Bio-Waste', 'Water Pipes', 'Fallen Trees', 'Other'],
  values: [82, 54, 47, 31, 22, 12],
};

export const DUMMY_AREA_DATA = {
  labels: ['Jubilee Hills', 'Banjara Hills', 'Hitech City', 'Madhapur', 'Gachibowli', 'Kondapur', 'Kukatpally'],
  values: [58, 44, 37, 33, 28, 26, 22],
};

export const DUMMY_MONTHLY_TREND = {
  labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  reported: [38, 45, 52, 41, 58, 62],
  resolved: [30, 39, 44, 38, 49, 54],
};

export const DUMMY_STATUS_BREAKDOWN = {
  labels: ['Resolved', 'In Progress', 'Under Review', 'Pending'],
  values: [174, 33, 41, 0],
  colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
};

export const DUMMY_ISSUES = [
  { id: 'ISS-0091', title: 'Critical Pothole near Jubilee Hills Checkpost', category: 'pothole', reporter: 'Arjun Mehta', area: 'Jubilee Hills', date: '2026-03-31', status: 'in_progress', priority: 1 },
  { id: 'ISS-0087', title: 'Main Pipeline Rupture on Road No. 45', category: 'water_leak', reporter: 'Priya S.', area: 'Banjara Hills', date: '2026-03-30', status: 'under_review', priority: 1 },
  { id: 'ISS-0083', title: 'Street Light Outage — 3-block radius', category: 'street_light', reporter: 'Ravi Kumar', area: 'Hitech City', date: '2026-03-29', status: 'submitted', priority: 2 },
  { id: 'ISS-0079', title: 'Overflowing Garbage Bin near Park', category: 'garbage', reporter: 'Sana Fathima', area: 'Madhapur', date: '2026-03-28', status: 'resolved', priority: 3 },
  { id: 'ISS-0074', title: 'Fallen Tree Blocking MMTS Entry', category: 'fallen_tree', reporter: 'Vikram P.', area: 'Gachibowli', date: '2026-03-27', status: 'resolved', priority: 2 },
];

export const DUMMY_LEADERBOARD = [
  { rank: 1, name: 'Arjun Mehta',     reports: 47, resolved: 39, area: 'Jubilee Hills',  streak: 12, badge: '🏆' },
  { rank: 2, name: 'Priya Sundaram',  reports: 41, resolved: 35, area: 'Banjara Hills',  streak: 9,  badge: '🥈' },
  { rank: 3, name: 'Ravi Kumar',      reports: 38, resolved: 31, area: 'Hitech City',    streak: 8,  badge: '🥉' },
  { rank: 4, name: 'Sana Fathima',    reports: 34, resolved: 28, area: 'Madhapur',       streak: 7,  badge: '⭐' },
  { rank: 5, name: 'Vikram Patel',    reports: 29, resolved: 25, area: 'Gachibowli',     streak: 6,  badge: '⭐' },
  { rank: 6, name: 'Deepa Nair',      reports: 26, resolved: 21, area: 'Kondapur',       streak: 5,  badge: '⭐' },
  { rank: 7, name: 'Kiran Reddy',     reports: 23, resolved: 18, area: 'Kukatpally',     streak: 4,  badge: '⭐' },
  { rank: 8, name: 'Ananya Rao',      reports: 21, resolved: 17, area: 'Ameerpet',       streak: 3,  badge: '⭐' },
  { rank: 9, name: 'Suresh Babu',     reports: 19, resolved: 15, area: 'SR Nagar',       streak: 3,  badge: '⭐' },
  { rank: 10, name: 'Meera Krishnan', reports: 17, resolved: 13, area: 'Secunderabad',   streak: 2,  badge: '⭐' },
];
