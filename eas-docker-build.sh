#!/bin/bash

# ตรวจสอบว่ามีการกำหนด profile หรือไม่
if [ -z "$1" ]; then
  echo "Usage: ./eas-docker-build.sh <profile> [platform]"
  echo "Example: ./eas-docker-build.sh preview android"
  echo "Available profiles: development, preview, production"
  exit 1
fi

PROFILE=$1
PLATFORM=${2:-android}  # ถ้าไม่ระบุ platform จะใช้ android เป็นค่าเริ่มต้น

# สร้างอิมเมจ Docker
echo "Building Docker image..."
docker build -t eas-builder .

# รัน Docker container
echo "Running EAS build in container..."
docker run -it --rm \
  -v "$(pwd):/app" \
  -v "$HOME/.eas-cli:/root/.eas-cli" \
  -v "$HOME/.expo:/root/.expo" \
  -e EXPO_TOKEN="$EXPO_TOKEN" \
  eas-builder bash -c "eas build --profile $PROFILE --platform $PLATFORM --local"

# แสดงที่อยู่ของไฟล์ APK ที่สร้าง
if [ "$PLATFORM" = "android" ]; then
  echo "Build completed. Check ./android/app/build/outputs/apk/ for APK files."
else
  echo "Build completed. iOS builds will be available through EAS."
fi 