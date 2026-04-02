// ─── Dummy Data ─────────────────────────────────────────────────────────────
// Used by: AdminDashboard, AnalyticsCharts, Leaderboard, AdminIssues, AdminMap, AdminUsers
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
  {
    _id: 'i1',
    issueId: 'ISS-0091',
    title: 'Critical Pothole near Jubilee Hills Checkpost',
    category: 'pothole',
    reporter: 'Arjun Mehta',
    area: 'Jubilee Hills',
    createdAt: '2026-03-31T10:00:00Z',
    date: '2026-03-31',
    status: 'in_progress',
    aiPriorityLevel: 'high',
    aiPriorityScore: 92,
    upvoteCount: 14,
    description: 'A deep, dangerous pothole has formed right after the checkpost toward Road No. 36. This is causing significant traffic backup and is a major hazard for two-wheelers at night.',
    location: { coordinates: [78.4126, 17.4239] },
    aiReasoning: 'Analysis of multiple reports suggests high risk of vehicle damage and potential for injury due to high-speed approach and proximity to a major intersection.',
    photos: [{ url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5904?auto=format&fit=crop&q=80&w=400' }]
  },
  {
    _id: 'i2',
    issueId: 'ISS-0087',
    title: 'Main Pipeline Rupture on Road No. 45',
    category: 'water_leak',
    reporter: 'Priya S.',
    area: 'Banjara Hills',
    createdAt: '2026-03-30T14:20:00Z',
    date: '2026-03-30',
    status: 'under_review',
    aiPriorityLevel: 'high',
    aiPriorityScore: 88,
    upvoteCount: 22,
    description: 'Large amount of water gushing out from the sidewalk near the park entrance. Pressure seems high, and localized flooding is starting on the road.',
    location: { coordinates: [78.4299, 17.4156] },
    aiReasoning: 'Water pipeline failure in high-density residential area; immediate risk of road erosion and significant utility loss.',
    photos: [{ url: 'https://images.unsplash.com/photo-1584622650111-993d426fbf0a?auto=format&fit=crop&q=80&w=400' }]
  },
  {
    _id: 'i3',
    issueId: 'ISS-0083',
    title: 'Street Light Outage — 3-block radius',
    category: 'street_light',
    reporter: 'Ravi Kumar',
    area: 'Hitech City',
    createdAt: '2026-03-29T20:15:00Z',
    date: '2026-03-29',
    status: 'submitted',
    aiPriorityLevel: 'medium',
    aiPriorityScore: 65,
    upvoteCount: 8,
    description: 'Multiple street lights are out from Image Gardens through the next two blocks. The area is pitch dark, making it unsafe for pedestrians and commuters.',
    location: { coordinates: [78.3845, 17.4474] },
    aiReasoning: 'Cluster failure suggests circuit fault; moderate priority due to security concerns in active nightlife zone.',
    photos: []
  },
  {
    _id: 'i4',
    issueId: 'ISS-0079',
    title: 'Overflowing Garbage Bin near Park',
    category: 'garbage',
    reporter: 'Sana Fathima',
    area: 'Madhapur',
    createdAt: '2026-03-28T09:45:00Z',
    date: '2026-03-28',
    status: 'resolved',
    aiPriorityLevel: 'low',
    aiPriorityScore: 35,
    upvoteCount: 5,
    description: 'The community bin near Silpa Gram is completely full and trash is spilling onto the road. Needs immediate pickup.',
    location: { coordinates: [78.3888, 17.4510] },
    aiReasoning: 'Routine maintenance violation; low immediate safety risk but potential hygiene issue.',
    photos: []
  },
  {
    _id: 'i5',
    issueId: 'ISS-0074',
    title: 'Fallen Tree Blocking MMTS Entry',
    category: 'fallen_tree',
    reporter: 'Vikram P.',
    area: 'Gachibowli',
    createdAt: '2026-03-27T11:30:00Z',
    date: '2026-03-27',
    status: 'resolved',
    aiPriorityLevel: 'medium',
    aiPriorityScore: 70,
    upvoteCount: 31,
    description: 'A large neem tree has fallen across the main walkway to the Hitech City MMTS station entrance. People are having to climb over it.',
    location: { coordinates: [78.3725, 17.4393] },
    aiReasoning: 'Obstruction of public transit node; high utility impact requiring urban forestry dispatch.',
    photos: []
  }
];

export const DUMMY_COMMENTS = [
  { _id: 'c1', issueId: 'i1', author: { name: 'Admin Unit 1' }, text: 'Engineering team dispatched to site for measurements.', isAdminComment: true, isInternalOnly: true, createdAt: '2026-03-31T12:00:00Z' },
  { _id: 'c2', issueId: 'i1', author: { name: 'Civic Support' }, text: 'Thank you for reporting, Arjun. We have logged this for priority repair.', isAdminComment: true, isInternalOnly: false, createdAt: '2026-03-31T11:00:00Z' },
  { _id: 'c3', issueId: 'i2', author: { name: 'Priya S.' }, text: 'The water is now reaching the shops.', isAdminComment: false, isInternalOnly: false, createdAt: '2026-03-30T15:00:00Z' }
];

export const DUMMY_USERS = [
  { _id: 'u1', name: 'Arjun Mehta', email: 'arjun.m@example.com', role: 'citizen', area: 'Jubilee Hills', contributionScore: 470, createdAt: '2025-01-15T10:00:00Z' },
  { _id: 'u2', name: 'Priya Sundaram', email: 'priya.s@example.com', role: 'citizen', area: 'Banjara Hills', contributionScore: 410, createdAt: '2025-02-12T14:00:00Z' },
  { _id: 'u3', name: 'Ravi Kumar', email: 'ravi.k@example.com', role: 'citizen', area: 'Hitech City', contributionScore: 380, createdAt: '2025-03-01T09:00:00Z' },
  { _id: 'u4', name: 'Sana Fathima', email: 'sana.f@example.com', role: 'citizen', area: 'Madhapur', contributionScore: 340, createdAt: '2025-04-10T11:00:00Z' },
  { _id: 'u5', name: 'Vikram Patel', email: 'vikram.p@example.com', role: 'admin', area: 'HQ', contributionScore: 1250, createdAt: '2024-12-01T08:00:00Z' },
  { _id: 'u6', name: 'Deepa Nair', email: 'deepa.n@example.com', role: 'citizen', area: 'Kondapur', contributionScore: 260, createdAt: '2025-05-20T16:00:00Z' }
];

export const DUMMY_LEADERBOARD = [
  { rank: 1, name: 'Arjun Mehta', reports: 47, resolved: 39, area: 'Jubilee Hills', streak: 12, badge: '🏆' },
  { rank: 2, name: 'Priya Sundaram', reports: 41, resolved: 35, area: 'Banjara Hills', streak: 9, badge: '🥈' },
  { rank: 3, name: 'Ravi Kumar', reports: 38, resolved: 31, area: 'Hitech City', streak: 8, badge: '🥉' },
  { rank: 4, name: 'Sana Fathima', reports: 34, resolved: 28, area: 'Madhapur', streak: 7, badge: '⭐' },
  { rank: 5, name: 'Vikram Patel', reports: 29, resolved: 25, area: 'Gachibowli', streak: 6, badge: '⭐' },
  { rank: 6, name: 'Deepa Nair', reports: 26, resolved: 21, area: 'Kondapur', streak: 5, badge: '⭐' },
  { rank: 7, name: 'Kiran Reddy', reports: 23, resolved: 18, area: 'Kukatpally', streak: 4, badge: '⭐' },
  { rank: 8, name: 'Ananya Rao', reports: 21, resolved: 17, area: 'Ameerpet', streak: 3, badge: '⭐' },
  { rank: 9, name: 'Suresh Babu', reports: 19, resolved: 15, area: 'SR Nagar', streak: 3, badge: '⭐' },
  { rank: 10, name: 'Meera Krishnan', reports: 17, resolved: 13, area: 'Secunderabad', streak: 2, badge: '⭐' },
];

