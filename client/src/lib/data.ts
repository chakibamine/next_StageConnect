import { User, Internship, Post, Connection, Message, Application, CV } from "@shared/schema";

// Mock User Data
export const mockUsers: User[] = [
  {
    id: 1,
    username: "alexjohnson",
    password: "hashed_password",
    email: "alex.johnson@email.com",
    firstName: "Alex",
    lastName: "Johnson",
    role: "student",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    bio: "Computer Science student passionate about web development and UX design.",
    location: "Paris, France",
    phone: "+33 6 12 34 56 78",
    website: "alexjohnson.dev",
    company: "Paris University",
    position: "Computer Science Student",
    isVerified: true,
    createdAt: new Date("2022-09-01"),
  },
  {
    id: 2,
    username: "jameswilson",
    password: "hashed_password",
    email: "james.wilson@techcorp.com",
    firstName: "James",
    lastName: "Wilson",
    role: "supervisor",
    profilePicture: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    bio: "HR Director with 10+ years of experience in talent acquisition and development.",
    location: "Paris, France",
    phone: "+33 6 23 45 67 89",
    website: "techcorp.com",
    company: "TechCorp",
    position: "HR Director",
    isVerified: true,
    createdAt: new Date("2022-08-15"),
  },
  {
    id: 3,
    username: "sarahchen",
    password: "hashed_password",
    email: "sarah.chen@creativeedge.com",
    firstName: "Sarah",
    lastName: "Chen",
    role: "supervisor",
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    bio: "Marketing Specialist with expertise in digital campaigns and brand strategy.",
    location: "Lyon, France",
    phone: "+33 6 34 56 78 90",
    website: "creativeedge.com",
    company: "CreativeEdge",
    position: "Marketing Specialist",
    isVerified: true,
    createdAt: new Date("2022-07-20"),
  },
  {
    id: 4,
    username: "michaelroberts",
    password: "hashed_password",
    email: "michael.roberts@parisuniversity.edu",
    firstName: "Michael",
    lastName: "Roberts",
    role: "supervisor",
    profilePicture: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    bio: "Professor of Computer Science with research interests in artificial intelligence and machine learning.",
    location: "Paris, France",
    phone: "+33 6 45 67 89 01",
    website: "parisuniversity.edu",
    company: "Paris University",
    position: "Professor",
    isVerified: true,
    createdAt: new Date("2022-06-10"),
  },
  {
    id: 5,
    username: "emmadavis",
    password: "hashed_password",
    email: "emma.davis@google.com",
    firstName: "Emma",
    lastName: "Davis",
    role: "supervisor",
    profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    bio: "Software Engineer with expertise in frontend development and user experience design.",
    location: "Paris, France",
    phone: "+33 6 56 78 90 12",
    website: "google.com",
    company: "Google",
    position: "Software Engineer",
    isVerified: true,
    createdAt: new Date("2022-05-05"),
  },
];

// Mock Internship Data
export const mockInternships: Internship[] = [
  {
    id: 1,
    title: "UX/UI Design Intern",
    company: "DesignHub",
    location: "Paris, France",
    description: "Join our creative team to design intuitive user interfaces for web and mobile applications. You'll work with experienced designers and developers to create elegant solutions to complex UX challenges.",
    requirements: "Proficiency in Figma, Adobe XD, and basic knowledge of HTML/CSS. Studying design or a related field.",
    duration: "6 months",
    isPaid: true,
    workType: "Hybrid",
    compensation: "€800/month",
    applicationDeadline: new Date("2023-06-15"),
    postedBy: 2,
    createdAt: new Date("2023-05-01"),
  },
  {
    id: 2,
    title: "Software Engineering Intern",
    company: "TechCorp",
    location: "Lyon, France",
    description: "Looking for a passionate software engineering intern to join our development team. You'll be working on real projects using technologies like React, Node.js, and AWS. Great opportunity to apply your technical skills in a real-world setting.",
    requirements: "Knowledge of JavaScript, React, and Node.js. Currently pursuing a degree in Computer Science or related field.",
    duration: "3 months",
    isPaid: true,
    workType: "On-site",
    compensation: "€900/month",
    applicationDeadline: new Date("2023-06-30"),
    postedBy: 2,
    createdAt: new Date("2023-04-28"),
  },
  {
    id: 3,
    title: "Marketing Analytics Intern",
    company: "GlobalBrands",
    location: "Paris, France",
    description: "GlobalBrands is seeking a Marketing Analytics Intern to help analyze campaign performance and provide data-driven insights. You'll work with marketing teams to optimize strategies and measure ROI across different channels.",
    requirements: "Strong analytical skills, knowledge of Excel and Google Analytics. Studying Marketing, Business, or Statistics.",
    duration: "6 months",
    isPaid: true,
    workType: "Remote",
    compensation: "€850/month",
    applicationDeadline: new Date("2023-06-10"),
    postedBy: 3,
    createdAt: new Date("2023-04-30"),
  },
  {
    id: 4,
    title: "Research & Development Intern",
    company: "BioInnovate",
    location: "Marseille, France",
    description: "BioInnovate is looking for a research intern to assist in our biotech R&D department. The ideal candidate will have a background in biology or chemistry and a strong interest in laboratory research and innovation.",
    requirements: "Background in Biology, Chemistry or related field. Laboratory experience is a plus.",
    duration: "6+ months",
    isPaid: true,
    workType: "On-site",
    compensation: "€950/month",
    applicationDeadline: new Date("2023-07-15"),
    postedBy: 4,
    createdAt: new Date("2023-04-25"),
  },
];

// Mock Post Data
export const mockPosts: Post[] = [
  {
    id: 1,
    content: "We're excited to announce that we're hiring summer interns for our Software Development department! Looking for passionate students who want to gain real-world experience. #Internships #TechJobs",
    authorId: 2,
    image: null,
    createdAt: new Date("2023-05-10"),
    likeCount: 15,
    commentCount: 3,
  },
  {
    id: 2,
    content: "Just finished my 6-month internship at CreativeEdge. It was an incredible learning experience working with such talented professionals. Huge thanks to my amazing supervisor @JaneSmith for the guidance! #Internship #CareerGrowth",
    authorId: 3,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    createdAt: new Date("2023-05-08"),
    likeCount: 42,
    commentCount: 7,
  },
  {
    id: 3,
    content: "Reminder to all my students: The deadline for submitting your internship applications is next Friday. Make sure your CVs are updated and professional. If you need any help with your applications, my office hours are Tuesday 2-4pm. #StudentSuccess",
    authorId: 4,
    image: null,
    createdAt: new Date("2023-05-05"),
    likeCount: 18,
    commentCount: 5,
  },
  {
    id: 4,
    content: "Just completed my project on React and TypeScript. Excited to share more about what I've learned! #WebDevelopment #ReactJS",
    authorId: 1,
    image: null,
    createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    likeCount: 12,
    commentCount: 3,
  },
  {
    id: 5,
    content: "Looking for recommendations on advanced JavaScript courses. Has anyone taken any good ones recently?",
    authorId: 1,
    image: null,
    createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    likeCount: 5,
    commentCount: 7,
  },
];

// Helper function to get user data by ID
export const getUserById = (id: number): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

// Helper function to get internships by company
export const getInternshipsByCompany = (company: string): Internship[] => {
  return mockInternships.filter(internship => 
    internship.company.toLowerCase().includes(company.toLowerCase())
  );
};

// Helper function to search internships
export const searchInternships = (keyword: string, location: string): Internship[] => {
  keyword = keyword.toLowerCase();
  location = location.toLowerCase();
  
  return mockInternships.filter(internship => 
    (keyword ? (
      internship.title.toLowerCase().includes(keyword) ||
      internship.company.toLowerCase().includes(keyword) ||
      internship.description.toLowerCase().includes(keyword)
    ) : true) &&
    (location ? internship.location.toLowerCase().includes(location) : true)
  );
};

// Helper function to get posts by user ID
export const getPostsByUserId = (userId: number): Post[] => {
  return mockPosts.filter(post => post.authorId === userId);
};
