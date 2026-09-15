module.exports = {
  apps: [
    {
      name: "srmapi",
      cwd: __dirname,
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "arcade",
      cwd: `${__dirname}/arcade-server`,
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
        PORT: 8081,
      },
    },
  ],
};