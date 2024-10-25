export async function GET(req) {
    try {
      const session = await getSession();
      if (!session || !session.isLoggedIn) {
        return new Response(
          JSON.stringify({ message: 'Uživatel není přihlášen' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
  
      const Allsections = await prisma.Sections.findMany();
      return new Response(
        JSON.stringify(Allsections), // Make sure to JSON.stringify the data
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
  
    } catch (error) {
      console.error('Chyba při získávání sekcí :', error);
      return new Response(
        JSON.stringify({ message: 'Chyba na serveru [POST] získávání sekcí' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }