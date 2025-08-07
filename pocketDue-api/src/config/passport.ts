import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User as UserModel } from "../models/User";
import { logger } from "../utils/logger";

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (error) {
        logger.error("Local strategy error", { error, email });
        return done(error);
      }
    }
  )
);

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Serialize user
passport.serializeUser(function (user: any, done) {
  done(null, user && user._id ? user._id.toString() : undefined);
});

export default passport;
