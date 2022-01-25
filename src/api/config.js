export const apiUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : window.location.origin;

export const fetchOptions = {
  credentials: 'include',
};

export const postOptions = {
  ...fetchOptions,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
};
