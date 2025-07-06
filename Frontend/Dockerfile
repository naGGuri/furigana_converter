# 빌드 단계
FROM node:22-alpine AS builder
WORKDIR /app

# 소스 전체 복사
COPY . .

# VITE 환경변수 주입
ENV VITE_API_BASE_URL=/api

# 빌드 시 환경변수 사용됨
RUN npm install && npm run build

# 배포 단계
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]