export async function DELETE(req) {
    try {
      const session = await getSession();
      console.log(session)
      if (!session || !session.isLoggedIn || !session.email) {
        return new Response(JSON.stringify({
          message: "Chyba na serveru [POST] požadavek na report příspěvku. Session nebyla nalezena "
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      const data = await req.json();
      console.log("Received data report POST:", data);
  
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