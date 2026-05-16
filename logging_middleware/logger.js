// paramters to be passed to the protected API 

const LOG_API_URL="http://4.224.186.213/evaluation-service/logs";
// Access token is removed during the final push for security reasons
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoYXJzaGEuMjJtaXM3MTIzQHZpdGFwc3R1ZGVudC5hYy5pbiIsImV4cCI6MTc3ODkyOTM4MywiaWF0IjoxNzc4OTI4NDgzLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZGVlMzQ0MzYtYzQ2My00NzgxLTg0NTEtMjMwMmQzNDg4ZGI2IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2FpIGhhcnNoYSBkYW1hcmxhIiwic3ViIjoiOTljNGY1YmQtMWQzNy00MmQyLTk2YTYtZWZmY2JkMzc4YjEyIn0sImVtYWlsIjoiaGFyc2hhLjIybWlzNzEyM0B2aXRhcHN0dWRlbnQuYWMuaW4iLCJuYW1lIjoic2FpIGhhcnNoYSBkYW1hcmxhIiwicm9sbE5vIjoiMjJtaXM3MTIzIiwiYWNjZXNzQ29kZSI6IlNmRnVXZyIsImNsaWVudElEIjoiOTljNGY1YmQtMWQzNy00MmQyLTk2YTYtZWZmY2JkMzc4YjEyIiwiY2xpZW50U2VjcmV0IjoiY2ZFUk1HdnZDd1BxUXRxYSJ9.ILJ7cayMD8MzTxOQYxDbPW21LWNlCTaHpRTIDfiiczM";

// Constraints as per Pre-Setup
const validStacks = ["backend", "frontend"];
const validLevels = ["debug", "info", "warn", "error", "fatal"];
const validPackages=[ "cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"];

// Logger function
async function Log(stack, level, package, message) {
    // Verifying whether the parameters are valid i.e. satisfying the constraints as per Pre-Setup
    if (!validStacks.includes(stack)) {
        throw new Error(`Invalid stack provided to logger: ${stack}`);
    }
    if (!validLevels.includes(level)) {
        throw new Error(`Invalid log level provided to logger: ${level}`);
    }
    if (!validPackages.includes(package)) {
        throw new Error(`Invalid package provided to logger: ${package}`);
    }

    // Request Body
    const requestBody = {
        stack: stack,
        level: level,
        package: package,
        message: message
    };

    // Making the API call
    try {
        const response = await fetch(LOG_API_URL,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify(requestBody)
        });

        // If the response is not ok, throw an error
        if (!response.ok) {
            throw new Error(`Failed to push log. HTTP Status: ${response.status}`);
        }
    } catch (error) {
         throw new Error(`Logger Network Error: ${error.message}`);
    }
}

module.exports={Log};


// TEST CODE BLOCK
// Commented it for submission-purposes

/*
(async () => {
    try {
        await Log("backend", "info", "middleware", "Logger function executed successfully.");
    } catch (error) {
        console.error("Logger Error:", error.message);
    }
})();
*/
