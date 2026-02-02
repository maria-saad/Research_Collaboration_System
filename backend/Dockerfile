# استخدم نسخة LTS من Node كنقطة انطلاق
FROM node:20-alpine

WORKDIR /usr/src/app

# نسخ ملفات تعريف الحزم وتثبيت الاعتمادات
COPY package*.json ./
ENV HUSKY=0

RUN npm ci --omit=dev --ignore-scripts

# نسخ باقى الكود إلى الحاوية
COPY . .

# التأكد من وجود ملف البيئة داخل الحاوية عند البناء (اختيارى إذا ستستخدم environment فى Compose)
COPY .env ./

# تعريض المنفذ 5000
EXPOSE 5000

# الأمر الافتراضى لتشغيل التطبيق
CMD ["npm", "start"]
