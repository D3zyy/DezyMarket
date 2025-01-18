import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";
import { DateTime } from 'luxon';

export async function POST(request) {




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
    let data = await request.json();
    console.log("Tohle jsem dostal na serveru update ban:",data)

   
      
    return new Response(
      JSON.stringify('Ahoj'),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.log(error)
    return new Response(
      JSON.stringify({ message: 'Chyba na serceru update banu', success: false }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}