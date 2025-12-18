const MAX_BREADCRUMBS = 50;
let breadcrumbs = [];

function addBreadcrumb(breadcrumb) {
  breadcrumbs.push({
    category: breadcrumb.category,
    message: breadcrumb.message,
    data: breadcrumb.data,
    localTimestamp: new Date().toISOString(),
  });

  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
}

function getBreadcrumbs() {
  return breadcrumbs.slice();
}

function clearBreadcrumbs() {
  breadcrumbs = [];
}

export { addBreadcrumb, getBreadcrumbs, clearBreadcrumbs };
