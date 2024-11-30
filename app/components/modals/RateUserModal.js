"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

async function RateUser(userId, setErrorMessage, setSuccess,moreInfo,numberOfStars) {
    const response = await fetch('/api/posts/rate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId ,moreInfo,numberOfStars}),
    });

    console.log("Server response for post report:", response);
    const result = await response.json();
    if (!response.ok) { 
        setSuccess(false);
        setErrorMessage(result.message);
    } else {
        setSuccess(result.message);

    }

    
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
            
            try {
                const response = await fetch('/api/posts/rate', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userTorate }),
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setAlreadyEnoughRating(data.reported);
                } else {
                    const data = await response.json();
                    setErrorMessage(data.message);
                    
                }
            } catch (error) {
                console.error('Error checking rate status:', error);
            } finally {
                setTimeout(() => setLoadingStatus(false), 2000);
            }
        };
    
        checkRatetStatus();
    }, [userTorate]); // <- Přidání závislosti

    const handleRateUser = async () => {
        setLoading(true);
        await RateUser(userId, setErrorMessage,setSuccess,moreInfo,numberOfStars);
        setLoading(false);

    };

    return (
        <dialog 
            id="rate_user_modal" 
            className="modal  modal-bottom sm:modal-middle" 
            style={{ marginLeft: "0px" }}
        >
            <div className="modal-box w-full p-6 flex flex-col items-center align-middle text-center">
            {loadingStatus ?   <span className="loading loading-spinner loading-lg"></span>  :  <>
               
                <div className="flex justify-center mb-4">
                  
                      
                   
                  <>
                {!success && !alreadyEnoughRating  ? (
                               <> </>
                            ) : (
                                <>
                                    {success && (
                                        <div role="alert" className="flex flex-col items-center text-green-500 mb-2 p-3  rounded-lg ">
                                            <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="size-14 mb-3"
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
                                            <span className="text-sm font-medium text-center">{success}</span>
                                        </div>
                                    )}
                                    {alreadyEnoughRating&& (
                         <div role="alert" className="flex flex-col items-center  mb-2 p-3  rounded-lg ">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="font-extrabold  text-orange-500 size-16">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>

                                            <span className="text-sm font-extrabold  mt-4 block text-center">Dejte si chvíli pauzu než udělíte další hodnocení</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
            
                </div>

                {errorMessage && (
                    <div className="flex items-center gap-2 px-4 py-2  border border-red-500 rounded-md text-red-600 font-semibold mt-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>{errorMessage}</span>
                        
                    </div>
                )}

{!alreadyEnoughRating && <>
<div className="flex justify-center mb-4 font-extrabold  text-xl mt-4">
                <Link className='underline' target="_blank" href={`/user/${userTorate}`}>{nameOfUser}</Link>

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
        disabled={alreadyEnoughRating || success} // Disable the stars if alreadyEnoughRating is true
    />
    <input
        type="radio"
        name="rating-8"
        onChange={() => setNumberOfStars(2)}
        className="mask mask-star-2 bg-orange-400"
        disabled={alreadyEnoughRating || success} // Disable the stars if alreadyEnoughRating is true
    />
    <input
        type="radio"
        name="rating-8"
        onChange={() => setNumberOfStars(3)}
        className="mask mask-star-2 bg-orange-400"
        disabled={alreadyEnoughRating || success} // Disable the stars if alreadyEnoughRating is true
    />
    <input
        type="radio"
        name="rating-8"
        onChange={() => setNumberOfStars(4)}
        className="mask mask-star-2 bg-orange-400"
        disabled={alreadyEnoughRating || success} // Disable the stars if alreadyEnoughRating is true
    />
    <input
        type="radio"
        name="rating-8"
        onChange={() => setNumberOfStars(5)}
        className="mask mask-star-2 bg-orange-400"
        disabled={alreadyEnoughRating || success} // Disable the stars if alreadyEnoughRating is true
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
                </> }
                <div className="bg-base-200 collapse mt-5 mx-auto">
                        <input type="checkbox" className="peer " />
                        <div className="collapse-title bg-base-200 peer-checked:bg-base-300 flex items-center ">
                            Kde najdu všechna hodnocení uživatele
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                            </svg>
                        </div>
                        <div className="collapse-content bg-base-300  peer-checked:bg-base-300">
                            <p>
                                Všechna hodnocení uživatele je možné zobrazit na jeho profilu{" "}
                                <Link className='underline' target="_blank" href={`/user/${userTorate}`}>{nameOfUser}</Link>
                            </p>
                        </div>
                    </div>
                    <div className="bg-base-200 collapse mt-5 mx-auto">
                        <input type="checkbox" className="peer " />
                        <div className="collapse-title bg-base-200 peer-checked:bg-base-300 flex items-center ">
                         Jsou hodnocení důvěryhodná
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                            </svg>
                        </div>
                        <div className="collapse-content bg-base-300  peer-checked:bg-base-300">
                            <p>
                            Veškerá hodnocení nejsou ověřena a vycházejí výhradně z názorů uživatelů platformy.
                            </p>
                        </div>
                    </div>
                <div className="flex mt-4 justify-center">
                    {alreadyEnoughRating || !success &&  <button
                        onClick={handleRateUser}
                        className="btn mr-2 bg-orange-400 hover:bg-orange-400"
                        disabled={loading }
                    >
                        {loading && !success ? 'Hodnotím...' : "Ohodnotit uživatele"}
                    </button>}
                   
                    <button
                        onClick={closeRateUserModal}
                        className="btn"
                        autoFocus
                        disabled={loading}
                    >
                        Zavřít
                    </button>
                
                </div>
      
        </> }
        
            </div>
        
        </dialog>
    );
};