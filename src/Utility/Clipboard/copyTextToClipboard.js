const copyTextToClipboard = (text) => {
  if (typeof text !== 'string') {
    console.error('expected arg type of string to copy to clipboard');
    return;
  }
  let textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  console.log('copying text to clipboard');
  document.execCommand('Copy');
  textArea.remove();
};

export default copyTextToClipboard;
