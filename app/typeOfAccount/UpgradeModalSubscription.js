"use client";
import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

async function upgradeSubscription(name) {
    try {
        const response = await fetch('/api/upgradeSubscripiton', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name }),
        });

        if (!response.ok) {
            throw new Error(`Chyba HTTP! Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Chyba:', error);
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
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [priceToUpgrade, setPriceToUpgrade] = useState(false);
    const [priceOfDesiredSub, setPriceOfDesiredSub] = useState(0);

    useEffect(() => {
        function fetchSubscriptionInfo() {
            setLoading(true);
            fetch('/api/subInfo/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nameToUpgrade: nameToUpgrade }) // Ujistěte se, že posíláte platná data
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Chyba při získávání informací o předplatném');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    setNextPayment(data.nextPayment);
                    setScheduledToCancel(data.scheduledToCancel);
                    setName(data.name);
                    setPriceToUpgrade(data.priceToUpgrade);
                    setPriceOfDesiredSub(data.priceOfDesiredSub);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Chyba při získávání informací o předplatném:', error);
                });
        }

        fetchSubscriptionInfo();
    }, [nameToUpgrade]);

    const formattedDate = nextPayment ? nextPayment : null;

    const handleToggle = () => {
        setIsChecked(!isChecked);
    };

    return (
        <div>
            <dialog id="upgradeModalSubscriptionModal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box flex flex-col justify-center items-center p-4">
                    {loading ? <span className="loading loading-spinner loading-lg"></span> : 
                        <>
                            <span className="block text-center font-bold mb-4 text-lg">
                                Upgradovat předplatné na {nameToUpgrade}
                            </span>

                            <div className="flex justify-center items-center space-x-4 mb-6 p-6">
                                <span
                                    className={`transition-all duration-300 ease-in-out ${!isChecked ? 'underline font-bold' : 'text-black'}`}
                                >
                                    Ihned přejít na {nameToUpgrade}
                                </span>

                                <label className="swap swap-rotate">
                                    <input
                                        type="checkbox"
                                        className="toggle peer text-primary bg-primary checked:bg-primary checked:text-primary"
                                        checked={isChecked}
                                        onChange={handleToggle}
                                    />
                                </label>

                                <span
                                    className={`transition-all duration-300 ease-in-out ${isChecked ? 'underline font-bold' : 'text-black'}`}
                                >
                                    {formattedDate} přejdu na {nameToUpgrade}
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
                                    {!isChecked ? `Nyní doplatím ${priceToUpgrade} Kč a ihned přejdu na ${nameToUpgrade}` : `Od ${formattedDate} přejdu na ${nameToUpgrade}`}
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
                                    {!isChecked ? `${formattedDate} se mi předplatné znovu obnoví za ${priceOfDesiredSub} Kč` : `Předplatné se od ${formattedDate} obnoví za ${priceOfDesiredSub} Kč`}
                                </li>
                                {!isChecked ? (
    <li className="flex items-center mb-5 mt-5 text-gray-400 text-opacity-75 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
        Kliknutím na ‘Upgradovat’ souhlasíte se stržením částky z vaší karty a s obchodními podmínkami.
    </li>
) : (
    <li className="flex items-center mb-5 mt-5 text-gray-400 text-opacity-75 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 mr-2 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
        Kliknutím na ‘Upgradovat’ souhlasíte se změnou předplatného na výše uvedené od {formattedDate}.
    </li>
)}
                            </ul>

                            <div className="flex mt-4 justify-center">
                                <button
                                    type="button"
                                    className="btn bg-primary mr-2 hover:bg-primary"
                                    onClick={() => upgradeSubscription(nameToUpgrade)}
                                    onTouchStart={() => upgradeSubscription(nameToUpgrade)}
                                >
                                    Upgradovat
                                </button>
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
                        </>
                    }
                </div>
            </dialog>
        </div>
    );
}