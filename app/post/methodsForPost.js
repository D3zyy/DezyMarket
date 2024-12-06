import { prisma } from "../database/db";

export async function getPostFromDb(postId) {
  let postRecord = null;
  try {
    postRecord = await prisma.Posts.findUnique({
      
      where: {
        id: postId,
      },
      include: {
        category: true,
        section: true,
        user: {
          include: {
            role: true
          }
        }
      },
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    // Handle the error as needed, e.g., throw it or return null
  } finally {
    await prisma.$disconnect(); // Close the connection after finishing
  }
  return postRecord;
}

export async function getImageUrlsFromDb(postId) {
  let urls = [];
  try {
    urls = await prisma.Image.findMany({
      where: {
        postId: postId,
      },
    });
  } catch (error) {
    console.error("Error fetching image URLs:", error);
    // Handle the error as needed
  } finally {
    await prisma.$disconnect(); // Close the connection after finishing
  }
  return urls;
}