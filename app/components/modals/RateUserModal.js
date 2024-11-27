"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

async function RateUser(userId, setSuccess,moreInfo,numberOfStars) {
    const response = await fetch('/api/posts/rate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId ,moreInfo,numberOfStars}),
    });

    console.log("Server response for post report:", response);

    if (!response.ok) { 
        setSuccess(false);
    } else {
        setSuccess(true);
    }

    const result = await response.json();
    return result;
}

export function openRateUserModal() {
    document.getElementById('rate_user_modal').showModal();
}

export function closeRateUserModal() {
    document.getElementById('rate_user_modal').close();
}

export const RateUserModal = ({ userTorate, nameOfUser }) => {
    console.log("uzivatel:",userTorate)
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [userId, setUserId] = useState(userTorate);
    const [alreadyEnoughRating, setAlreadyEnoughRating] = useState('');
    const [moreInfo, setMoreInfo] = useState('');
    const [numberOfStars, setNumberOfStars] = useState(1);
    useEffect(() => {
    const checkRatetStatus = async () => {
        setLoadingStatus(true); // Zobrazí spinner

        try {
            const response = await fetch('/api/posts/rate', {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userTorate }),
            });

            if (response.ok) {
                const data = await response.json();
                setAlreadyEnoughRating(data.reported);
            } else {
                console.error('Failed to rate user:', response.statusText);
            }
        } catch (error) {
            console.error('Error checking rate status:', error);
        }

        // Nastaví zpoždění, aby spinner byl zobrazen alespoň 2 sekundy
        setTimeout(() => {
            setLoadingStatus(false); // Skrývá spinner po zpoždění
        }, 2000); // Zpoždění 2 sekundy (2000 ms)
    };

    checkRatetStatus();
}, [userId]);

    const handleRateUser = async () => {
        setLoading(true);
        await RateUser(userId, setSuccess,moreInfo,numberOfStars);
        setLoading(false);

    };

    return (
        <dialog 
            id="rate_user_modal" 
            className="modal  modal-bottom sm:modal-middle" 
            style={{ marginLeft: "0px" }}
        >
            <div className="modal-box w-full p-6 flex flex-col items-center align-middle text-center">
                <div className="flex justify-center mb-4 font-extrabold  text-xl mt-4">
                {nameOfUser}

                </div>
                <div className="w-full p-4 rounded-lg">
                  
                   {/* lg */}
                   <div className="rating rating-lg">
                <input
                defaultChecked
                    type="radio"
                    name="rating-8"
                    onChange={() => setNumberOfStars(1)}
                    className="mask mask-star-2 bg-orange-400"
                />
                <input
                    type="radio"
                    name="rating-8"
                    onChange={() => setNumberOfStars(2)}
                    className="mask mask-star-2 bg-orange-400"
                />
                <input
                    type="radio"
                    name="rating-8"
                    onChange={() => setNumberOfStars(3)}
                    className="mask mask-star-2 bg-orange-400"
                />
                <input
                    type="radio"
                    name="rating-8"
                    onChange={() => setNumberOfStars(4)}
                    className="mask mask-star-2 bg-orange-400"
                />
                <input
                    type="radio"
                    name="rating-8"
                    onChange={() => setNumberOfStars(5)}
                    className="mask mask-star-2 bg-orange-400"
                />
                </div>
<div className="w-full mt-5 relative mx-auto">
                        <textarea
                           disabled={alreadyEnoughRating || success}
                            maxLength="200"
                            style={{
                                fontSize: '14px',
                                padding: '8px',
                                height: '150px',
                                resize: 'none',
                            }}
                            name="moreInfo"
                            id="moreInfo"
                            value={alreadyEnoughRating[0]?.topic || moreInfo}
                            onChange={(e) => setMoreInfo(e.target.value)}
                            className="input input-bordered   w-full text-left"
                            placeholder={"Komentář.."}
                        />
                    </div>
                </div>
                <div className="flex mt-4 justify-center">
                    <button
                        onClick={handleRateUser}
                        className="btn mr-2 bg-orange-400 hover:bg-orange-400"
                        disabled={loading}
                    >
                        {loading && !success ? 'Hodnotím...' : "Ohodnotit uživatele"}
                    </button>
                    <button
                        onClick={closeRateUserModal}
                        className="btn"
                        autoFocus
                        disabled={loading}
                    >
                        Zavřít
                    </button>
                </div>
            </div>
        </dialog>
    );
};