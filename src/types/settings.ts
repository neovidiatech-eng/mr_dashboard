export interface SocialLinks {
  twitter: string;
  facebook: string;
  instagram: string;
}

export interface ContactInfo {
  whatsapp?: {
    phone: string;
    active: boolean;
  };
  mail?: {
    email: string;
    active: boolean;
  };
  email?: string;
  phone?: string;
  address?: string;
}

export interface ISetting {
  id: string;
  userPrefix: string;
  socialLinks: SocialLinks;
  contactInfo: ContactInfo;
  createdAt: string;
  updatedAt: string;
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
}
