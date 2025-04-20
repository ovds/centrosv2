import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ResourceCategory, Resource, ResourceType } from '@/types/supabase';

// Fetch all resource categories
export async function getAllResourceCategories(): Promise<ResourceCategory[]> {
  try {
    const { data, error } = await supabase
      .from('Resource_Category')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching resource categories:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching resource categories:', error);
    return [];
  }
}

// Get a specific resource category by ID
export async function getResourceCategoryById(categoryId: string): Promise<ResourceCategory | null> {
  try {
    const { data, error } = await supabase
      .from('Resource_Category')
      .select('*')
      .eq('category_id', categoryId)
      .single();
    
    if (error) {
      console.error('Error fetching resource category:', error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error('Unexpected error fetching resource category:', error);
    return null;
  }
}

// Fetch resources with optional filtering
export async function getResources({
  categoryId,
  type,
  searchQuery,
  featured = false,
  limit = 50,
  page = 1
}: {
  categoryId?: string;
  type?: ResourceType;
  searchQuery?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
}): Promise<Resource[]> {
  try {
    let query = supabase
      .from('Resource')
      .select(`
        *,
        Resource_Category(name),
        Users!uploaded_by(email)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (type) {
      query = query.eq('resource_type', type);
    }
    
    if (featured) {
      query = query.eq('is_featured', true);
    }
    
    if (searchQuery) {
      // Search in title and description
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching resources:', error);
      return [];
    }
    
    // Map to the Resource type with extra fields
    return (data || []).map(item => ({
      ...item,
      category_name: item.Resource_Category?.name,
      uploader_name: item.Users?.email?.split('@')[0] || 'Unknown'
    }));
  } catch (error) {
    console.error('Unexpected error fetching resources:', error);
    return [];
  }
}

// Get a specific resource by ID
export async function getResourceById(resourceId: string): Promise<Resource | null> {
  try {
    const { data, error } = await supabase
      .from('Resource')
      .select(`
        *,
        Resource_Category(name),
        Users!uploaded_by(email)
      `)
      .eq('resource_id', resourceId)
      .single();
    
    if (error) {
      console.error('Error fetching resource:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Increment view count
    await incrementResourceViewCount(resourceId);
    
    // Map to the Resource type with extra fields
    return {
      ...data,
      category_name: data.Resource_Category?.name,
      uploader_name: data.Users?.email?.split('@')[0] || 'Unknown'
    };
  } catch (error) {
    console.error('Unexpected error fetching resource:', error);
    return null;
  }
}

// Create a new resource
export async function createResource(resource: Omit<Resource, 'resource_id' | 'created_at' | 'updated_at' | 'view_count' | 'download_count'>): Promise<Resource | null> {
  try {
    const resourceId = uuidv4();
    
    const { data, error } = await supabase
      .from('Resource')
      .insert({
        resource_id: resourceId,
        title: resource.title,
        description: resource.description,
        file_url: resource.file_url,
        external_url: resource.external_url,
        thumbnail_url: resource.thumbnail_url,
        resource_type: resource.resource_type,
        category_id: resource.category_id,
        uploaded_by: resource.uploaded_by,
        is_featured: resource.is_featured || false,
        is_private: resource.is_private || false,
        file_size: resource.file_size,
        file_type: resource.file_type,
        download_count: 0,
        view_count: 0,
        expiry_date: resource.expiry_date,
        tags: resource.tags
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating resource:', error);
      return null;
    }
    
    // Create notifications for students
    if (!resource.is_private) {
      // Get all student IDs
      const { data: students } = await supabase
        .from('Student')
        .select('user_id');
      
      if (students && students.length > 0) {
        const category = await getResourceCategoryById(resource.category_id);
        const categoryName = category?.name || 'various topics';
        
        // Create a notification for each student
        for (const student of students) {
          await createResourceNotification({
            user_id: student.user_id,
            title: 'New Resource Available',
            content: `A new ${resource.resource_type} about ${categoryName} has been added: "${resource.title}"`,
            resource_id: resourceId
          });
        }
      }
    }
    
    return data as Resource;
  } catch (error) {
    console.error('Unexpected error creating resource:', error);
    return null;
  }
}

// Update an existing resource
export async function updateResource(
  resourceId: string,
  updates: Partial<Omit<Resource, 'resource_id' | 'created_at' | 'updated_at' | 'view_count' | 'download_count'>>
): Promise<Resource | null> {
  try {
    const { data, error } = await supabase
      .from('Resource')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('resource_id', resourceId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating resource:', error);
      return null;
    }
    
    return data as Resource;
  } catch (error) {
    console.error('Unexpected error updating resource:', error);
    return null;
  }
}

// Delete a resource
export async function deleteResource(resourceId: string): Promise<boolean> {
  try {
    // First get the resource to check if it has a file that needs to be deleted
    const resource = await getResourceById(resourceId);
    
    if (resource && resource.file_url) {
      // Extract the path from the public URL
      const path = resource.file_url.split('/').slice(-2).join('/');
      
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('resources')
        .remove([path]);
      
      if (storageError) {
        console.error('Error deleting resource file:', storageError);
        // Continue anyway to delete the database record
      }
    }
    
    // Delete the database record
    const { error } = await supabase
      .from('Resource')
      .delete()
      .eq('resource_id', resourceId);
    
    if (error) {
      console.error('Error deleting resource:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting resource:', error);
    return false;
  }
}

// Increment resource view count
async function incrementResourceViewCount(resourceId: string): Promise<void> {
  try {
    await supabase.rpc('increment_resource_view_count', { resource_id: resourceId });
  } catch (error) {
    console.error('Error incrementing resource view count:', error);
  }
}

// Increment resource download count
export async function incrementResourceDownloadCount(resourceId: string): Promise<void> {
  try {
    await supabase.rpc('increment_resource_download_count', { resource_id: resourceId });
  } catch (error) {
    console.error('Error incrementing resource download count:', error);
    
    // Fallback method if RPC function doesn't exist
    try {
      const { data } = await supabase
        .from('Resource')
        .select('download_count')
        .eq('resource_id', resourceId)
        .single();
      
      if (data) {
        await supabase
          .from('Resource')
          .update({ download_count: data.download_count + 1 })
          .eq('resource_id', resourceId);
      }
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
    }
  }
}

// Upload a file for a resource
export async function uploadResourceFile(
  file: File, 
  fileType: string = 'document'
): Promise<{ url: string; path: string } | null> {
  try {
    // Generate a unique path for the file
    const extension = file.name.split('.').pop();
    const path = `${fileType}/${uuidv4()}.${extension}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('resources')
      .upload(path, file);
    
    if (error) {
      console.error('Error uploading resource file:', error);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('resources')
      .getPublicUrl(path);
    
    return {
      url: urlData.publicUrl,
      path
    };
  } catch (error) {
    console.error('Unexpected error uploading resource file:', error);
    return null;
  }
}

// Helper function to create a resource notification
async function createResourceNotification({
  user_id,
  title,
  content,
  resource_id
}: {
  user_id: string;
  title: string;
  content: string;
  resource_id: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('Notification')
      .insert({
        notification_id: uuidv4(),
        user_id,
        title,
        content,
        notification_type: 'resource',
        related_id: resource_id,
        is_read: false,
        is_email_sent: false,
        priority: 'low'
      });
    
    if (error) {
      console.error('Error creating resource notification:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error creating resource notification:', error);
    return false;
  }
}
