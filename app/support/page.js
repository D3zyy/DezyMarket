import React from 'react';
import { getSession } from '../authentication/actions';
import SendButton from './SendButton';
import { headers } from 'next/headers';
import { checkRateLimit } from '../RateLimiter/rateLimit';
async function Page() {
  const ipToRedis =
  headers().get("x-forwarded-for")?.split(",")[0] || 
  headers().get("x-real-ip") ||                     
  null;

const ipCheck = ipToRedis?.startsWith("::ffff:") ? ipToRedis.replace("::ffff:", "") : ipToRedis;
const rateLimitStatus = await checkRateLimit(ipCheck);

if (!rateLimitStatus.allowed) {
return (
<div className="p-4 text-center">
  <h1 className="text-xl font-bold mt-2">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-red-500 mb-2">
<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
</svg>

   Příliš mnoho požadavků. Zkuste to zachvíli
    <br />
  
  </h1>
</div>
)
}
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
