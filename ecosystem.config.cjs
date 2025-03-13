module.exports = {
  apps: [{
    name: 'remotecord-bot',
    script: './dist/index.js',
    watch: false,
    max_memory_restart: '1G',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    env: {
      NODE_ENV: 'production'
    }
  }]
}
