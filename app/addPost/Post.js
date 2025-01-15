"use client";
import { useState } from 'react';
import Link from 'next/link';





export function Post({ allTops,priority,allowedTops,name,emoji, benefits, hasThisType }) {
  const [loading, setLoading] = useState(false);
  console.log("Všechny tops:", allTops);
  console.log("Filtrované dovolené tops:", allowedTops);
  let result
  if (Array.isArray(allowedTops)) {

// Zajistíme, že allowedTops je pole, pokud není, nastavíme prázdné pole
const allowedArray = Array.isArray(allowedTops) ? allowedTops : [];

// Získáme seznam povolených ID
const allowedIds = new Set(allowedArray.map(top => top.id));

// Vytvoříme třetí pole s přidaným klíčem `allowed`
 result = allTops.map(top => ({
  ...top,
  allowed: allowedIds.has(top.id)
}));





  }


  const [isOpen, setIsOpen] = useState(false);
  let canTop = allowedTops

  const [selectedColor, setSelectedColor] = useState(() => {
    // Zajistíme, že allowedTops je skutečně pole
    if (Array.isArray(allowedTops) && allowedTops.length > 0) {
      // Najděte top s největším numberOfMonthsToValid při inicializaci
      const defaultTop = allowedTops.length > 0 
      ? allowedTops.reduce((max, item) => 
          item.numberOfMonthsToValid > max.numberOfMonthsToValid ? item : max
        )
      : null; // nebo použij výchozí hodnotu podle potřeby
    

      
      // Vraťte barvu výchozího topu pro inicializaci stavu
      return defaultTop.color;
    }
  
    // Pokud allowedTops není pole nebo je prázdné, nastavíme výchozí hodnotu
  
  });
  const getDefaultTop = () => {
    return allowedTops.length > 0
    ? allowedTops.reduce((max, item) => 
        item.numberOfMonthsToValid > max.numberOfMonthsToValid ? item : max
      )
    : null; // nebo výchozí hodnota, např. {}
};
const [selectedTop, setSelectedTop] = useState(allowedTops? getDefaultTop(): name);
//console.log(allowedTops)

function toggleSteps() {
  const typeOfPosts = document.getElementsByClassName('typeOfPosts');

  if (typeOfPosts.length > 0) {
    // Přepne viditelnost na základě aktuálního stavu
    for (let i = 0; i < typeOfPosts.length; i++) {
      if (typeOfPosts[i].style.display === 'none') {
        typeOfPosts[i].style.display = '';
      } else {
        typeOfPosts[i].style.display = 'none';
      }
    }
  }

  const secondStepDivs = document.getElementsByClassName('addPostSecondStep');
for (let i = 0; i < secondStepDivs.length; i++) {
  if (secondStepDivs[i].style.display === 'block') {
      localStorage.removeItem('typeOfPost'); 
      secondStepDivs[i].style.display = 'none';
  } else {

      localStorage.setItem('typeOfPost', selectedTop?.name ? selectedTop?.name: name);
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
      secondStep.setAttribute('data-content', '2');
      firstStep.removeAttribute('data-content');
     
  } else {
      // Jinak nastavit data-content na '✓' a přidat 'step-primary' k druhému kroku
      secondStep.classList.add('step-primary');
      secondStep.setAttribute('data-content', '2');
      firstStep.setAttribute('data-content', '✓');

  }
}



}
  const isActive = priority != 1 && canTop && priority != 1;
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
  className={`w-full max-w-xs  p-3 sm:p-8 bg-base-100 border border-base-200 rounded-lg shadow-sm dark:bg-base-900 dark:border-base-700  `}
 
>

  

<h5 className="mb-3 sm:mb-4 text-lg sm:text-xl font-medium text-base-content dark:text-base-content">
  <span
    style={{
      fontWeight: "bold",
      marginRight: name ? "15px" : "",
    }}
    className="flex items-center space-x-2" // space-x-2 pro mezery mezi prvky
  >
    {canTop ? (
      <div className="relative flex items-center" style={{ flexShrink: 0 }}>
        {/* Tlačítko pro zobrazení aktuálního výběru */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-auto mr-2 text-left whitespace-nowrap" // whitespace-nowrap pro zajištění, že se text nezalomí
          style={{
            color: selectedTop?.color,
          }}
        >
          <span
            className="mr-2"
            dangerouslySetInnerHTML={{ __html: selectedTop?.emoji }}
          />
          {selectedTop?.name}
        </button>

        {/* Dropdown seznam */}
        {isOpen && (
          <div className="absolute z-10 w-full  min-w-48  bg-base-200 rounded-md  shadow-lg">
{result
  .sort((a, b) => b.numberOfMonthsToValid - a.numberOfMonthsToValid) // Řazení sestupně podle numberOfMonthsToValid
  .map((item) => (
    <div
      key={item.id}
      onClick={() => {
        if(item.allowed){
          setSelectedTop(item);
          setSelectedColor(item.color);
          setIsOpen(false); // Zavřít dropdown po výběru
        }
       
      }}
      className="px-3 py-1.5 cursor-pointer flex items-center text-sm"
      style={{
        color: item.allowed&& item.color ,
      }}
    >
      <span className="mr-2 flex items-center">
  {!item.allowed && (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6  mr-3"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  )}
  {item.allowed && (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-green-500  mr-3">
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>
)}
<span
  style={{ filter: !item.allowed ? 'blur(1px)' : '' }}
  dangerouslySetInnerHTML={{ __html: item.emoji }}
/>
</span>

   <span className={`${!item.allowed ? 'text-[#b0b0b0]' : ''}`}   style={{ filter: !item.allowed ? 'blur(1px)' : '' }}>{item.name}</span>   
    </div>
  ))}
            
          </div>
          
        )}
        <svg   onClick={() => setIsOpen(!isOpen)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
</svg>

      </div>
    ) : (
      name
    )}



    {/* If `hasThisType` doesn't match anything, display all emojis */}
    {!hasThisType || !emoji.some(item => item.name === hasThisType) ? (
      emoji.map((item, index) => (
        <span className="ml-3" key={index} dangerouslySetInnerHTML={{ __html: item.emoji }} />
      ))
    ) : null}
  </span>
</h5>



  <div style={{ position: 'relative' }}>
  {/* Conditionally render badges on top of the blurred content */}
  {!shouldDisable && (<>

    <div style={{ position: 'absolute', top: '0', left: '0', display: 'flex', gap: '8px', padding: '8px', zIndex: '10' }}>
   <Link className='btn btn-neutral btn-sm' href={"/typeOfAccount"}>Vylepšit předplatné<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
</svg>
</Link>
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
      ? "disabled:bg-[#8300ff] disabled:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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