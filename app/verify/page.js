import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

async function fetchVerification(email, token) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${token}&email=${email}`
    );

    // Check if the response is OK
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    // Parse and return JSON response
    return await res.json();
  } catch (error) {
    console.error('Error fetching verification:', error);
    // Return a default result in case of error
    return { message: '', success: false };
  }
}

const Page = async ({ searchParams }) => {
  const { token, email } = searchParams;

  // Check if token and email are provided
  if (!token || !email) {
    return <>
     <div className="flex items-center space-x-2 p-4">
    <XCircleIcon className="h-6 w-6 text-red-500" />
    <span>{'Žádný parametry nebyli načteny'}</span>
    </div>
  </>
  }

  const result = await fetchVerification(email, token);

  // Use default values if result properties are missing
  const message = result?.message || '';
  const isSuccess = result?.success || false;

  return (
    <div className="flex items-center space-x-2 p-4">
      {isSuccess ? (
        // Render the success icon and message
        <>
          <CheckCircleIcon className="h-6 w-6 text-green-500" />
          <span>{message}</span>
        </>
      ) : (
        // Render the error icon and message
        <>
          <XCircleIcon className="h-6 w-6 text-red-500" />
          <span>{message || 'An error occurred or verification is not valid.'}</span>
        </>
      )}
    </div>
  );
};

export default Page;