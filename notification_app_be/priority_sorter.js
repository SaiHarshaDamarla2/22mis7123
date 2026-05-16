// Importing our custom logger function
const { Log } = require('../logging_middleware/logger');

// Weights for our priority sorting as per the problem statement
const weights = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
};

// Access token is removed during the final push for security reasons
const ACCESS_TOKEN = "";

async function getPriorityNotifications() {
    try {
        // 1. Fetch from the provided API
        const response = await fetch("http://4.224.186.213/evaluation-service/notifications", {
            headers: { "Authorization": `Bearer ${ACCESS_TOKEN}` }
        });
        const data = await response.json();
        
        // 2. Sort Logic
        // Primary: Weight (descending), Secondary: Timestamp (descending)
        const sorted = data.notifications.sort((a, b) => {
            const weightDiff = weights[b.Type] - weights[a.Type];
            if (weightDiff !== 0) return weightDiff;
            
            // Compare timestamps (newest first)
            return new Date(b.Timestamp) - new Date(a.Timestamp);
        });

        // 3. Take Top 10
        const top10 = sorted.slice(0, 10);

        // 4. Log the success
        await Log("backend", "info", "service", "Priority inbox generated successfully.");
        
        return top10;

    } catch (err) {
        await Log("backend", "error", "handler", `Priority sorting failed: ${err.message}`);
        throw err;
    }
}

// Calling the function
(async () => {
    try {
        const top10 = await getPriorityNotifications();
        
        // Using process.stdout.write instead of console.log as per instructions of Pre-Setup
        process.stdout.write("--- TOP 10 PRIORITY NOTIFICATIONS ---\n");
        process.stdout.write(JSON.stringify(top10, null, 2));
        process.stdout.write("\n--------------------------------------\n");
    } catch (err) {
        process.stdout.write("Error occurred: " + err.message + "\n");
    }
})();