# ベースイメージ
FROM node:20

# 作業ディレクトリを作成
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションコードをコピー
COPY . .

# 環境変数ファイルをコピー
# 環境に応じて .env ファイルを指定（デフォルトは .env.development）
ARG ENV_FILE=.env.development
COPY ${ENV_FILE} /app/.env.local

# 必要に応じてテストツールのインストール
RUN npm install --save-dev jest cypress

# アプリケーションをビルド
RUN npm run build

# ポート8080を公開
EXPOSE 8080

# コンテナを起動するコマンド
CMD ["npm", "start"]
