'use client'

import { useState, useEffect, useCallback } from 'react';

export interface Profile {
  address: string;
  name?: string;
  bio?: string;
  profileImage?: string;
  email?: string;
  instagramLink?: string;
  youtubeLink?: string;
  linkedinLink?: string;
  githubLink?: string;
  twitterLink?: string;
  discordUsername?: string;
  beuid?: string;
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    discord?: string;
  };
}

export function useProfile(address: string | undefined | null) {

  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (onSuccess?: () => void) => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/profile?address=${address}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setProfileData(data.profile || null);
      if (onSuccess) onSuccess(); // Call onSuccess if provided
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to fetch profile. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, address]);

  return { profileData, isLoading, error, refetch: fetchProfile };
}

