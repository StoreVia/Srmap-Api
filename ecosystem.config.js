module.exports = {
  apps: [
    {
      name: "srmapi",
      cwd: __dirname,
      script: "npm",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 6767,
      },
    },
  ],
};