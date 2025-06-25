# 빌드 스테이지 (선택, 최적화용)
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# 실제 서비스 스테이지
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]