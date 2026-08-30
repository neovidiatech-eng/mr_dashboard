import api from "../lib/axios";
import { Section } from "../types/courses";

export interface CreateSectionPayload {
  name_ar?: string;
  name_en?: string;
  course_id: string;
  items?: Array<{
    item_id: string;
    item_type: 'LECTURE' | 'QUIZ';
    order?: number;
  }>;
}

export interface SectionItemPayload {
  item_id: string;
  item_type: 'LECTURE' | 'QUIZ';
  order?: number;
}

export const getSectionsByCourse = async (courseId: string): Promise<Section[]> => {
  const response = await api.get('/materials/sections', { params: { course_id: courseId, limit: 100 } });
  const data = response.data?.data;
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.sections && Array.isArray(data.sections)) return data.sections;
  return [];
};

export const getSectionById = async (id: string): Promise<Section> => {
  const response = await api.get(`/materials/sections/${id}`);
  return response.data.data;
};

export const createSection = async (data: CreateSectionPayload): Promise<Section> => {
  const response = await api.post('/materials/sections', data);
  return response.data.data;
};

export interface UpdateSectionPayload {
  name_ar?: string;
  name_en?: string;
  course_id?: string;
  items?: SectionItemPayload[];
}

export const updateSection = async (
  id: string,
  data: UpdateSectionPayload
): Promise<Section> => {
  const response = await api.patch(`/materials/sections/${id}`, data);
  return response.data.data;
};

export const deleteSection = async (id: string): Promise<void> => {
  await api.delete(`/materials/sections/${id}`);
};

export const addItemsToSection = async (
  sectionId: string,
  items: SectionItemPayload[]
): Promise<any> => {
  try {
    const response = await api.post(`/materials/sections/${sectionId}/items`, { items });
    return response.data;
  } catch (err: any) {
    // If backend endpoint POST /materials/sections/:id/items fails (e.g. 500 db.createMany is not a function)
    // Fallback to fetching current section items and calling PATCH /materials/sections/:id
    try {
      const sectionRes = await getSectionById(sectionId);
      const existingItems = (sectionRes.section_items || (sectionRes as any).sectionItems || []).map((it: any) => ({
        item_id: it.item_id || it.details?.id || it.id,
        item_type: (it.item_type || 'LECTURE').toUpperCase(),
        order: it.order || 1,
      }));

      const newItemsMap = new Map();
      existingItems.forEach((it: any) => {
        if (it.item_id) newItemsMap.set(it.item_id, it);
      });
      items.forEach((it: any) => {
        if (it.item_id) newItemsMap.set(it.item_id, it);
      });

      const updatedItems = Array.from(newItemsMap.values());
      const patchRes = await updateSection(sectionId, { items: updatedItems });
      return patchRes;
    } catch (fallbackErr) {
      throw err;
    }
  }
};

export const removeItemFromSection = async (
  sectionId: string,
  itemId: string
): Promise<any> => {
  try {
    const response = await api.delete(`/materials/sections/${sectionId}/items${itemId}`);
    return response.data;
  } catch (err: any) {
    try {
      const sectionRes = await getSectionById(sectionId);
      const existingItems = (sectionRes.section_items || (sectionRes as any).sectionItems || []).map((it: any) => ({
        id: it.id,
        item_id: it.item_id || it.details?.id || it.id,
        item_type: (it.item_type || 'LECTURE').toUpperCase(),
        order: it.order || 1,
      }));

      const filteredItems = existingItems
        .filter((it: any) => it.item_id !== itemId && it.id !== itemId)
        .map((it: any) => ({
          item_id: it.item_id,
          item_type: it.item_type,
          order: it.order,
        }));

      const patchRes = await updateSection(sectionId, { items: filteredItems });
      return patchRes;
    } catch (fallbackErr) {
      throw err;
    }
  }
};
