'use strict';

/**
 * Railway/Docker entry: honor process.env.PORT and bind 0.0.0.0.
 * Never overwrite a PORT the host already injected (common 502 cause).
 */
const injected = process.env.PORT;
if (injected == null || String(injected).trim() === '') {
  process.env.PORT = '3000';
} else {
  process.env.PORT = String(injected).trim();
}
process.env.HOSTNAME =
  process.env.HOSTNAME && String(process.env.HOSTNAME).trim()
    ? String(process.env.HOSTNAME).trim()
    : '0.0.0.0';

console.log(`[war] listen ${process.env.HOSTNAME}:${process.env.PORT}`);
require('./server.js');
