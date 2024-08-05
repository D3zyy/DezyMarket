import { verifyToken } from "../email/verifyToken";

export async function GET(req) {

  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Check if email and token are provided
  if (!email || !token) {
 
    return new Response(
      JSON.stringify({ message: 'Email nebo token chybý.', success: false }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {

    // Call the verifyToken function
    const result = await verifyToken(email, token);


    // Return JSON response with appropriate status
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