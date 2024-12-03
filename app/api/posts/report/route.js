import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';


export async function POST(req) {
    try {
      console.log("tady")
      const session = await getSession();
    
      if (!session || !session.isLoggedIn || !session.email) {
        return new Response(JSON.stringify({
          message: "Chyba na serveru [POST] požadavek na report příspěvku. Session nebyla nalezena ",
          success: false
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const enoughRep = await checkIfEnougReports(session.userId)
      if(enoughRep){
        return new Response(JSON.stringify({
          message: "Dejte si chvíli pauzu než nahlásite další příspěvek..",
          success: false
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const reasons = [
        'Nesprávná kategorie',
        'Nesprávná sekce',
        'Nevhodný inzerát',
        'Podvodný inzerát',
        'Nevhodné fotografie',
        'Nevhodný obsah',
        'Jiné',
    ];
      const data = await req.json();
    console.log("data od klienta:",data)
      if (data.extraInfo.length > 200) {
        return new Response(JSON.stringify({
            message: "Dodatečné informace jsou moc dlouhé.",
            success: false
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      } 
      if (data.reasons.length < 1) {
        return new Response(JSON.stringify({
            message: "Žádný z důvodů nebyl nalezen",
            success: false
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      } 



      const invalidReasons = data.reasons.filter(reason => !reasons.includes(reason));

      if (invalidReasons.length > 0) {
        return new Response(JSON.stringify({
            message: "Nějaký z důvodů není platný",
            success: false
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      } 
      console.log("id příspěvku:",data.postId)
      // Fetch the post and the creator's role
      const post = await prisma.Posts.findUnique({
        where: { id: data.postId },
      });
  
      if (!post) {
        return new Response(JSON.stringify({
          message: "Příspěvek nenalezen",
          success: false
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // If the session user is the post creator
      if (post.userId === session.userId) {      
        return new Response(JSON.stringify({
            message: "Nelze nahlásit vlastnní příspěvek",
            success: false
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      }

      const alreadyReported = await prisma.postReport.findFirst({
        where: {
          postId: data.postId,
          userId: session.userId,  // assuming session.userId contains the user's ID
        },
      });

      if (alreadyReported) {
        return new Response(JSON.stringify({
            message: 'Příspěvek jste již nahlásili',
            success: false
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      }
      
      let insertedTopic = false;
      const localISODateFixedOffset = DateTime.now()
      .setZone('Europe/Prague') // Čas zůstane v českém pásmu
      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'"); // Pevně přidá offset "+00:00"
   
      for (const reason of data.reasons) {
        await prisma.postReport.create({
            data: {
                reportedAt: localISODateFixedOffset,
                postId: data.postId,
                userId: session.userId,
                reason: reason,
                topic: !insertedTopic && data.extraInfo ? data.extraInfo : null,
            },
        });

        if (data.extraInfo && !insertedTopic) {
            insertedTopic = true;
        }
      }

      return new Response(JSON.stringify({
        message: 'Příspěvek byl úspěšně nahlášen',
        success: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (error) {
      console.error('Chyba na serveru [POST] požadavek na report příspěvku: ', error);
      return new Response(JSON.stringify({
        message: 'Chyba na serveru [POST] požadavek na nahlášení příspěvku',
        success: false
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
}



async function checkIfEnougReports(fromUser) {
  const currentDate = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat('yyyy-MM-dd'); // Pouze datum, bez času
console.log("Dnes je :", currentDate)
  // 1. Získat počet hodnocení, která již daný uživatel poskytl tomuto uživateli ve stejný den
  const uniqueReportsToday = await prisma.postReport.findMany({
    where: {
      userId: fromUser,
      reportedAt: {
        gte: new Date(`${currentDate}T00:00:00.000Z`),
        lt: new Date(`${currentDate}T23:59:59.999Z`),
      },
    },
    distinct: ['postId'],
  });
  
  const uniqueReportCount = uniqueReportsToday.length;
  console.log("Počet reportů dneska :",uniqueReportCount)
  // Pokud už hodnotil tohoto uživatele dnes, není možné hodnotit znovu
  if (uniqueReportCount > 4) {
    return true;
  }

  

  // Uživatel může hodnotit
  return false;
}







export async function PUT(req) {
    try {
      const session = await getSession();
    
      if (!session || !session.isLoggedIn || !session.email) {
        return new Response(JSON.stringify({
          message: "Chyba na serveru [PUT] požadavek na zjištění zda byl příspěvek uživatelem již nahlášen:. Session nebyla nalezena ",
          success: false
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const data = await req.json();
      
    


     
      const post = await prisma.Posts.findUnique({
        where: { id: data.postId },
      });

      if (!post) {
        return new Response(JSON.stringify({
          message: "Příspěvek nenalezen",
          success: false
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // If the session user is the post creator check whether the user has already reported the post

        const alreadyReported = await prisma.postReport.findMany({
            where: {
              postId: data.postId,
              userId: session.userId,  // assuming session.userId contains the user's ID
            },
          });

         const enoughReportss = await checkIfEnougReports(session.userId)

  
          return new Response(JSON.stringify({
           reported: alreadyReported,
           enoughReports: enoughReportss
           
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
      
     
    
     


    } catch (error) {
      console.error('Chyba na serveru [PUT] požadavek na zjištění zda byl příspěvek uživatel již nahlášen: ', error);
      return new Response(JSON.stringify({
        message: 'Chyba na serveru [PUT] požadavek na zjištění zda byl příspěvek uživatel již nahlášen:',
        success: false
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
}