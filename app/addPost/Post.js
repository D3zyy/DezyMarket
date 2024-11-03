"use client";
import { useState } from 'react';
import Link from 'next/link';
import { PaymentModal, openPaymentModal } from '../typeOfAccount/modalForPayment';
import { SubscriptionInfo } from '../components/SubscriptionInfo';




export function Post({ name,emoji, benefits, hasThisType }) {
  const [loading, setLoading] = useState(false);

  function toggleSteps() {
    const typeOfPosts = document.getElementsByClassName('typeOfPosts');
   

    if (typeOfPosts.length > 0) {
      for (let i = 0; i < typeOfPosts.length; i++) {
        typeOfPosts[i].style.display = 'none'; // Skrytí jednotlivých prvků
      }
    }

    const secondStepDivs = document.getElementsByClassName('addPostSecondStep');
for (let i = 0; i < secondStepDivs.length; i++) {
    if (secondStepDivs[i].style.display === 'block') {
        localStorage.removeItem('typeOfPost'); 
        secondStepDivs[i].style.display = 'none';
    } else {
      let nameToSave = 
      name === "Topovaný" ? process.env.NEXT_PUBLIC_MEDIUM_RANK :
      name === "Topovaný+" ? process.env.NEXT_PUBLIC_BEST_RANK :
      process.env.NEXT_PUBLIC_BASE_RANK ;
        localStorage.setItem('typeOfPost', nameToSave);
        secondStepDivs[i].style.display = 'block';
    }
}
const firstStep = document.querySelector('.firstStep');
const secondStep = document.querySelector('.secondStep');

if (firstStep && secondStep) {
    // Zkontrolovat, zda první krok má data-content atribut
    if (firstStep.getAttribute('data-content') === '✓') {
        // Pokud je data-content '✓', odstranit ho a odebrat 'step-primary' ze druhého kroku
        secondStep.classList.remove('step-primary');
        secondStep.setAttribute('data-content', '1');
        firstStep.removeAttribute('data-content');
       
    } else {
        // Jinak nastavit data-content na '✓' a přidat 'step-primary' k druhému kroku
        secondStep.classList.add('step-primary');
        secondStep.setAttribute('data-content', '2');
        firstStep.setAttribute('data-content', '✓');

    }
}



  }
  const isActive = hasThisType === name;
  const isZakladni = name === process.env.NEXT_PUBLIC_BASE_RANK ;

  // Determine if the button should be disabled
  const shouldDisable = hasThisType && (isZakladni || hasThisType !== process.env.NEXT_PUBLIC_BASE_RANK );



  

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
  className={`w-full max-w-xs  p-3 sm:p-8 bg-base-100 border border-base-200 rounded-lg shadow-sm dark:bg-base-900 dark:border-base-700`}
>

  

<h5 className="mb-3 sm:mb-4 text-lg sm:text-xl font-medium text-base-content dark:text-base-content">
<span style={{ fontWeight: "bold",marginRight: name ? "15px" : "" }}>
  {name}
</span>
  <span dangerouslySetInnerHTML={{ __html: emoji }} />
</h5>



  <div style={{ position: 'relative' }}>
  {/* Conditionally render badges on top of the blurred content */}
  {!shouldDisable && (<>

    <div style={{ position: 'absolute', top: '0', left: '0', display: 'flex', gap: '8px', padding: '8px', zIndex: '10' }}>
   <Link className='btn btn-neutral btn-sm' href={"/typeOfAccount"}>Vylepšit předplatné</Link>
    </div>
    </>
  )}
  
  {/* The benefits list */}
  <ul
    role="list"
    className="space-y-4 sm:space-y-5 my-6 sm:my-7"
    style={!shouldDisable ? { filter: 'blur(4px)', opacity: '1' } : {}}
  >
    {benefits.map((benefit, index) => {
      const [text, active] = benefit;
      return (
        <li
          key={index}
          className={`flex items-center ${active ? "" : "line-through decoration-gray-500"}`}
        >
          <svg
            className={`flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 ${active ? "text-[#8300ff]" : "text-gray-400 dark:text-gray-500"}`}
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
</div>
<a
    href="#scrollHereAddPost"
    onClick={(e) => {
      e.preventDefault(); // Zabránit výchozímu chování odkazu
      if (shouldDisable) {
        toggleSteps();
        const scrollToElement = document.getElementById('scrollHereAddPost');
        if (scrollToElement) {
          scrollToElement.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll
        }
      }
    }}
    type="button"
    className={`w-full btn text-sm sm:text-base ${
      isActive
        ? "bg-[#8300ff] text-white disabled:bg-[#8300ff] disabled:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        : "bg-[#8300ff] text-white hover:bg-[#6600cc] focus:outline-none focus:ring-2 focus:ring-[#8300ff] focus:ring-opacity-50"
    } ${!shouldDisable ? "cursor-not-allowed" : "cursor-pointer"}`}
    disabled={!shouldDisable || loading} // Disable button based on condition
>
    {loading ? (
      <span className="loading loading-spinner loading-sm"></span>
    ) : (
      <span>Zvolit</span>
    )}
</a>

  
</div>
  );
}

export default Post;