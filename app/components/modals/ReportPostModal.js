"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

async function reportPost(postId, selectedReasons, setSuccess, moreInfo) {
    const response = await fetch('/api/posts/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, reasons: selectedReasons ,extraInfo : moreInfo}),
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

export function openReportPostModal() {
    document.getElementById('report_post_modal').showModal();
}

export function closeReportPostModal() {
    document.getElementById('report_post_modal').close();
}

export const ReportPostModal = ({ post }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorFromServer, setErrorFromServer] = useState(false); 
    const [postId, setPostId] = useState(post?.id);
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [moreInfo, setMoreInfo] = useState('');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [alreadyReported, setAlreadyReported] = useState('');
    const dropdownRef = useRef(null);  // Reference to the dropdown container

    useEffect(() => {
        const checkReportStatus = async () => {
            try {
                const response = await fetch('/api/posts/report', {
                    method: 'PUT', 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ postId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("data:", data)
                    setAlreadyReported(data.reported);
                    console.log(alreadyReported)
                } else {
                    console.error('Failed to report post:', response.statusText);
                }
            } catch (error) {
                console.error('Error checking report status:', error);
            }
        };

        checkReportStatus();
    }, [postId]); // Add dependencies here if needed

    // Close dropdown if clicking outside
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
        'Nevhodné fotografie',
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
            return; // Prevent submission if no reason is selected
        }

        setErrorMessage(''); // Clear error message if validation passes
        setLoading(true);

        try {
            const resultsFromReport = await reportPost(postId, selectedReasons, setSuccess, moreInfo);
            console.log("co server odpovedel:", resultsFromReport);

            if (resultsFromReport.success) {
                setSuccess(resultsFromReport.message);
            } else {
                setErrorFromServer(true);
                setErrorMessage(resultsFromReport.message);
            }
        } catch (error) {
            console.error("An error occurred while reporting the post:", error);
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
                <div className="flex justify-center mb-4">
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
                                        strokeWidth={1.5} 
                                        stroke="currentColor" 
                                        className="size-16 mb-2"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <span className="text-sm font-medium text-center">{success}</span>
                                </div>
                            )}
                            {alreadyReported.length > 0 && (
                                <div role="alert" className="text-yellow-500 mb-2 p-3">
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
                                    <span className="text-sm font-medium block text-center">Již nahlášeno</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {errorMessage && (
                    <div className="flex items-center gap-2 px-4 py-2  border border-red-500 rounded-md text-red-600 font-semibold mt-2">
                        <span>{errorMessage}</span>
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
                    </div>
                )}

                <div className="w-full p-4 rounded-lg">
                    <div className="w-full  relative mx-auto" ref={dropdownRef}>
                        <button
                            className="select select-bordered w-full !inline-block"
                            onClick={() => setDropdownOpen(!isDropdownOpen)}
                        >
                            Zvolte důvod/y
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute bg-base-300 rounded-md top-full left-0 w-full mt-1 z-10">
                                {reasons.map((reason) => {
                                    const isAlreadyReported = alreadyReported.some((report) => report.reason === reason);

                                    return (
                                        <label key={reason} className="flex items-center cursor-pointer p-2">
                                            <input
                                                disabled={isAlreadyReported || success || alreadyReported.length > 0}
                                                type="checkbox"
                                                checked={selectedReasons.includes(reason) || isAlreadyReported}
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
                            disabled={alreadyReported.length > 0 || success}
                            maxLength="230"
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

                    <div className="modal-action mt-6 flex justify-center w-full">
                    {!errorFromServer && !success && !alreadyReported.length >0 ?  <button
                            onClick={handleReportChange}
                            className="btn btn-primary  "
                            disabled={loading || selectedReasons.length === 0 || success || alreadyReported.length > 0}
                            
                        >
                            {loading && !success ? 'Odesílám...' : "Nahlásit"}
                        </button>: ""}
                       
                    
                    
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
            </div>
        </dialog>
    );
};