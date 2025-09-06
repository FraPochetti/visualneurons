import { fetchAuthSession } from 'aws-amplify/auth';
import config from './amplify-config';

const API_URL = config.custom?.api_url || process.env.NEXT_PUBLIC_API_URL || '';

interface Asset {
  assetId: string;
  userId: string;
  title: string;
  coverS3Key?: string;
  latestVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
}

class ApiClient {
  private async getAuthHeaders() {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async createAsset(title: string): Promise<Asset> {
    const response = await fetch(`${API_URL}/assets`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create asset: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getAssets(): Promise<Asset[]> {
    const response = await fetch(`${API_URL}/assets`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getUploadUrl(filename: string, contentType: string): Promise<UploadUrlResponse> {
    const response = await fetch(`${API_URL}/upload-url`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ filename, contentType }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get upload URL: ${response.statusText}`);
    }
    
    return response.json();
  }

  async uploadFile(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
  }
}

export const apiClient = new ApiClient();
