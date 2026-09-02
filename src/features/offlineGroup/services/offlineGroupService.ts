import api from "../../../lib/axios";
import { ScanOfflineGroupResponse } from "../../../types/offlineGroup";
import { getCourseById } from "../../../services/CoursesServices";

export const scanOfflineGroup = async (token: string): Promise<ScanOfflineGroupResponse> => {
  const response = await api.get<ScanOfflineGroupResponse>('/offline-groups/scan', {
    params: { token },
  });

  const responseData = response.data;
  const rawCourses = responseData?.data?.courses;

  if (Array.isArray(rawCourses) && rawCourses.length > 0) {
    const populatedCourses = await Promise.all(
      rawCourses.map(async (item: any) => {
        const courseId =
          item?.course?.id ||
          (typeof item?.course === 'string' ? item.course : undefined) ||
          item?.courseId ||
          item?.id;

        if (!courseId) {
          return item;
        }

        try {
          const fullCourse = await getCourseById(courseId);
          return {
            ...item,
            courseId: courseId,
            course: {
              ...(typeof item?.course === 'object' ? item.course : {}),
              ...fullCourse,
            },
          };
        } catch (error) {
          console.error(`Failed to fetch course details for ID ${courseId}:`, error);
          return item;
        }
      })
    );

    return {
      ...responseData,
      data: {
        ...responseData.data,
        courses: populatedCourses,
      },
    };
  }

  return responseData;
};

