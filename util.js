const stringify = require("fast-json-stable-stringify");

const parsePath = (path) => {
  if (!path) {
    return [];
  }

  return path.split('/').filter((node) => {
    return !!node;
  })
}

const formatPath = (parsedPath) => {
  if (!Array.isArray(parsedPath) || parsedPath.length === 0) {
    return '/';
  }
  let formatted = '';
  for (const label of parsedPath) {
    formatted += '/' + stringify(label);
  }
  return (formatted.startsWith('/') ? '' : '/') + formatted;
}

module.exports = {
  parsePath,
  formatPath,
}