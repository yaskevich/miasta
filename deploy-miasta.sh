pm2 delete miasta
rm -rf miasta
mkdir -p miasta
cd miasta
degit https://github.com/yaskevich/miasta#main
# rm -rf miasta.pl
rm -rf datasets
npm install
# pm2-runtime ecosystem.config.js
pm2 start ecosystem.config.cjs
pm2 save