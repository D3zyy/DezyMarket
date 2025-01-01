import React, {useState} from 'react';
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
export default function CheckoutForm({priceId,nameOfSub}) {
  const stripe = useStripe();
  const router = useRouter()
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState();
  const [loading, setLoading] = useState(false);

  const handleError = (error) => {
    setLoading(false);
    setErrorMessage(error.message);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!stripe) {
      return;
    }
  
    setLoading(true);
  
    try {
      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
      
        return;
      }
  
      let agreed = document.getElementById("agreeBusinessConditions").checked; // Use .checked for checkbox
      // Create the subscription

      const res = await fetch('/api/create-subscription', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priceId, agreed ,nameOfSub})
      });
      
      if (!res.ok) {
        setErrorMessage('Nastala chyba při platbě. Zkuste to znovu');
      }
  
      const { type, clientSecret } = await res.json();
      const confirmIntent = type === "setup" ? stripe.confirmSetup : stripe.confirmPayment;
  
      const successAccountType = nameOfSub;
      let returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/typeOfAccount?success=${encodeURIComponent(successAccountType)}`;
      
      console.log(returnUrl);
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  
      const { error } = await confirmIntent({
        elements,
        clientSecret,
        redirect: "if_required",
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              address: {    
                country: "CZ",  // Manually provide the country here
              },
            },
          },
        },
        
      });
     
      
  
      if (error) {
        router.push("/typeOfAccount?redirect_status=failed");
        router.refresh(); 
        setErrorMessage('Nastala chyba při platbě. Zkuste to znovu');
      } else {
       
        await delay(5000)
        router.push("/typeOfAccount?redirect_status=succeeded");
        router.refresh();
       
      }
    } catch (error) {
      setErrorMessage('Nastala chyba při platbě. Zkuste to znovu');
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };
  if(!stripe || !elements)
    {
        return <div style={{textAlign: "center"}}>  <div
        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
        role="status" >
      </div></div>
    }
  return (
    <form onSubmit={handleSubmit}>
       <div className="flex items-start gap-3 py-3  text-red-600   font-medium mt-4 transition-transform transform hover:scale-105">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-500 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
</svg>

    <span>{errorMessage}</span>
  </div>
  
     <PaymentElement
  options={{
    fields: {
      billingDetails: {
        address: {
          country: 'never',
        },
       
      },
    },
  }}
/>
      <div style={{ display: "flex", alignItems: "center" , marginTop: "10px"}}>
  <span>
    Souhlasím s 
    <Link
      style={{ textDecoration: "underline",marginLeft: "4px", marginRight: "15px" }}
      href={"/BusinessConditions"}
      target='_blank'
    >
      obchodními podmínky
    </Link>
  </span>
  <input
  required
    type="checkbox"
    className="checkbox"
    name="agreeBusinessConditions"
    id="agreeBusinessConditions"
  />
</div>
      <button 
             disabled={!stripe || loading}
             className='w-full btn bg-[#8300ff] text-white hover:bg-[#8300ff] focus:outline-none focus:ring-2 focus:ring-[#8300ff] focus:ring-opacity-50 cursor-pointer' style={{ display: "block", margin: "20px auto" }}>
                {!loading ? "Zaplatit" : <span className="loading loading-spinner loading-sm"></span>} 
                </button>

    </form>
  );
}