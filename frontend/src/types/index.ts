export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: 'suv' | 'sedan' | 'compact' | 'luxury' | 'crossover';
  transmission: 'automatic' | 'manual';
  fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  seats: number;
  doors: number;
  color?: string;
  daily_price: number;
  weekly_price?: number;
  monthly_price?: number;
  deposit_amount: number;
  is_available: boolean;
  is_featured: boolean;
  description?: string;
  features?: string[];
  images?: string[];
  thumbnail?: string;
  reviews?: Review[];
  created_at: string;
}

export interface Reservation {
  id: string;
  reservation_number: string;
  user_id?: string;
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  total_days: number;
  daily_rate: number;
  subtotal: number;
  tax_amount: number;
  deposit_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  payment_status: 'pending' | 'paid' | 'refunded' | 'partial';
  notes?: string;
  admin_notes?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  vehicle_name?: string;
  vehicle_image?: string;
  brand?: string;
  model?: string;
  year?: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  wilaya?: string;
  role: 'customer' | 'admin' | 'super_admin';
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  vehicle_id: string;
  rating: number;
  title?: string;
  content?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
}

export interface BookingForm {
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  notes?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
}

export interface Analytics {
  bookings: {
    total: string;
    pending: string;
    confirmed: string;
    completed: string;
  };
  revenue: {
    total: string;
    this_month: string;
  };
  fleet: {
    available: string;
    total: string;
  };
  topVehicles: Array<{
    name: string;
    thumbnail: string;
    rental_count: string;
    revenue: string;
  }>;
  monthlyStats: Array<{
    month: string;
    bookings: string;
    revenue: string;
  }>;
  customers: { total: string };
}
