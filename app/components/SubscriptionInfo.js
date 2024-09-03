"use client";

import React, { useState, useEffect } from 'react';
import {EditSubscriptionModal, openEditSubscriptionModal} from './modals/EditSubscriptionModal';

export function SubscriptionInfo() {
    const [nextPayment, setNextPayment] = useState(null);
    const [scheduledToCancel, setScheduledToCancel] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        function fetchSubscriptionInfo() {
            setLoading(true)
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
                setNextPayment(data.nextPayment); // Corrected property name to 'nextPayment'
                setScheduledToCancel(data.scheduledToCancel)
                setLoading(false)
                
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
            { formattedDate ? (scheduledToCancel ?  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>) : "" }
           
        {formattedDate ? <EditSubscriptionModal cancel={scheduledToCancel} date={formattedDate} />  : ""}   
                
                <span>{
                        formattedDate ? (
                        scheduledToCancel ? 
                            `Platné do : ${formattedDate}` : 
                            `Příští fakturace: ${formattedDate}`
                        ) : (
                            <span className="loading loading-spinner loading-sm"></span>
                        )
                    }</span>
            </div>
                
            <div className="flex items-center space-x-2 mt-2">
                { formattedDate ?(scheduledToCancel ?  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                </svg>
                

                :

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              
                ) : ""}
                <button
                        onClick={openEditSubscriptionModal}
                        onTouchStart={openEditSubscriptionModal}
                        className={`underline ${scheduledToCancel ? 'text-green-500' : 'text-gray-400'}`}
                        >
                        {formattedDate ? (scheduledToCancel ? 'Obnovit předplatné' : 'Zrušit předplatné') : ""}

                 </button>
            </div>
        </>
    );
}