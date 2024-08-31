"use client";
import React from 'react'
import { useState , useEffect } from 'react'

import {
    useStripe,
    useElements,
    PaymentElement,
} from "@stripe/react-stripe-js"




const CheckOut = (amount) => {
    const stripe = useStripe()
    const elements = useElements()
    const [errorMessage,setErrorMessage] = useState(false)
    const [clientSecret,setClientSecret] = useState("")
    const [loading,setLoading] = useState(false)
    useEffect(() => {
        fetch("/api/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( amount ), 
        })
        .then((res) => res.json())
        .then((data) => {
            setClientSecret(data.clientSecret);
            
        })
        .catch((error) => console.error('Error:', error));
    }, [amount]);
    





  return (
  <div>

    <form >
    {errorMessage && <div>{errorMessage} </div>}
    {clientSecret && <PaymentElement />}
    
    <button>Pay</button>
    </form>
  
  </div>
  )
}

export default CheckOut