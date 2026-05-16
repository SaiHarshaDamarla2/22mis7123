# Notification System Design

## Stage-01
Here our main aim & constraint is low-latency delivery, so I suggest WebSockets (Socket.io).
When "Notify All" is selected by admin, the server broadcasts an event via the socket to all connected student clients simultaneously.

## Stage-02
### Recommendation:  PostgreSQL (Relational)
**Reason:** As Notifications are structred-scheme data with many relationships(student-to-notification). A relational DB ensures data integrity and specifically PostgreSQL suits this scenario.
#### Schema:
- students: id (PK), email
- notifications: id (PK), student_id (FK), type (Enum: Event, Result, Placement), message, isRead (Boolean), createdAt (Timestamp)

**Scalability issues:** As volume of the data grows, lookups will be slow.
**Solution:** Database partitioning by createdAt or student_id.

## Stage-03: Query Optimization
**Reason for slow:** The query WHERE studentID = 1042 AND isRead = false performs a Full Table Scan if there is no Database indexing.
**Suggestion:** We should add a Composite Index on (studentID, isRead).
because adding an index on every column is not preferrable as it slows down writes. <br>
**Example:** Placement NotificationLast 11 days
SELECT * FROM notifications 
WHERE notificationType = 'Placement' 
AND createdAt >= NOW() - INTERVAL '11 days';

## Stage-04: Performance Strategy
### Strategy-01: Pagination
Fetching 5 million rows is impossible. Use LIMIT and OFFSET (or keyset pagination) to fetch only 20 at a time.
### Strategy-02: Redis Caching
Store the "latest 20 unread notifications" in Redis. This reduces DB load by 90%.
**Trade-off:**Cache invalidation. If a student marks a notification as read, we must update both DB and Cache.

## Stage-05: Reliability & Notify All
In the current scenario the loop is synchronous. If one email fails or the DB times out, the whole process blocks or hangs.
**Solution**: Use an Asynchronous Message Queue (e.g., RabbitMQ)
1. The notify_all function pushes 50,000 tasks into the Queue.
2. Worker nodes pick up these tasks independently. <br>
**Decoupling:** DB storage and Email sending should be separate microservices communicating via the Queue.


#### These are the design decisions we made for design our system to make sure it is efficient, relaibale also scalable, overall making our system real-world ready.    


## Stage-06: How will you maintain the top 10 efficiently?
**Answer:** If we have millions of notifications, we don't sort the whole array. We would use a Min-Heap of size 10 to keep track of the top items, which is O(N log 10) rather than O(N log N).

## Note: "This whole backend system is built without the need of building an express server due to the simplicity of problem statement & no specific need of building a web server. That being said it can also be built using a Web server (here Express Js) making it more prodcution-ready by using external libraries like dotenv etc.. and designing API Endpoints." 

