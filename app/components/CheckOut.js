"use client";
import React from 'react'
import { useState , useEffect } from 'react'

import {
    elements,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js"




const CheckOut = (amount) => {
    const elements = elements.create('payment', {
        fields: {
            billingDetails: {
                address: {
                    country: 'never'
                }
            }
        },
      });
    const stripe = useStripe()

    const [errorMessage,setErrorMessage] = useState(false)
    const [clientSecret,setClientSecret] = useState("")
    const [loading,setLoading] = useState(false)
    const [successPaymenet,setSuccessPaymenet] = useState(false)
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




const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    if(!stripe || !elements){
        return;
    }
    const {error} = await elements.submit()
    if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return;
    }

    const { errorPayment } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams:{
            return_url: 'http://localhost:3000/addPost',
           
        }
    })
    if (!errorPayment) {
        setSuccessPayment(true);
    } else {
        setErrorMessage(errorPayment)
        console.error(error);
    }
    setLoading(false)

}
if(!clientSecret || !stripe || !elements)
{
    return <div style={{textAlign: "center"}}>  <div
    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
    role="status" >
  </div></div>
}

  return (
  <div>

        <form onSubmit={handleSubmit}>
        
            {clientSecret && <PaymentElement />}
        
            <button 
             disabled={!stripe || loading}
             className='w-full btn bg-[#8300ff] text-white hover:bg-[#8300ff] focus:outline-none focus:ring-2 focus:ring-[#8300ff] focus:ring-opacity-50 cursor-pointer' style={{ display: "block", margin: "20px auto" }}>
                {!loading ? "Zaplatit" : "Načítání.."} 
                </button>

        </form>
  
  </div>
  )
}

export default CheckOut