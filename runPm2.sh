git pull origin main
pm2 delete ecosystem.config.cjs
pm2 start ecosystem.config.cjs
