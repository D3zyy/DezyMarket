"use client";
import React, { useState, useEffect } from 'react';

async function deactivateSubscription(name) {
    try {
        const response = await fetch('/api/upgradeSubscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export function openUpgradeModalSubscriptionModal() {
    const modal = document.getElementById("upgradeModalSubscriptionModal");
    if (modal) {
        modal.showModal();
    }
}

export function UpgradeModalSubscription({ nameToUpgrade, date }) {
    const [nextPayment, setNextPayment] = useState(null);
    const [scheduledToCancel, setScheduledToCancel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        function fetchSubscriptionInfo() {
            setLoading(true);
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
                    setScheduledToCancel(data.scheduledToCancel);
                    setName(data.name);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Chyba získávaní informací o předplatném:', error);
                });
        }

        fetchSubscriptionInfo();
    }, []);

    const formattedDate = nextPayment ? nextPayment : null;

    const handleToggle = () => {
        setIsChecked(!isChecked);
    };

    return (
        <div>
            <dialog id={`upgradeModalSubscriptionModal`} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    {/* Text center and bold */}
                    <span className="block text-center font-bold mb-4 text-lg ">
                        Upgradovat předplatné na {nameToUpgrade}
                    </span>

                    {/* Container for the checkbox with text left and right */}
                    <div className="flex justify-center items-center space-x-4 mb-6">
                        {/* Text nalevo */}
                        <span
                            className={`transition-all duration-300 ease-in-out ${isChecked ? 'text-gray-500' : 'font-bold text-black'}`}
                        >
                            Ihned chci {nameToUpgrade}
                        </span>

                        {/* Checkbox pro přepínání */}
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            id="upgrade-toggle"
                            checked={isChecked}
                            onChange={handleToggle}
                        />

                        {/* Text napravo */}
                        <span
                            className={`transition-all duration-300 ease-in-out ${isChecked ? 'font-bold text-black' : 'text-gray-500'}`}
                        >
                            Na konci zůčtování se přepnu na {nameToUpgrade}
                        </span>
                    </div>

                    <ul className="list-disc list-inside text-left">
                        <li className="flex items-center mb-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-6 text-primary mr-2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                                />
                            </svg>
                            Předplatného se od {formattedDate} obnoví za xxx
                        </li>
                        <li className="flex items-center mb-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-6 text-primary mr-2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                                />
                            </svg>
                            Předplatné se již nebude znovu obnovovat
                        </li>
                    </ul>
                    <button
                        type="button"
                        className="btn"
                        onClick={() => {
                            document.getElementById("upgradeModalSubscriptionModal").close();
                        }}
                        onTouchStart={() => {
                            document.getElementById("upgradeModalSubscriptionModal").close();
                        }}
                    >
                        Zavřít
                    </button>
                </div>

                
            </dialog>
        </div>
    );
}