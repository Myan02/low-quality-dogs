#!/bin/bash
set -euo pipefail

IMAGE_NAME="low-quality-dogs"
IMAGE_TAG="latest"

echo "Building docker image: ${IMAGE_NAME}:${IMAGE_TAG}..."

DOCKER_BUILDKIT=1 docker build --tag "${IMAGE_NAME}:${IMAGE_TAG}" .

echo "Build complete: ${IMAGE_NAME}:${IMAGE_TAG}"