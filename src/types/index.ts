export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  role: 'individual' | 'company' | 'affiliate' | 'admin';
  avatar?: string;
  role_admin?: 'super' | 'admin' | 'moderator';
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
  transaction_status: 'pending' | 'refunded'| 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  payment_method: 'cod' | 'split' | 'card' | 'bank_transfer';
  transaction_id?: string;
  reference_number?: string;
  notes?: string;
  vendor?: string;
  hint_note?: string;
  currency?: string;
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;
  transaction_type_display: string;
  transaction_status_display: string;
  payment_method_display: string;
  is_completed: boolean;
}

export interface Order {
  user_name: string;
  tax_amount: number;
  order_number: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  phone: string;
  userId: string;
  notes?: string;
  items: OrderItem[];
  status_display: string;
  estimated_delivery: string;
  shipping_amount: number;
  discount_amount: number;
  full_shipping_address: string;
  can_be_cancelled: boolean;
  total_price: number;
  currency: string;
  order_status: 'pending' | 'processing' | 'shipped' | 'confirmed'| 'delivered' | 'cancelled';
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

export interface Company {
  id: number;
  name: string;
  registration_number: string;
  industry: string;
  website?: string;
  description?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  approval_status: "pending" | "approved" | "rejected" | "suspended";
  approved_at?: string;
  rejection_reason?: string;
  admin_name: string;
  admin_email: string;
  employee_count: number;
  created_at: string;
  updated_at: string;
  tax_card_image?: string;
  commercial_registration_image?: string;
}

export interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  hire_date: string;
  salary?: number;
  status: "active" | "inactive" | "pending" | "suspended";
  can_manage_orders: boolean;
  can_view_reports: boolean;
  can_manage_inventory: boolean;
  can_manage_customers: boolean;
  user_email?: string;
  created_at: string;
  updated_at: string;
}
