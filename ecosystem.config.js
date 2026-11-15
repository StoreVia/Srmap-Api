module.exports = {
  apps: [
    {
      name: "srmapi",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 6767",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_restarts: 10,
    },
  ],
};