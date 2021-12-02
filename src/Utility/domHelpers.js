export const isInViewport = (el) => {
  if (!el) {
    return false;
  }

  let rect = el.getBoundingClientRect();

  if (!rect) {
    return false;
  }

  let top = rect.top >= 0;
  let left = rect.left >= 0;
  let bottom =
    rect.bottom <=
    (window.innerHeight || document.documentElement.clientHeight);
  let right =
    rect.right <= (window.innerWidth || document.documentElement.clientWidth);

  return top && left && bottom && right;
};

export const elementIsReady = (step) => {
  let qs = step.element;
  let el = document.querySelector(qs);
  let isReady = isInViewport(el);
  return isReady;
};
