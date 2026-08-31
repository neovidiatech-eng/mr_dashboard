# 📁 توثيق الـ Endpoints الخاصة برفع الملفات (File Uploads API Documentation)

هذا المستند موجه لفريق **الفرونت إند (Frontend Team)** لتوضيح التغييرات وطريقة إرسال البيانات والملفات للـ Endpoints الخاصة بالصور والملفات في الباك إند.

---

## ⚠️ تعليمات عامة للفرونت إند (Important Notes for Frontend)
1. **نوع الطلب (Content-Type):** جميع الـ Endpoints الموضحة أدناه تتطلب إرسال البيانات بصيغة **`multipart/form-data`** باستخدام كائن **`FormData`** وليس JSON عادي (`application/json`).
2. **المرونة (Flexibility):** يمكنك رفع الملفات في الفيلد المخصص (`File`), وفي حالة عدم اختيار ملف جديد أثناء التحديث (Update)، يظل التغيير اختياريًا دون مساس بالبيانات القديمة.

---

## 1️⃣ المحاضرات (Lectures API)

### 📌 إضافة محاضرة جديدة (Create Lecture)
* **Endpoint:** `POST /matrials/lectures`
* **Content-Type:** `multipart/form-data`
* **المسار في الراوتر:** `/matrials/lectures`

#### 📋 الحقول المطلوب إرسالها (FormData Fields):
| اسم الحقل (Field Name) | النوع (Type) | إجباري؟ (Required) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `title_ar` | `Text` | **نعم** | عنوان المحاضرة بالعربية |
| `title_en` | `Text` | لا | عنوان المحاضرة بالإنجليزية |
| `content_ar` | `Text` | **نعم** | وصف/محتوى المحاضرة بالعربية |
| `content_en` | `Text` | لا | وصف/محتوى المحاضرة بالإنجليزية |
| `courseId` | `Text` (UUID) | **نعم** | معرف الكورس التابعة له |
| `order` | `Number` | لا | ترتيب المحاضرة |
| `duration` | `Text` | لا | مدة المحاضرة (مثال: `01:30:00`) |
| `date` | `ISO Date` | لا | تاريخ المحاضرة |
| **`video`** | **`File`** | لا | ملف الفيديو الخاص بالمحاضرة (MP4, MKV, AVI, WEBM, MOV) |
| **`slides`** | **`File`** | لا | ملف العرض التقديمي (PDF, PPT, PPTX) |
| **`pdf`** | **`File`** | لا | ملف الملازم/الملفات النصية (PDF) |

---

### 📌 تعديل محاضرة حالية (Update Lecture)
* **Endpoint:** `PATCH /matrials/lectures/:id`
* **Content-Type:** `multipart/form-data`
* **المسار في الراوتر:** `/matrials/lectures/:id`
* **ملاحظة:** جميع الحقول أعلاه اختيارية عند التعديل، والملفات المرفوعة تُحدّث المسارات السابقة (`video_path`, `slides_path`, `pdf_path`).

---

## 2️⃣ الجدول والحصص (Schedules / Sessions API)

### 📌 إنشاء حصة واحدة (Create Single Session)
* **Endpoint:** `POST /schedules/create-one`
* **Content-Type:** `multipart/form-data`

#### 📋 الحقول المطلوب إرسالها (FormData Fields):
| اسم الحقل (Field Name) | النوع (Type) | إجباري؟ (Required) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `teacherId` | `Text` (UUID) | **نعم** | معرف المعلم |
| `courseId` | `Text` (UUID) | **نعم** | معرف الكورس |
| `studentId` | `Text` (UUID) | لا | معرف الطالب (في حالة الحصة الفردية) |
| `title` | `Text` | **نعم** | عنوان الحصة |
| `platform` | `Text` | **نعم** | منصة الحصة (`zoom` / `google_meet` ...) |
| `link` | `Text` | **نعم** | رابط الحضور المباشر |
| `start_time` | `ISO Date` | **نعم** | موعد الحصة |
| `type` | `Text` | **نعم** | نوع الحصة |
| `notification_Time` | `Text` | **نعم** | وقت الإشعار قبل الحصة |
| **`video`** | **`File`** | لا | ملف تسجيل الفيديو للحصة |
| **`slides`** | **`File`** | لا | ملف العرض التقديمي |
| **`pdf`** | **`File`** | لا | ملف PDF/ملزمة الحصة |

---

### 📌 إنشاء حصص متكررة (Create Recurring Sessions)
* **Endpoint:** `POST /schedules/create-recurring`
* **Content-Type:** `multipart/form-data`
* **الحقول:** نفس حقول الحصة الواحدة بالإضافة إلى `days`, `startDate`, `endDate`, وتدعم رفع `video`, `slides`, `pdf`.

---

### 📌 تعديل حصة (Update Session)
* **Endpoint:** `PATCH /schedules/:id`
* **Content-Type:** `multipart/form-data`
* **الحقول:** جميع الحقول اختيارية مع إمكانية إرفاق `video`, `slides`, `pdf`.

---

## 3️⃣ الرتب (Ranks API)

### 📌 إضافة رتبة جديدة (Create Rank)
* **Endpoint:** `POST /matrials/ranks/create`
* **Content-Type:** `multipart/form-data`

#### 📋 الحقول المطلوب إرسالها (FormData Fields):
| اسم الحقل (Field Name) | النوع (Type) | إجباري؟ (Required) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `name_ar` | `Text` | **نعم** | اسم الرتبة بالعربية |
| `name_en` | `Text` | لا | اسم الرتبة بالإنجليزية |
| `color` | `Text` | **نعم** | كود اللون (Hex code مثل `#FF5733`) |
| **`icon`** | **`File`** | لا | صورة/أيقونة الرتبة (PNG, JPG, JPEG, WEBP, SVG) |

---

### 📌 تعديل رتبة (Update Rank)
* **Endpoint:** `PATCH /matrials/ranks/:id`
* **Content-Type:** `multipart/form-data`
* **الحقول:** `name_ar`, `name_en`, `color`, **`icon`** (الملف اختيارية عند التعديل).

---

## 4️⃣ المنشورات والمدونة (Posts / Blog API)

### 📌 إنشاء منشور/خبر جديد (Create Post)
* **Endpoint:** `POST /posts`
* **Content-Type:** `multipart/form-data`

#### 📋 الحقول المطلوب إرسالها (FormData Fields):
| اسم الحقل (Field Name) | النوع (Type) | إجباري؟ (Required) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `type` | `Text` | **نعم** | نوع المنشور (`blog` أو `news`) |
| `title_ar` | `Text` | **نعم** | العنوان بالعربية |
| `title_en` | `Text` | لا | العنوان بالإنجليزية |
| `content_ar` | `Text` | **نعم** | المحتوى بالعربية |
| `content_en` | `Text` | لا | المحتوى بالإنجليزية |
| `excerpt_ar` | `Text` | لا | مقتطف قصير بالعربية |
| `excerpt_en` | `Text` | لا | مقتطف قصير بالإنجليزية |
| `published` | `Boolean` | لا | حالة النشر (`true`/`false`) |
| **`coverImage`** | **`File`** | لا | صورة غلاف المنشور |

---

### 📌 تعديل منشور (Update Post)
* **Endpoint:** `PATCH /posts/:id`
* **Content-Type:** `multipart/form-data`
* **الحقول:** جميع حقول المنشور اختيارية مع إمكانية رفع صورة غلاف جديدة في حقل **`coverImage`**.

---

## 5️⃣ الطلاب والملف الشخصي (Students & Profile API)

### 📌 إنشاء طالب (Create Student)
* **Endpoint:** `POST /students/create`
* **Content-Type:** `multipart/form-data`
* **حقل الصورة:** **`image`** (صورة الملف الشخصي للطالب).

---

### 📌 تعديل طالب (Update Student)
* **Endpoint:** `PATCH /students/update/:id`
* **Content-Type:** `multipart/form-data`
* **حقل الصورة:** **`image`** (تحديث صورة الطالب).

---

## 6️⃣ طلبات النواقص والدعم (Requests API)

### 📌 إنشاء طلب جديد (Create Request)
* **Endpoint:** `POST /requests`
* **Content-Type:** `multipart/form-data`
* **حقل المرفقات:** **`attachments`** (يمكن إرسال عدة ملفات Array of Files).

---

## 💻 مثال كود فرونت إند (JavaScript Example using FormData)

```javascript
const formData = new FormData();

// إضافة النصوص
formData.append("title_ar", "المحاضرة الأولى - الفิزيياء");
formData.append("content_ar", "شرح المحاضرة الأولى بالتفصيل");
formData.append("courseId", "550e8400-e29b-41d4-a716-446655440000");

// إضافة الملفات (من عناصر input type="file")
if (videoFileInput.files[0]) {
  formData.append("video", videoFileInput.files[0]);
}
if (pdfFileInput.files[0]) {
  formData.append("pdf", pdfFileInput.files[0]);
}
if (slidesFileInput.files[0]) {
  formData.append("slides", slidesFileInput.files[0]);
}

// إرسال الطلب عبر Axios أو Fetch
fetch("https://api.example.com/matrials/lectures", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`, // لا تضع Content-Type يدوياً وسيتم تحديده تلقائياً بـ multipart/form-data
  },
  body: formData,
})
  .then((res) => res.json())
  .then((data) => console.log("Success:", data))
  .catch((err) => console.error("Error:", err));
```
دي التغيرات اللي هتتعمل في الفرونت في حته رفع الفايلات ك فايل مش ك لينك