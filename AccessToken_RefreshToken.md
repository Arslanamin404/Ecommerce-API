# Authentication with Access and Refresh Tokens in Express.js and MongoDB

---

## **Understanding Short-Lived and Long-Lived Tokens with Refresh Token Rotation**

### **1. Introduction**

Authentication systems often use two types of tokens:

#### 1. Short-lived tokens (Access Tokens)

#### 2. Long-lived tokens (Refresh Tokens)

These tokens provide secure, scalable, and user-friendly ways to maintain user sessions. In modern systems, we often combine short-lived access tokens with refresh token rotation to balance security and user convenience.

---

### 2. Short-Lived Tokens (Access Tokens)

#### What Are They?

- Access tokens are issued to the client after authentication and are used to access protected resources.
- They are short-lived (e.g., valid for 15 minutes to 1 hour).

#### Why Use Short-Lived Tokens?

- **Security:** Minimize the impact of token theft.
- **No Manual Revocation Needed:** Tokens naturally expire after a short duration.

Once an access token expires, the client cannot make API requests unless a new token is obtained using a refresh token.

---

### **3. Long-Lived Tokens (Refresh Tokens)**

#### What Are They?

- **Refresh tokens** are issued alongside access tokens but are long-lived (e.g., valid for 30 days).
- They are securely stored on the client and used to request new access tokens when the current one expires.

#### Why Use Long-Lived Tokens?

- Enable **seamless user sessions** over extended periods without requiring frequent logins.
- Provide a fallback to refresh access tokens securely.

---

### **4. Refresh Token Rotation**

#### What Is Refresh Token Rotation?

- **Refresh token rotation** means that every time a refresh token is used, the server:
  1. Issues a new **refresh token**.
  2. Invalidates the old refresh token.

#### How It Works:

1. Client sends a refresh token to the server.
2. Server verifies the refresh token.
3. If valid:
   - Issues a new access token.
   - Issues a new refresh token.
4. Stores the new refresh token in the database and invalidates the old one.

---

### **5. Workflow Example**

#### Token Lifespan:

- **Access Token:** 15 minutes
- **Refresh Token:** 30 days (rotated on each use)

#### Day 1:

1.  User logs in.
2.  Server issues:
    - **Access Token**: Valid for 15 minutes.
    - **Refresh Token**: Valid for 30 days.

#### After 15 Minutes:

1. Access Token Expires.
2. Client sends the **Refresh Token** to the server.
3. Server:
   - Verifies the **refresh token**.
   - Issues:
     - A new **Access Token** (valid for another 15 minutes).
     - A new **Refresh Token** (valid for 30 days).
   - Invalidates the old **refresh token**.

#### Day 15:

- The refresh token has been used multiple times, rotated with each use.
- The user is still authenticated without logging in again.

#### Day 30:

- **If the user does not use the system for 30 days, the refresh token expires, requiring the user to log in again.**

---

### **6. Security Advantages**

**Short-Lived Tokens:**

- Reduce the risk of unauthorized access if stolen.
- Automatically expire, requiring revalidation through a refresh token.

**Refresh Token Rotation:**

- Limits the damage of refresh token theft.
- Attackers cannot reuse an expired or rotated refresh token.

---

## **Implementation**

### **1. Define MongoDB Models**

**User Schema:**

```typescript
import { Schema, Document, model, Model, Types } from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
const { isEmail } = validator;

export interface IUser extends Document {
  _id: Types.ObjectId; // Explicitly type _id as ObjectId
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  profile_url?: string;
  role: "user" | "admin";
  isVerified: boolean;
  refreshToken?: string;
  otp?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    first_name: {
      type: String,
      required: [true, "first name is required"],
      minlength: [4, "first name must be at least 4 characters long"],
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "enter a valid email address"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [7, "password must be al least 7 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile_url: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

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

export const User: Model<IUser> = model("User", userSchema);
```

---

### **2. Utility Functions for Tokens**

**Token Generation and Verification:**

```typescript
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction } from "express";
import { config } from "../config/env.ts";

interface Payload {
  id: string;
  email: string;
}
const generateToken = (payload: Payload, secret: string, expiresIn: string) => {
  return jwt.sign(payload, secret, { expiresIn });
};
export const generateTokens = (user: Payload) => {
  const accessToken = generateToken(
    { id: user.id.toString(), email: user.email },
    config.ACCESS_TOKEN_SECRET,
    config.ACCESS_TOKEN_EXPIRES_IN
  );
  const refreshToken = generateToken(
    { id: user.id.toString(), email: user.email },
    config.REFRESH_TOKEN_SECRET,
    config.REFRESH_TOKEN_EXPIRES_IN
  );
  return { accessToken, refreshToken };
};

export const verifyToken = (
  token: string,
  secret: string,
  next: NextFunction
): JwtPayload | undefined => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    next(error); // Pass the error to the next middleware
    return undefined; // Explicitly return undefined if an error occurs
  }
};
```

---

### **3. Authentication Routes**

**Register and Login Routes:**

```typescript
import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { generateToken, verifyToken } from "../utils/tokenUtils";

const router = express.Router();

// Register
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { first_name, last_name, email, password } = req.body;

      if (!first_name || !email || !password) {
        return API_Response(res, 400, false, "All fields are required");
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return API_Response(res, 400, false, "User already registered");
      }

      const raw_otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(
        Date.now() + (config.OTP_EXPIRES || 5 * 60 * 1000)
      ); // OTP valid for 5 minutes
      const hashed_OTP = await generate_hashed_OTP(raw_otp, next);

      const new_user: IUser = new User({
        first_name,
        last_name,
        email,
        password,
        otp: hashed_OTP,
        otpExpiresAt,
      });
      await new_user.save();

      await sendEmail(
        email,
        "Verify Your Email",
        `Your OTP is: ${raw_otp}.\nIts valid for 5 minutes only.`
      );

      return API_Response(
        res,
        201,
        true,
        "User registered. OTP sent to email."
      );
    } catch (error) {
      next(error);
    }
  }
);

//verifyOTP
router.post("/verify-otp", async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return API_Response(res, 400, false, "All fields are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return API_Response(res, 401, false, "Invalid Credentials");
    }

    if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
      return API_Response(res, 400, false, "Invalid or expired OTP");
    }

    // Ensure `user.otp` is defined
    if (!user.otp) {
      return API_Response(res, 400, false, "Invalid or expired OTP");
    }

    const isOtpValid = await verify_OTP(otp, user.otp, next);
    if (!isOtpValid) {
      return API_Response(res, 400, false, "Invalid or expired OTP");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return API_Response(res, 200, true, "Email verified successfully");
  } catch (error) {
    next(error);
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return API_Response(res, 400, false, "All fields are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return API_Response(res, 401, false, "Invalid Credentials");
    }

    if (!user.isVerified) {
      return API_Response(res, 403, false, "Email not verified");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return API_Response(res, 401, false, "Invalid Credentials");
    }

    // Generate tokens (refresh token -- Long Lived adn accessToken -- Short lived)
    const { refreshToken, accessToken } = generateTokens({
      id: user._id.toString(),
      email: user.email,
    });

    // Save refreshToken in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Ensure secure flag is enabled for HTTPS environments
      sameSite: "strict", // Prevent CSRF
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // Ensure secure flag is enabled for HTTPS environments
      sameSite: "strict", // Prevent CSRF
    });

    return API_Response(res, 200, true, null, accessToken);
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

### **4. Token Refresh Route**

**Refresh Access Tokens:**

```typescript
import express, { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { generateToken, verifyToken } from "../utils/tokenUtils";

const router = express.Router();

router.post(
  "/refresh-token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

      if (!incomingRefreshToken) {
        return API_Response(res, 401, false, "Unauthorized Request");
      }

      const decodedToken = verifyToken(
        incomingRefreshToken,
        config.REFRESH_TOKEN_SECRET,
        next
      );

      if (!decodedToken || typeof decodedToken !== "object") {
        return API_Response(res, 403, false, "Invalid refresh token");
      }

      const user = await User.findById(decodedToken.id);

      if (!user) {
        return API_Response(res, 403, false, "Invalid refresh token");
      }

      // Use a secure comparison to prevent timing attacks
      const isTokenValid = user.refreshToken === incomingRefreshToken;

      if (!isTokenValid) {
        return API_Response(
          res,
          401,
          false,
          "Invalid or expired refresh token"
        );
      }

      // Generate new tokens
      const { refreshToken, accessToken } = generateTokens({
        id: user._id.toString(),
        email: user.email,
      });

      // Update user's refresh token in the database
      user.refreshToken = refreshToken;
      await user.save();

      // Set new cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // Ensure secure flag is enabled for HTTPS environments
        sameSite: "strict", // Prevent CSRF
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // Ensure secure flag is enabled for HTTPS environments
        sameSite: "strict", // Prevent CSRF
      });

      return API_Response(res, 200, true, "Token refreshed successfully");
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

---

### **6. Middleware for Protected Routes**

**Authentication Middleware:**

```typescript
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/tokenUtils";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(refreshToken, config.ACCESS_TOKEN_SECRET);

    req.body.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(403).json({ message: "Forbidden" });
  }
};
```

---

## Summary

By combining short-lived access tokens with long-lived refresh tokens (using rotation), you can achieve both security and user convenience in authentication workflows. This approach provides a robust mechanism to maintain user sessions while minimizing risks from token theft or misuse.
