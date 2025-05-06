export const apiUrl =
  process.env.NODE_ENV === 'development'
    ? `${window.location.protocol}//${window.location.hostname}:8080` // 'http://localhost:8080'
    : window.location.origin;

export const fetchOptions = {
  credentials: 'include',
};

export const postOptions = {
  ...fetchOptions,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
};

export const deleteOptions = {
  ...fetchOptions,
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
};
