"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

async function fetchVerification(email, token) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${token}&email=${email}`
    );
    return await res.json();
  } catch (error) {
    console.error("Error fetching verification:", error);
    return { message: "", success: false };
  }
}

const Page = ({ searchParams }) => {
  const { token, email } = searchParams;
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const dialogRef = useRef(null);
  const router = useRouter();

  // Ref pro kontrolu, zda už byl požadavek proveden
  const hasVerified = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (!token || !email || hasVerified.current) return;

      hasVerified.current = true; // Zabrání opakovanému provedení
      const result = await fetchVerification(email, token);

      setMessage(result.message || "Nastala chyba.");
      setIsSuccess(result.success);
      setLoading(false);
    };

    verify();
  }, [token, email]);

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, []);

  return (
    <>
      <div style={{ marginBottom: "900px" }}> </div>
      <dialog
        ref={dialogRef}
        id="verify_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <div className="modal-action">
            <div className="flex items-center justify-center h-full w-full p-1">
              {loading ? (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full">
                  {token && email ? (
                    isSuccess ? (
                      <>
                        {message === "Email byl úspěšně ověřen." ? (
                          <CheckCircleIcon className="mb-3 h-12 w-12 text-green-500" />
                        ) : (
                          <ShieldExclamationIcon className="mb-3 h-12 w-12 text-yellow-500" />
                        )}
                        <span className="ml-2 text-lg">{message}</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="mb-3 h-12 w-12 text-red-500" />
                        <span className="ml-2 text-lg">{message}</span>
                      </>
                    )
                  ) : (
                    <>
                      <XCircleIcon className="mb-3 h-12 w-12 text-red-500" />
                      <span className="ml-2 text-lg">{message}</span>
                    </>
                  )}
                  <button
                    style={{ marginTop: "15px" }}
                    type="button"
                    className="btn"
                    onClick={() => {
                      dialogRef.current.close();
                      router.push("/");
                    }}
                  >
                    Zavřít
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Page;