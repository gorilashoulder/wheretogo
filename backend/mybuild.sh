# react project build
cd ../../teamProject501/frontend
npm run build

# index.html, main.js 복사(이동) : dist -> static
cd ../../teamProject501/backend
rm -rf src/main/resources/static
mv ../../teamProject501/frontend/dist src/main/resources/static
mkdir src/main/resources/static/src
mkdir src/main/resources/static/src/assets
cp -r ../frontend/src/assets/* src/main/resources/static/src/assets/

# spring project build
./gradlew bootJar

# build image
docker buildx build --platform=linux/amd64 -t simsunghwan/wheretogo .

# push image
docker push simsunghwan/wheretogo

# remote 에서

# 컨테이너 멈추고
ssh -i src/main/resources/secret/key0527.pem ubuntu@15.164.103.59 'docker stop wheretogo'
# 컨테이너 삭제
ssh -i src/main/resources/secret/key0527.pem ubuntu@15.164.103.59 'docker rm wheretogo'
# pull image
ssh -i src/main/resources/secret/key0527.pem ubuntu@15.164.103.59 'docker pull simsunghwan/wheretogo'
# 컨테이너 실행
ssh -i src/main/resources/secret/key0527.pem ubuntu@15.164.103.59 'docker run -d -p 8080:8080 --restart always --name wheretogo simsunghwan/wheretogo'
# 불필요한 이미지 삭제
ssh -i src/main/resources/secret/key0527.pem ubuntu@15.164.103.59 'docker image prune -f'