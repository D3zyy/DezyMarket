import { prisma } from "../database/db";
import { checkUserBan } from "../api/session/dbMethodsSession";
import { getCachedData } from "../getSetCachedData/caching";
export async function getPostFromDb(postId,privi = 1) {
  let postRecord = null;

  try {
   
   
    
    // Uložíme data do dvou cache klíčů
   postRecord =  await getCachedData(`post_record_${postId}_privi_${privi}`,  prisma.Posts.findUnique({
    where: {
      id: postId,
      ...(privi > 1 ? {} : { visible: true }), // Viditelnost pouze pokud privi <= 1
    },
    include: {
      category: true,
      section: true,
      user: {
        include: {
          role: true,
        },
      },
    },
  }), 300); // Cache pro s privilegii
    await getCachedData(`post_record_${postId}`,  prisma.Posts.findUnique({
      where: {
        id: postId,
        ...(privi > 1 ? {} : { visible: true }), // Viditelnost pouze pokud privi <= 1
      },
      include: {
        category: true,
        section: true,
        user: {
          include: {
            role: true,
          },
        },
      },
    }), 300); // Cache bez privilegii
    
   
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