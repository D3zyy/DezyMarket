import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";

export async function POST(req) {
    try {
      const session = await getSession();
    
      if (!session || !session.isLoggedIn || !session.email) {
        return new Response(JSON.stringify({
          message: "Chyba na serveru [POST] požadavek na report příspěvku. Session nebyla nalezena "
        }), {
          status: 400,
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
      console.log("Received data report POST:", data);

      const invalidReasons = data.reasons.filter(reason => !reasons.includes(reason));

      if (invalidReasons.length > 0) {
       // console.log("Nesprávné důvody:", invalidReasons);
        return new Response(JSON.stringify({
            message: "Nějaký z důvodů není platný"
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      } 
      // Fetch the post and the creator's role
      const post = await prisma.posts.findUnique({
        where: { id: data.postId },
        include: { user: { include: { role: true } } }  // Include the user and their role
      });
  
      if (!post) {
        return new Response(JSON.stringify({
          message: "Příspěvek nenalezen"
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
  
      // If the session user is the post creator
      if (post.userId === session.userId) {      
        return new Response(JSON.stringify({
            message: "Nelze nahlásit vlastnní příspěvek"
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      }
      console.log(session)
      const alreadyReported = await prisma.postReport.findFirst({
        where: {
          postId: data.postId,
          userId: session.userId,  // assuming session.userId contains the user's ID
        },
      });
       
      
      console.log("Již reportoval :",alreadyReported)
      if(alreadyReported){
        return new Response(JSON.stringify({
            message: 'Příspěvek byl již vámi nahlášen'
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
      }
           
            let insertedTopic = false;

            for (const reason of data.reasons) {
     
            await prisma.postReport.create({
                data: {
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
        message: 'Příspěvek byl úspěšně nahlášen'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (error) {
      console.error('Chyba na serveru [POST] požadavek na report příspěvku: ', error);
      return new Response(JSON.stringify({
        message: 'Chyba na serveru [POST] požadavek  na smazání příspěvku'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }