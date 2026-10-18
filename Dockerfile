# Tek konteyner: derlenmiş web uygulaması + API (FastAPI). Kendi bilgisayarınızda veya bir sunucuda çalışır.
FROM node:22-slim AS web
WORKDIR /src
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
RUN npm ci
COPY . .
ARG ACADEMY_REPO_URL=""
ARG ACADEMY_REPO_REF="main"
ENV ACADEMY_REPO_URL=$ACADEMY_REPO_URL ACADEMY_REPO_REF=$ACADEMY_REPO_REF
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
COPY apps/api/requirements*.txt apps/api/
RUN pip install --no-cache-dir -r apps/api/requirements-postgres.txt
COPY apps/api apps/api
COPY --from=web /src/apps/web/dist apps/web/dist
ENV DATABASE_URL=sqlite:////data/academy.db BACKUP_DIR=/data/backups WEB_DIST=/app/apps/web/dist
VOLUME /data
EXPOSE 8000
WORKDIR /app/apps/api
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
