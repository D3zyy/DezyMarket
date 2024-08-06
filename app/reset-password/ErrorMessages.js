import React from 'react';

const ErrorMessages = ({ errors }) => (
  <div>
    {Object.keys(errors).map((key, index) => (
      <div key={index}>
        <h3>{key}</h3>
        <ul>
          {errors[key].map((error, subIndex) => (
            <li key={subIndex}>{error}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

export default ErrorMessages;