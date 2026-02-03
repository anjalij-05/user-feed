import * as yup from "yup";

export const inviteFormSchema = yup.object().shape({
  first_name: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces allowed"),
  last_name: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces allowed"),
  email_id: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  country_code: yup.string().required("Country is required"),
  phone_number: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  company_name: yup
    .string()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters"),
  job_title: yup
    .string()
    .required("Designation is required")
    .min(2, "Designation must be at least 2 characters"),
});

export type InviteFormData = yup.InferType<typeof inviteFormSchema>;