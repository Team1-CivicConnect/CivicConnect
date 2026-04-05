const { calculatePriority } = require('../utils/priorityEngine');

describe('Priority Engine Algorithm', () => {

    test('should calculate correct priority for a fresh, low-impact issue', () => {
        const issue = {
            upvoteCount: 0,
            category: 'noise',
            createdAt: new Date(),
            status: 'submitted'
        };
        const result = calculatePriority(issue);
        
        // Math: upvote(0) + noise(2) + age(0) + status(5) = 7
        expect(result.priorityScore).toBe(7);
        expect(result.priority).toBe('low');
    });

    test('should escalate priority to critical for severe, aging issues', () => {
        const thirtyOneDaysAgo = new Date();
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

        const issue = {
            upvoteCount: 5, // 10 pts
            category: 'pothole', // 10 pts
            createdAt: thirtyOneDaysAgo, // 20 pts
            status: 'submitted' // 5 pts
        };
        const result = calculatePriority(issue);
        
        // Math: 10 + 10 + 20 + 5 = 45
        expect(result.priorityScore).toBe(45);
        expect(result.priority).toBe('critical');
    });

    test('should deduct priority points if issue is in_progress', () => {
        const issue = {
            upvoteCount: 10, // 20 pts
            category: 'water_leak', // 10 pts
            createdAt: new Date(), // 0 pts
            status: 'in_progress' // 1 pts instead of 5
        };
        const result = calculatePriority(issue);
        
        // Math: 20 + 10 + 0 + 1 = 31
        expect(result.priorityScore).toBe(31);
        expect(result.priority).toBe('high');
    });
});
