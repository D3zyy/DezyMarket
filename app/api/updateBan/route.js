import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';

export async function POST(request) {


let data

  try {
    console.log("HIT")
    const session = await getSession();
    if (!session || !session.isLoggedIn || !session.email) {
        return new Response(JSON.stringify({
            message: "Chyba na serveru [POST] požadavek na získání informací o předplatném pro upgrade. Session nebyla nalezena"
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
     data = await request.json();


    if(session?.role?.privileges <= 1){
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.create({ data: {
              info: `Chyba na /api/updateBan - POST - (Na tento příkaz nemáte oprávnění) data: ${data} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
        return new Response(JSON.stringify({
            message: "Na tento příkaz nemáte oprávnění"
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
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
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.create({ data: {
              info: `Chyba na /api/updateBan - POST - (Již jste vyčerpal adm. pravomocí) data: ${data} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
      return new Response(JSON.stringify({
        message: 'Již jste vyčerpal administrativních pravomocí dnes'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const ban = await prisma.bans.findUnique({
        where: {id: data?.banId},
        include: {
            fromUser: {
              include: {
                role: true, // Fetches the role of the user
              },
            },
          },

    })

    if(!ban){
        return new Response(JSON.stringify({
            message: "Ban nebyl nalezen"
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
      }
// Získání aktuálního času a doby vypršení banu
const currentTime = DateTime.now().setZone('Europe/Prague').toMillis();
const bannedTillTime = new Date(ban.bannedTill).getTime();
const timeDifference = currentTime - bannedTillTime; // Rozdíl v milisekundách

// Pokud je ban vypršený více než 2 hodiny, neumožníme prodloužení
if(session?.role?.privileges <= 3){


if(ban.bannedTill){


if (timeDifference > 1000 * 3600 * 2 ) {
  return new Response(JSON.stringify({
    message: "Ban již vypršel o více než 2 hodiny, prodloužení není povoleno"
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}
}
}
      if (
        (session?.role?.privileges > ban?.fromUser?.role?.privileges && session?.userId != ban?.userId) ||

        (session?.userId === ban?.fromUser?.id && session?.userId != ban?.userId)
      ) {
        const updateBan = await prisma.bans.update({
          where: {
            id: data.banId // Identifikátor banId, podle kterého se najde záznam
          },
          data: {
            bannedFrom: data.bannedFrom, // Ujistěte se, že datetime je správně naformátován
            bannedTill: data.isPermanent ? null : data.bannedTo, // Pokud je potřeba, upravte podle typu ve vaší databázi
            reason: data.reason,
            pernament: data.isPermanent
          }
        });
        const nowww = DateTime.now()
        .setZone('Europe/Prague')
        .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        await prisma.managementActions.create({
          data: {
            fromUserId: session.userId,
            doneAt: 
              nowww,
            
            toUserId: ban?.userId,
            info: 'Update ban'
          },
        });
          
          


    } else {
      const rawIp =
    request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
    request.headers.get("x-real-ip") ||                      // Alternativní hlavička
    request.socket?.remoteAddress ||                         // Lokální fallback
    null;
  
  // Odstranění případného prefixu ::ffff:
  const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
  

  
        const dateAndTime = DateTime.now()
        .setZone('Europe/Prague')
        .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
          await prisma.create({ data: {
            info: `Chyba na /api/updateBan - POST - (Na tento příkaz nemáte oprávnění) data: ${data} `,
            dateAndTime: dateAndTime,
            userId: session?.userId,
            ipAddress:ip },
          })
        return new Response(JSON.stringify({
            message: "Na tento příkaz nemáte oprávnění"
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }
  
   
      
    return new Response(
      JSON.stringify({success: true}),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    try{
    const rawIp =
    request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
    request.headers.get("x-real-ip") ||                      // Alternativní hlavička
    request.socket?.remoteAddress ||                         // Lokální fallback
    null;
  
  // Odstranění případného prefixu ::ffff:
  const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
  

  
        const dateAndTime = DateTime.now()
        .setZone('Europe/Prague')
        .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
          await prisma.create({ data: {
            info: `Chyba na /api/updateBan - POST - (catch) data: ${data} `,
            dateAndTime: dateAndTime,
            errorPrinted: error,
            userId: session?.userId,
            ipAddress:ip },
          })

        }catch(error){}
    console.log(error)
    return new Response(
      JSON.stringify({ message: 'Chyba na serceru update banu', success: false }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
      finally {
              await prisma.$disconnect(); // Uzavřete připojení po dokončení
      }
}

export async function PUT(request) {
  let data
  try {
    console.log("HITtttttt");
    const session = await getSession();
    if (!session || !session.isLoggedIn || !session.email) {
      return new Response(JSON.stringify({
        message: "Chyba na serveru [POST] požadavek na získání informací o předplatném pro upgrade. Session nebyla nalezena"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
     data = await request.json();
  
    console.log("data:", data);
    if (session?.role?.privileges <= 1) {
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.create({ data: {
              info: `Chyba na /api/updateBan - PUT - (Na tento příkaz nemáte oprávnění) data: ${data} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
      return new Response(JSON.stringify({
        message: "Na tento příkaz nemáte oprávnění"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
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
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.create({ data: {
              info: `Chyba na /api/updateBan - PUT - (Již jste vyčerpal adm. pravomocí) data: ${data} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
      return new Response(JSON.stringify({
        message: 'Již jste vyčerpal administrativních pravomocí dnes'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const ban = await prisma.bans.findUnique({
      where: { id: data },
      include: {
        fromUser: {
          include: {
            role: true, // Fetches the role of the user
          },
        },
      },
    });
  
    console.log("bannn:", ban);
    if (!ban) {
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.create({ data: {
              info: `Chyba na /api/updateBan - PUT - ban nebyl nalezen) data: ${data} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })
      return new Response(JSON.stringify({
        message: "Ban nebyl nalezen"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Získání aktuálního času a doby vypršení banu
    const currentTime = DateTime.now().setZone('Europe/Prague').toMillis();
    const bannedTillTime = new Date(ban.bannedTill).getTime();
    const timeDifference = currentTime - bannedTillTime; // Rozdíl v milisekundách

    // Pokud je ban vypršený více než 2 hodiny, neumožníme prodloužení
    if(session?.role?.privileges <= 3){
    if(ban.bannedTill){

 
    if (timeDifference > 1000 * 3600 * 2 ) {
      return new Response(JSON.stringify({
        message: "Ban již vypršel o více než 2 hodiny, prodloužení není povoleno"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
    // Pokud je čas vypršení banu ještě v rámci tolerance 2 hodin, pokračujeme
    const dateAndTime = DateTime.now()
      .setZone('Europe/Prague')
      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
console.log("tady")
      if (
        (session?.role?.privileges > ban?.fromUser?.role?.privileges &&  session?.userId !== ban?.userId) ||
        
        (session?.userId === ban?.fromUser?.id && session?.userId !== ban?.userId)
      ) {
        console.log("taddy");
      
        const updateBan = await prisma.bans.update({
          where: {
            id: data // Identifikátor banId, podle kterého se najde záznam
          },
          data: {
            bannedTill: dateAndTime,
            pernament: false // Pokud je potřeba, upravte podle typu ve vaší databázi
          }
        });
        const nowww = DateTime.now()
        .setZone('Europe/Prague')
        .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        await prisma.managementActions.create({
          data: {
            fromUserId: session.userId,
            doneAt: 
              nowww,
            
            toUserId: ban?.userId,
            info: 'Zrušení ban'
          },
        });
      console.log("udate:", updateBan);
    } else {
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.create({ data: {
              info: `Chyba na /api/updateBan - PUT - (Na tento příkaz nemáte oprávnění) data: ${data} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })


      return new Response(JSON.stringify({
        message: "Na tento příkaz nemáte oprávnění"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    try{
              
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.create({ data: {
              info: `Chyba na /api/updateBan - PUT - (catch) data: ${data} `,
              dateAndTime: dateAndTime,
              errorPrinted: error,
              userId: session?.userId,
              ipAddress:ip },
            })

          }catch(error){}
    console.log(error);
    return new Response(
      JSON.stringify({ message: 'Chyba na serveru při update banu', success: false }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
}
}





export async function DELETE(request) {
  let data
  try {

    const session = await getSession();
    if (!session || !session.isLoggedIn || !session.email) {
      return new Response(JSON.stringify({
        message: "Chyba na serveru [POST] požadavek na získání informací o předplatném pro upgrade. Session nebyla nalezena"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }


    
     data = await request.json();
  
    console.log("data:", data);
    if (session?.role?.privileges <= 3) {
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.create({ data: {
              info: `Chyba na /api/updateBan - DELETE - (Na tento příkaz nemáte oprávnění) data: ${data} `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip },
            })

      return new Response(JSON.stringify({
        message: "Na tento příkaz nemáte oprávnění"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    const ban = await prisma.bans.delete({
      where: { id: data },
    });
  
    const nowww = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
    await prisma.managementActions.create({
      data: {
        fromUserId: session.userId,
        doneAt: 
          nowww,
        
        toUserId: ban?.userId,
        info: 'Smazaní ban'
      },
    });

      

    
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    try{
              
      const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      request.headers.get("x-real-ip") ||                      // Alternativní hlavička
      request.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.create({ data: {
              info: `Chyba na /api/updateBan - DELETE - (catch) data: ${data} `,
              dateAndTime: dateAndTime,
              errorPrinted: error,
              userId: session?.userId,
              ipAddress:ip },
            })

          }catch(error){}
    console.log(error);
    return new Response(
      JSON.stringify({ message: 'Chyba na serveru při smazaní banu', success: false }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
}
}