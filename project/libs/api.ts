const BASE_URL = 'https://timecapsule-backend-z21v.onrender.com/api';

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      created_at: string;
    };
    token: string;
  };
  message: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface SaveCategoriesRequest {
  category_ids: string[];
}

export interface SaveCategoriesResponse {
  success: boolean;
  message: string;
  data: {
    saved_count: number;
    existing_count: number;
  };
}

export interface GetCategoriesResponse {
  success: boolean;
  data: Category[];
}

// Avatar interfaces
export interface Avatar {
  id: string;
  imageUrl: string;
  label: string;
}

export interface GetAvatarsResponse {
  success: boolean;
  data: Avatar[];
  message: string;
}

export interface UploadProfilePictureResponse {
  success: boolean;
  data: {
    image_url: string;
    file_path: string;
  };
  message: string;
}

export interface SaveProfilePictureRequest {
  type: 'upload' | 'avatar';
  data: string;
}

export interface SaveProfilePictureResponse {
  success: boolean;
  message: string;
  data: {
    profile_picture_url: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    
    // Start with basic headers
    const headers: Record<string, string> = {};
    
    // Only set Content-Type if not multipart/form-data (browser will set it automatically)
    const contentType = options.headers && typeof options.headers === 'object' && 'Content-Type' in options.headers 
      ? (options.headers as Record<string, string>)['Content-Type'] 
      : null;
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Merge with any custom headers
    if (options.headers) {
      if (typeof options.headers === 'object') {
        Object.assign(headers, options.headers);
      }
    }

    const defaultOptions: RequestInit = {
      headers,
      ...options,
    };

    // Add authorization header if required
    if (requiresAuth) {
      const token = await this.getAuthToken();
      console.log('Auth token retrieved:', token ? 'Token exists' : 'No token');
      if (token) {
        defaultOptions.headers = {
          ...defaultOptions.headers,
          'Authorization': `Bearer ${token}`,
        };
        console.log('Authorization header added');
      } else {
        console.log('No auth token available');
      }
    }

    try {
      console.log('Making request to:', url);
      console.log('Request options:', {
        method: defaultOptions.method,
        headers: defaultOptions.headers,
        body: defaultOptions.body ? 'FormData/JSON body present' : 'No body'
      });
      
      const response = await fetch(url, defaultOptions);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Request failed with error:', error);
      console.error('Error type:', typeof error);
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
      
      if (error instanceof Error) {
        // Check for specific network errors
        if (error.message.includes('Network request failed')) {
          throw new Error('Network request failed. Please check your internet connection and try again.');
        }
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      // Import storage utility to get the stored JWT token
      const { storage } = await import('@/utils/storage');
      const token = await storage.getToken();
      console.log('Stored JWT token:', token ? 'Token exists' : 'No token');
      return token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCategories(): Promise<GetCategoriesResponse> {
    return this.makeRequest<GetCategoriesResponse>('/categories', {
      method: 'GET',
    }, true);
  }

  async saveDirectorCategories(categoryIds: string[]): Promise<SaveCategoriesResponse> {
    return this.makeRequest<SaveCategoriesResponse>('/categories/director', {
      method: 'POST',
      body: JSON.stringify({
        category_ids: categoryIds
      }),
    }, true);
  }

  // Avatar methods
  async getAvatars(): Promise<GetAvatarsResponse> {
    return this.makeRequest<GetAvatarsResponse>('/avatars', {
      method: 'GET',
    });
  }

  async uploadProfilePicture(imageFile: File | string): Promise<UploadProfilePictureResponse> {
    const formData = new FormData();
    
    // Handle both File objects (web) and string URIs (React Native)
    if (typeof imageFile === 'string') {
      // React Native: create a file object from URI
      const uri = imageFile;
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // React Native FormData format
      formData.append('image', {
        uri,
        name: filename,
        type,
      } as any);
    } else {
      // Web: use File object directly
      formData.append('image', imageFile);
    }

    console.log('FormData created:', formData);
    console.log('Image file type:', typeof imageFile);
    if (typeof imageFile === 'string') {
      console.log('Image URI:', imageFile);
    }

    return this.makeRequest<UploadProfilePictureResponse>('/avatars/upload/profile-picture', {
      method: 'POST',
      body: formData,
    }, true);
  }

  async saveProfilePicture(request: SaveProfilePictureRequest): Promise<SaveProfilePictureResponse> {
    return this.makeRequest<SaveProfilePictureResponse>('/avatars/director/profile-picture', {
      method: 'POST',
      body: JSON.stringify(request),
    }, true);
  }
}

export const apiService = new ApiService();
export default apiService;
