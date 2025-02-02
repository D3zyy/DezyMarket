"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function openCardsModal() {
    const modal = document.getElementById(`cardsModal`);
    if (modal) {
        modal.showModal();
    }
}

export function CardsModal() {
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [lastDigits, setLastDigits] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [selectedCardIsDefault, setSelectedCardIsDefault] = useState(false); // Nový stav pro kontrolu, zda je defaultní
    const [error, setError] = useState(null);
    const [errorFromPayment, setErrorFromPayment] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchSubscriptionInfo() {
            try {
                const response = await fetch("/api/getCards", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                });

                if (!response.ok) throw new Error("Chyba při získávání informací o předplatném");

                const data = await response.json();
                console.log("tohle jsem dostal od serveru:", data);

                setLastDigits(data.cards || []);

                if (data.cards?.length) {
                    const defaultCard = data.cards.find((card) => card.isDefault) || data.cards[0]; // Najde defaultní kartu nebo vezme první
                    setSelectedCardId(defaultCard.id);
                    setSelectedCardIsDefault(defaultCard.isDefault);
                }

                setLoading(false);
            } catch (error) {
                console.error("Chyba při získávání informací o předplatném:", error);
                setError("Nastala chyba na serveru. Zkuste to později");
                setLoading(false);
            }
        }

        fetchSubscriptionInfo();
    }, [success]);

    const handleSetDefaultPm = async (cardId) => {
        if (!cardId) return;

        try {
            setLoadingPayment(true);
            const response = await fetch("/api/deleteCard", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId: cardId , setDef: true }),
            });

            if (!response.ok) {
                throw new Error("Nepodařilo se nastavit kartu jako výchozí.");
            }

            setSelectedCardIsDefault(true); // Po úspěšném nastavení změníme stav
        } catch (error) {
            console.error("Chyba při nastavování defaultní karty:", error);
            setErrorFromPayment("Nepodařilo se nastavit kartu jako výchozí. Zkuste to znovu.");
         } finally {
                setLoadingPayment(false);
                setSuccess(true);  // Vyvolá nový fetch
                setTimeout(() => setSuccess(false), 500); // Reset pro další změny
                router.refresh();
            }
    };

    const handleDelete = async (cardId) => {
        if (!selectedCardId) return;
        try {
            setLoadingPayment(true);
            const response = await fetch("/api/deleteCard", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardId: cardId , setDef: false}),
            });

            if (!response.ok) {
                throw new Error("Nepodařilo se zpracovat platbu.");
            }

            setSuccess(true);
        } catch (error) {
            console.error("Chyba při mazání karty:", error);
            setErrorFromPayment("Nepodařilo se nám odstranit vaši kartu. Zkuste to znovu.");
         } finally {
                setLoadingPayment(false);
                setSuccess(true);  // Vyvolá nový fetch
                setTimeout(() => setSuccess(false), 500); // Reset pro další změny
                router.refresh();
            }
    };

    return (
        <dialog id="cardsModal" className="modal modal-bottom sm:modal-middle">
            <div className="modal-box flex flex-col justify-center items-center p-6">
                {loading ? (
                    <span className="loading loading-spinner loading-lg"></span>
                ) : error ? (
                    <div className="text-red-500 text-center">
                        {error}
                        <button className="btn mt-3" onClick={() => document.getElementById("cardsModal").close()}>Zavřít</button>
                    </div>
                ) : (
                    <>
                        <div className="mt-6 w-full flex flex-row items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 flex-shrink-0 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                            </svg>

                            <select
                            disabled={loadingPayment}
                                className="w-full p-3 border rounded-lg"
                                value={selectedCardId || ""}
                                onChange={(e) => {
                                    const selectedCard = lastDigits.find((card) => card.id === e.target.value);
                                    setSelectedCardId(selectedCard.id);
                                    setSelectedCardIsDefault(selectedCard.isDefault);
                                }}
                            >
                               {[...lastDigits]
    .sort((a, b) => b.isDefault - a.isDefault) // Seřadí tak, že true (1) bude před false (0)
    .map((card) => (
        <option key={card.id} value={card.id}>
            {`**** ${card.last4} ${card.brand.toUpperCase()} ${card.isDefault ? '(defaultní)' : ''}`}
        </option>
    ))}
                            </select>
                            <button disabled={loadingPayment} onClick={() => handleDelete(selectedCardId)} className="btn btn-sm ml-4 rounded-box text-red-500"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
</button>
                        </div>

                        {/* Zobrazit tlačítko pouze pokud karta NENÍ defaultní */}
                        {!selectedCardIsDefault && (
                            <button  disabled={loadingPayment}onClick={() => handleSetDefaultPm(selectedCardId)} className="btn btn-sm mt-3">
                                Nastavit jako defaultní
                            </button>
                        )}

                        <div className="flex justify-center mt-6 space-x-4">
                            <button disabled={loadingPayment} className="btn" onClick={() => document.getElementById("cardsModal").close()}>
                                Zavřít
                            </button>
                        </div>
                    </>
                )}
            </div>
        </dialog>
    );
}