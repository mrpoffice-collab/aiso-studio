import { useState, useEffect } from 'react';

/**
 * Custom hook to persist form data in localStorage
 *
 * Usage:
 * const [formData, setFormData] = useFormPersistence('unique-form-key', {
 *   name: '',
 *   email: '',
 *   industry: ''
 * });
 *
 * Then use formData and setFormData like normal useState
 */
export function useFormPersistence<T>(
  key: string,
  initialValue: T,
  expiryMinutes: number = 60 // Auto-clear after 60 minutes by default
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get saved data from localStorage on mount
  const [data, setData] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const saved = localStorage.getItem(key);
      if (!saved) return initialValue;

      const parsed = JSON.parse(saved);

      // Check if expired
      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.data || initialValue;
    } catch (error) {
      console.error('Error loading persisted form data:', error);
      return initialValue;
    }
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const expiry = Date.now() + (expiryMinutes * 60 * 1000);
      localStorage.setItem(key, JSON.stringify({ data, expiry }));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [data, key, expiryMinutes]);

  // Function to clear saved data
  const clearSaved = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
    setData(initialValue);
  };

  return [data, setData, clearSaved];
}
