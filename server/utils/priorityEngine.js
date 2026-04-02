const Issue = require('../models/Issue.model');

const calculatePriority = (issue) => {
    let score = 0;

    // upvoteCount: each upvote = +2 points
    score += (issue.upvoteCount || 0) * 2;

    // category
    const cat = issue.category || '';
    if (['pothole', 'sewage', 'water_leak', 'road_damage'].includes(cat)) {
        score += 10;
    } else if (['street_light'].includes(cat)) {
        score += 5;
    } else {
        score += 2;
    }

    // ageInDays
    const createdAt = issue.createdAt ? new Date(issue.createdAt) : new Date();
    const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageInDays > 30) {
        score += 20;
    } else if (ageInDays > 14) {
        score += 10;
    } else if (ageInDays > 7) {
        score += 5;
    }

    // status
    const stat = issue.status || 'submitted';
    if (stat === 'submitted') score += 5;
    else if (stat === 'under_review') score += 3;
    else if (stat === 'in_progress') score += 1;
    // resolved = 0

    let priority = 'low';
    if (score >= 36) priority = 'critical';
    else if (score >= 21) priority = 'high';
    else if (score >= 11) priority = 'medium';

    return { priorityScore: score, priority };
};

const recalculateAllPriorities = async () => {
    try {
        console.log('Running scheduled priority recalculation...');
        const issues = await Issue.find({
            status: { $nin: ['resolved', 'rejected', 'duplicate'] },
            priorityOverride: false
        });

        for (let issue of issues) {
            const { priorityScore, priority } = calculatePriority(issue);
            if (issue.priorityScore !== priorityScore || issue.priority !== priority) {
                issue.priorityScore = priorityScore;
                issue.priority = priority;
                await issue.save();
            }
        }
        console.log(`Recalculated priorities for ${issues.length} active issues.`);
    } catch (err) {
        console.error('Error in recalculateAllPriorities:', err);
    }
};

module.exports = {
    calculatePriority,
    recalculateAllPriorities
};
