export interface Reply {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
}

export interface Discussion {
  id: string;
  slug: string;
  title: string;
  author: string;
  date: string;
  category: 'Academic' | 'Career' | 'Study Groups' | 'Other';
  replies: Reply[];
  likes: number;
  content: string;
  preview: string;
}

export interface NewDiscussionForm {
  title: string;
  category: string;
  content: string;
}

export interface NewReplyForm {
  content: string;
} 