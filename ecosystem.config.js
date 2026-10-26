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
      name: "omegle",
      cwd: `${__dirname}/omegle`,
      script: "index.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};