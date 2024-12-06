"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

async function updatedPost(postId, setSuccess) {
    const response = await fetch('/api/posts', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
    });

    console.log("Server response for post edit:", response);

    if (!response.ok) { 
        setSuccess(false);
    } else {
        setSuccess(true);
    }

    const result = await response.json();
    return result;
}

export function openDeletePostModal() {
    document.getElementById('delete_post_modal').showModal();
}

export function closeDeletePostModal() {
    document.getElementById('delete_post_modal').close();
}

export const DeletePostModal = ({ posttId }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [postId, setPostId] = useState(posttId);

    const handlePostChange = async () => {
        setLoading(true);
        await updatedPost(postId, setSuccess);
        setLoading(false);
        router.push("/");
        closeDeletePostModal();
    };

    return (
        <dialog 
            id="delete_post_modal" 
            className="modal  modal-bottom sm:modal-middle" 
            style={{ marginLeft: "0px" }}
        >
            <div className="modal-box w-full p-6 flex flex-col items-center align-middle text-center">
                <div className="flex justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 text-red-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </div>
                <div className="w-full p-4 rounded-lg">
                    <p className="text-lg font-semibold text-red-500">
                        Opravdu chcete smazat příspěvek?
                    </p>
                    <span className="text-sm text-gray-500 mt-2 block">
                        Tato akce je nevratná.
                    </span>
                </div>
                <div className="flex mt-4 justify-center">
                    <button
                        onClick={handlePostChange}
                        className="btn mr-2 hover:bg-red-600 bg-red-500"
                        disabled={loading}
                    >
                        {loading ? 'Načítání...' : "Smazat příspěvek"}
                    </button>
                    <button
                        onClick={closeDeletePostModal}
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