const Issue = require('../models/Issue.model');

async function generateIssueId() {
    const year = new Date().getFullYear();
    const count = await Issue.countDocuments();
    return `INC-${year}-${String(count + 1).padStart(4, '0')}`;
}

module.exports = generateIssueId;
