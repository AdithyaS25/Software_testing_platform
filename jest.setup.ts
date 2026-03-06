import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for react-router in jsdom
const { TextEncoder, TextDecoder } = require('util');
(globalThis.TextEncoder = TextEncoder); 
(globalThis.TextDecoder = TextDecoder);