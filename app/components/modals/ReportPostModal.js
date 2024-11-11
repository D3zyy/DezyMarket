"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

async function reportPost(postId, selectedReasons, setSuccess) {
    const response = await fetch('/api/posts/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, reasons: selectedReasons }),
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
    const [postId, setPostId] = useState(post?.id);
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [moreInfo, setMoreInfo] = useState('');
    const [isDropdownOpen, setDropdownOpen] = useState(false);

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
        setLoading(true);
        await reportPost(postId, selectedReasons, setSuccess);
        setLoading(false);
    };

    return (
        <dialog 
            id="report_post_modal" 
            className="modal modal-bottom sm:modal-middle" 
            style={{ marginLeft: "0px" }}
        >
            <div className="modal-box w-full p-6 flex flex-col items-center text-center">
                <div className="flex justify-center mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-12 text-red-600"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                        />
                    </svg>
                </div>
                <div className="w-full p-4 rounded-lg">
                    <div className="w-full  relative mx-auto">
                        <button
                            className="select select-bordered w-full !inline-block " // Light primary background with transparency
                            onClick={() => setDropdownOpen(!isDropdownOpen)}
                        >
                            Zvolte důvod/y
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute bg-base-200 rounded-md top-full left-0 w-full mt-1 z-10">
                                {reasons.map((reason) => (
                                    <label key={reason} className="flex items-center cursor-pointer p-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedReasons.includes(reason)}
                                            onChange={() => handleReasonToggle(reason)}
                                            className="checkbox mr-2"
                                        />
                                        {reason}
                                    </label>
                                ))}
                                
                            </div>
                        )}
                    </div>
                    <div className="w-full mt-5 relative mx-auto">
                        <textarea
                   
                        style={{ 
                            fontSize: '14px', 
                            padding: '8px', 
                            height: '150px', // Počáteční výška
                            resize: 'none' // Zamezení změny velikosti
                          }}
                            name="moreInfo"
                            id="moreInfo"
                            value={moreInfo}
                            onChange={(e) => setMoreInfo(e.target.value)}
                            className="input input-bordered w-full  text-left" // Keep input text left-aligned
                            placeholder="Řekněte nám víc.." // Placeholder text
                        />
                    </div>
                    <div className="bg-base-200 collapse mt-5 mx-auto">
  <input type="checkbox" className="peer " />
  <div className="collapse-title bg-base-200 peer-checked:bg-base-300 flex items-center ">
  Chci nahlásit uživatele
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
  </svg>
</div>
  <div
    className="collapse-content bg-base-300  peer-checked:bg-base-300">
<p>
  Nahlášení uživatele je možné na jeho profilu{" "}
  <Link className='underline' target="_blank" href={`/user/${post?.user?.id}`}>{post?.user?.fullName}</Link>
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
  <div
    className="collapse-content bg-base-300  peer-checked:bg-base-300">
<p>
 Nahlašte podvod na Policii ČR. V případě že budete potřebovat dodatečné informace kontaktujte nás prostřednictvím  <Link className='underline' target="_blank" href={"/support"}>Podpory</Link>
</p>
  </div>
</div>

                </div>
                <div className="flex mt-4 justify-center w-full">
                    <button
                        onClick={handleReportChange}
                        className="btn mr-2 hover:bg-red-600 bg-red-500"
                        disabled={loading}
                    >
                        {loading && !success ? 'Načítání...' : "Nahlásit příspěvek"}
                    </button>
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
        </dialog>
    );
};