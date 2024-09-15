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
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    // Trigger form validation and wallet collection
    const {error: submitError} = await elements.submit();
    if (submitError) {
      handleError(submitError);
      return;
    }
    let agreed = document.getElementById("agreeBusinessConditions").value
    // Create the subscription
    const res = await fetch('/api/create-subscription', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json' // Add the Content-Type header
        },
        body: JSON.stringify({ priceId,agreed }) // Send as an object
      });
    const {type, clientSecret} = await res.json();
    const confirmIntent = type === "setup" ? stripe.confirmSetup : stripe.confirmPayment;

    // Confirm the Intent using the details collected by the Payment Element
    const successAccountType = name; // Store the account type name
const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/typeOfAccount?success=${encodeURIComponent(successAccountType)}`; // Construct the URL and encode the parameter

const { error } = await confirmIntent({
  elements,
  clientSecret,
  confirmParams: {
    return_url: returnUrl, // Use the constructed URL
  },
});

    if (error) {

      handleError(error);
    } else {
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
      {errorMessage}
      <PaymentElement />
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