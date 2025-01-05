# Production-Grade Express with Mongoose and TypeScript

---

## Installing Dependencies

### Core Dependencies:

```bash
npm install express mongoose dotenv zod
```

### Development Dependencies:

```bash
npm install typescript ts-node @types/node @types/express nodemon --save-dev
```

---

## Features

This project includes:

- **TypeScript** for a safer and more maintainable codebase.
- **Express.js** for building RESTful APIs.
- **Mongoose** for MongoDB integration and schema modeling.
- **Error Handling** with custom middleware.
- **Environment Configuration** with `dotenv` for managing secrets and environment variables.

---

## Project Structure

Here’s how the project is organized:

```plaintext
src/
├── config/               # Configuration files
│   ├── db.ts             # MongoDB connection logic
│   └── env.ts            # Environment variable handling
├── controllers/          # Functions handling API requests
├── middlewares/          # Custom Express middleware (e.g., error handling)
├── models/               # Mongoose models and schemas
├── routes/               # API route definitions
├── services/             # Business logic (reusable code)
├── utils/                # Utility functions
├── validations/          # Input validation schemas (using Joi)
├── app.ts                # Sets up Express app
└── index.ts              # Entry point (starts the server)
```

---

## Detailed Features

### 1. Connecting to MongoDB

The database connection is handled in `src/config/db.ts`. Here’s a simple example:

```typescript
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("MongoDB Connected!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit the process if DB connection fails
  }
};
```

This function is called when the server starts in `src/index.ts`.

### 2. Error Handling Middleware

Centralized error handling makes debugging easier:

```typescript
import { Request, Response, NextFunction } from "express";

// Define the error type explicitly as a general Error
interface CustomError extends Error {
  statusCode?: number;
  message: string;
}

export const ErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errStatus = err.statusCode || 500;
  const errMsg = err.message || "Something went wrong";
  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
  });
};
```

---

## Example Code

### Sample User Route

```typescript
import { Router } from "express";
import { userController } from "../controllers/userController.ts";
const authRouter = Router();

authRouter.post(
  "/register",
  (req: Request, res: Response, next: NextFunction) => {
    AuthController.handle_register_user(req, res, next);
  }
);
export default authRouter;
```

### Mongoose Model Example

```typescript
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error as Error); // No TypeScript error
  }
});

export const User = mongoose.model<IUser>("User", userSchema);
```

---

## Scripts

| Command         | Code                                  | Description                           |
| --------------- | ------------------------------------- | ------------------------------------- |
| `npm run dev`   | `nodemon --exec ts-node src/index.ts` | Start development server with nodemon |
| `npm run build` | `tsc`                                 | Compile TypeScript to JavaScript      |
| `npm run start` | `node dist/index.js`                  | Start the production server           |

---
