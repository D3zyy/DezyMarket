"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

async function reportPost(postId, selectedReasons, setSuccess, moreInfo) {
  try {
    const response = await fetch('/api/posts/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, reasons: selectedReasons, extraInfo: moreInfo }),
    });

    console.log("Server response for post report:", response);

    const result = await response.json();

    if (!response.ok) {
      setSuccess(false);
    } else {
      setSuccess(true);
    }

    return result;

  } catch (error) {
    console.error('Chyba při odesílání požadavku:', error);
    setSuccess(false);
    return { success: false, error: 'Network error or server is unavailable' }; // Return error object if network issue occurs
  }
}

export function openReportPostModal() {
    try {
        const modal =  document.getElementById('report_post_modal')
        if (modal) {
            modal.showModal();
        } 
      } catch (error) {
        console.error("Chyba otevírání modalu:", error);
        
      }

}

export function closeReportPostModal() {
    try {
        const modal =  document.getElementById('report_post_modal')
        if (modal) {
            modal.close();
        } 
      } catch (error) {
        console.error("Chyba otevírání modalu:", error);
        
      }
}

const ReportPostModal = ({ posttId, postCreatorName, postCreatorId, imagesLength }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorFromServer, setErrorFromServer] = useState(false); 
    const [postId, setPostId] = useState(posttId);
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [moreInfo, setMoreInfo] = useState('');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [alreadyReported, setAlreadyReported] = useState('');
    const [alreadyEnoughReports, setAlreadyEnoughReports] = useState('');
    const [loadingStatus, setLoadingStatus] = useState(true); // Stav načítání
    const dropdownRef = useRef(null); // Reference na dropdown
  
    useEffect(() => {
      const checkReportStatus = async () => {
        setLoadingStatus(true); // Zobrazí spinner
        
        try {
          const response = await fetch('/api/posts/report', {
            method: 'PUT', 
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId }),
          });
  
          if (response.ok) {
            console.log("Odpověď v pořádku");
            const data = await response.json();
            setAlreadyReported(data.reported);
            setAlreadyEnoughReports(data.enoughReports);
          } else {
            console.error('Nepodařilo se načíst stav reportu:', response.statusText);
          }
        } catch (error) {
          console.error('Chyba při načítání stavu reportu:', error);
        } finally {
          // Nastaví zpoždění, aby spinner byl zobrazen alespoň 2 sekundy
          setTimeout(() => {
            setLoadingStatus(false); // Skrývá spinner po zpoždění
          }, 2000); // Zpoždění 2 sekundy (2000 ms)
        }
      };
  
      checkReportStatus();
    }, [postId]);
  
    // Zavření dropdownu při kliknutí mimo něj
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  
    const reasons = [
      'Nesprávná kategorie',
      'Nesprávná sekce',
      'Nevhodný inzerát',
      'Podvodný inzerát',
      ...(imagesLength > 0 ? ['Nevhodné fotografie'] : []),
      'Nevhodný obsah',
      'Jiné',
    ];
  
    const handleReasonToggle = (reason) => {
      setSelectedReasons((prevReasons) =>
        prevReasons.includes(reason)
          ? prevReasons.filter((r) => r !== reason)
          : [...prevReasons, reason]
      );
    };
  
    const handleReportChange = async () => {
      if (selectedReasons.length === 0) {
        setErrorMessage('Důvod je povinný.');
        return; // Zabrání odeslání, pokud není vybrán žádný důvod
      }
  
      setErrorMessage(''); // Vyčistí chybovou zprávu, pokud validace projde
      setLoading(true);
  
      try {
        const resultsFromReport = await reportPost(postId, selectedReasons, setSuccess, moreInfo);
        console.log("Co server odpověděl:", resultsFromReport);
  
        if (resultsFromReport.success) {
          setSuccess(resultsFromReport.message);
        } else {
          setErrorFromServer(true);
          setErrorMessage(resultsFromReport.message);
        }
      } catch (error) {
        console.error("Chyba při odesílání reportu:", error);
        setErrorMessage("Nastala chyba při odesílání. Zkuste to prosím znovu.");
      } finally {
        setLoading(false);
      }
    };

    return (
        <dialog 
            id="report_post_modal" 
            className="modal modal-bottom sm:modal-middle" 
            style={{ marginLeft: "0px" }}
        >
            <div className="modal-box w-full p-6 flex flex-col items-center text-center">
            {loadingStatus ?   <span className="loading loading-spinner loading-lg"></span>  :  <>
                <div className="flex justify-center mb-4">
                  
                      
                   
                        <>
                        {alreadyEnoughReports && !alreadyReported.length > 0  ?(
                         <div role="alert" className="flex flex-col items-center  mb-2 p-3  rounded-lg ">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="font-extrabold  text-orange-500 size-16">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>

                                            <span className="text-sm font-extrabold  mt-4 block text-center">Dejte si chvíli pauzu než nahlásíte další příspěvek</span>
                                        </div>
                                    ) : <> 
                            {!success && !alreadyReported.length > 0 ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-16 text-red-600"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                                    />
                                </svg>
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
                                    {alreadyReported.length > 0 && (
                                        <div role="alert" className="text-orange-400 mb-2 p-3">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="size-16 mx-auto mb-2 stroke-current"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                />
                                            </svg>
                                            <span className="text-sm font-medium text-orange-400 block text-center">Již nahlášeno</span>
                                        </div>
                                    )}
                                    
                                </>
                            
                            )}
                                </>}
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
               
                <div className="w-full p-4 rounded-lg">
                {!alreadyEnoughReports  || alreadyReported.length > 0 ? (<>
                    <div className="w-full  relative mx-auto" ref={dropdownRef}>
                    
                        <button
                            className="select select-bordered w-full !inline-block"
                            onClick={() => setDropdownOpen(!isDropdownOpen)}
                        >
                            Zvolte důvod/y
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute bg-base-300 rounded-md top-full left-0 w-full mt-1 z-10">
                                {reasons?.map((reason) => {
                                   const isAlreadyReported = Array.isArray(alreadyReported) 
                                   ? alreadyReported.some((report) => report.reason === reason) 
                                   : false;

                                    return (
                                        <label key={reason} className="flex items-center cursor-pointer p-2">
                                            <input
                                                disabled={isAlreadyReported || success || alreadyReported.length > 0 || alreadyEnoughReports}
                                                type="checkbox"
                                                checked={selectedReasons?.includes(reason) || isAlreadyReported}
                                                onChange={() => handleReasonToggle(reason)}
                                                className="checkbox mr-2"
                                            />
                                            {reason}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="w-full mt-5 relative mx-auto">
                        <textarea
                            disabled={alreadyReported.length > 0 || success || alreadyEnoughReports}
                            maxLength="150"
                            style={{
                                fontSize: '14px',
                                padding: '8px',
                                height: '150px',
                                resize: 'none',
                            }}
                            name="moreInfo"
                            id="moreInfo"
                            value={alreadyReported[0]?.topic || moreInfo}
                            onChange={(e) => setMoreInfo(e.target.value)}
                            className="input input-bordered w-full text-left"
                            placeholder={"Řekněte nám víc.."}
                        />
                    </div>

                    </>) : ""}

                    <div className="bg-base-200 collapse mt-5 mx-auto">
                        <input type="checkbox" className="peer " />
                        <div className="collapse-title bg-base-200 peer-checked:bg-base-300 flex items-center ">
                            Chci nahlásit uživatele
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                            </svg>
                        </div>
                        <div className="collapse-content bg-base-300  peer-checked:bg-base-300">
                            <p>
                                Nahlášení uživatele je možné na jeho profilu{" "}
                                <Link className='underline' target="_blank" href={`/user/${postCreatorId}`}>{postCreatorName}</Link>
                            </p>
                        </div>
                    </div>
                    <div className="bg-base-200 collapse mt-5 mx-auto">
                        <input type="checkbox" className="peer " />
                        <div className="collapse-title bg-base-200 peer-checked:bg-base-300 flex items-center ">
                            Byl jsem podveden
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                            </svg>
                        </div>
                        <div className="collapse-content bg-base-300  peer-checked:bg-base-300">
                            <p>
                                Nahlašte podvod na Policii ČR. V případě, že budete potřebovat dodatečné informace, kontaktujte nás prostřednictvím <Link className='underline' target="_blank" href={"/support"}>Podpory</Link>
                            </p>
                            
                        </div>
                        
                    </div>
                



                    <div className="modal-action mt-6 flex justify-center w-full">
                    {!alreadyEnoughReports && alreadyReported.length === 0 && !success ? (
    <button
        onClick={handleReportChange}
        className="btn bg-red-500 hover:bg-red-600"
        disabled={loading || selectedReasons.length === 0 || success || alreadyReported.length > 0}
    >
        {loading && !success ? 'Nahlašuji...' : "Nahlásit"}
    </button>
) : null}

                        <button
                            onClick={closeReportPostModal}
                            className="btn"
                            autoFocus
                            disabled={loading}
                        >
                            Zavřít
                        </button>
                    </div>
                </div>
      
                     </>  
}
            </div>
        </dialog>
    );
};
export default ReportPostModal