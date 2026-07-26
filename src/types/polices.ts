export interface Policy {
    id: string;
    title: string;
    description?: string;
    content?: string;
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
    title: string;
    description: string;
    icon?: string;
    color?: string;
    active?: boolean;
}

export interface CreateNoticeInput {
    title: string;
    content: string;
    active?: boolean;
}

export interface UpdatePolicyInput extends Partial<CreatePolicyInput> {}
export interface UpdateNoticeInput extends Partial<CreateNoticeInput> {}
