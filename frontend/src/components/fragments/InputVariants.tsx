import React from 'react';
import { Input, InputProps } from '../ui/Input';

// Định nghĩa các biến thể Input thường dùng

// Input với label
interface LabeledInputProps extends InputProps {
  label: string;
  id: string;
  required?: boolean;
  errorMessage?: string;
}

export const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  id,
  required = false,
  errorMessage,
  ...props
}) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input id={id} {...props} />
    {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
  </div>
);

// Input số lượng
interface QuantityInputProps extends Omit<InputProps, 'type' | 'min' | 'max' | 'onChange'> {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  min = 1,
  max = 999,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleDecrement}
        className="px-2 py-1 border border-gray-300 rounded-l-md bg-gray-50"
        disabled={value <= min}
      >
        -
      </button>
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        className="w-16 text-center rounded-none border-l-0 border-r-0"
        {...props}
      />
      <button
        type="button"
        onClick={handleIncrement}
        className="px-2 py-1 border border-gray-300 rounded-r-md bg-gray-50"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
};

// Input tìm kiếm
export const SearchInput: React.FC<Omit<InputProps, 'type' | 'placeholder'>> = (props) => (
  <Input
    type="search"
    placeholder="Tìm kiếm..."
    className="pl-9 pr-3"
    leftIcon={
      <svg
        className="w-4 h-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    }
    {...props}
  />
);

// Input số tiền
interface PriceInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  currency = 'VND',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue) {
      onChange(parseInt(rawValue, 10));
    } else {
      onChange(0);
    }
  };

  // Format giá trị thành chuỗi có phân cách hàng nghìn
  const formattedValue = new Intl.NumberFormat('vi-VN').format(value);

  return (
    <div className="relative">
      <Input
        type="text"
        value={formattedValue}
        onChange={handleChange}
        className="pl-3 pr-12"
        {...props}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
        {currency}
      </div>
    </div>
  );
}; 