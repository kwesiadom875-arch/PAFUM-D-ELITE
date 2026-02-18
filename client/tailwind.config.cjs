// Keep this file as a thin CommonJS wrapper so Tailwind
// always reads a single canonical configuration.
// Vite/Tailwind will typically use `tailwind.config.js`,
// but if this CJS file is ever picked up it should mirror
// the same config to avoid palette drift.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('./tailwind.config.js');

module.exports = baseConfig.default || baseConfig;
