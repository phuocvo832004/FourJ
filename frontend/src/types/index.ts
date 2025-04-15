export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  categoryId?: number;
  variant?: string;
  sellerId?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: string;
  paymentMethod: 'credit_card' | 'paypal' | 'cod';
  sellerId?: string;
}

export interface Seller {
  id: string;
  userId: string;
  name: string;
  description: string;
  logo: string;
  address: string;
  phoneNumber: string;
  email: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: string;
  products?: Product[];
  orders?: Order[];
}

export interface SellerApplicationForm {
  name: string;
  description: string;
  logo?: File;
  address: string;
  phoneNumber: string;
  email: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  bankAccount?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
  };
} 