import React, {useState} from 'react';
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';
import Link from 'next/link';
export default function CheckoutForm(priceId,name) {
  const stripe = useStripe();

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
        body: JSON.stringify({ priceId, agreed })
      });
      
      if (!res.ok) {
        throw new Error('Nastala chyba při vytváření předplatného'); // Handle server error
      }
  
      const { type, clientSecret } = await res.json();
      const confirmIntent = type === "setup" ? stripe.confirmSetup : stripe.confirmPayment;
  
      const successAccountType = name;
      const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/typeOfAccount?success=${encodeURIComponent(successAccountType)}`;
  
      const { error } = await confirmIntent({
        elements,
        clientSecret,
        confirmParams: {
          return_url: returnUrl,
        },
      });
  
      if (error) {
        handleError(error);
      } else {
        // Handle successful payment here (e.g., redirect, show success message)
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