const isDev =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.port === '3000' ||
  window.location.port === '5000';

let debugInitialized = false;

export function devLog(...args) {
  if (isDev) {
    console.log(...args);
  }
}

export function devWarn(...args) {
  if (isDev) {
    console.warn(...args);
  }
}

export function devError(...args) {
  if (isDev) {
    console.error(...args);
  }
}

export function setupDebugging() {
  if (debugInitialized) return;
  debugInitialized = true;

  if (!isDev) {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  } else {
  }
}
