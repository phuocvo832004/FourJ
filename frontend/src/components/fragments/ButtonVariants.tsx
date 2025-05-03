import React from 'react';
import { Button, ButtonProps } from '../ui/Button';

// Định nghĩa các loại button thường dùng dựa trên component Button

export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);

// Kích thước
export const SmallButton: React.FC<Omit<ButtonProps, 'size'>> = (props) => (
  <Button size="sm" {...props} />
);

export const MediumButton: React.FC<Omit<ButtonProps, 'size'>> = (props) => (
  <Button size="md" {...props} />
);

export const LargeButton: React.FC<Omit<ButtonProps, 'size'>> = (props) => (
  <Button size="lg" {...props} />
);

// Kết hợp kích thước và variant thường dùng 
export const PrimarySmallButton: React.FC<Omit<ButtonProps, 'variant' | 'size'>> = (props) => (
  <Button variant="primary" size="sm" {...props} />
);

export const PrimaryLargeButton: React.FC<Omit<ButtonProps, 'variant' | 'size'>> = (props) => (
  <Button variant="primary" size="lg" {...props} />
);

export const SecondarySmallButton: React.FC<Omit<ButtonProps, 'variant' | 'size'>> = (props) => (
  <Button variant="secondary" size="sm" {...props} />
);

export const SecondaryLargeButton: React.FC<Omit<ButtonProps, 'variant' | 'size'>> = (props) => (
  <Button variant="secondary" size="lg" {...props} />
);

// Button loading
export const LoadingButton: React.FC<Omit<ButtonProps, 'isLoading'>> = (props) => (
  <Button isLoading={true} {...props} />
);

// Button với icons
export const IconButton: React.FC<ButtonProps & { icon: React.ReactNode }> = ({ icon, ...props }) => (
  <Button leftIcon={icon} {...props} />
);

// Button xóa với confirm
export const DeleteButton: React.FC<
  Omit<ButtonProps, 'variant'> & { 
    onConfirm: () => void;
    confirmText?: string;
  }
> = ({ onConfirm, confirmText = 'Bạn có chắc chắn muốn xóa không?', ...props }) => {
  const handleClick = () => {
    if (window.confirm(confirmText)) {
      onConfirm();
    }
  };

  return <Button variant="danger" onClick={handleClick} {...props} />;
}; 