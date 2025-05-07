import { API_BASE_URL } from '@/config';

// Types
export interface Internship {
  id: number;
  title: string;
  department: string;
  location: string;
  workType: string;
  duration: string;
  compensation: string;
  applicants: number;
  status: string;
  posted: string;
  deadline: string;
  description: string;
  requirements: string;
  company: {
    id: number;
    name: string;
    logo: string;
  };
}

export interface Application {
  id: number;
  internshipId: number;
  userId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  coverLetter?: string;
  resumeUrl?: string;
  availableStartDate?: string;
  questionAnswers?: Record<string, string>;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// API Services
export const internshipApi = {
  getInternships: async (companyId: string, status?: string, page = 0, size = 10): Promise<PaginatedResponse<Internship>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships?${new URLSearchParams({
          ...(status && { status }),
          page: page.toString(),
          size: size.toString(),
        })}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch internships: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Return data in the expected format
        return {
          content: data.data || [],
          currentPage: data.currentPage,
          totalItems: data.totalItems,
          totalPages: data.totalPages
        };
      } else {
        throw new Error(data.message || 'Failed to fetch internships');
      } 
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw error;
    }
  },

  getInternship: async (companyId: string, internshipId: string): Promise<Internship> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships/${internshipId}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch internship: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Internship not found');
      }
    } catch (error) {
      console.error('Error fetching internship:', error);
      throw error;
    }
  },
  getInternshipbyid: async (internshipId: string): Promise<Internship> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/internships/${internshipId}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch internship: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Internship not found');
      }
    } catch (error) {
      console.error('Error fetching internship:', error);
      throw error;
    }
  },

  createInternship: async (companyId: string, internshipData: Partial<Internship>): Promise<Internship> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(internshipData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create internship: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating internship:', error);
      throw error;
    }
  },

  updateInternship: async (companyId: string, internshipId: string, internshipData: Partial<Internship>): Promise<Internship> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships/${internshipId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(internshipData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update internship: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating internship:', error);
      throw error;
    }
  },

  deleteInternship: async (companyId: string, internshipId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships/${internshipId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete internship: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting internship:', error);
      throw error;
    }
  },

  updateStatus: async (companyId: string, internshipId: string, status: string): Promise<Internship> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships/${internshipId}/status`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update internship status: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating internship status:', error);
      throw error;
    }
  },

  getInternshipById: async (internshipId: string): Promise<Internship> => {
    console.log(`Fetching internship with ID: ${internshipId}`);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/internships/id/${internshipId}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch internship: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Internship data received:", data);
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Internship not found');
      }
    } catch (error) {
      console.error('Error fetching internship by id:', error);
      throw error;
    }
  },
};

export const applicationApi = {
  submitApplication: async (internshipId: string, applicationData: any): Promise<any> => {
    try {
      // Format the data to match what the backend expects
      const requestData = {
        user_id: applicationData.userId || applicationData.user_id,
        coverLetter: applicationData.coverLetter,
        resumeUrl: applicationData.resumeUrl,
        availableStartDate: applicationData.availableStartDate,
        questionAnswers: applicationData.questionAnswers
      };

      console.log('Submitting application with data:', requestData);
      
      const response = await fetch(
        `${API_BASE_URL}/api/applications/internships/${internshipId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Application submission failed:', data);
        throw new Error(data.message || `Failed to submit application: ${response.statusText}`);
      }

      console.log('Application submitted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  },

  getApplications: async (internshipId: string, page = 0, size = 10, status?: string): Promise<PaginatedResponse<Application>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/internships/${internshipId}?${new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          ...(status && { status }),
        })}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Format to match PaginatedResponse interface
      return {
        content: data.applications || [],
        currentPage: data.currentPage,
        totalItems: data.totalItems,
        totalPages: data.totalPages
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  updateApplicationStatus: async (applicationId: string, status: string, feedback?: string, interviewDate?: string, interviewTime?: string): Promise<Application> => {
    try {
      console.log(`API call: Updating application ${applicationId} to status ${status}`);
      const requestPayload = { 
        status, 
        ...(feedback && { feedback }),
        ...(interviewDate && { interviewDate }),
        ...(interviewTime && { interviewTime })
      };
      console.log('Request payload:', requestPayload);
      
      const response = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        }
      );

      // Log the response status
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      // Try to get response body even if it's an error
      const responseText = await response.text();
      console.log('Response body:', responseText);
      
      // Parse JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to update application status: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  deleteApplication: async (applicationId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete application: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  },
};

// Post API service
export interface Post {
  id: number;
  content: string;
  authorId: number;
  imageUrl?: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
    title?: string;
  };
  hasLiked?: boolean;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  postId: number;
  createdAt: string;
  author?: {
    id: number;
    firstName: string;
    lastName: string;
    photo?: string;
  };
  replies?: Comment[];
}

export const postApi = {
  // Get user feed
  getFeed: async (userId: string, page = 0, size = 10): Promise<PaginatedResponse<Post>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts/feed?user_id=${userId}&page=${page}&size=${size}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.posts || [],
        currentPage: data.currentPage,
        totalItems: data.totalItems,
        totalPages: data.totalPages
      };
    } catch (error) {
      console.error('Error fetching feed:', error);
      throw error;
    }
  },

  // Get all posts
  getAllPosts: async (userId?: string, page = 0, size = 10): Promise<PaginatedResponse<Post>> => {
    try {
      const url = new URL(`${API_BASE_URL}/api/posts`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('size', size.toString());
      if (userId) url.searchParams.append('userId', userId);

      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.posts || [],
        currentPage: data.currentPage,
        totalItems: data.totalItems,
        totalPages: data.totalPages
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // Get posts by a specific user
  getUserPosts: async (userId: string, currentUserId?: string, page = 0, size = 10): Promise<PaginatedResponse<Post>> => {
    try {
      const url = new URL(`${API_BASE_URL}/api/posts/user/${userId}`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('size', size.toString());
      if (currentUserId) url.searchParams.append('currentUserId', currentUserId);

      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user posts: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.posts || [],
        currentPage: data.currentPage,
        totalItems: data.totalItems,
        totalPages: data.totalPages
      };
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  // Get a specific post
  getPost: async (postId: string, userId?: string): Promise<Post> => {
    try {
      const url = new URL(`${API_BASE_URL}/api/posts/${postId}`);
      if (userId) url.searchParams.append('userId', userId);

      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  // Create a new post
  createPost: async (userId: string, content: string, image?: File): Promise<Post> => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('content', content);
      if (image) formData.append('image', image);

      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Update a post
  updatePost: async (postId: string, content: string, image?: File): Promise<Post> => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) formData.append('image', image);

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to update post: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete a post
  deletePost: async (postId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Search posts by content
  searchPosts: async (keyword: string, userId?: string, page = 0, size = 10): Promise<PaginatedResponse<Post>> => {
    try {
      const url = new URL(`${API_BASE_URL}/api/posts/search`);
      url.searchParams.append('keyword', keyword);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('size', size.toString());
      if (userId) url.searchParams.append('userId', userId);

      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to search posts: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.posts || [],
        currentPage: data.currentPage,
        totalItems: data.totalItems,
        totalPages: data.totalPages
      };
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  },

  // Like a post
  likePost: async (postId: string, userId: string): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Try to parse the error message
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Failed to like post: ${response.statusText}`);
        } catch (parseError) {
          // If can't parse, use the original error
          throw new Error(`Failed to like post: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data.likeCount;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  // Unlike a post
  unlikePost: async (postId: string, userId: string): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/unlike`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Try to parse the error message
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Failed to unlike post: ${response.statusText}`);
        } catch (parseError) {
          // If can't parse, use the original error
          throw new Error(`Failed to unlike post: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data.likeCount;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }
};

// Comment API service
export const commentApi = {
  // Get comments for a post
  getComments: async (postId: string, page = 0, size = 10): Promise<PaginatedResponse<Comment>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comments?page=${page}&size=${size}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.comments || [],
        currentPage: data.currentPage,
        totalItems: data.totalItems,
        totalPages: data.totalPages
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Add a comment to a post
  addComment: async (postId: string, userId: string, content: string): Promise<Comment> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comments`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            user_id: userId,
            content 
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to add comment: ${response.statusText}`);
      }

      const data = await response.json();
      // Return the correct data structure from the backend response
      return data.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Update a comment
  updateComment: async (commentId: string, content: string): Promise<Comment> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update comment: ${response.statusText}`);
      }

      const data = await response.json();
      return data.comment;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete comment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Add a reply to a comment
  addReply: async (commentId: string, userId: string, content: string): Promise<Comment> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}/replies`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            user_id: userId,
            content 
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to add reply: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  },

  // Like a comment
  likeComment: async (commentId: string, userId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}/like`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to like comment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  },

  // Unlike a comment
  unlikeComment: async (commentId: string, userId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}/unlike`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to unlike comment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error unliking comment:', error);
      throw error;
    }
  }
}; 