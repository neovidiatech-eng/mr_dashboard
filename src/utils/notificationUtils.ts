import { NotificationItem } from "../types/notification";

export const NOTIFICATION_TYPE_MAP: Record<string, { ar: string; en: string }> = {
  NEW_COURSE_PURCHASE_REQUEST: {
    ar: "طلب شراء كورس جديد",
    en: "New Course Purchase Request",
  },
  COURSE_PURCHASE_REQUEST: {
    ar: "طلب شراء كورس",
    en: "Course Purchase Request",
  },
  NEW_PURCHASE_REQUEST: {
    ar: "طلب شراء جديد",
    en: "New Purchase Request",
  },
  PURCHASE_REQUEST: {
    ar: "طلب شراء",
    en: "Purchase Request",
  },
  NEW_SUBSCRIPTION_REQUEST: {
    ar: "طلب اشتراك جديد",
    en: "New Subscription Request",
  },
  SUBSCRIPTION_REQUEST: {
    ar: "طلب اشتراك",
    en: "Subscription Request",
  },
  NEW_STUDENT_REGISTERED: {
    ar: "تسجيل طالب جديد",
    en: "New Student Registration",
  },
  GENERAL: {
    ar: "عام",
    en: "General",
  },
  ANNOUNCEMENT: {
    ar: "إعلان",
    en: "Announcement",
  },
};

export const NOTIFICATION_TITLE_MAP: Record<string, { ar: string; en: string }> = {
  "New Course Purchase Request": {
    ar: "طلب شراء كورس جديد",
    en: "New Course Purchase Request",
  },
  "New Purchase Request": {
    ar: "طلب شراء جديد",
    en: "New Purchase Request",
  },
  "New Subscription Request": {
    ar: "طلب اشتراك جديد",
    en: "New Subscription Request",
  },
  "Course Purchase Request": {
    ar: "طلب شراء كورس",
    en: "Course Purchase Request",
  },
};

export function translateNotificationType(type?: string, isAr: boolean = true): string {
  if (!type) return "";
  const normalized = type.trim().toUpperCase();
  const matched = NOTIFICATION_TYPE_MAP[normalized];
  if (matched) {
    return isAr ? matched.ar : matched.en;
  }
  // Fallback: replace underscores with spaces
  return type.replace(/_/g, " ");
}

export function translateNotificationMessage(rawMessage: string, isAr: boolean): string {
  if (!isAr || !rawMessage) return rawMessage;

  // Case 1: Student "X" submitted a purchase request for course "Y"
  const courseMatch = rawMessage.match(
    /Student\s*["“']?([^"“”']+)["”']?\s*submitted a purchase request for course\s*["“']?([^"“”']+)["”']?/i
  );
  if (courseMatch) {
    const studentName = courseMatch[1].trim();
    const courseName = courseMatch[2].trim();
    return `قام الطالب "${studentName}" بتقديم طلب شراء للكورس "${courseName}".`;
  }

  // Case 2: Student "X" submitted a purchase request for plan "Y" / subscription "Y"
  const planMatch = rawMessage.match(
    /Student\s*["“']?([^"“”']+)["”']?\s*submitted a (?:purchase|subscription) request for plan\s*["“']?([^"“”']+)["”']?/i
  );
  if (planMatch) {
    const studentName = planMatch[1].trim();
    const planName = planMatch[2].trim();
    return `قام الطالب "${studentName}" بتقديم طلب اشتراك في الباقة "${planName}".`;
  }

  // Case 3: Student "X" submitted a purchase request
  const purchaseMatch = rawMessage.match(
    /Student\s*["“']?([^"“”']+)["”']?\s*submitted a purchase request/i
  );
  if (purchaseMatch) {
    const studentName = purchaseMatch[1].trim();
    return `قام الطالب "${studentName}" بتقديم طلب شراء.`;
  }

  // Case 4: Student "X" submitted a subscription request
  const subMatch = rawMessage.match(
    /Student\s*["“']?([^"“”']+)["”']?\s*submitted a subscription request/i
  );
  if (subMatch) {
    const studentName = subMatch[1].trim();
    return `قام الطالب "${studentName}" بتقديم طلب اشتراك.`;
  }

  return rawMessage;
}

export function getNotificationDetails(
  item: NotificationItem | null | undefined,
  isAr: boolean
): {
  type: string;
  typeLabel: string;
  title: string;
  message: string;
} {
  if (!item) {
    return { type: "", typeLabel: "", title: "", message: "" };
  }

  const translation = item.translations?.find((t) => t.lang === (isAr ? "ar" : "en"));
  let rawTitle = translation?.title || item.title || "";
  let rawMessage = translation?.message || item.message || "";

  // If language is Arabic but backend only gave English or translation is missing
  let title = rawTitle;
  if (isAr) {
    const titleMatch = NOTIFICATION_TITLE_MAP[rawTitle.trim()];
    if (titleMatch) {
      title = titleMatch.ar;
    } else if (item.type && NOTIFICATION_TYPE_MAP[item.type.trim().toUpperCase()]) {
      // If title is equal to type or standard English
      const normalizedType = item.type.trim().toUpperCase();
      if (
        rawTitle.toUpperCase() === normalizedType ||
        rawTitle.toUpperCase() === normalizedType.replace(/_/g, " ")
      ) {
        title = NOTIFICATION_TYPE_MAP[normalizedType].ar;
      }
    }
  }

  const message = translateNotificationMessage(rawMessage, isAr);
  const typeLabel = translateNotificationType(item.type, isAr);

  return {
    type: item.type || "",
    typeLabel,
    title,
    message,
  };
}
