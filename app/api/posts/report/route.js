import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";

function sanitizeInput(input) {
  const unsafeChars = /[<>;()&|]/g; // Add any other characters you want to block
  return input.replace(unsafeChars, ''); // Remove unsafe characters
}

export async function POST(req) {
    try {
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
      if (!Number.isInteger(data.postId)) {
        return new Response(
          JSON.stringify({
            message: "Id příspěvku je nesprávný datový typ.",
            success: false,
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
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
      // Sanitize input to remove unsafe characters
      data.reasons = data.reasons.map(sanitizeInput);
      data.extraInfo = sanitizeInput(data.extraInfo);

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

      // Fetch the post and the creator's role
      const post = await prisma.posts.findUnique({
        where: { id: data.postId },
        include: { user: { include: { role: true } } }  // Include the user and their role
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











export async function PUT(req) {
    try {
      const session = await getSession();
    
      if (!session || !session.isLoggedIn || !session.email) {
        return new Response(JSON.stringify({
          message: "Chyba na serveru [PUT] požadavek na zjištění zda byl příspěvek uživatel již nahlášen:. Session nebyla nalezena ",
          success: false
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const data = await req.json();
      
    
      

      // Fetch the post and the creator's role
      const post = await prisma.posts.findUnique({
        where: { id: data.postId },
        include: { user: { include: { role: true } } }  // Include the user and their role
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