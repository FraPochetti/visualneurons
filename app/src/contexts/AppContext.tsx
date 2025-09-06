'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface Asset {
  assetId: string;
  userId: string;
  title: string;
  coverS3Key?: string;
  latestVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppContextType {
  assets: Asset[];
  currentAsset: Asset | null;
  isLoading: boolean;
  error: string | null;
  loadAssets: () => Promise<void>;
  createAsset: (title: string) => Promise<Asset>;
  selectAsset: (asset: Asset | null) => void;
  uploadImage: (file: File, title?: string) => Promise<Asset>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedAssets = await apiClient.getAssets();
      setAssets(loadedAssets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAsset = useCallback(async (title: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newAsset = await apiClient.createAsset(title);
      setAssets(prev => [...prev, newAsset]);
      setCurrentAsset(newAsset);
      return newAsset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create asset');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectAsset = useCallback((asset: Asset | null) => {
    setCurrentAsset(asset);
  }, []);

  const uploadImage = useCallback(async (file: File, title?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Get presigned URL
      const { uploadUrl, key } = await apiClient.getUploadUrl(file.name, file.type);
      
      // Upload file to S3
      await apiClient.uploadFile(uploadUrl, file);
      
      // Create asset with the uploaded image
      const newAsset = await apiClient.createAsset(title || file.name);
      // TODO: Update asset with coverS3Key once we implement that endpoint
      
      setAssets(prev => [...prev, newAsset]);
      setCurrentAsset(newAsset);
      return newAsset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      assets,
      currentAsset,
      isLoading,
      error,
      loadAssets,
      createAsset,
      selectAsset,
      uploadImage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
