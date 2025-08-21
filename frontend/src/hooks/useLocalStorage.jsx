import { useState } from "react";

/**
 * Custom hook to persist state in localStorage
 * @param {string} key - localStorage key
 * @param {*} defaultValue - default value if not found in localStorage
 * @returns {[value, setValue]} - stateful value and setter function
 */
export function useLocalStorage(key, defaultValue) {
  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Update localStorage when value changes
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook specifically for persisting user preferences
 * @param {string} prefKey - preference key
 * @param {*} defaultValue - default value
 * @returns {[value, setValue]} - stateful value and setter function
 */
export function useUserPreference(prefKey, defaultValue) {
  return useLocalStorage(`userPref_${prefKey}`, defaultValue);
}
