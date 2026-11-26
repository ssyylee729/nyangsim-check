const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 웹에서 expo-sqlite(wa-sqlite)가 쓰는 wasm 파일을 에셋으로 번들한다.
config.resolver.assetExts.push('wasm');

// SharedArrayBuffer 를 쓰려면 cross-origin isolation 헤더가 필요하다 (웹 개발 서버용).
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  middleware(req, res, next);
};

module.exports = config;
