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
  try {
    const sectionRes = await getSectionById(id);
    const items = sectionRes?.section_items || (sectionRes as any)?.sectionItems || [];
    for (const item of items) {
      const isLec = (item.item_type || '').toUpperCase() === 'LECTURE';
      const isQz = (item.item_type || '').toUpperCase() === 'QUIZ';
      const itemId = item.details?.id || item.item_id || item.id;
      if (itemId) {
        if (isLec) {
          try { await api.delete(`/materials/lectures/${itemId}`); } catch (_) {}
        } else if (isQz) {
          try { await api.delete(`/quiz/${itemId}`); } catch (_) {}
        }
      }
    }
    try {
      await api.patch(`/materials/sections/${id}`, { items: [] });
    } catch (_) {}
  } catch (_) {}

  await api.delete(`/materials/sections/${id}`);
};

export const addItemsToSection = async (
  sectionId: string,
  items: SectionItemPayload[],
  courseId?: string
): Promise<any> => {
  try {
    const sectionRes = await getSectionById(sectionId);
    if (!sectionRes) throw new Error('SECTION_NOT_FOUND');

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
  } catch (err: any) {
    const is404 = err?.response?.status === 404 || err?.message === 'SECTION_NOT_FOUND' || err?.response?.data?.error === 'SECTION_NOT_FOUND';
    if (is404 && courseId) {
      try {
        const newSec = await createSection({
          name_ar: 'السكشن الرئيسي',
          name_en: 'Main Section',
          course_id: courseId,
          items,
        });
        return newSec;
      } catch (createErr) {
        console.warn('Failed auto-creating section:', createErr);
      }
    }

    try {
      const response = await api.post(`/materials/sections/${sectionId}/items`, { items });
      return response.data;
    } catch (postErr) {
      throw err;
    }
  }
};

export const removeItemFromSection = async (
  sectionId: string,
  itemId: string
): Promise<any> => {
  try {
    await api.delete(`/materials/sections/${sectionId}/items/${itemId}`);
  } catch (err: any) {
    // proceed to PATCH update
  }

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
    return null;
  }
};
