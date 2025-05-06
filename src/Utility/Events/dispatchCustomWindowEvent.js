const dispatchCustomWindowEvent = (name, payload) => {
  if (!window) {
    console.error('no window object in scope');
    return;
  }
  if (typeof name !== 'string') {
    console.error('event name is not a string');
    return;
  }
  window.dispatchEvent(
    new CustomEvent(name, {
      detail: payload,
      bubbles: true,
      cancelable: false,
    }),
  );
};

export default dispatchCustomWindowEvent;
