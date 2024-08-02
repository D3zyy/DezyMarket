import { prisma } from "@prisma/client";

// Function to verify user credentials
async function verifyUserCredentials(email, password) {
    // Step 1: Fetch user by email
    const user = await prisma.Users.findUnique({
      where: {
        email: email,
      },
    });
 
    // Step 2: Check if user exists
    if (!user) {
      throw new Error('User not found');
    }
  
    // Step 3: Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  
    // Step 4: Return the result
    if (isPasswordValid) {
      return user; // Or any other relevant information
    } else {
      throw new Error('Invalid password');
    }
  }


export {verifyUserCredentials}