# مرحلة البناء
FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
# متغير البيئة حتى يستطيع Vite قراءة عنوان الـ API
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

# مرحلة التشغيل: استخدم صورة Nginx لخدمة الملفات الثابتة
FROM nginx:stable-alpine AS production
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
