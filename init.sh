# コンテナ作成
docker compose up -d --build

# コンテナnpmインストール&再起動
docker compose run app npm install
docker compose up -d app
docker compose run test npm install
docker compose up -d test
