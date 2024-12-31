"use client";
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { openPaymentModal } from './PaymentModal';
import { SubscriptionInfo } from '../components/SubscriptionInfo';

import { openUpgradeModalSubscriptionModal} from './UpgradeModalSubscription'


const PaymentModal = dynamic(
  () => import("@/app/typeOfAccount/PaymentModal"),
  {ssr:false  }
);

const UpgradeModalSubscription = dynamic(
  () => import("@/app/typeOfAccount/UpgradeModalSubscription"),
  {ssr:false  }
);



export function Account({ name,emoji, price, priceId, benefits, hasThisType, hasThisTypePriority, namePriority}) {

 
  const [loading, setLoading] = useState(false);
  const [isPaymentModalVisible,setIsPaymentModalVisible] = useState(false)
  const [isUpgradeModalVisible,setIsUpgradeModalVisible] = useState(false)
  const isActive = hasThisType === name;
  const isZakladni = namePriority === 1;
 let  canUpgrade = (hasThisTypePriority < namePriority ) && hasThisTypePriority != 1

  // Determine if the button should be disabled
  const shouldDisable = hasThisType && (isZakladni ||  hasThisTypePriority != 1);

  function importPaymentModalDynamically (price){
    try {
      setIsPaymentModalVisible(true);
      if (!isPaymentModalVisible) {
        console.log("Čekám ")
        setTimeout(() => {
            openPaymentModal(price);
        }, 500);
        console.log("Otevírám ")
      } else {
  
        openPaymentModal(price);
      }
    } catch (error) {
      console.log("Chyba otevírání payment modalu")
    }
  }
  function importUpgradeModalDynamically (){
    try {
      setIsUpgradeModalVisible(true);
      if (!isUpgradeModalVisible) {
        console.log("Čekám ")
        setTimeout(() => {
            openUpgradeModalSubscriptionModal();
        }, 500);
        console.log("Otevírám ")
      } else {
  
        openUpgradeModalSubscriptionModal();
      }
    } catch (error) {
      console.log("Chyba otevírání upgrade modalu")
    }
  }

  // Determine if the "Zrušit předplatné" link should be shown
  const showCancelLink = isActive && !isZakladni;

  const setDefaultType = async () => {
    setLoading(true);
    try {
        const res = await fetch('/api/setDefaultTypeAcc', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json' // Add the Content-Type header
            },
            body: JSON.stringify({ name })
        });

        // If successful, reload the page
        location.reload();
    } catch (error) {
        // Catch and handle any other errors
        console.error('An error occurred:', error);
        // Optionally, show an error message to the user here
    } 
}

  const renderBenefitText = (text) => {
    const regex = /<Link href='([^']+)'>([^<]+)<\/Link>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <Link target='_blank' key={match.index} href={match[1]} className="text-blue-500 underline">
          {match[2]}
        </Link>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (

<div
  className={`w-full max-w-xs sm:max-w-sm p-3 sm:p-8 bg-base-100 border  ${
    isActive && !isZakladni ? "shadow-effect border-0" : "border-base-200"
  } rounded-lg shadow-sm dark:bg-base-900 dark:border-base-700`}
>

  {canUpgrade  && isUpgradeModalVisible?  <UpgradeModalSubscription nameToUpgrade={name}  fromName={hasThisType}/> : ""}
  <style jsx>{`
    @keyframes shadow {
      0% {
        box-shadow: 0 0 5px rgba(131, 0, 255, 0.7);
      }
      50% {
        box-shadow: 0 0 15px rgba(131, 0, 255, 1);
      }
      100% {
        box-shadow: 0 0 5px rgba(131, 0, 255, 0.7);
      }
    }

    .shadow-effect {
      animation: shadow 3s infinite;
    }
  `}</style>

<h5 className="mb-3 sm:mb-4 text-lg sm:text-xl font-medium text-base-content dark:text-base-content">
<span style={{ marginRight: name ? "15px" : "" }}>
  {name}
</span>
  <span dangerouslySetInnerHTML={{ __html: emoji }} />
</h5>

  <div className="flex items-baseline text-base-content dark:text-base-content">
    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
      {price === 0 ? "Zdarma" : price}
    </span>
    <span className="text-lg sm:text-xl font-semibold">
      {price === 0 ? "" : "Kč"}
    </span>
    <span className="ms-1 text-lg sm:text-xl font-normal text-base-content dark:text-base-content">
      {price === 0 ? "" : "/měsíčně"}
    </span>
  </div>

  <ul role="list" className="space-y-4 sm:space-y-5 my-6 sm:my-7">
    {benefits.map((benefit, index) => {
      const [text, active] = benefit;
      return (
        <li
          key={index}
          className={`flex items-center ${
            active ? "" : "line-through decoration-gray-500"
          }`}
        >
          <svg
            className={`flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 ${
              active ? "text-[#8300ff]" : "text-gray-400 dark:text-gray-500"
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
          </svg>
          <span
            className={`text-sm sm:text-base font-normal leading-tight ms-2 sm:ms-3 ${
              active
                ? "text-base-content dark:text-base-content"
                : "text-gray-500 dark:text-gray-500"
            }`}
          >
            {renderBenefitText(text)}
          </span>
        </li>
      );
    })}
  </ul>
  
  {isPaymentModalVisible && <PaymentModal price={price} name={name} priceId={priceId} />} 
  <button
    onClick={() => {
      if(canUpgrade){
        importUpgradeModalDynamically()
      }
      if (price > 15 && !shouldDisable) {
       
        importPaymentModalDynamically(price); 
        
       
      } else if(!shouldDisable){
        setDefaultType();
      }
    }}
    type="button"
    className={`w-full btn text-sm sm:text-base ${
      isActive &&!canUpgrade
        ? "bg-[#8300ff] text-white disabled:bg-[#8300ff] disabled:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        : "bg-[#8300ff] text-white hover:bg-[#6600cc] focus:outline-none focus:ring-2 focus:ring-[#8300ff] focus:ring-opacity-50"
    } ${shouldDisable&&!canUpgrade  ? "cursor-not-allowed" : "cursor-pointer"}`}
    disabled={!canUpgrade && shouldDisable || loading} // Disable button based on condition
  >
    {loading ? (
      <span className="loading loading-spinner loading-sm"></span>
    ) : (
<span>{isActive && !canUpgrade ? "Vaše předplatné" : (canUpgrade ? "Upgradovat" : "Zvolit")}</span>
    )}
  </button>

  {showCancelLink && !isZakladni && (
    <div className="mt-4 sm:mt-5">
      <SubscriptionInfo />

    </div>
  )}
 


</div>
  );
}

export default Account;