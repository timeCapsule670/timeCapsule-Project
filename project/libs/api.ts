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
    
    // Check if we're sending FormData
    const isFormData = options.body instanceof FormData;
    
    // Only set Content-Type if NOT sending FormData
    // For FormData, let the system set the correct multipart/form-data with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Merge with any custom headers (but don't override Content-Type for FormData)
    if (options.headers) {
      if (typeof options.headers === 'object') {
        Object.assign(headers, options.headers);
      }
    }
    
    // For FormData, ensure we don't have a conflicting Content-Type
    if (isFormData && headers['Content-Type']) {
      delete headers['Content-Type'];
      console.log('🗑️ Removed Content-Type header for FormData request');
    }

    const defaultOptions: RequestInit = {
      headers,
      ...options,
    };

    // Add authorization header if required
    if (requiresAuth) {
      const token = await this.getAuthToken();
      console.log('🔑 Auth token retrieved:', token ? 'Token exists' : 'No token');
      if (token) {
        defaultOptions.headers = {
          ...defaultOptions.headers,
          'Authorization': `Bearer ${token}`,
        };
        console.log('✅ Authorization header added');
      } else {
        console.log('❌ No auth token available');
      }
    }

    try {
      console.log('🌐 Making request to:', url);
      console.log('📋 Request options:', {
        method: defaultOptions.method,
        headers: defaultOptions.headers,
        body: defaultOptions.body ? (defaultOptions.body instanceof FormData ? 'FormData present' : 'JSON body present') : 'No body'
      });
      
      // Log the final headers being sent
      console.log('📤 Final headers being sent:', defaultOptions.headers);
      
      console.log('🔄 Starting fetch request...');
      const response = await fetch(url, defaultOptions);
      console.log('📡 Response status:', response.status);
      
      console.log('📖 Reading response body...');
      const data = await response.json();
      console.log('📄 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Request failed with error:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      if (error instanceof Error) {
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
      console.log('🔑 Stored JWT token:', token ? 'Token exists' : 'No token');
      return token;
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
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

  // Test backend connectivity
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Testing backend connectivity...');
      const response = await fetch(`${BASE_URL}/health`, { method: 'GET' });
      console.log('✅ Backend is reachable, status:', response.status);
      return { success: true, message: 'Backend is reachable' };
    } catch (error) {
      console.error('❌ Backend connectivity test failed:', error);
      return { success: false, message: 'Backend is not reachable' };
    }
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
      
      // React Native FormData format - try different approaches
      try {
        // Method 1: Standard React Native format
        formData.append('image', {
          uri,
          type,
          name: filename,
        } as any);
        
        console.log('📱 React Native FormData created with Method 1:', {
          uri,
          type,
          name: filename
        });
      } catch (error) {
        console.log('❌ Method 1 failed, trying Method 2');
        // Method 2: Alternative format
        formData.append('image', {
          uri,
          type,
          name: filename,
        } as any);
      }
    } else {
      // Web: use File object directly
      formData.append('image', imageFile);
      console.log('🌐 Web FormData created with File object');
    }

    console.log('📋 FormData created successfully');
    console.log('🚀 About to make request with FormData...');

    return this.makeRequest<UploadProfilePictureResponse>('/profile-pictures/upload/profile-picture', {
      method: 'POST',
      body: formData,
    }, true);
  }

  async saveProfilePicture(request: SaveProfilePictureRequest): Promise<SaveProfilePictureResponse> {
    return this.makeRequest<SaveProfilePictureResponse>('/profile-pictures/director/profile-picture', {
      method: 'POST',
      body: JSON.stringify(request),
    }, true);
  }
}

export const apiService = new ApiService();
export default apiService;
