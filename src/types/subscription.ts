export type SubscriptionStatus = 'pending' | 'approved' | 'rejected';

export interface SubscriptionUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  code_country: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  confirmAt: string | null;
  roleId: string;
  googleId: string | null;
  provider: string;
  image: string | null;
  age?: number | null;
  birth_date?: string | null;
  birthDate?: string | null;
}
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: number;
  features: string[];
  sessionsCount: number;
  rescheduleCount: number;
  currencyId: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}
export interface SubscriptionRequest {
  id: string;
  planId: string;
  user_id: string;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
  user: SubscriptionUser;
  plan: SubscriptionPlan;
}
export interface SubscriptionRequestsResponse {
  message: string;
  status: number;
  lang: string;
  data: {
    subscriptionRequests: SubscriptionRequest[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
}