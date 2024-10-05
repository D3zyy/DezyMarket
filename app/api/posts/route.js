import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { z } from 'zod';
import { prisma } from "@/app/database/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from 'sharp';
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
let sessionGeneral

const s3Client = new S3Client({
  region :process.env.NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY
  }
})
async function resizeImage(buffer) {
  const resizedBuffer = await sharp(buffer)
    .resize(1200, 1200, {
      fit: sharp.fit.inside,
      withoutEnlargement: true
    })
    .toBuffer();
  
  return resizedBuffer;
}

async function uploadImagesToS3(files,postId) {
  const uploadResponses = await Promise.all(files.map(async (file, index) => {
    const resizedImage = await resizeImage(file);

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
      Key: `${postId}/${Date.now()}-image-${index}.jpg`,
      Body: resizedImage,
      ContentType: "image/jpeg"
    };

    const command = new PutObjectCommand(params);
    try {
      let responseAWS = await s3Client.send(command);
      console.log("AWS upload response:", responseAWS);

      // Construct the URL of the uploaded image
      const imageUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
      return imageUrl; // Return the URL of the uploaded image
    } catch (error) {
      console.error("Error uploading to AWS:", error);
      throw error;
    }
  }));
  return uploadResponses
}


export async function POST(req) {
    try {
        let allowedTypeOfPost
        let formData;
        let allImages
 
        try {
            formData = await req.formData();
           console.log("data ktery sem dostal od klienta :",formData)
           console.log(formData.getAll("images"))
           allImages = formData.getAll("images")
          } catch (error) {
            return new Response(JSON.stringify({ message: "Chybně formátovaný požadavek." }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        const session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return new Response(JSON.stringify({
                message: "Chyba na serveru [POST] požadavek na vytvoření příspěvku. Session nebyla nalezena "
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        sessionGeneral = session



        const schema = z.object({
              name: z.string()
              .max(120, 'Název může mít maximálně 120 znaků.') 
              .min(5, 'Název musí mít alespoň 5 znaků.')
              .regex(/^[A-Za-z0-9á-žÁ-Ž. ]*$/, 'Název nesmí obsahovat žádné speciální znaky.'),
              category: z.number()
              .int('Kategorie musí být celé číslo.') 
              .positive('Kategorie musí být kladné číslo.'), 
              section: z.number()
              .int('Sekce musí být celé číslo.') 
              .positive('Sekce musí být kladné číslo.') ,
              description: z.string()
              .min(15, 'Popisek musí mít alespoň 15 znaků.')
              .max(1500, 'Popisek může mít maximálně 1500 znaků.')
              .transform((value) => value.replace(/[\r\n]/g, '')) // Remove \r and \n
              .refine((value) => /^[A-Za-z0-9á-žÁ-Ž.!?&, -]*$/.test(value), {
                message: 'Popisek nesmí obsahovat žádné speciální znaky kromě (. , ? ! & - ).'
              }),
              location: z.string()
                .min(2, 'Místo musí mít alespoň 2 znaky.')
                .max(30, 'Místo může mít maximálně 30 znaků.')
                .regex(/^(?:[A-Za-z0-9á-žÁ-Ž]+(?: [A-Za-z0-9á-žÁ-Ž]+)?|[A-Za-z0-9á-žÁ-Ž]+ [A-Za-z0-9á-žÁ-Ž.]+)$/, 'Místo musí mít tvar "Název Číslo", "Název Název", nebo pouze "Název".'),
              price: z.union([
                        z.number()
                          .min(1, 'Cena musí být minimálně 1.')
                          .max(5000000, 'Cena může být maximálně 5000000.'),
                        z.string()
                          .regex(/^(Dohodou|V textu|Zdarma)$/, 'Cena musí být "Dohodou", "V textu" nebo "Zdarma".'),
                      ]),
          });

          let priceConverted = formData.get('price'); // Vždy vrací string
          console.log("konver",priceConverted)
      
            if (!isNaN(priceConverted) && Number.isInteger(parseFloat(priceConverted))) {
                priceConverted = parseInt(priceConverted, 10); // Převeď na celé číslo
            }
          const validatedFields = schema.safeParse({
            name: formData.get('name'),
            category: parseInt(formData.get('category')),
            section: parseInt(formData.get('section')),
            description: formData.get('description'),
            location: formData.get('location'),
            nickname: formData.get('nickname'), // Opraveno, aby to odpovídalo zadaným datům
            price: priceConverted,
          });
          
          if (!validatedFields.success) {
            console.log("Nevalidní pole:", validatedFields.error.flatten().fieldErrors); // Vypiš chyby
            return new Response(JSON.stringify({
              message: 'Nevalidní vstupy.',
              errors: validatedFields.error.flatten().fieldErrors // Vrátí konkrétní chyby jako součást odpovědi
            }), {
              status: 400, // Můžeš vrátit 400, pokud je něco špatně
              headers: { 'Content-Type': 'application/json' }
            });
          } else {

            const customers = await stripe.customers.list({
                email: session.email
            });

            const customer = customers.data[0];
        
            // Retrieve subscriptions for the customer
            const subscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                status: "active"
            });
            if (!subscriptions.data.length) {
                allowedTypeOfPost = process.env.NEXT_PUBLIC_BASE_RANK
            } else {
                const subscription = subscriptions.data[0];
                const subscriptionInfo = await stripe.subscriptions.retrieve(subscription.id);
                const product = await stripe.products.retrieve(subscriptionInfo.plan.product);
                switch (product.name) {
                    case process.env.NEXT_PUBLIC_MEDIUM_RANK:
                        allowedTypeOfPost = process.env.NEXT_PUBLIC_MEDIUM_RANK;
                        break;
                    case process.env.NEXT_PUBLIC_BEST_RANK:
                        allowedTypeOfPost = process.env.NEXT_PUBLIC_BEST_RANK;
                        break;
                    default:
                        allowedTypeOfPost = process.env.NEXT_PUBLIC_BASE_RANK
                        break;
                }
            }
         
            if (allowedTypeOfPost === formData.get('typeOfPost') ||  formData.get('typeOfPost') === process.env.NEXT_PUBLIC_BASE_RANK && allowedTypeOfPost ===process.env.NEXT_PUBLIC_BEST_RANK || formData.get('typeOfPost') === process.env.NEXT_PUBLIC_BASE_RANK && allowedTypeOfPost ===process.env.NEXT_PUBLIC_MEDIUM_RANK  ){
               console.log(validatedFields)
      
               const categoryExist = await prisma.Categories.findUnique({
                where: { id: parseInt(formData.get('category')) }
              });
              const sectionExist = await prisma.Sections.findUnique({
                where: { id: parseInt(formData.get('section')) }
              });
              
              if (!categoryExist) {
                return new Response(JSON.stringify({ message: "Tato kategorie neexistuje." }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              
              if (!sectionExist) {
                return new Response(JSON.stringify({ message: "Tato sekce neexistuje." }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              const buffers = await Promise.all(allImages.map(async (image) => {
                const arrayBuffer = await image.arrayBuffer(); // Convert each file to arrayBuffer
                return Buffer.from(arrayBuffer);  // Convert arrayBuffer to Buffer
              }));
              const price = validatedFields.data.price;
              const validatedPrice = typeof price === 'number' && Number.isInteger(price) ? price.toString() : price;
              
              const newPost = await prisma.Posts.create({
                data: {
                  name: validatedFields.data.name,
                  description: validatedFields.data.description,
                  price: validatedPrice,
                  location: validatedFields.data.location,
                  typeOfPost: formData.get('typeOfPost'),
                  categoryId: validatedFields.data.category,
                  sectionId : validatedFields.data.section
                }
              });
              
              const FilePath = await uploadImagesToS3(buffers,newPost.id)
              console.log("Cesta k obrázům :", FilePath)
              const imageUrls = FilePath; 

              await Promise.all(
                imageUrls.map(url => 
                  prisma.image.create({
                    data: {
                      url,
                      post: {
                        connect: { id: newPost.id } // Link to the post
                      }
                    }
                  })
                )
              );

              

              console.log(newPost)
              return new Response(JSON.stringify({ message: "Příspěvek úspěšně vytvořen" , id : newPost.id }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
               

            } else {
   
                if(formData.get('typeOfPost') != process.env.NEXT_PUBLIC_BASE_RANK && formData.get('typeOfPost') != process.env.NEXT_PUBLIC_MEDIUM_RANK && formData.get('typeOfPost') != process.env.NEXT_PUBLIC_BEST_RANK ){
                    console.log("neexistuje tento typ prispevku")
                    return new Response(JSON.stringify({ message: "Tento typ příspěvku neexistuje." }), {
                        status: 403,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                console.log("neni to dovoleny")
                return new Response(JSON.stringify({ message: "Na tento typ příspěvku nemáte opravnění." }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
          }



       


       


    } catch (error) {
        console.error('Chyba na serveru [POST] požadavek vytvoření příspěvku: ', error);
        return new NextResponse(JSON.stringify({
            message: 'Chyba na serveru [POST] požadavek informace o předplatném'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}