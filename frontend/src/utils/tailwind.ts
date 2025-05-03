import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Hàm utility kết hợp nhiều className
 * Sử dụng clsx để xử lý điều kiện và twMerge để kết hợp các lớp tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 