#!/bin/bash
set -euo pipefail

IMAGE_NAME="low-quality-dogs"
IMAGE_TAG="latest"
CONTAINER_NAME="low-quality-dogs"

# Resolve the project root (one level up from backend/)
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "${PROJECT_ROOT}"
echo "${BACKEND_DIR}"

# Pre-create host directories with correct ownership if they don't exist
# so the nonroot user (UID 999) can write to them at runtime
mkdir -p "${PROJECT_ROOT}/static/images"
mkdir -p "${PROJECT_ROOT}/db"

if [ ! "$(stat -c '%u' "${PROJECT_ROOT}/static" 2>/dev/null)" = "999" ]; then
  echo "Setting ownership of static/ to nonroot (UID 999)..."
  sudo chown -R 999:999 "${PROJECT_ROOT}/static"
fi

if [ ! "$(stat -c '%u' "${PROJECT_ROOT}/db" 2>/dev/null)" = "999" ]; then
  echo "Setting ownership of db/ to nonroot (UID 999)..."
  sudo chown -R 999:999 "${PROJECT_ROOT}/db"
fi

# Stop and remove any existing container with the same name
if [ "$(docker ps -aq -f name=^${CONTAINER_NAME}$)" ]; then
  echo "Stopping existing container: ${CONTAINER_NAME}..."
  docker rm -f "${CONTAINER_NAME}"
fi

echo "Starting container: ${CONTAINER_NAME}..."

docker run \
  --detach \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  --env-file .env \
  --publish 8000:8000 \
  --volume "${PROJECT_ROOT}/db:/db" \
  --volume "${PROJECT_ROOT}/static:/static" \
  "${IMAGE_NAME}:${IMAGE_TAG}"

echo "Container is running: ${CONTAINER_NAME}"
echo "Logs: docker logs -f ${CONTAINER_NAME}"
echo "Stop: docker rm -f ${CONTAINER_NAME}"