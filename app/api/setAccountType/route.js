


export async function POST(req) {

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const accountType = searchParams.get('accountType');

  if (!userId || !accountType) {
 
    return new Response(
      JSON.stringify({ message: 'Id uživatele a typ účtu nebyli nalezeny'}),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {


    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    // Handle errors
    console.error('Error during token verification:', error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error', success: false }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}