export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  role: 'individual' | 'company' | 'affiliate' | 'admin';
  avatar?: string;
  points: number;
  companyName?: string;
  affiliateCode?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'network-device' | 'software-license' | 'installation-service';
  price: number;
  image: string;
  inStock: number;
  specifications?: Record<string, string>;
  tags: string[];
}

export interface PaymentTransaction {
  id: string;
  transaction_type: 'full' | 'deposit' | 'final' | 'refund';
  transaction_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  payment_method: 'cod' | 'split' | 'card' | 'bank_transfer';
  transaction_id?: string;
  reference_number?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;
  transaction_type_display: string;
  transaction_status_display: string;
  payment_method_display: string;
  is_completed: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total_price: number;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: Address;
  paymentMethod: 'cod' | 'split' | 'card' | 'bank_transfer';
  payment_status: 'pending' | 'paid' | 'partial' | 'failed' | 'refunded';
  payment_transactions?: PaymentTransaction[];
  has_services?: boolean;
  pointsEarned: number;
  pointsUsed: number;
}

export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Notification {
  id: string;
  title: string;
  title_ar: string;
  message: string;
  message_ar: string;
  notification_type: 'order' | 'company' | 'points' | 'service' | 'marketing' | 'security';
  notification_type_display: string;
  is_read: boolean;
  link?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'redeemed';
  description: string;
  descriptionAr: string;
  createdAt: string;
}