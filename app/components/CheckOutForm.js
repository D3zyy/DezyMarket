import React, {useState} from 'react';
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';
import Link from 'next/link';
export default function CheckoutForm({priceId,nameOfSub}) {
  const stripe = useStripe();
  console.log("Jmeno predplatneho:",nameOfSub)
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
        handleError(submitError);
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
        throw new Error('Nastala chyba při vytváření předplatného'); // Handle server error
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
        if (returnUrl.includes('?')) {
          returnUrl += '&redirect_status=failed';
        } else {
          returnUrl += '?redirect_status=failed';
        }
        window.location.href = returnUrl
        handleError(error);
      } else {
        if (returnUrl.includes('?')) {
          returnUrl += '&redirect_status=succeeded';
        } else {
          returnUrl += '?redirect_status=succeeded';
        }
        await delay(5000)
       window.location.href = returnUrl
      }
    } catch (error) {
      handleError(error);
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