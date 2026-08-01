export interface Policy {
    id: string;
    title: string;
    title_ar?: string;
    title_en?: string;
    description?: string;
    description_ar?: string;
    description_en?: string;
    content?: string;
    content_ar?: string;
    content_en?: string;
    icon?: string;
    color?: string;
    lastUpdated?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PoliciesResponse {
    message: string;
    status: number;
    lang: string;
    data: Policy[];
}

export interface SinglePolicyResponse {
    message: string;
    status: number;
    lang: string;
    data: Policy;
}

export interface CreatePolicyInput {
    title?: string;
    title_ar: string;
    title_en?: string;
    description?: string;
    description_ar?: string;
    description_en?: string;
    icon?: string;
    color?: string;
    active?: boolean;
}

export interface CreateNoticeInput {
    title?: string;
    title_ar: string;
    title_en?: string;
    content?: string;
    content_ar?: string;
    content_en?: string;
    active?: boolean;
}

export interface UpdatePolicyInput extends Partial<CreatePolicyInput> {}
export interface UpdateNoticeInput extends Partial<CreateNoticeInput> {}
