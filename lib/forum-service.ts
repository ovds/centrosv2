import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ForumCategory, Discussion, DiscussionReply, UserProfile } from '@/types/supabase';
import { createNotification } from './appointment-service';

// Get all forum categories
export async function getForumCategories(): Promise<ForumCategory[]> {
  try {
    const { data, error } = await supabase
      .from('Forum_Category')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching forum categories:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching forum categories:', error);
    return [];
  }
}

// Get discussions with optional filtering
export async function getDiscussions({
  categoryId,
  authorId,
  searchQuery,
  page = 1,
  limit = 20
}: {
  categoryId?: string;
  authorId?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
}): Promise<Discussion[]> {
  try {
    let query = supabase
      .from('Discussion')
      .select(`
        *,
        Forum_Category(name),
        replies:Discussion_Reply(count),
        author_student:Student!author_id(name),
        author_counsellor:Counsellor!author_id(name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (authorId) {
      query = query.eq('author_id', authorId);
    }
    
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching discussions:', error);
      return [];
    }
    
    // Transform discussions to include author name based on author_type
    return (data || []).map(discussion => {
      let author_name = 'Unknown';
      if (discussion.author_type === 'student' && discussion.author_student) {
        author_name = discussion.author_student?.name;
      } else if (discussion.author_type === 'counsellor' && discussion.author_counsellor) {
        author_name = discussion.author_counsellor?.name;
      }
      
      // Handle anonymous posts
      if (discussion.is_anonymous) {
        author_name = 'Anonymous';
      }
      
      return {
        ...discussion,
        author_name,
        category_name: discussion.Forum_Category?.name,
        replies_count: discussion.replies?.length || 0
      };
    });
  } catch (error) {
    console.error('Unexpected error fetching discussions:', error);
    return [];
  }
}

// Get a specific discussion by ID or slug
export async function getDiscussion(idOrSlug: string): Promise<Discussion | null> {
  try {
    // Try to fetch by ID first
    let query = supabase
      .from('Discussion')
      .select(`
        *,
        Forum_Category(name),
        author_student:Student!author_id(name),
        author_counsellor:Counsellor!author_id(name)
      `);
    
    // Check if the parameter is a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    if (isUuid) {
      query = query.eq('discussion_id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      console.error('Error fetching discussion:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Increment view count
    await incrementDiscussionViewCount(data.discussion_id);
    
    // Determine author name based on author type
    let author_name = 'Unknown';
    if (data.author_type === 'student' && data.author_student) {
      author_name = data.author_student?.name;
    } else if (data.author_type === 'counsellor' && data.author_counsellor) {
      author_name = data.author_counsellor?.name;
    }
    
    // Handle anonymous posts
    if (data.is_anonymous) {
      author_name = 'Anonymous';
    }
    
    return {
      ...data,
      author_name,
      category_name: data.Forum_Category?.name
    };
  } catch (error) {
    console.error('Unexpected error fetching discussion:', error);
    return null;
  }
}

// Get replies for a discussion
export async function getDiscussionReplies(discussionId: string): Promise<DiscussionReply[]> {
  try {
    const { data, error } = await supabase
      .from('Discussion_Reply')
      .select(`
        *,
        author_student:Student!author_id(name),
        author_counsellor:Counsellor!author_id(name)
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching discussion replies:', error);
      return [];
    }
    
    // Transform replies to include author name
    return (data || []).map(reply => {
      let author_name = 'Unknown';
      if (reply.author_type === 'student' && reply.author_student) {
        author_name = reply.author_student?.name;
      } else if (reply.author_type === 'counsellor' && reply.author_counsellor) {
        author_name = reply.author_counsellor?.name;
      }
      
      // Handle anonymous replies
      if (reply.is_anonymous) {
        author_name = 'Anonymous';
      }
      
      return {
        ...reply,
        author_name
      };
    });
  } catch (error) {
    console.error('Unexpected error fetching discussion replies:', error);
    return [];
  }
}

// Create a new discussion
export async function createDiscussion({
  title,
  content,
  categoryId,
  authorId,
  authorType,
  isAnonymous = false
}: {
  title: string;
  content: string;
  categoryId: string;
  authorId: string;
  authorType: 'student' | 'counsellor' | 'admin';
  isAnonymous?: boolean;
}): Promise<Discussion | null> {
  try {
    // Create a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const discussionId = uuidv4();
    
    const { data, error } = await supabase
      .from('Discussion')
      .insert({
        discussion_id: discussionId,
        title,
        content,
        author_id: authorId,
        author_type: authorType,
        category_id: categoryId,
        is_pinned: false,
        is_closed: false,
        is_anonymous: isAnonymous,
        view_count: 0,
        slug: `${slug}-${discussionId.slice(0, 8)}`
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating discussion:', error);
      return null;
    }
    
    // Notify counsellors if it's a student post
    if (authorType === 'student') {
      const { data: counsellors } = await supabase
        .from('Counsellor')
        .select('user_id');
      
      if (counsellors && counsellors.length > 0) {
        // Get category name for the notification
        const { data: category } = await supabase
          .from('Forum_Category')
          .select('name')
          .eq('category_id', categoryId)
          .single();
        
        const categoryName = category?.name || 'General';
        
        for (const counsellor of counsellors) {
          await createNotification({
            user_id: counsellor.user_id,
            title: 'New Forum Discussion',
            content: `A new discussion has been posted in ${categoryName}: "${title}"`,
            notification_type: 'discussion',
            related_id: discussionId
          });
        }
      }
    }
    
    return data as Discussion;
  } catch (error) {
    console.error('Unexpected error creating discussion:', error);
    return null;
  }
}

// Add a reply to a discussion
export async function createDiscussionReply({
  discussionId,
  content,
  authorId,
  authorType,
  parentReplyId = null,
  isAnonymous = false
}: {
  discussionId: string;
  content: string;
  authorId: string;
  authorType: 'student' | 'counsellor' | 'admin';
  parentReplyId?: string | null;
  isAnonymous?: boolean;
}): Promise<DiscussionReply | null> {
  try {
    const replyId = uuidv4();
    
    const { data, error } = await supabase
      .from('Discussion_Reply')
      .insert({
        reply_id: replyId,
        discussion_id: discussionId,
        content,
        author_id: authorId,
        author_type: authorType,
        parent_reply_id: parentReplyId,
        is_anonymous: isAnonymous,
        is_solution: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating discussion reply:', error);
      return null;
    }
    
    // Fetch the discussion
    const discussion = await getDiscussion(discussionId);
    
    if (discussion) {
      // If replying to someone else's discussion, notify the original author
      if (discussion.author_id !== authorId) {
        await createNotification({
          user_id: discussion.author_id,
          title: 'New Reply to Your Discussion',
          content: `Someone has replied to your discussion: "${discussion.title}"`,
          notification_type: 'discussion',
          related_id: discussionId
        });
      }
      
      // If replying to another reply, notify that reply's author
      if (parentReplyId) {
        const { data: parentReply } = await supabase
          .from('Discussion_Reply')
          .select('author_id')
          .eq('reply_id', parentReplyId)
          .single();
        
        if (parentReply && parentReply.author_id !== authorId) {
          await createNotification({
            user_id: parentReply.author_id,
            title: 'New Reply to Your Comment',
            content: `Someone has replied to your comment in the discussion: "${discussion.title}"`,
            notification_type: 'discussion',
            related_id: discussionId
          });
        }
      }
    }
    
    return data as DiscussionReply;
  } catch (error) {
    console.error('Unexpected error creating discussion reply:', error);
    return null;
  }
}

// Mark a reply as the solution to a discussion
export async function markReplyAsSolution(
  discussionId: string, 
  replyId: string, 
  authorId: string
): Promise<boolean> {
  try {
    // First check if the user is the discussion author
    const { data: discussion, error: discussionError } = await supabase
      .from('Discussion')
      .select('author_id')
      .eq('discussion_id', discussionId)
      .single();
    
    if (discussionError || !discussion) {
      console.error('Error fetching discussion for solution marking:', discussionError);
      return false;
    }
    
    // Only the discussion author can mark a solution
    if (discussion.author_id !== authorId) {
      console.error('Only the discussion author can mark a solution');
      return false;
    }
    
    // Update the reply as a solution
    const { error } = await supabase
      .from('Discussion_Reply')
      .update({ is_solution: true })
      .eq('reply_id', replyId)
      .eq('discussion_id', discussionId);
    
    if (error) {
      console.error('Error marking reply as solution:', error);
      return false;
    }
    
    // Also close the discussion
    const { error: closeError } = await supabase
      .from('Discussion')
      .update({ is_closed: true })
      .eq('discussion_id', discussionId);
    
    if (closeError) {
      console.error('Error closing discussion:', closeError);
      // Continue anyway, the solution was marked
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error marking reply as solution:', error);
    return false;
  }
}

// Update a discussion
export async function updateDiscussion(
  discussionId: string,
  updates: Partial<Pick<Discussion, 'title' | 'content' | 'is_pinned' | 'is_closed'>>,
  authorId: string
): Promise<Discussion | null> {
  try {
    // First check if the user is authorized to update this discussion
    const { data: discussion, error: discussionError } = await supabase
      .from('Discussion')
      .select('author_id, author_type')
      .eq('discussion_id', discussionId)
      .single();
    
    if (discussionError || !discussion) {
      console.error('Error fetching discussion for update:', discussionError);
      return null;
    }
    
    // Only the author or an admin can update the discussion content
    if (discussion.author_id !== authorId) {
      // Check if the user is an admin
      const { data: userData } = await supabase
        .from('Users')
        .select('role')
        .eq('user_id', authorId)
        .single();
      
      if (!userData || userData.role !== 'admin') {
        console.error('Unauthorized to update discussion');
        return null;
      }
    }
    
    // If title is being updated, update the slug too
    let updatedData: any = { ...updates };
    if (updates.title) {
      const slug = updates.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      updatedData.slug = `${slug}-${discussionId.slice(0, 8)}`;
    }
    
    // Update the discussion
    const { data, error } = await supabase
      .from('Discussion')
      .update(updatedData)
      .eq('discussion_id', discussionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating discussion:', error);
      return null;
    }
    
    return data as Discussion;
  } catch (error) {
    console.error('Unexpected error updating discussion:', error);
    return null;
  }
}

// Delete a discussion
export async function deleteDiscussion(discussionId: string, authorId: string): Promise<boolean> {
  try {
    // First check if the user is authorized to delete this discussion
    const { data: discussion, error: discussionError } = await supabase
      .from('Discussion')
      .select('author_id, author_type')
      .eq('discussion_id', discussionId)
      .single();
    
    if (discussionError || !discussion) {
      console.error('Error fetching discussion for deletion:', discussionError);
      return false;
    }
    
    // Only the author or an admin can delete the discussion
    if (discussion.author_id !== authorId) {
      // Check if the user is an admin
      const { data: userData } = await supabase
        .from('Users')
        .select('role')
        .eq('user_id', authorId)
        .single();
      
      if (!userData || userData.role !== 'admin') {
        console.error('Unauthorized to delete discussion');
        return false;
      }
    }
    
    // Delete all replies first
    const { error: repliesError } = await supabase
      .from('Discussion_Reply')
      .delete()
      .eq('discussion_id', discussionId);
    
    if (repliesError) {
      console.error('Error deleting discussion replies:', repliesError);
      return false;
    }
    
    // Delete the discussion
    const { error } = await supabase
      .from('Discussion')
      .delete()
      .eq('discussion_id', discussionId);
    
    if (error) {
      console.error('Error deleting discussion:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting discussion:', error);
    return false;
  }
}

// Update a reply
export async function updateDiscussionReply(
  replyId: string,
  content: string,
  authorId: string
): Promise<DiscussionReply | null> {
  try {
    // First check if the user is authorized to update this reply
    const { data: reply, error: replyError } = await supabase
      .from('Discussion_Reply')
      .select('author_id, author_type')
      .eq('reply_id', replyId)
      .single();
    
    if (replyError || !reply) {
      console.error('Error fetching reply for update:', replyError);
      return null;
    }
    
    // Only the author or an admin can update the reply
    if (reply.author_id !== authorId) {
      // Check if the user is an admin
      const { data: userData } = await supabase
        .from('Users')
        .select('role')
        .eq('user_id', authorId)
        .single();
      
      if (!userData || userData.role !== 'admin') {
        console.error('Unauthorized to update reply');
        return null;
      }
    }
    
    // Update the reply
    const { data, error } = await supabase
      .from('Discussion_Reply')
      .update({ content })
      .eq('reply_id', replyId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating reply:', error);
      return null;
    }
    
    return data as DiscussionReply;
  } catch (error) {
    console.error('Unexpected error updating reply:', error);
    return null;
  }
}

// Delete a reply
export async function deleteDiscussionReply(replyId: string, authorId: string): Promise<boolean> {
  try {
    // First check if the user is authorized to delete this reply
    const { data: reply, error: replyError } = await supabase
      .from('Discussion_Reply')
      .select('author_id, author_type, discussion_id')
      .eq('reply_id', replyId)
      .single();
    
    if (replyError || !reply) {
      console.error('Error fetching reply for deletion:', replyError);
      return false;
    }
    
    // Check if the user is the reply author
    let isAuthorized = reply.author_id === authorId;
    
    // If not the reply author, check if they're the discussion author
    if (!isAuthorized) {
      const { data: discussion } = await supabase
        .from('Discussion')
        .select('author_id')
        .eq('discussion_id', reply.discussion_id)
        .single();
      
      isAuthorized = discussion?.author_id === authorId;
    }
    
    // If still not authorized, check if they're an admin
    if (!isAuthorized) {
      const { data: userData } = await supabase
        .from('Users')
        .select('role')
        .eq('user_id', authorId)
        .single();
      
      isAuthorized = userData?.role === 'admin';
    }
    
    if (!isAuthorized) {
      console.error('Unauthorized to delete reply');
      return false;
    }
    
    // Delete any child replies first
    const { error: childrenError } = await supabase
      .from('Discussion_Reply')
      .delete()
      .eq('parent_reply_id', replyId);
    
    if (childrenError) {
      console.error('Error deleting child replies:', childrenError);
      return false;
    }
    
    // Delete the reply
    const { error } = await supabase
      .from('Discussion_Reply')
      .delete()
      .eq('reply_id', replyId);
    
    if (error) {
      console.error('Error deleting reply:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting reply:', error);
    return false;
  }
}

// Increment the view count of a discussion
async function incrementDiscussionViewCount(discussionId: string): Promise<void> {
  try {
    await supabase.rpc('increment_discussion_view_count', { discussion_id: discussionId });
  } catch (error) {
    console.error('Error incrementing discussion view count:', error);
    
    // Fallback method if RPC function doesn't exist
    try {
      const { data } = await supabase
        .from('Discussion')
        .select('view_count')
        .eq('discussion_id', discussionId)
        .single();
      
      if (data) {
        await supabase
          .from('Discussion')
          .update({ view_count: data.view_count + 1 })
          .eq('discussion_id', discussionId);
      }
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
    }
  }
}
