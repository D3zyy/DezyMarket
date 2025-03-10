import { prisma } from "../database/db";
import { checkUserBan } from "../api/session/dbMethodsSession";
import { getCachedData } from "../getSetCachedData/caching";
export async function getPostFromDb(postId,privi = 1) {
  let postRecord = null;

  try {
  
    

    console.log("PRIVILEGIA:", privi);
    console.log("POSTID:", postId);
    
    // Definujeme podmínku WHERE předem
    const whereCondition = { id: postId };
    
    if (privi <= 1) {
      whereCondition.visible = true;
    }
    
    console.log("WHERE CONDITION:", whereCondition); // Debug výstup
    
    // Uložíme data do cache bez privilegii
    postRecord = await getCachedData(
      `post_record_${postId}`, // Cache bez privilegii
      async () => await prisma.posts.findUnique({
        where: whereCondition,
        include: {
          category: true,
          section: true,
          user: {
            include: {
              role: true,
            },
          },
        },
      }),
      43829 // Cache expirace na 5 minut (300 sekund)
    );
    
   console.log("POST:",postRecord)
    if(privi <=1){


    let cannotShow = await checkUserBan(postRecord.user.id)
    if(cannotShow || postRecord.visible == false){
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