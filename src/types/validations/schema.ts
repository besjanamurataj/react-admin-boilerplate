import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z
    .string()
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Email is not valid, put a valid email",
    ),
  roles: z.array(z.number()).min(1, "Select at least one role"),
  userInfo: z.object({
    phoneNumber: z
      .string()
      .refine(
        (val) => val === "" || /^(\+3556\d{8}|3556\d{8}|06\d{8})$/.test(val),
        {
          message:
            "Numër telefoni i pavlefshëm (p.sh. 06XXXXXXXX ose +3556XXXXXXXX)",
        },
      ),
    birthDate: z.string().optional(),
    gender: z.string().optional(),
    street: z.string().optional(),
  }),
});
export const loginSchema = z.object({
  email: z
    .string()
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Email is not valid, put a valid email",
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is not valid"),
  number: z.string().min(8, "Phone number is too short"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  birthdate: z.date().refine((date) => date instanceof Date, {
    message: "Birth date is required",
  }),
});

export const forgotSchema = z.object({
  email: z
    .string()
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Email is not valid, put a valid email",
    ),
});

export const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const roleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  authorities: z.array(z.number()).min(1, "Select at least one authority"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type UserFormValues = z.infer<typeof userSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotFormValue = z.infer<typeof forgotSchema>;
export type PasswordFormValue = z.infer<typeof passwordSchema>;
export type RoleFormValue = z.infer<typeof roleSchema>;
