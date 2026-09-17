export interface SocialLinks {
  facebook?: string;
  youtube?: string;
  whatsapp?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  [key: string]: any;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}

export interface PaymentMethods {
  vodafoneCash?: string;
  instaPay?: string;
  fawry?: string;
  [key: string]: any;
}

export interface ISetting {
  id?: string;
  userPrefix: string;
  socialLinks: SocialLinks;
  contactInfo: ContactInfo;
  paymentMethods: PaymentMethods;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettingsResponse {
  message: string;
  status: number;
  lang: string;
  data: ISetting;
}

export interface UpdateSettingsRequest {
  userPrefix?: string;
  socialLinks?: Partial<SocialLinks>;
  contactInfo?: Partial<ContactInfo>;
  paymentMethods?: Partial<PaymentMethods>;
}



