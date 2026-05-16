// Importing our custom logger function
const { Log } = require('../logging_middleware/logger');

// Test Server Endpoints
const DEPOTS_ENDPOINT = "http://4.224.186.213/evaluation-service/depots";
const VEHICLES_ENDPOINT = "http://4.224.186.213/evaluation-service/vehicles";
// Access token is removed during the final push for security reasons
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoYXJzaGEuMjJtaXM3MTIzQHZpdGFwc3R1ZGVudC5hYy5pbiIsImV4cCI6MTc3ODkzNjYzMCwiaWF0IjoxNzc4OTM1NzMwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNzA0OWE1YjctNzJhYS00ODJiLWE3NDktMWU0ODI1MDgyMDdmIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2FpIGhhcnNoYSBkYW1hcmxhIiwic3ViIjoiOTljNGY1YmQtMWQzNy00MmQyLTk2YTYtZWZmY2JkMzc4YjEyIn0sImVtYWlsIjoiaGFyc2hhLjIybWlzNzEyM0B2aXRhcHN0dWRlbnQuYWMuaW4iLCJuYW1lIjoic2FpIGhhcnNoYSBkYW1hcmxhIiwicm9sbE5vIjoiMjJtaXM3MTIzIiwiYWNjZXNzQ29kZSI6IlNmRnVXZyIsImNsaWVudElEIjoiOTljNGY1YmQtMWQzNy00MmQyLTk2YTYtZWZmY2JkMzc4YjEyIiwiY2xpZW50U2VjcmV0IjoiY2ZFUk1HdnZDd1BxUXRxYSJ9.n7SkTKsOwRSPbcgTe4L3XAjZunJMS1afxoWhrtNVQ-I";

// Function to get the optimal tasks
function getOptimalTasks(tasks, capacity) {
    const n = tasks.length;
    // DP table: dp[i][w] = max impact using first i items with capacity w
    const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const { Duration, Impact } = tasks[i - 1];
        for (let w = 0; w <= capacity; w++) {
            if (Duration <= w) {
                dp[i][w] = Math.max(Impact + dp[i - 1][w - Duration], dp[i - 1][w]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][capacity];
}

async function runScheduler() {
    try {
        // Fetching data
        const headers = { "Authorization": `Bearer ${ACCESS_TOKEN}` };
        const [depotRes, vehicleRes] = await Promise.all([
            fetch(DEPOTS_ENDPOINT, { headers }),
            fetch(VEHICLES_ENDPOINT, { headers })
        ]);

        const { depots } = await depotRes.json();
        const { vehicles } = await vehicleRes.json();

        // Performing calculation for each depot
        for (const depot of depots) {
            const maxImpact = getOptimalTasks(vehicles, depot.MechanicHours);
            
            // Logging with our customized function
            await Log("backend", "info", "cron_job", 
                `Depot ${depot.ID} optimization complete. Max Impact: ${maxImpact}`);
            
            console.log(`Depot ID: ${depot.ID}, Max Impact Found: ${maxImpact}`);
            // or we can use process.stdout.write in place of console.log
        }
    } catch (err) {
        // Logging with our customized function
        await Log("backend", "fatal", "db", `Scheduler failure: ${err.message}`);
    }
}

// Calling the function
runScheduler();