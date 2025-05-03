import { useState, useEffect } from 'react';

/**
 * Hook để debounce giá trị, trả về giá trị mới sau một khoảng thời gian delay
 * @param value Giá trị cần debounce
 * @param delay Thời gian debounce (ms)
 * @returns Giá trị sau khi debounce
 */
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cập nhật giá trị sau khoảng thời gian delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout nếu giá trị thay đổi hoặc component unmount
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce; 