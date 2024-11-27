import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';



export async function POST(req) {
    try {
      const session = await getSession();
    
      if (!session || !session.isLoggedIn || !session.email) {
        return new Response(JSON.stringify({
          message: "Chyba na serveru [POST] požadavek na ohodnocení uživatele. Session nebyla nalezena ",
          success: false
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      } 

      const data = await req.json();

      console.log(session.userId)
      console.log(data.userId)
      console.log("Data  který sem dostal na ohodnocení uživatele :",data)
      
      if (data.moreInfo.length > 200) {
        return new Response(JSON.stringify({
            message: "Dodatečné inforace jsou moc dlouhé.",
            success: false
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      } 
      if (data.userId == session.userId) {
        return new Response(JSON.stringify({
            message: "Nelze ohodnotit sám sebe.",
            success: false
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      } 

      if (data.numberOfStars != 5 && data.numberOfStars != 4 && data.numberOfStars != 3&& data.numberOfStars != 2 && data.numberOfStars !=1) {
        return new Response(JSON.stringify({
            message: "Chybný počet hvězdiček",
            success: false
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      } 
      console.log("Uspesna kontrola hvezdicek")
   
     

      //check if given user exists
      const userExists = await prisma.Users.findFirst({
        where: {
          id: data.userId,
        },
      });
     
  
      if (!userExists) {
        return new Response(JSON.stringify({
          message: "Uživatel na hodnocení nenalezen",
          success: false
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  



   // Získání aktuálního českého času
   const localISODateFixedOffset = DateTime.now()
   .setZone('Europe/Prague') // Čas zůstane v českém pásmu
   .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'"); // Pevně přidá offset "+00:00"

//console.log(localISODateFixedOffset); // Např. "2024-11-26T23:10:30+00:00"
      

      const newRating = await prisma.UserRatings.create({
        data: {
            ratedAt: localISODateFixedOffset,
            fromUserId: session.userId,
            toUserId: data.userId,
            extraInfo: data.moreInfo,
            numberOfStars: data.numberOfStars,
        },
    });

    const find = await prisma.UserRatings.findFirst({
        where: {
            id: newRating.id,
           
        },
    });
    //console.log(find.ratedAt)




       
      




      return new Response(JSON.stringify({
        message: 'Uživatel byl úspěšně ohodnocen',
        success: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (error) {
        console.log(error)
      return new Response(JSON.stringify({
        message: 'Chyba na serveru [POST] požadavek na hodnocení uživatele',
        success: false
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
}















export async function PUT(req) {
    try {
      const session = await getSession();
    
      if (!session || !session.isLoggedIn || !session.email) {
        return new Response(JSON.stringify({
          message: "Chyba na serveru [PUT] požadavek na zjištění zda byl příspěvek uživatel již ohodnocen:. Session nebyla nalezena ",
          success: false
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const data = await req.json();





      const ratingsOfUser = await prisma.userRatings.findMany({
        where: { fromUserId: session.userId },
      });
      let alreadyEnoughRating = ratingsOfUser.length > 0 ? true : false;
    //Pak to doupravim tady dole
      return new Response(JSON.stringify({
       reported: alreadyEnoughRating
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      







      // Fetch the post and the creator's role
      const post = await prisma.posts.findUnique({
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
     
          return new Response(JSON.stringify({
           reported: alreadyReported,
           
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
      
     
    
     


    } catch (error) {
        console.log(error)
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