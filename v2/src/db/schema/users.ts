import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
  date,
  index,
} from "drizzle-orm/pg-core";
import { userRole } from "./enums";
import { timestamps, authorship, activeFlag, softDelete } from "./_shared";

export const users = pgTable(
  "users",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),

    // Identity
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),

    // Personal
    firstName: varchar("first_name", { length: 50 }).notNull(),
    lastName: varchar("last_name", { length: 50 }).notNull(),
    profilePicture: varchar("profile_picture", { length: 512 }),
    bio: varchar("bio", { length: 500 }),
    dateOfBirth: date("date_of_birth"),

    // Contact
    phone: varchar("phone", { length: 20 }),
    address: varchar("address", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    country: varchar("country", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }),

    // Role / org
    role: userRole("role").notNull().default("user"),
    organization: varchar("organization", { length: 100 }),

    // Status
    ...activeFlag,
    isOnline: boolean("is_online").notNull().default(false),
    lastLogin: timestamp("last_login", { withTimezone: true }),

    // Email verification
    isEmailVerified: boolean("is_email_verified").notNull().default(false),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    emailVerificationToken: varchar("email_verification_token", { length: 255 }),
    emailVerificationExpires: timestamp("email_verification_expires", {
      withTimezone: true,
    }),

    // Security
    twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
    twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
    loginAttempts: integer("login_attempts").notNull().default(0),
    lockUntil: timestamp("lock_until", { withTimezone: true }),

    // Password management
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }),
    passwordResetToken: varchar("password_reset_token", { length: 255 }),
    passwordResetExpires: timestamp("password_reset_expires", {
      withTimezone: true,
    }),

    ...timestamps,
    ...authorship,
    ...softDelete,
  },
  (t) => [
    index("idx_users_email").on(t.email),
    index("idx_users_username").on(t.username),
    index("idx_users_role").on(t.role),
    index("idx_users_organization").on(t.organization),
    index("idx_users_is_active").on(t.isActive),
    index("idx_users_is_deleted").on(t.isDeleted),
    index("idx_users_email_verification_token").on(t.emailVerificationToken),
    index("idx_users_password_reset_token").on(t.passwordResetToken),
    index("idx_users_last_login").on(t.lastLogin),
    index("idx_users_created_at").on(t.createdAt),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
