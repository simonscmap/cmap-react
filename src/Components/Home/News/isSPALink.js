// look at a link's protocol to determine whether it is an internal link
// or an external link
// this will determine whether to use a Link component or an `a` tag
const isSPALink = (link) => {
  if (typeof link !== 'string') {
    return false;
  } else if (link.slice(0, 4) === 'http') {
    return false;
  } else if (link.slice(0, 1) === '/') {
    return true;
  } else {
    // console.log('unknown link type', link, link.slice(0,3), link.slice(0,1));
    return false;
  }
};

export default isSPALink;
