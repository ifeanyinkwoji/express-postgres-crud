import express from "express";
import { Sequelize, DataTypes } from "sequelize";
import joi from "joi";
import dotenv from "dotenv";

dotenv.config();

export const app = express();
app.use(express.json());

// 1. Database Hookup
export const sequelize = new Sequelize(
  process.env.DB_NAME || "crud_db",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "postgres_password",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
  },
);

// 2. Data Definition
export const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
});

// 3. Joi Validation Schemas & Middleware
const userSchema = joi.object({
  name: joi.string().min(3).max(30).required().messages({
    "string.min": '"name" must be at least 3 characters long',
    "any.required": '"name" is a required field',
  }),
  email: joi.string().email().required().messages({
    "string.email": '"email" must be a valid email address',
    "any.required": '"email" is a required field',
  }),
});

const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }
  next();
};

// 4. CRUD Routes with Validation Middleware Applied
app.post("/users", validateUser, async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = await User.create({ name, email });
    res.status(201).json(newUser);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(400).json({ error: error.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/users/:id", validateUser, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update({ name, email });
    res.status(200).json(user);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(400).json({ error: error.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Conditional Server Boot (Prevents port conflicts during testing)
if (process.env.NODE_ENV !== "test") {
  sequelize
    .sync({ alter: true })
    .then(() => {
      console.log("✅ Database connected");
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    })
    .catch((err) => console.error("❌ Sync failed:", err));
}
