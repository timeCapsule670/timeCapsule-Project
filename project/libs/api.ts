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

// Child Profile interfaces
export interface Actor {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string | null;
  notes: string | null;
  created_at: string;
  username: string;
}

export interface Relationship {
  director_id: string;
  actor_id: string;
  relationship: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  birthday: string;
  username: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateChildProfileRequest {
  children: Array<{
    id: string;
    name: string;
    birthday: string;
    username?: string;
  }>;
}

export interface CreateChildProfileResponse {
  success: boolean;
  data: {
    actors: Actor[];
    relationships: Relationship[];
    message: string;
    nextStep: string;
    actorIds: string[];
  };
  message: string;
}

export interface GetChildProfilesResponse {
  success: boolean;
  data: ChildProfile[];
  message: string;
}

export interface GetChildProfileResponse {
  success: boolean;
  data: ChildProfile;
  message: string;
}

export interface UpdateChildProfileRequest {
  name?: string;
  birthday?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string | null;
  notes?: string | null;
}

export interface UpdateChildProfileResponse {
  success: boolean;
  data: ChildProfile;
  message: string;
}

export interface DeleteChildProfileResponse {
  success: boolean;
  message: string;
  data: {
    deleted: boolean;
    relationships_removed: number;
  };
}

export interface BulkUpdateChildProfilesRequest {
  children: Array<{
    id: string;
    updates: UpdateChildProfileRequest;
  }>;
}

export interface BulkUpdateChildProfilesResponse {
  success: boolean;
  data: {
    updated: ChildProfile[];
    failed: Array<{
      id: string;
      error: string;
    }>;
  };
  message: string;
}

// Family Setup interfaces
export interface FamilySetupRequest {
  selectedRole: string;
  actorIds: string[];
}

export interface FamilySetupResponse {
  success: boolean;
  data: {
    director_role_updated: boolean;
    relationships_created: number;
    message: string;
  };
  message: string;
}

export interface UpdateDirectorRoleRequest {
  selectedRole: string;
}

export interface UpdateDirectorRoleResponse {
  success: boolean;
  data: {
    director_role_updated: boolean;
    message: string;
  };
  message: string;
}

// Invite Code interfaces
export interface InviteCode {
  id: string;
  code: string;
  director_id: string;
  created_by: string;
  expires_at: string;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateInviteCodeResponse {
  success: boolean;
  data: {
    code: string;
    expiresAt: string;
    formattedExpiration: string;
    message: string;
  };
}

export interface ValidateInviteCodeRequest {
  code: string;
}

export interface ValidateInviteCodeResponse {
  success: boolean;
  data: {
    isValid: boolean;
    isExpired: boolean;
    directorName: string;
    message: string;
  };
}

export interface UseInviteCodeRequest {
  code: string;
  userId: string;
}

export interface UseInviteCodeResponse {
  success: boolean;
  data: {
    message: string;
    directorId: string;
    relationshipCreated: boolean;
  };
}

export interface GetMyInviteCodesResponse {
  success: boolean;
  data: InviteCode[];
  message: string;
}

export interface RevokeInviteCodeResponse {
  success: boolean;
  message: string;
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

  // Child Profile methods
  async createChildProfiles(request: CreateChildProfileRequest): Promise<CreateChildProfileResponse> {
    return this.makeRequest<CreateChildProfileResponse>('/child-profiles', {
      method: 'POST',
      body: JSON.stringify(request),
    }, true);
  }

  async getChildProfiles(): Promise<GetChildProfilesResponse> {
    return this.makeRequest<GetChildProfilesResponse>('/child-profiles', {
      method: 'GET',
    }, true);
  }

  async getChildProfile(id: string): Promise<GetChildProfileResponse> {
    return this.makeRequest<GetChildProfileResponse>(`/child-profiles/${id}`, {
      method: 'GET',
    }, true);
  }

  async updateChildProfile(id: string, request: UpdateChildProfileRequest): Promise<UpdateChildProfileResponse> {
    return this.makeRequest<UpdateChildProfileResponse>(`/child-profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    }, true);
  }

  async deleteChildProfile(id: string): Promise<DeleteChildProfileResponse> {
    return this.makeRequest<DeleteChildProfileResponse>(`/child-profiles/${id}`, {
      method: 'DELETE',
    }, true);
  }

  async bulkUpdateChildProfiles(request: BulkUpdateChildProfilesRequest): Promise<BulkUpdateChildProfilesResponse> {
    return this.makeRequest<BulkUpdateChildProfilesResponse>('/child-profiles/bulk-update', {
      method: 'PUT',
      body: JSON.stringify(request),
    }, true);
  }

  // Family Setup methods
  async familySetup(request: FamilySetupRequest): Promise<FamilySetupResponse> {
    return this.makeRequest<FamilySetupResponse>('/family-setup', {
      method: 'POST',
      body: JSON.stringify(request),
    }, true);
  }

  async updateDirectorRole(request: UpdateDirectorRoleRequest): Promise<UpdateDirectorRoleResponse> {
    return this.makeRequest<UpdateDirectorRoleResponse>('/family-setup/director-role', {
      method: 'PUT',
      body: JSON.stringify(request),
    }, true);
  }

  // Invite Code methods
  async generateInviteCode(): Promise<GenerateInviteCodeResponse> {
    return this.makeRequest<GenerateInviteCodeResponse>('/invite-codes/generate', {
      method: 'POST',
    }, true);
  }

  async validateInviteCode(request: ValidateInviteCodeRequest): Promise<ValidateInviteCodeResponse> {
    return this.makeRequest<ValidateInviteCodeResponse>('/invite-codes/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async useInviteCode(request: UseInviteCodeRequest): Promise<UseInviteCodeResponse> {
    return this.makeRequest<UseInviteCodeResponse>('/invite-codes/use', {
      method: 'POST',
      body: JSON.stringify(request),
    }, true);
  }

  async getMyInviteCodes(): Promise<GetMyInviteCodesResponse> {
    return this.makeRequest<GetMyInviteCodesResponse>('/invite-codes/my-codes', {
      method: 'GET',
    }, true);
  }

  async revokeInviteCode(id: string): Promise<RevokeInviteCodeResponse> {
    return this.makeRequest<RevokeInviteCodeResponse>(`/invite-codes/${id}/revoke`, {
      method: 'DELETE',
    }, true);
  }
}

export const apiService = new ApiService();
export default apiService;
