"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

async function upgradeSubscription(name, insta, setloadingPayment, setErrorFromPayment, setSuccess, router) {
    try {
        setloadingPayment(true);
        const response = await fetch('/api/upgradeSubscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nameToUpgrade: name, instantly: !insta }),
        });

        if (!response.ok) {
            setloadingPayment(false);
            setErrorFromPayment("Nastala chyba na serveru. Nepodařilo se nám zpracovat vaši platbu.");
        } else {
            router.push('/typeOfAccount?redirect_status=upgraded');
            router.refresh();
            document.getElementById("upgradeModalSubscriptionModal").close()
        }
    } catch (error) {
        console.error('Chyba při upgradu předplatného:', error);
        setloadingPayment(false);
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
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingPayment, setloadingPayment] = useState(false);
    const [name, setName] = useState(false);
    const [priceToUpgrade, setPriceToUpgrade] = useState(false);
    const [priceOfDesiredSub, setPriceOfDesiredSub] = useState(0);
    const [error, setError] = useState(false);
    const [errorFromPayment, setErrorFromPayment] = useState(false);
    const router = useRouter();

    useEffect(() => {
        function fetchSubscriptionInfo() {
            setLoading(true);
            fetch('/api/subInfo/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nameToUpgrade: nameToUpgrade })
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
                    setName(data.name);
                    setPriceToUpgrade(data.priceToUpgrade);
                    setPriceOfDesiredSub(data.priceOfDesiredSub);
                    setLoading(false);
                })
                .catch(error => {
                    setError("Nastala chyba na serveru. Zkuste to později")
                    setLoading(false);
                    console.error('Chyba při získávání informací o předplatném:', error);
                });
        }

        fetchSubscriptionInfo();
    }, [nameToUpgrade]);

    const formattedDate = nextPayment ? nextPayment : null;

    return (
        <div>
            <dialog id="upgradeModalSubscriptionModal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box flex flex-col justify-center items-center p-4">
                    {loading ? <span className="loading loading-spinner loading-lg"></span> :
                        <>
                            {error ? <>
                                <span className='text-red-500 flex justify-center items-center mt-4 '>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 mr-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                    Nastala chyba. Zkuste to později
                                </span>
                                <button
                                    type="button"
                                    className="btn mt-3"
                                    onClick={() => {
                                        document.getElementById("upgradeModalSubscriptionModal").close();
                                    }}
                                    onTouchStart={() => {
                                        document.getElementById("upgradeModalSubscriptionModal").close();
                                    }}
                                >
                                    Zavřít
                                </button>
                            </> : <>
                                <span className="block text-center font-bold mb-4 text-lg">
                                    {success ? <div
                                        className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-200 dark:bg-gray-800 dark:text-green-400"
                                        role="alert"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                        }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-6 h-6"
                                            style={{
                                                strokeWidth: '2.5',
                                            }}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                            />
                                        </svg>
                                    </div> : <span className='underline'> Upgradovat předplatné na {nameToUpgrade}</span>}
                                </span>

                                <div className="flex justify-center items-center space-x-4 mb-6 p-6">
                                    <span className=" font-bold ">
                                        Ihned přejdu na {nameToUpgrade}
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
                                        Nyní doplatím {priceToUpgrade} Kč a ihned získám výhody {nameToUpgrade}
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
                                        Předplatné se obnoví  {formattedDate} za {priceOfDesiredSub} Kč
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
                                       Mé dosavadní topovaní dle měsíců to nijak neovlivní  
                                    </li>
                                    <li className="flex items-center mb-5 mt-5 text-gray-400 text-opacity-75 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
        Kliknutím na ‘Upgradovat’ souhlasíte s okamžitým stržením částky z vaší karty a s obchodními podmínkami.
    </li>
                                </ul>

                                <div className="flex mt-4 justify-center">
                                    {!success &&
                                        <button
                                            type="button "
                                            className="btn bg-primary text-white mr-2 hover:bg-primary"
                                            disabled={loadingPayment}
                                            onClick={() => upgradeSubscription(nameToUpgrade, false, setloadingPayment, setErrorFromPayment, setSuccess, router)}
                                            onTouchStart={() => upgradeSubscription(nameToUpgrade, false, setloadingPayment, setErrorFromPayment, setSuccess, router)}
                                        >
                                            {loadingPayment ? "Upgraduji..." : "Upgradovat"}
                                        </button>
                                    }
                                    <button
                                        type="button"
                                        className="btn"
                                        disabled={loadingPayment}
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
                            </>}
                        </>
                    }
                </div>
            </dialog>
        </div>
    );
}