import React from 'react';
import { getSession } from '../authentication/actions';
import SendButton from './SendButton';

async function Page() {
  let session = await getSession();



  return (
    <div className='flex justify-center items-center min-h-screen  p-6'>
      <div className='  rounded-2xl p-8 w-full max-w-2xl'>
      <div className='flex justify-center items-center mb-6'>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-16 h-16"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
    />
  </svg>
</div>
        
        
         <SendButton sessionEmail={session?.email} />
 
      </div>
    </div>
  );
}

export default Page;
