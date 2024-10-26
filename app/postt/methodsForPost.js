import { prisma } from "../database/db";

export async function getPostFromDb(postId) {
   const postRecord = await prisma.Posts.findUnique({
        where: {
          id: parseInt(postId),
        },
        include: {
          category: true,  
          section: true,  
          user: true,
        },
      });
      return postRecord
}
export async function getImageUrlsFromDb(postId) {
  console.log(postId)
  const urls = await prisma.Image.findFirst({
       where: {
         postId: parseInt(postId),
       },

     });
     return urls

}