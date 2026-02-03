import * as yup from "yup";

export const registerSchema = yup.object().shape({
  first_name: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  last_name: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  mobileNumber: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  designation: yup
    .string()
    .required("Designation is required")
    .min(2, "Designation must be at least 2 characters"),
  company: yup
    .string()
    .required("Company is required")
    .min(2, "Company must be at least 2 characters"),
  role: yup.string().default("user"),
  countryCode: yup.number().required("Country code is required"),
  profileImage: yup.string().required("Profile image is required"),
});

export type RegisterForm = yup.InferType<typeof registerSchema>;
