import { Discussion } from "./types";

export const discussionsData: Discussion[] = [
  {
    id: "1",
    slug: "tips-for-university-applications",
    title: "Tips for University Applications",
    author: "Sarah L.",
    date: "2 hours ago",
    category: "Academic",
    replies: [
      {
        id: "1-1",
        author: "Michael P.",
        content: "Thanks for sharing these tips! I found that starting applications early really helped me too.",
        date: "1 hour ago",
        likes: 5
      },
      {
        id: "1-2",
        author: "Jessica T.",
        content: "Do you have any tips specifically for writing personal statements?",
        date: "30 minutes ago",
        likes: 2
      }
    ],
    likes: 23,
    content: "Hi everyone, I'm preparing my university applications and would like to share some tips I've learned along the way. First, start early! Applications can take much longer than you expect. Second, get multiple people to review your personal statement. Third, research each university thoroughly to tailor your application. Fourth, don't forget to highlight extracurricular activities that show your character. Hope this helps!",
    preview: "Hi everyone, I'm preparing my university applications and would like to share some tips..."
  },
  {
    id: "2",
    slug: "study-group-for-ib-physics",
    title: "Study Group for IB Physics",
    author: "David W.",
    date: "5 hours ago",
    category: "Study Groups",
    replies: [
      {
        id: "2-1",
        author: "Emma L.",
        content: "I'd be interested in joining! I'm struggling with mechanics.",
        date: "4 hours ago",
        likes: 3
      }
    ],
    likes: 12,
    content: "Looking to form a study group for IB Physics. We can meet twice a week to review concepts, solve problems together, and prepare for the exams. I find mechanics and thermodynamics particularly challenging, so would love to collaborate with others. Let me know if you're interested!",
    preview: "Looking to form a study group for IB Physics. We can meet twice a week..."
  },
  {
    id: "3",
    slug: "career-fair-experience-sharing",
    title: "Career Fair Experience Sharing",
    author: "Rachel T.",
    date: "1 day ago",
    category: "Career",
    replies: [
      {
        id: "3-1",
        author: "John D.",
        content: "Did you get any internship opportunities from the fair?",
        date: "20 hours ago",
        likes: 4
      },
      {
        id: "3-2",
        author: "Sophia R.",
        content: "Which companies did you find most interesting?",
        date: "15 hours ago",
        likes: 2
      },
      {
        id: "3-3",
        author: "Mark Z.",
        content: "Thanks for sharing! Do you have any tips for preparing for next year's fair?",
        date: "10 hours ago",
        likes: 7
      }
    ],
    likes: 45,
    content: "Just attended the annual career fair and wanted to share my experience. The event was well-organized with representatives from over 50 companies across different industries. I found that companies were particularly interested in students who had done relevant projects or internships. I managed to schedule three interviews for summer internships! Make sure to bring plenty of resumes and practice your elevator pitch beforehand.",
    preview: "Just attended the annual career fair and wanted to share my experience..."
  }
]; 