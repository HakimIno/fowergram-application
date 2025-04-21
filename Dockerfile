FROM ubuntu:22.04

# ตั้งค่าสภาพแวดล้อม non-interactive
ENV DEBIAN_FRONTEND=noninteractive

# ติดตั้งซอฟต์แวร์ที่จำเป็น
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    python3 \
    python3-pip \
    openjdk-17-jdk \
    build-essential \
    libssl-dev \
    gnupg

# ติดตั้ง Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# ติดตั้ง Yarn
RUN npm install -g yarn

# ติดตั้ง EAS CLI
RUN npm install -g eas-cli

# ติดตั้ง Android SDK
RUN mkdir -p /opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
RUN cd /opt/android-sdk && \
    curl -o commandlinetools.zip https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip commandlinetools.zip && \
    rm commandlinetools.zip && \
    mkdir -p cmdline-tools/latest && \
    mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

ENV PATH=${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools

# ยอมรับใบอนุญาตและติดตั้ง Android SDK components
RUN yes | sdkmanager --licenses
RUN sdkmanager "platforms;android-33" "platform-tools" "build-tools;33.0.0"

# สร้างไดเรกทอรีสำหรับโปรเจกต์
WORKDIR /app

# คัดลอกไฟล์สำหรับการติดตั้ง dependencies
COPY package.json yarn.lock ./

# ติดตั้ง dependencies
RUN yarn install

# คัดลอกไฟล์โปรเจกต์ทั้งหมด
COPY . .

# กำหนดคำสั่งที่จะรันเมื่อคอนเทนเนอร์เริ่มทำงาน
CMD ["bash"] 