import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from "luxon";

export async function POST(req) {
  let   userId, bannedFrom, bannedTo, permanent, reason 
  try {
    const session = await getSession();

    if (!session || !session.isLoggedIn || !session.email) {
      return new Response(
        JSON.stringify({
          message:
            "Chyba na serveru [POST]: Session nebyla nalezena. Nelze vytvořit ban.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await req.json();
    ({ userId, bannedFrom, bannedTo,permanent,reason } =data);

    // Zkontrolujeme, zda má uživatel práva na vytvoření banu
    if (session?.role?.privileges <= 1) {
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              data:{
              info: `Chyba na /api/createBan - POST - (Nemáte oprávněnína tento příkaz.) userIdToBeBanned: ${userId} zabanovat od: ${formatDateWithDotsWithTime(bannedFrom)}  zabanovaat do : ${formatDateWithDotsWithTime(bannedTo)} pernametní:${permanent} reason: ${reason} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,}
            })
      return new Response(
        JSON.stringify({
          message: "Na tento příkaz nemáte oprávnění.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Najdeme uživatele, který má být zabanován
    const userToBeBanned = await prisma.users.findUnique({
      where: { id: userId }, // Opraveno, aby bylo správné použití klíče
      include: { role: true }, // Zahrneme role uživatele
    });

    if (!userToBeBanned) {
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              data:{
              info: `Chyba na /api/createBan - POST - (Uživatel kterého chcete zabanovat nebyl nalezen.) userIdToBeBanned: ${userId} zabanovat od: ${formatDateWithDotsWithTime(bannedFrom)}  zabanovaat do : ${formatDateWithDotsWithTime(bannedTo)} pernametní:${permanent} reason: ${reason} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,}
            })
      return new Response(
        JSON.stringify({
          message: "Uživatel, kterého chcete zabanovat, nebyl nalezen.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  const currentDate = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat('yyyy-MM-dd');
    let numberOfActionsToday = await prisma.managementActions.count({
      where: {
        fromUserId: session.userId,
        doneAt: {
          gte: new Date(`${currentDate}T00:00:00.000Z`),
          lt: new Date(`${currentDate}T23:59:59.999Z`),
        },
      },
    });
    if(session.role.privileges  === 2 && numberOfActionsToday > 100 || session.role.privileges  === 3 && numberOfActionsToday > 200 ){
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              data:{
              info: `Chyba na /api/createBan - POST - (Vyčerpání adm. pravomocí .) userIdToBeBanned: ${userId} zabanovat od: ${formatDateWithDotsWithTime(bannedFrom)}  zabanovaat do : ${formatDateWithDotsWithTime(bannedTo)} pernametní:${permanent} reason: ${reason} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,}
            })
      return new Response(JSON.stringify({
        message: 'Již jste vyčerpal administrativních pravomocí dnes'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // Ověříme, zda má práva na zabanování uživatele s vyšším nebo stejným oprávněním
    if (userToBeBanned?.role?.privileges >= session?.role?.privileges) {
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              data:{
              info: `Chyba na /api/createBan - POST - (Nemáte oprávnění zabanovat uživatele s vyšším nebo stejným oprávněním.) userIdToBeBanned: ${userId} zabanovat od: ${formatDateWithDotsWithTime(bannedFrom)}  zabanovaat do : ${formatDateWithDotsWithTime(bannedTo)} pernametní:${permanent} reason: ${reason} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,}
            })



      return new Response(
        JSON.stringify({
          message:
            "Nemáte oprávnění zabanovat uživatele s vyšším nebo stejným oprávněním.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log(data)
    // Vytvoření banu
    const ban = await prisma.bans.create({
      data: {
        bannedFrom: bannedFrom,
        bannedTill: permanent ? null : bannedTo, // Pokud je pernamentní, bannedTo bude null
        pernament: permanent,
        reason: reason,
        fromUserId: session.userId,
        userId: userId,
      },
    });
    function formatDateWithDotsWithTime(dateInput) {
      // Zjistíme, zda je vstup instancí Date nebo ISO řetězec
      const dateString =
        dateInput instanceof Date
          ? dateInput.toISOString()
          : typeof dateInput === 'string'
          ? dateInput
          : null;
    
      // Pokud není platný vstup, vrátíme prázdný řetězec nebo chybu
      if (!dateString || !dateString.includes('T')) {
        
        return '';
      }
    
      // Rozdělíme ISO string na části (datum a čas)
      const [datePart, timePart] = dateString.split('T');
      const [year, month, day] = datePart.split('-'); // Rozdělíme datum
      const [hours, minutes] = timePart.split(':'); // Vezmeme pouze hodiny a minuty
    
      // Sestavíme výstup
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
const nowww = DateTime.now()
        .setZone('Europe/Prague')
        .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        await prisma.managementActions.create({
          data: {
            fromUserId: session.userId,
            doneAt: 
              nowww,
            
            toUserId: userId,
            info: `Ban  trvale: ${permanent} od: ${formatDateWithDotsWithTime(bannedFrom)}: do: ${formatDateWithDotsWithTime(bannedTo)} duvod: ${reason}`
          },
        });
    return new Response(
      JSON.stringify({
        message: "Ban byl úspěšně vytvořen.",
        ban: ban,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {

    try{
      
              
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              data:{
              info: `Chyba na /api/createBan - POST - (catch) userIdToBeBanned: ${userId} zabanovat od: ${formatDateWithDotsWithTime(bannedFrom)}  zabanovaat do : ${formatDateWithDotsWithTime(bannedTo)} pernametní:${permanent} reason: ${reason} `,
              errorPrinted: error,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,}
            })
          } catch(error){
    
          }

    return new Response(
      JSON.stringify({ message: "Interní chyba serveru", success: false }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}