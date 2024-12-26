"use client";
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import CheckoutForm from '../components/CheckOutForm';

// Function to open the modal
export function openPaymentModal(price) {
    const modal = document.getElementById(`payment_modal_${price}`);
    if (modal) {
        modal.showModal();
    }
}

// PaymentModal Component

export function PaymentModal({ price, name, priceId }) {
    const options = {
        appearance: {
          theme: 'flat',
        },
        mode: 'subscription',
        amount: 8800,
        currency: 'czk',
    
        
      };
    const publicKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
    const stripePromise = loadStripe(publicKey);
   
    return (
    
            <dialog id={`payment_modal_${price}`} className="modal  modal-bottom sm:modal-middle" style={{ zIndex: 2 }}>
                <div className="modal-box ">

                    {/* Text center and bold */}
                    <span className="block text-center font-bold mb-4">{name}</span>     
                    {price >= 15 ? (
                     <Elements stripe={stripePromise} options={options}>

   


    <CheckoutForm priceId={priceId} name={name} />
</Elements>

                    ) : (
                        <p className="text-center">Minimální částka pro platbu je 15 Kč.</p>
                    )}
                </div>
                <button 
                    type="button" 
                    className="btn" 
                    onClick={() => {
                        document.getElementById(`payment_modal_${price}`).close();                
                    }}
                    onTouchStart={() => {
                        document.getElementById(`payment_modal_${price}`).close(); 
                    }}
                >
                    Zavřít
                </button>
            </dialog>
    
    );
}