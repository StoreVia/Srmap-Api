const withSerwistInit = require("@serwist/next").default;

const isDev = process.env.NODE_ENV === "development";

const config = {
  reactStrictMode: !isDev,
  trailingSlash: false,
  allowedDevOrigins: ['100.112.217.28'],
  devIndicators: false,
  images: {
    unoptimized: isDev,
  },
  typescript: {
    ignoreBuildErrors: isDev,
  },
  serverExternalPackages: ["sharp", "tfjs-tflite-node", "@tensorflow/tfjs"],
};

if (isDev) {
  module.exports = config;
} else {
  const withSerwist = withSerwistInit({
    swSrc: "src/app/sw.ts",
    swDest: "public/sw.js",
    exclude: [
      /.*/,
    ],
  });

  module.exports = withSerwist(config);
}