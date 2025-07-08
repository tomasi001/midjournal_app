# Non-Functional Requirements (NFRs)

This document specifies the Non-Functional Requirements for the MidJournal application.

---

### NFR Category: Performance

#### Requirement: Chat Query Latency

**Description:** The time it takes for a user to receive a response after submitting a query in the chat interface.
**Metric:** Latency (ms), measured as the 90th percentile (P90).
**Target:** `< 500ms`
**Measurement Tool/Method:** Application Performance Monitoring (APM) tools like Prometheus/Grafana.
**Priority:** High
**Impact if not met:** Poor user experience, app feels unresponsive.

#### Requirement: Document Ingestion Rate

**Description:** The rate at which the system can process and index documents from bulk uploads.
**Metric:** Documents per minute.
**Target:** `100 documents/minute` (average)
**Measurement Tool/Method:** Custom application metrics logged to a monitoring service.
**Priority:** Medium
**Impact if not met:** Delays in making bulk-uploaded content available for querying.

#### Requirement: Voice Transcription Latency

**Description:** The time taken to transcribe a short audio clip into text.
**Metric:** Latency (ms).
**Target:** `< 200ms` for a 10-second audio clip.
**Measurement Tool/Method:** Application logs and metrics.
**Priority:** High
**Impact if not met:** User has to wait for transcription, disrupting the voice input flow.

---

### NFR Category: Scalability

#### Requirement: Concurrent Users

**Description:** The number of users the system can support simultaneously without performance degradation.
**Metric:** Number of concurrent active users.
**Target:** `1,000`
**Measurement Tool/Method:** Load testing using a tool like K6 or Locust.
**Priority:** High
**Impact if not met:** System may become slow or unavailable during peak usage.

#### Requirement: Data Volume Per User

**Description:** The amount of vectorized data the system can efficiently manage per user.
**Metric:** Storage size (GB).
**Target:** `10GB of vectorized data` per user.
**Measurement Tool/Method:** Vector database monitoring and user data reports.
**Priority:** Medium
**Impact if not met:** Limits the long-term value of the app for prolific users.

---

### NFR Category: Security

#### Requirement: Data Encryption

**Description:** Protection of user data both when stored and when being transmitted.
**Metric:** Compliance with specified encryption standards.
**Target:** All data at rest MUST be encrypted using AES-256. All data in transit MUST use TLS 1.2+.
**Measurement Tool/Method:** Infrastructure configuration audit; penetration testing.
**Priority:** High
**Impact if not met:** Critical user data could be compromised.

#### Requirement: Authentication

**Description:** Securely verifying the identity of users.
**Metric:** Compliance with password hashing standards.
**Target:** Implement industry-standard password hashing (e.g., bcrypt) and enforce strong password policies.
**Measurement Tool/Method:** Code review and security audit.
**Priority:** High
**Impact if not met:** User accounts could be easily compromised.

#### Requirement: Authorization

**Description:** Ensuring users can only access their own data.
**Metric:** Enforcement of user-based data access control.
**Target:** Strict row-level/document-level access control based on `user_id` for all data access.
**Measurement Tool/Method:** Code review, automated tests, and security audit.
**Priority:** High
**Impact if not met:** Users could potentially access or modify other users' data.

---

### NFR Category: Availability

#### Requirement: System Uptime

**Description:** The percentage of time the core services of the application are operational.
**Metric:** Uptime (%).
**Target:** `99.9%`
**Measurement Tool/Method:** Cloud monitoring services (e.g., AWS CloudWatch, UptimeRobot).
**Priority:** High
**Impact if not met:** Unreliable service, loss of user trust.

#### Requirement: Recovery Point Objective (RPO)

**Description:** The maximum acceptable amount of data loss in case of a disaster.
**Metric:** Time (hours).
**Target:** `1 hour`
**Measurement Tool/Method:** Review of database backup and restore procedures and schedules.
**Priority:** High
**Impact if not met:** Users could lose a significant amount of their journal data.

#### Requirement: Recovery Time Objective (RTO)

**Description:** The maximum acceptable time for the service to be restored after a disaster.
**Metric:** Time (hours).
**Target:** `4 hours`
**Measurement Tool/Method:** Disaster recovery drills and documentation.
**Priority:** High
**Impact if not met:** Prolonged outage would severely damage user trust and product reputation.

---

### NFR Category: Cost-Effectiveness

#### Requirement: Average Cost per Active User

**Description:** The target monthly operational cost for each active user.
**Metric:** Cost in USD ($).
**Target:** `< $2.00 per month`
**Measurement Tool/Method:** Cloud provider billing reports and analysis.
**Priority:** Medium
**Impact if not met:** Business model may not be sustainable.

---

### NFR Category: Data Privacy

#### Requirement: Privacy Compliance

**Description:** Adherence to relevant data privacy regulations.
**Metric:** Compliance audit.
**Target:** Adhere to Australian privacy principles (APP) and GDPR where applicable.
**Measurement Tool/Method:** Legal review and privacy policy documentation.
**Priority:** High
**Impact if not met:** Legal and financial penalties, loss of user trust.

#### Requirement: User Data Control

**Description:** Providing users with control over their own data.
**Metric:** Feature availability.
**Target:** Provide clear mechanisms for user data export and deletion.
**Measurement Tool/Method:** Feature verification.
**Priority:** High
**Impact if not met:** Non-compliance with privacy regulations, poor user experience.
