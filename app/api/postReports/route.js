import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { prisma } from "@/app/database/db";

export async function POST(req) {
    try {
        let data 
        try {

             data = await req.json();
            console.log("Data který sem dostal na získání hlašení o příspěvků :",data)
          } catch (error) {
            return new Response(JSON.stringify({ message: "Chybně formátovaný požadavek." }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        // Ensure the session is retrieved correctly
        const session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na získání nahlašení příspěvku . Session nebyla nalezena "
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const postExist = await prisma.Posts.findFirst({
            where: {
              id: data.postId,
            },
            include: {
              user: {
                include: {
                  role: true, // Fetches the role of the user
                },
              },
            },
          });
       
          if(!postExist){
            return new Response(JSON.stringify({
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
          }
          if(postExist.user.role.privileges >= session.role.privileges){
            return new Response(JSON.stringify({
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
          }
         
          const PostReports = await prisma.PostReport.findMany({
            where: {
              postId: data.postId,
            },
            include: {
              user: true,
              post: true
            
            },
          });
          
          const allReportsOfPost = PostReports.map(report => ({
            fromUser: {
              id: report.user.id,
              fullName: report.user.fullName,
            },
            
            reportedAt: report.reportedAt,
            topic: report.topic, // This might be `null` if not provided.
            reason: report.reason,
          }));
         // console.log(allReportsOfPost);
   

       

 
       
          
        return new Response(JSON.stringify({
            reports: allReportsOfPost }), {
           
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Chyba na serveru [POST] požadavek informace o předplatném:  ', error);
        return new NextResponse(JSON.stringify({
            message: 'Chyba na serveru [POST] požadavek informace o předplatném'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
