import api from "../lib/axios"
import { 
    SupportCategoriesResponse, 
    SupportResponse, 
    CreateSupportItemInput, 
    UpdateSupportItemInput, 
    CreateSupportCategoryInput, 
    UpdateSupportCategoryInput,
    SupportItem,
    PopularSupportResponse
} from "../types/support"

// Support Items
export const getSupport = async (): Promise<SupportResponse> => {
    const res = await api.get('/support')
    return res.data
}

export const getSupportById = async (id: string): Promise<{ data: SupportItem }> => {
    const res = await api.get(`/support/${id}`)
    return res.data
}

export const createSupport = async (data: CreateSupportItemInput): Promise<SupportResponse> => {
    const res = await api.post('/support', data)
    return res.data
}

export const updateSupport = async (id: string, data: UpdateSupportItemInput): Promise<SupportResponse> => {
    const res = await api.patch(`/support/${id}`, data)
    return res.data
}

export const deleteSupport = async (id: string): Promise<void> => {
    await api.delete(`/support/${id}`)
}

// Support Categories
export const getSupportCategories = async (): Promise<SupportCategoriesResponse> => {
    const res = await api.get('/support/categories')
    return res.data
}

export const createSupportCategory = async (data: CreateSupportCategoryInput): Promise<SupportCategoriesResponse> => {
    const res = await api.post('/support/categories', data)
    return res.data
}

export const updateSupportCategory = async (id: string, data: UpdateSupportCategoryInput): Promise<SupportCategoriesResponse> => {
    const res = await api.patch(`/support/categories/${id}`, data)
    return res.data
}

export const deleteSupportCategory = async (id: string): Promise<void> => {
    await api.delete(`/support/categories/${id}`)
}

// Teacher Specific
export const getSupportForTeacher = async (): Promise<PopularSupportResponse> => {
    const res = await api.get('/support/teacher')
    return res.data
}