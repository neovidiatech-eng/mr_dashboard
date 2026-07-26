export interface TeacherSubject {
    id: string;
    teacherId: string;
    subjectId: string;
    createdAt: string;
    updatedAt: string;
    subject: {
        id: string;
        name_en: string;
        name_ar: string;
        active: boolean;
        color: string;
        createdAt: string;
        updatedAt: string;
    };
}

export interface Teacher {
    id: string;
    user_id: string;
    currencyId: string;
    hour_price: number;
    gender: 'Male' | 'Female';
    age: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    roleId: string | null;
    user: {
        id: string;
        email: string;
        name: string;
        username?: string;
        phone: string;
        code_country: string;
        status: string;
        gender?: string;
        age?: number | null;
        password?: string;
        createdAt?: string;
        confirmAt?: string | null;
    };
    teacherSubjects: TeacherSubject[];
}

export interface TeachersFetchResponse {
    message: string;
    status: number;
    data: {
        teachers: Teacher[];
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
            hasNextPage: boolean;
        };
        activeCount: number;
        inactiveCount: number;
    };
}

export interface CreateTeacherInput {
    name: string;
    email: string;
    password?: string;
    phone: string;
    code_country: string;
    currency_id: string;
    gender: 'male' | 'female';
    hour_price: number;
    active: boolean;
    age: number;
}

export type TeachersData = TeachersFetchResponse['data'];