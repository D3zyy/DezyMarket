"use client";

import Link from 'next/link';
import { PaymentModal, openPaymentModal } from './modalForPayment';

export function Account({ name, price, priceId, benefits, hasThisType }) {
  const isActive = hasThisType === name;
  const isZákladní = name === 'Základní';
  const hasOtherActive = hasThisType && hasThisType !== 'Základní';
  
  // Determine if the current button should be enabled or disabled
  const shouldDisable = isZákladní || hasOtherActive || (isActive && !isZákladní);

  // Determine if the "Zrušit předplatné" link should be shown
  const showCancelLink = isActive && !isZákladní;

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
    <div className="w-full max-w-sm p-4 bg-base-100 border border-base-200 rounded-lg shadow-sm sm:p-8 dark:bg-base-900 dark:border-base-700">
      <h5 className="mb-4 text-xl font-medium text-base-content dark:text-base-content">{name}</h5>
      <div className="flex items-baseline text-base-content dark:text-base-content">
        <span className="text-5xl font-extrabold tracking-tight">{price === 0 ? "Zdarma" : price}</span>
        <span className="text-xl font-semibold">{price === 0 ? "" : "Kč"}</span>
        <span className="ms-1 text-xl font-normal text-base-content dark:text-base-content">{price === 0 ? "" : "/měsíčně"}</span>
      </div>
      <ul role="list" className="space-y-5 my-7">
        {benefits.map((benefit, index) => {
          const [text, active] = benefit;
          return (
            <li key={index} className={`flex items-center ${active ? '' : 'line-through decoration-gray-500'}`}>
              <svg
                className={`flex-shrink-0 w-4 h-4 ${active ? 'text-[#8300ff]' : 'text-gray-400 dark:text-gray-500'}`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
              </svg>
              <span className={`text-base font-normal leading-tight ${active ? 'text-base-content dark:text-base-content' : 'text-gray-500 dark:text-gray-500'} ms-3`}>
                {renderBenefitText(text)}
              </span>
            </li>
          );
        })}
      </ul>
      <button
        onClick={() => openPaymentModal(price)} // Pass the price to the function
        type="button"
        className={`w-full btn ${isActive ? 'bg-[#8300ff] text-white disabled:bg-[#8300ff] disabled:text-white disabled:opacity-50 disabled:cursor-not-allowed' : 'bg-[#8300ff] text-white hover:bg-[#6600cc] focus:outline-none focus:ring-2 focus:ring-[#8300ff] focus:ring-opacity-50'} ${shouldDisable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        disabled={shouldDisable} // Disable button based on condition
      >
        {isActive ? 'Vaše předplatné' : 'Zvolit'}
      </button>
      {!isZákladní && showCancelLink && (
        <Link href="/zrusit-predplatne" className="block mt-4 text-red-500 underline">
          Zrušit předplatné
        </Link>
      )}
      <PaymentModal price={price} name={name} priceId={priceId} />
    </div>
  );
}

export default Account;