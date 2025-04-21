import { Discussion, DiscussionReply, ForumCategory } from "@/types/types";

// Mock categories data
export const categoriesData: ForumCategory[] = [
  {
    category_id: "academic",
    name: "Academic",
    description: "Discussions related to academic matters, courses, and studies",
    icon: "book",
    display_order: 1,
    is_private: false,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    category_id: "study-groups",
    name: "Study Groups",
    description: "For organizing and discussing study groups",
    icon: "users",
    display_order: 2,
    is_private: false,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    category_id: "career",
    name: "Career",
    description: "Career advice, internships, and job opportunities",
    icon: "briefcase",
    display_order: 3,
    is_private: false,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  }
];

// Mock discussions data
export const discussionsData: Discussion[] = [
  {
    discussion_id: "1",
    title: "Tips for University Applications",
    content: "Hi everyone, I'm preparing my university applications and would like to share some tips I've learned along the way. First, start early! Applications can take much longer than you expect. Second, get multiple people to review your personal statement. Third, research each university thoroughly to tailor your application. Fourth, don't forget to highlight extracurricular activities that show your character. Hope this helps!",
    author_id: "user1",
    author_type: "student",
    category_id: "academic",
    is_pinned: false,
    is_closed: false,
    is_anonymous: false,
    view_count: 120,
    created_at: "2025-04-19T14:00:00Z",
    updated_at: "2025-04-19T14:00:00Z"
  },
  {
    discussion_id: "2",
    title: "Study Group for IB Physics",
    content: "Looking to form a study group for IB Physics. We can meet twice a week to review concepts, solve problems together, and prepare for the exams. I find mechanics and thermodynamics particularly challenging, so would love to collaborate with others. Let me know if you're interested!",
    author_id: "user2",
    author_type: "student",
    category_id: "study-groups",
    is_pinned: false,
    is_closed: false,
    is_anonymous: false,
    view_count: 75,
    created_at: "2025-04-16T09:00:00Z",
    updated_at: "2025-04-16T09:00:00Z"
  },
  {
    discussion_id: "3",
    title: "Career Fair Experience Sharing",
    content: "Just attended the annual career fair and wanted to share my experience. The event was well-organized with representatives from over 50 companies across different industries. I found that companies were particularly interested in students who had done relevant projects or internships. I managed to schedule three interviews for summer internships! Make sure to bring plenty of resumes and practice your elevator pitch beforehand.",
    author_id: "user3",
    author_type: "student",
    category_id: "career",
    is_pinned: true,
    is_closed: false,
    is_anonymous: false,
    view_count: 210,
    created_at: "2025-04-20T11:00:00Z",
    updated_at: "2025-04-20T11:00:00Z"
  }
];

// Mock discussion replies
export const repliesData: Record<string, DiscussionReply[]> = {
  "1": [
    {
      reply_id: "1-1",
      discussion_id: "1",
      content: "Thanks for sharing these tips! I found that starting applications early really helped me too.",
      author_id: "user4",
      author_type: "student",
      parent_reply_id: null,
      is_anonymous: false,
      is_solution: false,
      created_at: "2025-04-19T15:00:00Z",
      updated_at: "2025-04-19T15:00:00Z"
    },
    {
      reply_id: "1-2",
      discussion_id: "1",
      content: "Do you have any tips specifically for writing personal statements?",
      author_id: "user5",
      author_type: "student",
      parent_reply_id: null,
      is_anonymous: false,
      is_solution: false,
      created_at: "2025-04-19T17:30:00Z",
      updated_at: "2025-04-19T17:30:00Z"
    }
  ],
  "2": [
    {
      reply_id: "2-1",
      discussion_id: "2",
      content: "I'd be interested in joining! I'm struggling with mechanics.",
      author_id: "user6",
      author_type: "student",
      parent_reply_id: null,
      is_anonymous: false,
      is_solution: false,
      created_at: "2025-04-16T13:00:00Z",
      updated_at: "2025-04-16T13:00:00Z"
    }
  ],
  "3": [
    {
      reply_id: "3-1",
      discussion_id: "3",
      content: "Did you get any internship opportunities from the fair?",
      author_id: "user7",
      author_type: "student",
      parent_reply_id: null,
      is_anonymous: false,
      is_solution: false,
      created_at: "2025-04-21T02:00:00Z",
      updated_at: "2025-04-21T02:00:00Z"
    },
    {
      reply_id: "3-2",
      discussion_id: "3",
      content: "Which companies did you find most interesting?",
      author_id: "user8",
      author_type: "student",
      parent_reply_id: null,
      is_anonymous: false,
      is_solution: false,
      created_at: "2025-04-21T07:00:00Z",
      updated_at: "2025-04-21T07:00:00Z"
    },
    {
      reply_id: "3-3",
      discussion_id: "3",
      content: "Thanks for sharing! Do you have any tips for preparing for next year's fair?",
      author_id: "user9",
      author_type: "student",
      parent_reply_id: null,
      is_anonymous: false,
      is_solution: false,
      created_at: "2025-04-21T12:00:00Z",
      updated_at: "2025-04-21T12:00:00Z"
    }
  ]
};

// Helper function to get author name (would be replaced by API call in production)
export const getAuthorName = (authorId: string): string => {
  const names: Record<string, string> = {
    "user1": "Sarah L.",
    "user2": "David W.",
    "user3": "Rachel T.",
    "user4": "Michael P.",
    "user5": "Jessica T.",
    "user6": "Emma L.",
    "user7": "John D.",
    "user8": "Sophia R.",
    "user9": "Mark Z."
  };
  return names[authorId] || "Anonymous User";
};