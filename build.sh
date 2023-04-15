. /etc/profile
set -e

nvm use 16

yarn

node -v
node --max_old_space_size=4096 ./node_modules/vuepress/cli.js build docs