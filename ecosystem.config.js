module.exports = {
  apps: [
    {
      name: 'luxurio-backend',
      script: 'src/server.js',
      cwd: '/var/www/luxurio/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
    },
  ],
};
