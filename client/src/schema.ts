import { z } from "zod";

export const internshipSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  company: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  location: z.string().min(2, { message: "Location must be at least 2 characters" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  requirements: z.array(z.string()).min(1, { message: "At least one requirement is required" }),
  skills: z.array(z.string()).min(1, { message: "At least one skill is required" }),
  salary: z.number().min(0, { message: "Salary must be a positive number" }),
  type: z.enum(["FULL_TIME", "PART_TIME", "REMOTE"]),
  status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
});

export type Internship = z.infer<typeof internshipSchema>;

export type ApplicationWithDetails = {
  id: string;
  internshipId: string;
  applicantId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  applicant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  }
};

export type Post = {
  id: number;
  content: string;
  authorId: number;
  image: string | null;
  createdAt: Date;
  likeCount: number;
  commentCount: number;
}; 