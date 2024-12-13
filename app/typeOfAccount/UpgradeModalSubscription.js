"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

async function upgradeSubscription(name, cardId, setloadingPayment, setErrorFromPayment, setSuccess, router) {
    try {
        setloadingPayment(true);
        const response = await fetch("/api/upgradeSubscription", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nameToUpgrade: name,instantly: true, cardId: cardId }),
        });

        if (!response.ok) {
            setloadingPayment(false);
            setErrorFromPayment("Nepodařilo se nám zpracovat vaši platbu. Zkuste to znovu");
        } else {
            setSuccess(true);
            setloadingPayment(false);
            setTimeout(() => {
                router.push("/typeOfAccount?redirect_status=upgraded");
                router.refresh();
                document.getElementById("upgradeModalSubscriptionModal").close();
            }, 1500);
        }
    } catch (error) {
        console.error("Chyba při upgradu předplatného:", error);
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
    const [lastDigits, setLastDigits] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const router = useRouter();
    useEffect(() => {
        if (lastDigits.length > 0 && !selectedCardId) {
            setSelectedCardId(lastDigits[0].id);
        }
    }, [lastDigits, selectedCardId, setSelectedCardId]);
    useEffect(() => {
        async function fetchSubscriptionInfo() {
            setLoading(true);
            try {
                const response = await fetch("/api/subInfo/upgrade", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nameToUpgrade }),
                });
                if (!response.ok) throw new Error("Chyba při získávání informací o předplatném");

                const data = await response.json();
                setNextPayment(data.nextPayment);
                setName(data.name);
                setPriceToUpgrade(data.priceToUpgrade);
                setPriceOfDesiredSub(data.priceOfDesiredSub);
                setLastDigits(data.cards); // Cards as an array
                setLoading(false);
            } catch (error) {
                console.error("Chyba při získávání informací o předplatném:", error);
                setError("Nastala chyba na serveru. Zkuste to později");
                setLoading(false);
            }
        }

        fetchSubscriptionInfo();
    }, [nameToUpgrade]);

    const formattedDate = nextPayment || null;

    return (
        <div>
            <dialog id="upgradeModalSubscriptionModal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box flex flex-col justify-center items-center p-6">
                    {/* Hlavní SVG */}
                    <div className="mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-16 h-16 text-center text-primary"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                            />
                        </svg>
                    </div>
                    {loading ? (
                        <span className="loading loading-spinner loading-lg"></span>
                    ) : error ? (
                        <div className="text-red-500 text-center">
                            {error}
                            <button
                                className="btn mt-3"
                                onClick={() => document.getElementById("upgradeModalSubscriptionModal").close()}
                            >
                                Zavřít
                            </button>
                        </div>
                    ) : (
                        <>
                        {errorFromPayment && <h2 className="text-md mb-4 text-center text-red-500 flex items-center justify-center">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
  </svg>
  {errorFromPayment}
</h2>}
                      
                       
                            <h2 className="text-lg font-bold mb-4 text-center">
                            Upgradovat předplatné na {nameToUpgrade}
                            </h2>
                            <ul className="space-y-4 text-centre">
                                <li className="text-center">
                                    <span>Částka k doplacení: </span>
                                    <span className="font-bold">{priceToUpgrade} Kč</span>
                                </li>
                                <li className="text-center">
                                    <span>Příští obnovení předplatného: </span>
                                    <span className="font-bold">{formattedDate} za {priceOfDesiredSub} Kč</span>
                                </li>
                            </ul>

                            {/* Select pro karty */}
                            <div className="mt-6 w-full flex items-center">
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-8 mr-3"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
        />
    </svg>
    <select
        className="w-full p-3 border rounded-lg flex-1"
        value={selectedCardId || ""}
        onChange={(e) => setSelectedCardId(e.target.value)}
    >
        {lastDigits?.map((card) => (
            <option key={card.id} value={card.id}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 mr-3"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                    />
                </svg>
                {`**** ${card.last4}  ${card.brand}`}
            </option>
        ))}
    </select>
</div>
<ul>
<li className="flex items-center mb-5 mt-5 text-gray-400 text-opacity-75 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
        Kliknutím na ‘Upgradovat’ souhlasíte s okamžitým stržením částky z vaší karty a přechodem na uvedené předplatné.
    </li>
    </ul>

                            <div className="flex justify-center mt-6 space-x-4 ">
                                {!success && (
                                    <button
                                        className={`btn btn-primary  `}
                                        disabled={loadingPayment || !selectedCardId}
                                        onClick={() =>
                                            upgradeSubscription(nameToUpgrade, selectedCardId, setloadingPayment, setErrorFromPayment, setSuccess, router)
                                        }
                                    >
                                        {loadingPayment ? "Upgraduji..." : "Upgradovat"}
                                    </button>
                                )}
                                <button
                                    className="btn"
                                    onClick={() => document.getElementById("upgradeModalSubscriptionModal").close()}
                                >
                                    Zavřít
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </dialog>
        </div>
    );
}