import type { OrderStatus, Payment } from "@/entities/order/model/types";

export type UserRole = "CUSTOMER" | "ADMIN";
export type SortOrder = "asc" | "desc";

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type AdminListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  status?: OrderStatus;
  role?: UserRole;
  categoryId?: number;
  rating?: number;
};

export type AdminCategory = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: { products: number };
};

export type AdminIngredient = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    cartItems: number;
    orderItems: number;
  };
};

export type AdminProductItem = {
  id?: string;
  price: number;
  size: number | null;
  pizzaType: number | null;
  imageUrl: string;
};

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  canBuildHalfAndHalf: boolean;
  ratingAvg: number;
  ratingSum: number;
  ratingCount: number;
  categoryId: number;
  category: AdminCategory;
  ingredients: AdminIngredient[];
  items: Required<AdminProductItem>[];
  minPrice: number | null;
  maxPrice: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductPayload = {
  name: string;
  description: string;
  imageUrl: string;
  categoryId: number;
  canBuildHalfAndHalf: boolean;
  ingredientIds: string[];
  items: AdminProductItem[];
};

export type AdminOrder = {
  id: string;
  orderNumber: number;
  token: string;
  status: OrderStatus;
  totalPrice: number;
  userId: string | null;
  name: string;
  phone: string;
  address: string;
  email: string | null;
  comment: string | null;
  payment: Payment | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null;
  _count: { items: number };
};

export type AdminOrderDetails = AdminOrder & {
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    customName: string | null;
    customDetails: unknown;
    productItem: {
      id: string;
      size: number | null;
      pizzaType: number | null;
      imageUrl: string;
      product: { id: string; name: string; imageUrl: string };
    };
    ingredients: Array<{ id: string; name: string; price: number }>;
  }>;
};

export type AdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  productId: string;
  userId: string;
  orderItemId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
  product: {
    id: string;
    name: string;
    imageUrl: string;
  };
};

export type AdminUser = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  _count: { orders: number };
};

export type AdminUserPayload = {
  name: string;
  phone: string;
  email?: string | null;
  password?: string;
  address?: string | null;
  role: UserRole;
};

export type AdminDashboard = {
  metrics: {
    ordersTotal: number;
    ordersToday: number;
    productsTotal: number;
    usersTotal: number;
    pendingOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    averageOrderValue: number;
  };
  statusBreakdown: Array<{
    status: OrderStatus;
    count: number;
    totalPrice: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
};
