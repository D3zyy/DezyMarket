import { prisma } from "../database/db";
import { checkUserBan } from "../api/session/dbMethodsSession";
export async function getPostFromDb(postId,privi = 1) {
  let postRecord = null;
  console.log('PostId:', postId, 'Privileges:', privi); 
  try {

    postRecord = await prisma.Posts.findUnique({
      
      where: {
        id: postId,
        visible: true,
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
   
    if(privi <=1){


    let cannotShow = await checkUserBan(postRecord.user.id)
    if(cannotShow){
      return false
    }
  }
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