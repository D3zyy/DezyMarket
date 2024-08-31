"use client";
import React from 'react'
import { useState , useEffect } from 'react'

import {
    useStripe,
    useElements,
    PaymentElement,
} from "@stripe/react-stripe-js"




const CheckOuPage = (amount) => {

    const stripe = useStripe()
    const elements = useElements()
 
    const [clientSecret,setClientSecret] = useState("")
    const [loading,setLoading] = useState(false)

    useEffect(() => {
        fetch("/api/create-payment-intent",{
            method : "POST",
            headers:{
                "Content-Type" : "application/json",
            },
            body : JSON.stringify({ amount : amount})
        })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
    }, [amount])






  return (
  <div>
    tady2
    <form action="">
    {clientSecret && <PaymentElement />}
    <button>Pay</button>
    </form>
  
  </div>
  )
}

export default CheckOuPage