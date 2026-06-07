import request from "supertest";
import { app, sequelize, User } from "../server.js";

// Setup database before tests run and wipe data clean
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await User.destroy({ where: {}, truncate: true });
});

// Close database connection after tests complete
afterAll(async () => {
  await sequelize.close();
});

describe("User CRUD & Validation API", () => {
  describe("POST /users", () => {
    it("should create a user when payload passes Joi validation", async () => {
      const res = await request(app)
        .post("/users")
        .send({ name: "John Doe", email: "john@example.com" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("John Doe");
    });

    it("should reject payload with a 400 if validation fails", async () => {
      const res = await request(app)
        .post("/users")
        .send({ name: "Jo", email: "invalid-email" }); // Name too short, bad email

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
      expect(res.body.errors.length).toBe(2);
    });

    it("should return 409 if email already exists", async () => {
      await User.create({ name: "Alex Grey", email: "alex@example.com" });

      const res = await request(app)
        .post("/users")
        .send({ name: "Alex Grey", email: "alex@example.com" });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Email already exists");
    });
  });

  describe("GET /users", () => {
    it("should fetch all users", async () => {
      await User.create({ name: "User One", email: "one@example.com" });
      await User.create({ name: "User Two", email: "two@example.com" });

      const res = await request(app).get("/users");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it("should fetch a single user by id", async () => {
      const user = await User.create({
        name: "Single User",
        email: "single@example.com",
      });

      const res = await request(app).get(`/users/${user.id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Single User");
    });

    it("should return 404 if user id does not exist", async () => {
      const res = await request(app).get("/users/999");
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /users/:id", () => {
    it("should update an existing user", async () => {
      const user = await User.create({
        name: "Old Name",
        email: "old@example.com",
      });

      const res = await request(app)
        .put(`/users/${user.id}`)
        .send({ name: "New Name", email: "new@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("New Name");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete a user and return confirmation", async () => {
      const user = await User.create({
        name: "To Delete",
        email: "delete@example.com",
      });

      const res = await request(app).delete(`/users/${user.id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User deleted successfully");
    });
  });
});
