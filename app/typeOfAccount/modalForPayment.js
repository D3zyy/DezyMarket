"use client";
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckOut from '../components/CheckOut';
import { useState,useEffect } from 'react';
import CheckoutForm from '../components/CheckOutForm';

// Function to open the modal
export function openPaymentModal(price) {
    const modal = document.getElementById(`payment_modal_${price}`);
    if (modal) {
        modal.showModal();
    }
}

// PaymentModal Component
export function PaymentModal({ price,name ,priceId}) {
    const publicKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
    const stripePromise = loadStripe(publicKey);
 

    return (
        <div>
            <dialog id={`payment_modal_${price}`} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    {name}
                    {price >= 15 ?( 
                    
                    <Elements 
                    stripe={stripePromise}
                    options={{
                        mode: "subscription",
                        amount: price *100,
                        currency: "czk"
                    }}
                >
                    <CheckoutForm priceId={priceId} />
                    
                </Elements>
                
                    ) : (
                        <p>Minimální částka pro platbu je 15 Kč.</p>
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
        </div>
    );
}