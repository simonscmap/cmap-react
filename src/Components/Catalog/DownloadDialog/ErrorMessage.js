import React from 'react';

const ErrorMessage = ({ description }) => {
  let message;
  if (typeof description === 'string') {
    message = description;
  } else if (typeof description === 'object' && description.message) {
    message = description.message;
  } else {
    message = 'Sorry! There was an unexpected error.';
  }
  return (
    <div>
      <p>There was an error parsing dataset parameters.</p>
      <pre>{message}</pre>
    </div>
  );
};

export default ErrorMessage;
