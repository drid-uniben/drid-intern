import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";

const baseEnv: Record<string, string> = {
  NODE_ENV: "test",
  PORT: "3000",
  POSTGRES_URI: "postgresql://user:pass@localhost:5432/drid",
  FRONTEND_URL: "http://127.0.0.1:3001",
  API_URL: "http://localhost:3000",
  LOG_LEVEL: "info",
  JWT_ACCESS_SECRET: "a".repeat(64),
  JWT_REFRESH_SECRET: "b".repeat(64),
  SMTP_HOST: "smtp-relay.com",
  SMTP_PORT: "587",
  SMTP_USER: "user@example.com",
  SMTP_PASS: "user-password",
  EMAIL_FROM: "noreply@example.com",
  ADMIN_NAME: "Admin",
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD: "admin-password",
};

for (const [key, value] of Object.entries(baseEnv)) {
  process.env[key] = value;
}

test("invite to review decision workflow", async () => {
  const { app } = await import("../app");
  const { seedAdmin } = await import("../bootstrap/seedAdmin");

  await seedAdmin();

  const adminLogin = await request(app).post("/api/v1/auth/login").send({
    email: "admin@example.com",
    password: "admin-password",
  });

  assert.equal(adminLogin.status, 200);
  const adminToken = adminLogin.body.data.accessToken as string;

  const createCohort = await request(app)
    .post("/api/v1/cohorts")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      year: 2026,
      cohortNumber: 2,
      deadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      allowedCategories: ["backend", "frontend", "fullstack", "design"],
    });

  assert.equal(createCohort.status, 201);
  const cohortId = createCohort.body.data.id as string;

  const activate = await request(app)
    .patch(`/api/v1/cohorts/${cohortId}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "ACTIVE" });

  assert.equal(activate.status, 200);

  const signupReviewer = await request(app).post("/api/v1/auth/signup").send({
    fullName: "Reviewer One",
    email: "reviewer@example.com",
    password: "admin-password",
  });
  assert.equal(signupReviewer.status, 201);
  const reviewerId = signupReviewer.body.data.id as string;

  const approveReviewer = await request(app)
    .patch(`/api/v1/users/${reviewerId}/approve`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({});
  assert.equal(approveReviewer.status, 200);

  const promoteReviewer = await request(app)
    .patch(`/api/v1/users/${reviewerId}/role`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ role: "REVIEWER" });
  assert.equal(promoteReviewer.status, 200);

  const reviewerLogin = await request(app).post("/api/v1/auth/login").send({
    email: "reviewer@example.com",
    password: "admin-password",
  });
  assert.equal(reviewerLogin.status, 200);
  const reviewerToken = reviewerLogin.body.data.accessToken as string;

  const invite = await request(app)
    .post("/api/v1/invitations")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      cohortId,
      category: "backend",
      emails: ["candidate@example.com"],
      expiresInDays: 7,
    });

  assert.equal(invite.status, 201);
  const invitationToken = invite.body.data[0].token as string;

  const submission = await request(app).post("/api/v1/submissions").send({
    invitationToken,
    fullName: "Candidate",
    email: "candidate@example.com",
    githubUrl: "https://github.com/example/repo",
    deploymentUrl: "https://example.com",
    message: "Please review my submission",
  });
  assert.equal(submission.status, 201);
  const submissionId = submission.body.data.id as string;

  const review = await request(app)
    .post("/api/v1/reviews")
    .set("Authorization", `Bearer ${reviewerToken}`)
    .send({
      submissionId,
      rating: 8,
      comment: "Strong implementation",
    });
  assert.equal(review.status, 201);

  const accept = await request(app)
    .patch(`/api/v1/submissions/${submissionId}/accept`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({});
  assert.equal(accept.status, 200);
  assert.equal(accept.body.data.status, "accepted");
});
