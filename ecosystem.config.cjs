/** PM2 process config — run from project root: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'vastralayam',
      cwd: './backend',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
