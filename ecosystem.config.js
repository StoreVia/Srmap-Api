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
      name: "captcha",
      cwd: `${__dirname}/python`,
      script: "api.py",
      interpreter: `${__dirname}/python/venv/bin/python3`,
      env: {
        PYTHONUNBUFFERED: "1",
      },
    },
  ],
};