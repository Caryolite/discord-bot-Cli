# 使用官方 Node.js 映像作為基礎映像，這裡選擇的是 LTS 版本
FROM node:18-alpine

# 設定工作目錄
WORKDIR /usr/src/app

# 複製本地的 Discord bot 代碼到容器內部
COPY E:/discord-bot /usr/src/app

# 安裝應用程式的依賴
RUN npm install

# 曝露所需的端口（如果有）
# EXPOSE 3000 (如果你的 bot 或應用程式有前端界面)

# 啟動 Discord bot
CMD ["node", "index.js"]


# 窩不知道qwq