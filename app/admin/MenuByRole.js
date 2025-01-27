
"use client"
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


function MenuByRole({supTick,reports,privileges}) {
 const [loading, setLoading] = useState(false); 
  const [activeContent, setActiveContent] = useState("Tickets"); 
  const [userPrivileges, setUserPrivileges] = useState(privileges); 
  const [allrSupTick, setAllrSupTick] = useState(supTick); 
  const [allReports, setallReports] = useState(reports); 

  const router = useRouter()
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth is zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
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
        return <div>Users</div>;
      case "Subscriptions":
        return <div>{userPrivileges > 2 && 'Předplatné' } </div>;
      case "Stats":
        return <div>Statistiky</div>;
      case "Errors":
        return <div>Chyby</div>;
      case "Tickets":
          return<>   <div className=" text-center  p-4 ">
          {allReports.length > 0 ? <> 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 mb-5 mx-auto text-orange-500 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
</svg>
<p className=" mb-2 text-sm font-medium text-gray-600">
  Počet ticketů: 
  <span className="ml-2 text-gray-500">
    {[...new Set(allReports.map(report => report.user.id))].length + allrSupTick.length}
  </span>
</p>
<p className="mb-3 text-sm font-medium text-gray-600">
  Poslední ticket:  
  <span className="ml-2 text-gray-500">
  {allReports.length > 0 ? 
  (() => {
    const latestReportDate = new Date(Math.max(...reports.map(report => new Date(report.reportedAt).getTime())));
    const isoString = latestReportDate.toISOString();
    const [year, month, day] = isoString.substring(0, 10).split('-'); // Rozebereme datum na rok, měsíc a den
    const datePart = `${parseInt(day, 10)}.${parseInt(month, 10)}.${year}`; // Odstranění nul na začátku
    const timePart = isoString.substring(11, 19); // HH:MM:SS
    return `${datePart} ${timePart}`;
  })()
  : 'Žádný report'
}
  </span>
</p>
</> : <span className="text-gray-500">  Žádné tikety nebyli nalezeny</span>}

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
        <div className="space-y-4 w-2/4 min-w-72 bg-base-200 flex flex-col p-4 rounded-lg shadow-sm">
        <div key={ticket.id} >
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
      case "Settings":
        return <div>{userPrivileges > 2 && 'Nastavení' }</div>;
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
          <li
            className={`${
              activeContent === "Settings" ? "text-black font-bold" : ""
            }`}
            onClick={() => setActiveContent("Settings")}
          >
            <a>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>

</a>
          </li>
          </>}
        </ul>
      </div>
      <div className="flex justify-center gap-4 p-2 flex-col items-center">{renderContent()}</div>
    </>
  );
}

export default MenuByRole;