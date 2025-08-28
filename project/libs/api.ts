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

// Moment Selection interfaces
export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface GetCategoriesResponse {
  success: boolean;
  data: Category[];
  message: string;
}

export interface SaveDirectorCategoriesRequest {
  category_ids: string[];
}

export interface SaveDirectorCategoriesResponse {
  success: boolean;
  message: string;
  data: {
    saved_count: number;
    existing_count: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Forgot Password interfaces
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    otp_sent: boolean;
  };
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    verified: boolean;
    reset_token?: string;
  };
}

export interface ResetPasswordWithOtpRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordWithOtpResponse {
  success: boolean;
  message: string;
  data?: {
    password_reset: boolean;
  };
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
    }

    const defaultOptions: RequestInit = {
      headers,
      ...options,
    };

    // Add authorization header if required
    if (requiresAuth) {
      const token = await this.getAuthToken();
      if (token) {
        defaultOptions.headers = {
          ...defaultOptions.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
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
      return token;
    } catch (error) {
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
      const response = await fetch(`${BASE_URL}/health`, { method: 'GET' });
      return { success: true, message: 'Backend is reachable' };
    } catch (error) {
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
      
             // React Native FormData format
       formData.append('image', {
         uri,
         type,
         name: filename,
       } as any);
         } else {
       // Web: use File object directly
       formData.append('image', imageFile);
     }

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

  // Moment Selection methods
  async getCategories(): Promise<GetCategoriesResponse> {
    return this.makeRequest<GetCategoriesResponse>('/categories', {
      method: 'GET',
    }, true);
  }

  async saveDirectorCategories(request: SaveDirectorCategoriesRequest): Promise<SaveDirectorCategoriesResponse> {
    return this.makeRequest<SaveDirectorCategoriesResponse>('/categories/director', {
      method: 'POST',
      body: JSON.stringify(request),
    }, true);
  }

  // Forgot Password methods
  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.makeRequest<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return this.makeRequest<VerifyOtpResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async resetPasswordWithOtp(request: ResetPasswordWithOtpRequest): Promise<ResetPasswordWithOtpResponse> {
    return this.makeRequest<ResetPasswordWithOtpResponse>('/auth/reset-password-with-otp', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
