"use client";

import React, { useState, useEffect } from 'react';

export function SubscriptionInfo() {
    const [nextPayment, setNextPayment] = useState(null);
    const [scheduledToCancel, setScheduledToCancel] = useState(false);

    useEffect(() => {
        function fetchSubscriptionInfo() {
            fetch('/api/subInfo', {
                method: 'POST',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Chyba získávaní informací o předplatném');
                }
                return response.json();
            })
            .then(data => {
                console.log("data ze serveru:", data);
                setNextPayment(data.nextPayment); // Corrected property name to 'nextPayment'
                setScheduledToCancel(data.scheduledToCancel)
                console.log(data.scheduledToCancel)
            })
            .catch(error => {
                console.error('Chyba získávaní informací o předplatném:', error);
            });
        }

        fetchSubscriptionInfo();
    }, []);
    const formattedDate = nextPayment
    ? nextPayment
    : null;
    return (
        <>
            <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>{
        formattedDate ? (
          scheduledToCancel ? 
            `Platné do : ${formattedDate}` : 
            `Příští fakturace: ${formattedDate}`
        ) : (
          'Načítám...'
        )
      }</span>
            </div>

            <div className="flex items-center space-x-2 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <button className="text-red-500 underline">Zrušit předplatné</button>
            </div>
        </>
    );
}