"use client";

import React, { useState, useEffect } from 'react';
import { openEditSubscriptionModal } from './modals/EditSubscriptionModal';
import dynamic from 'next/dynamic';

export function SubscriptionInfo({ gifted }) {
  const [nextPayment, setNextPayment] = useState(null);
  const [scheduledToCancel, setScheduledToCancel] = useState(false);
  const [loading, setLoading] = useState(true); // Výchozí stav je true
  const [name, setName] = useState('');
  const [isSubInfoModalVisible, setIsSubInfoModalVisible] = useState(false);

  const EditSubscriptionModal = dynamic(
    () => import("@/app/components/modals/EditSubscriptionModal"),
    { ssr: false }
  );

  function importSubInfoModalDynamically() {
    try {
      setIsSubInfoModalVisible(true);
      if (!isSubInfoModalVisible) {
        console.log("Čekám ");
        setTimeout(() => {
          openEditSubscriptionModal();
        }, 500);
        console.log("Otevírám ");
      } else {
        openEditSubscriptionModal();
      }
    } catch (error) {
      console.log("Chyba otevírání payment modalu");
    }
  }

  useEffect(() => {
    async function fetchSubscriptionInfo() {
      setLoading(true);
      try {
        const response = await fetch('/api/subInfo', {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Chyba získávání informací o předplatném');
        }

        const data = await response.json();
        setNextPayment(data.nextPayment);
        setScheduledToCancel(data.scheduledToCancel);
        setName(data.name);
      } catch (error) {
        console.error('Chyba získávání informací o předplatném:', error);
      } finally {
        setLoading(false); // Ukončení načítání
      }
    }

    fetchSubscriptionInfo();
  }, []);

  const formattedDate = nextPayment ? nextPayment : null;

  if (loading) {
    // Zobrazíme pouze jeden centrální spinner během načítání
    return (
     
        <span className="loading loading-spinner loading-md"></span>
     
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        {formattedDate && !gifted ? (
          scheduledToCancel ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          )
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        )}

        <span>
          {gifted ? (
            <>Platné do: {formattedDate}</>
          ) : scheduledToCancel ? (
            <>Platné do: {formattedDate}</>
          ) : (
            <>Příští fakturace: {formattedDate}</>
          )}
        </span>

        {formattedDate && isSubInfoModalVisible && !gifted && (
          <EditSubscriptionModal
            cancel={scheduledToCancel}
            date={formattedDate}
            name={name}
          />
        )}
      </div>

      <div className="flex items-center space-x-2 mt-2">
        {formattedDate && !gifted ? (
          scheduledToCancel ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          )
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
            Předplatné bylo darováno
          </>
        )}

        <button
          onClick={importSubInfoModalDynamically}
          onTouchStart={importSubInfoModalDynamically}
          className={`underline ${
            scheduledToCancel ? 'text-green-500' : 'text-gray-400'
          }`}
        >
          {formattedDate && !gifted
            ? scheduledToCancel
              ? 'Obnovit předplatné'
              : 'Zrušit předplatné'
            : ''}
        </button>
      </div>
    </>
  );
}