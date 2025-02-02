
"use client"
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { DateTime } from "luxon";

function MenuByRole({errorsfromServer,poststats,subscriptionStats,topsWithCounts,usersStats,allTops,supTick,reports,privileges,subscTypes}) {
 const [loading, setLoading] = useState(false); 
 const [isLoadingSearch, setIsLoadingSearch] = useState(false); 
 const [IsLoadingTop, setIsLoadingTop] = useState(false); 
 const [IsLoadingPerk, setIsLoadingPerk] = useState(false); 
 const [IsLoadingPrice, setIsLoadingPrice] = useState(false); 
  const [activeContent, setActiveContent] = useState("Tickets"); 
  const [userPrivileges, setUserPrivileges] = useState(privileges); 
  const [allrSupTick, setAllrSupTick] = useState(supTick); 
  const [allReports, setallReports] = useState(reports); 
  const [searchInfo, setSearchInfo] = useState(null); 
  const [subTypes, setSubTypes] = useState(JSON.parse(subscTypes)); 
  const [foundUsers, setFoundUsers] = useState([]); 

  const router = useRouter()
  const searchTimeout = useRef(null); // useRef pro zajištění, že timeout je uchován mezi renderováními

  const searchUser = async (info) => {
    if(info.length   > 0){

   
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current); // Pokud je aktivní timeout, zrušíme ho
    }

    searchTimeout.current = setTimeout(async () => { // Spustí se až po určitém zpoždění
      setIsLoadingSearch(true); // Nastavení loading stavu na true
      try {
        
        const response = await fetch('/api/getUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            info: info,
          }),
        });

        const result = await response.json();
        setFoundUsers(result?.users);
       

      } catch (error) {
        console.error('Chyba získávání uživatele', error);
      } finally {
        setIsLoadingSearch(false); // Po dokončení nebo chybě, nastavíme loading na false
      }
    }, 1000); // 500 ms zpoždění
  } else {
   
  }
  };

  const changePrice = async (accTypeId,newPrice) => {
   
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current); // Pokud je aktivní timeout, zrušíme ho
    }

    searchTimeout.current = setTimeout(async () => { // Spustí se až po určitém zpoždění
  
      setIsLoadingPrice(true); // Nastavení loading stavu na true
      try {
        
        const response = await fetch('/api/changePrice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accTypeId: accTypeId,
            newPrice: newPrice,

          }),
        });

        router.refresh()
       

      } catch (error) {
        console.error('Chyba získávání uživatele', error);
      } finally {
        setIsLoadingPrice(false); // Po dokončení nebo chybě, nastavíme loading na false
      }
    }, 3000); 
 
  };



  const changePerk = async (value,perkId,idOfAcc) => {
   
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current); // Pokud je aktivní timeout, zrušíme ho
    }

    searchTimeout.current = setTimeout(async () => { // Spustí se až po určitém zpoždění
  
      setIsLoadingPerk(true); // Nastavení loading stavu na true
      try {
        
        const response = await fetch('/api/changePerk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            perkId: perkId,
            newValue: value,
            accId : idOfAcc
          }),
        });

        router.refresh()
       

      } catch (error) {
        console.error('Chyba získávání uživatele', error);
      } finally {
        setIsLoadingPerk(false); // Po dokončení nebo chybě, nastavíme loading na false
      }
    }, 1500); // 500 ms zpoždění
 
  };


  const changePerkVisibility = async (visibility,perkId,idOfAcc) => {
   
      setIsLoadingPerk(true); // Nastavení loading stavu na true
      try {
        
        const response = await fetch('/api/changeVisibilityPerk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            perkId: perkId,
            visibility: visibility,
            accId : idOfAcc
          }),
        });
       window.location.reload()
       

      } catch (error) {
        console.error('Chyba získávání uživatele', error);
      } finally {
        setIsLoadingPerk(false); // Po dokončení nebo chybě, nastavíme loading na false
      }
  
 
  };

  const changeTopVisibility = async (visibility,topId) => {
   
    setIsLoadingTop(true); // Nastavení loading stavu na true
    try {
      
      const response = await fetch('/api/changeVisibilityTop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visibility: visibility,
          topId : topId
        }),
      });

     

    } catch (error) {
      console.error('Chyba získávání uživatele', error);
    } finally {
      setIsLoadingTop(false); // Po dokončení nebo chybě, nastavíme loading na false
    }


};
const changeTopSMonths = async (newMo,topId) => {
  console.log("POuštím")
  if (searchTimeout.current) {
    clearTimeout(searchTimeout.current); // Pokud je aktivní timeout, zrušíme ho
  }

  searchTimeout.current = setTimeout(async () => { // Spustí se až po určitém zpoždění

  setIsLoadingTop(true); // Nastavení loading stavu na true
  try {
    
    const response = await fetch('/api/changeNuberOfMonthsTop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nbrMnth: newMo,
        topId : topId
      }),
    });

   

  } catch (error) {
    console.error('Chyba získávání uživatele', error);
  } finally {
    setIsLoadingTop(false); // Po dokončení nebo chybě, nastavíme loading na false
  }
}, 3000); 

};





const formatDate = (date) => {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Měsíce jsou od 0
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

  const setDone = async (ticketId,type) => {
  
    setLoading(true)
    try {
     let  response =  await fetch("/api/setDoneTicket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticketId, type: type }),
      });
      let result = await response.json();
      window.location.reload()
     
    } catch (error) {
      console.log("1")
    } 


   }


  
  const renderContent = () => {
    switch (activeContent) {
      case "Users":
        return <div className="min-w-72"> 
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-12 mb-5 mx-auto text-blue-500 font-bold"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                />
              </svg>
          
          
          <label className="input  mx-auto input-bordered flex items-center gap-2">
          <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4 opacity-70">
          <path
            fillRule="evenodd"
            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
            clipRule="evenodd" />
        </svg>
        <input 
        autoFocus={true}
        disabled={isLoadingSearch}
        onChange={(e) => {
          const value = e.target.value;
          if (value.trim() !== '') {
            searchUser(value);
          }
        }}
        type="text" 
        className="grow" 
        placeholder="Uživatel.." 
      />
        
      </label>
      {foundUsers.length > 0 && <>   
      <div className="bg-base-200 mt-6 p-4 text-center rounded-lg  ">
        <div className="">
        

{foundUsers.map((user) => {
  return (
    <div key={user.id} className="flex flex-row gap-6 mt-3 mb-3">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${user.privileges == 2 ? 'text-red-500' : user.privileges == 3 ? 'text-yellow-500' : user.privileges == 4 ? 'text-green-500' : ''}`}
>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>
      <Link className="underline" href={`/user/${user.id}`}>{user.fullName}</Link>
    </div>
  );
})}

        </div>
      

    
      </div>
      </>}
      
      </div>;
      case "Subscriptions":
        return <div>
          
          
          {userPrivileges > 2 && <> 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className=" text-purple-500 size-12 mx-auto mb-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
</svg>

        <div className="flex flex-col md:flex-row gap-6 ">
      {subTypes.map((type,indexikk) => (
        <div
          key={indexikk}
          className="p-6  bg-base-100 border  border-base-200 rounded-lg shadow-sm"
        >
          {/* Subscription header */}
          <div className="flex  justify-between mb-4">
            <div className="text-xl font-semibold items-center justify-center">
            {type.name}
              {type.emoji ? (
                <span className="ml-2" dangerouslySetInnerHTML={{ __html: type.emoji }} />
              ) : (
                <></>
              )}
            </div>
            <div className="text-lg text-gray-500 flex items-center ">
              {type.activePrice === 0 ? "Zdarma" :  <>  

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
<input type="number" onChange={(e) => changePrice(type.id,e.target.value)} disabled={IsLoadingPrice} className="input max-w-16" defaultValue={type.activePrice} name="" id="" />
Kč

                </>}
            </div>
          </div>
          {/* Perks list */}
          <ul className="space-y-2">
            {type.perks.map((perk) => (
              
              
              <li
                key={perk.id}
                className={`flex items-center ${
                  perk.valid ? "" : "text-gray-400 "
                }`}
              >
                <span className="mr-2">
                 
                  <svg
            className={`flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4  ${
              perk.valid ? "text-[#8300ff]" : "text-gray-400 dark:text-gray-500"
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
          </svg>
                </span>
   
       
                <input  disabled={IsLoadingPerk} onChange={(e) => changePerk(e.target.value,perk.id,type.id)}  defaultValue={perk.name}  type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
{perk.valid ? <svg onClick={ () => changePerkVisibility(false,perk.id,type.id)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
</svg>
 : <svg onClick={ () => changePerkVisibility(true,perk.id,type.id)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ml-2">
 <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>
}
              </li>
              
             
            ))}
          </ul>
        </div>
      ))}


    </div >
    {allTops.map((top,idxxk) => (<>
      <div 
          key={idxxk}
          className="p-6  mt-4 bg-base-100 border  border-base-200 rounded-lg shadow-sm"
        >
          {/* Subscription header */}
          <div className="flex   mb-4">
  {top.name}
  <span className="ml-4" dangerouslySetInnerHTML={{ __html: top.emoji }}></span>

  </div>
  Počet měsíců na aktivaci: <input disabled={IsLoadingTop}  onChange={(e) => { changeTopSMonths(e.target.value,top.id)}}  className="input max-w-14" defaultValue={top.numberOfMonthsToValid} type="number" />
<div></div>
<div className="flex gap-4">
Aktivní : <input onChange={(e) => { changeTopVisibility(e.target.checked,top.id)}} disabled={IsLoadingTop} defaultChecked={!top.hidden} className="checkbox ml-1" type="checkbox" name="" id="" />
</div>

</div>


</>))}
        
        
        </> } </div>;
      case "Stats":
        return <> <div>
          
         < svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-12 text-yellow-500 mx-auto mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>

<div>
          <div className="stats shadow stats-vertical lg:stats-horizontal">
  <div className="stat">
    <div className="stat-figure text-yellow-500">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
</svg>

    </div>
    <div className="stat-title">Celkově uživatelů</div>
    <div className="stat-value">{usersStats.numberOfAllUsers}</div>
   
  </div>

  <div className="stat">
    <div className="stat-figure text-secondary">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-yellow-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
</svg>

    </div>
    <div className="stat-title">Dnes registrováno</div>
    <div className="stat-value">{usersStats.numberOfRegistredUsrToday}</div>
    <div className="stat-desc">{usersStats.numberOfRegistredUsrYestrday > usersStats.numberOfRegistredUsrToday ? '↘︎ +' : '↗︎ +'}{usersStats.numberOfRegistredUsrYestrday} ({usersStats.percentChangeTodayVsYesterday}) (včera)</div>
  </div>

  <div className="stat">
    <div className="stat-figure text-secondary">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-yellow-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
</svg>

    </div>
    <div className="stat-title">Tento měsíc registrováno</div>
    <div className="stat-value">{usersStats.numberOfRegistredUsrThisMonth}</div>
    <div className="stat-desc">{usersStats.numberOfRegistredUsrLastMonth > usersStats.numberOfRegistredUsrThisMonth ? '↘︎ +' : '↗︎ +'}{usersStats.numberOfRegistredUsrLastMonth} ({usersStats.percentChangeThisMonthVsLastMonth}) (Minulý měsíc)</div>
  </div>
</div>

</div>



 

<div className="mx-auto flex items-center justify-center">


<div className="stats shadow stats-vertical lg:stats-horizontal mt-5 ">
  <div className="stat">
    <div className="stat-figure text-yellow-500">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-yellow-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
</svg>

    </div>
    <div className="stat-title">Celkově příspěvků</div>
    <div className="stat-value">{poststats.numberOfAllPosts}</div>
    <div className="stat-desc">Aktivních příspěvků: {poststats.numberOfAllActivePosts}</div>
   
  </div>

  <div className="stat">
    <div className="stat-figure text-secondary">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-yellow-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
</svg>


    </div>
    <div className="stat-title">Dnes příspěvků</div>
    <div className="stat-value">{poststats.numberOPostsToday}</div>
    <div className="stat-desc">+{poststats.numberOPostsYestrday} (včera)</div>
  </div>

  <div className="stat">
    <div className="stat-figure text-secondary">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-yellow-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
</svg>

    </div>
    <div className="stat-title">Tento měsíc příspěvků</div>
    <div className="stat-value">{poststats.numberOPostsThisMonth}</div>
    <div className="stat-desc">+{poststats.numberOPostsLastMonth} (minulý měsíc)</div>
  </div>
</div>

</div>








<div className="mt-6 flex items-center justify-center">
  <div className="stats shadow mt-2 stats-vertical lg:stats-horizontal">
    {Object.keys(subscriptionStats).map((key) => {
      const stat = subscriptionStats[key]; // Get the data for each subscription type
      return (
        <div className="stat" key={key}>
         
          <div className="stat-title">
          <span className="mr-2">{stat.name}</span>   {stat.emoji ? <span dangerouslySetInnerHTML={{ __html: stat.emoji }} /> : null}
          </div>
          <div className="stat-value">
            <div className="flex items-center">
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
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              {stat.numberOfAllUsers}
            </div>
          </div>
         
          <div className="stat-desc flex items-center gap-1">

          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/>
</svg>

            Z toho darovaných: {stat.numberOfGifted}
          </div>
          <div className="stat-desc flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
  <path strokeLinecap="round" strokeLinejoin="round" d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
Počet upgradů : {stat.numberOfUpgrades}
          </div>

          <div className="stat-desc flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
  <path strokeLinecap="round" strokeLinejoin="round" d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
            Počet upgradů  tento měsíc: {stat.numberOfThisMonthUpgrades}
          </div>

          <div className="stat-desc">↗︎ Dnes: +{stat.numberOfToday}</div>
          <div className="stat-desc">↗︎ Včera: +{stat.numberOfYesterday}</div>
          <div className="stat-desc">↗︎ Tento měsíc: +{stat.numberOfThisMonth}</div>
          <div className="stat-desc">↗︎ Minulý měsíc: +{stat.numberOfLastMonth}</div>
          <div className="stat-desc">
            ↘︎ Zrušení na konci měsíce: {stat.numberOfScheduledToCancel}
          </div>
          <div className="stat-desc">
            ↘︎ Zrušeno minulý měsíc: {stat.numberOfEndedLastMonth}
          </div>
        </div>
      );
    })}
  </div>

  
</div>





        </div>
<div className="flex lg:flex-row gap-2 flex-col"> 
{topsWithCounts.map((top,idxxk) => (<>
      <div 
          key={idxxk}
          className="border-2  border-solid  rounded-[12px] p-[6px_10px] inline-flex flex-col items-center justify-center m-[5px] w-[120px] opacity-100  bg-[#f5f5f5] text-[#757575] dark:border-[#2a2828] dark:bg-[#333333] dark:text-[#9b9a9a] dark:opacity-90"
        >

<div
            dangerouslySetInnerHTML={{ __html: top.emoji }}
            style={{
              fontSize: '18px',
              marginBottom: '5px'
            
            }}
          />
   
         
          <div
            style={{
              fontSize: '12px',
              textAlign: 'center',
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "4px"
            }}
          >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>
    {top.userCount} <br />
          </div>
        
       
   
      












        
          </div>

       
       
        </>))}
        </div>


</> ;
      case "Errors":
        return <div>
          <div className="flex flex-col "> 
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 mx-auto text-red-500 font-bold mb-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
</svg>
           
{errorsfromServer
  .sort((a, b) => new Date(b.dateAndTime) - new Date(a.dateAndTime)) // Seřazení od nejnovějšího
  .map((error) => {
    return (
    <div className=" mb-4 bg-base-300 min-w-96 rounded-lg max-w-[800px] break-all p-4" key={error.id}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mx-auto text-red-500 font-bold mb-2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
</svg>
<div className="flex flex-row gap-4 mb-2">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
</svg>
{error?.info}
</div>


{error?.errorPrinted  && <> 
<div className="flex flex-row gap-4 mb-2">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
</svg>
{error?.errorPrinted}
</div>

</>}
<div className="flex flex-row gap-4 mb-2">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
</svg>

{ formatDate( error?.dateAndTime)}
</div>
<div className="flex flex-row gap-4 mb-2">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
</svg>
 

{  error?.ipAddress}
</div>
{error?.userId && 
<div className="flex flex-row gap-4 mb-2">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>

 
<Link target="_blank" className="underline" href={`user/${error?.userId}`}>{error?.userId}</Link>

</div>
}
    </div>

  );
})}
            
              </div>




        </div>;
      case "Tickets":
          return<>   <div className=" text-center  p-4 ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 mb-5 mx-auto text-orange-500 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
</svg>
          {(allReports.length >  0 || allrSupTick.length> 0)? <> 
            
<p className=" mb-2 text-sm font-medium text-gray-600">
  Počet ticketů: 
  <span className="ml-2 text-gray-500">
    {[...new Set(allReports.map(report => report?.user?.id))].length + allrSupTick?.length}
  </span>
</p>
<p className="mb-3 text-sm font-medium text-gray-600">
  Nejnovejší ticket:
  <span className="ml-2 text-gray-500">
    {(allReports?.length >  0 ) ? 
      (() => {
        // Finding the latest ticket by 'doneAt' (compare with reportedAt)
        const latestReportDate = new Date(Math.max(...allReports.map(report => new Date(report?.reportedAt).getTime())));

        // Check if there's a newer ticket (doneAt) than the latest report
        const latestTicketDate = new Date(Math.max(...allrSupTick.map(ticket => new Date(ticket?.doneAt).getTime())));

        // If the latest ticket's doneAt is more recent than the latest report's reportedAt, use doneAt
        const finalDate = latestTicketDate > latestReportDate ? latestTicketDate : latestReportDate;

        const isoString = finalDate.toISOString();
        const [year, month, day] = isoString.substring(0, 10).split('-'); // Split date into year, month, day
        const datePart = `${parseInt(day, 10)}.${parseInt(month, 10)}.${year}`; // Remove leading zeros
        const timePart = isoString.substring(11, 19); // HH:MM:SS
        return `${datePart} ${timePart}`;
      })()
    : <>
    {
  allrSupTick.length > 0 && (
    <>
      {
        // Find the latest doneAt and convert it to a readable string
        new Date(
          allrSupTick.reduce((latest, current) =>
            new Date(latest.doneAt) > new Date(current.doneAt) ? latest : current
          ).doneAt
        ).toLocaleString('cs-CZ') // Ensure consistent format on both client and server
      }
    </>
  )
}
  </>
    
    }
  </span>
</p>
</> : <span className="text-gray-500"> {allrSupTick?.length < 1 && <> <div className="flex flex-row gap-4"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>
 Žádné tikety nebyli nalezeny</div> </> } </span>}

</div>

          <div className="space-y-4 w-2/4 min-w-72">
  {Object.values(
    allReports.reduce((groups, report) => {
      const postId = report.postId;  // Sesbíráme reporty podle postId
      if (!groups[postId]) {
        groups[postId] = {
          post: report.post,  // Uchováme data o příspěvku
          reports: [],
        };
      }

      // Seskupíme reporty podle uživatele a příspěvku
      const userId = report.user.id;
      if (!groups[postId].reports[userId]) {
        groups[postId].reports[userId] = {
          user: report.user,  // Uchováme data o uživatele
          reasons: [],
          reportedAt: report.reportedAt,  // Uchováme čas prvního reportu uživatele
          topic: report.topic, // Uchováme téma (pokud existuje)
        };
      }
      groups[postId].reports[userId].reasons.push(report.reason);  // Přidáme důvod reportu

      return groups;
    }, {})
  ).map((group, index) => (
    <div key={index} className="flex flex-col space-y-4 bg-base-200 p-4 rounded-lg shadow-sm">
            <div className="badge badge-lg  font-bold">Report</div>
      <div className="flex items-center space-x-4">

      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-600 flex-shrink-0" >
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
</svg>

      
        <Link
          href={`/post/${group.post.id}`}  // Odkaz na příspěvek
          className="underline hover:underline"
          target="_blank"
        >
          {group.post.name} {/* Název příspěvku */}
        </Link>

    
        <button
  disabled={loading}
  onClick={() => setDone(group.post.id, 'report')}
  className="btn-sm btn bg-slate-300 dark:bg-neutral break-all"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
  <span className="hidden sm:inline">Vyřešeno</span>
</button>

        
      </div>

      <div className="space-y-4">
        {Object.values(group.reports).map((userReport, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-base-100">
            <div className="flex items-center space-x-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 text-gray-600 flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              <Link
                href={`/user/${userReport.user.id}`}  // Odkaz na uživatele
                className="underline hover:underline"
                target="_blank"
              >
                {userReport.user.fullName} {/* Jméno uživatele */}
              </Link>
            </div>

            {/* Zobrazení data a času prvního reportu tohoto uživatele */}
            <div className="flex items-center space-x-4 whitespace-nowrap flex-shrink-0 mt-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-orange-600  flex-shrink-0 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

              <span className="text-sm text-gray-600 break-all">
                {new Date(userReport.reportedAt).toISOString()
                  .replace('T', ' ') // Nahrazení 'T' mezerou pro lepší formát
                  .substring(0, 10) // Získá datum (YYYY-MM-DD)
                  .split('-') // Rozdělí na jednotlivé části (rok, měsíc, den)
                  .map((item, index) => index !== 0 ? parseInt(item, 10) : item) // Převede den a měsíc na čísla bez přední nuly
                  .reverse() // Obrátí pořadí na [den, měsíc, rok]
                  .join('.') // Spojí do požadovaného formátu s tečkou a mezerou
                  + ' ' + new Date(userReport.reportedAt).toISOString().substring(11, 19)} {/* Část pro čas */}
              </span>
            </div>

            {/* Pokud je k dispozici topic (téma), zobrazíme ho */}
            {userReport.topic && (
              <div className="flex flex-row gap-4  break-all flex-shrink-0 mb-4 ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-orange-600 flex-shrink-0 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
</svg>

                <span className="text-sm text-gray-600">{userReport.topic}</span>
              </div>
            )}

            {/* Důvody reportu */}
            {userReport.reasons.map((reason, reasonIdx) => (
              <div key={reasonIdx} className="space-y-2">
                <p className="font-semibold text-red-500">{reason}</p>  {/* Důvod reportu */}
              </div>
            ))}

          
          </div>
        ))}
      </div>
    </div>
  ))}
</div>


      {allrSupTick.map((ticket) => (
        <div key={ticket.id}   className="space-y-4 w-2/4 min-w-72 bg-base-200 flex flex-col p-4 rounded-lg shadow-sm">
        <div >
          <div className="flex flex-row gap-4 items-center">
          <div className="badge badge-lg border-2    font-bold">
            Support
          </div>
          <button
  disabled={loading}
  onClick={() => setDone(ticket.id, 'support')}
  className="btn-sm btn bg-slate-300 dark:bg-neutral break-all"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
  <span className="hidden sm:inline">Vyřešeno</span>
</button>
          </div>
         
          <div className="flex flex-row gap-4 mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 flex-shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25"
              />
            </svg>
            {ticket.email}
          </div>
          <div className="flex flex-row gap-4 mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-orange-600 flex-shrink-0">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

           
            {formatDate(ticket.doneAt)}
          </div>
          <div className="flex flex-row gap-4 mt-4">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-orange-600 flex-shrink-0 break-all"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
            {ticket.text}
          </div>
          <div className="flex flex-row gap-4 mt-4">
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
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
              />
            </svg>
            {ticket.ipOfusrOnsup.value}
          </div>
        </div>
        </div>
      ))}




          
          </> 
     
    }
  };
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
</svg>

  return (
    <>
      <div className="flex justify-center gap-4 p-2">
        <ul className="menu menu-horizontal bg-base-200 rounded-box border-2 border-black border-dashed">
        <li
            className={`${
              activeContent === "Tickets" ? "text-orange-500 font-bold" : ""
            }`}
            onClick={() => setActiveContent("Tickets")}
          >
            <a><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
</svg>

</a>
          </li>
          <li
            className={`${
              activeContent === "Users" ? "text-blue-500 font-bold" : ""
            }`}
            onClick={() => setActiveContent("Users")}
          >
            <a><svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                />
              </svg></a>
          </li>
          {userPrivileges > 2 && <>   
          <li
            className={`${
              activeContent === "Subscriptions" ? "text-purple-500 font-bold" : ""
            }`}
            onClick={() => setActiveContent("Subscriptions")}
          >
            <a>   <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                />
              </svg></a>
          </li>
          </>} 
          <li
            className={`${
              activeContent === "Stats" ? "text-yellow-500 font-bold" : ""
            }`}
            onClick={() => setActiveContent("Stats")}
          >
            <a><svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg></a>
          </li>
          <li
            className={`${
              activeContent === "Errors" ? "text-red-500 font-bold" : ""
            }`}
            onClick={() => setActiveContent("Errors")}
          >
            <a><svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
                />
              </svg></a>
          </li>
          {userPrivileges > 2 && <>  
         
          </>}
        </ul>
      </div>
      <div className="flex justify-center gap-4 p-2 flex-col items-center">{renderContent()}</div>
    </>
  );
}

export default MenuByRole;