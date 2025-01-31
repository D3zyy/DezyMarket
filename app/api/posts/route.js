import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { z } from 'zod';
import { prisma } from "@/app/database/db";
import { S3Client, PutObjectCommand,ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import sharp from 'sharp';
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront"
import { DateTime } from 'luxon';
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods";
const schema = z.object({
  name: z.string()
    .max(70, 'Název může mít maximálně 70 znaků.') 
    .min(5, 'Název musí mít alespoň 5 znaků.')
    .regex(/^[A-Za-z0-9á-žÁ-Ž., /()#&_?!;:,\+\.\[\]]*$/, 'Název nesmí obsahovat speciální znaky jako < > nebo uvozovky.'),

  phoneNumber: z.string()
    .max(9, 'Telefoní číslo musí mít přesně 9 číslic.') 
    .min(9, 'Telefoní číslo musí mít přesně 9 číslic.')
    .regex(/^[0-9]*$/, 'Telefoní číslo musí obsahovat pouze číslice.')
    .optional(), // Telefonní číslo je nepovinné

  category: z
    .preprocess(
      (value) => (value === '' || isNaN(value) ? NaN : Number(value)), // Převede prázdné nebo nečíselné hodnoty na NaN
      z.number({
        required_error: 'Kategorie je povinná.',
        invalid_type_error: 'Kategorie musí být číslo.',
      })
      .int('Kategorie musí být celé číslo.')
      .positive('Kategorie musí být kladné číslo.')
    ),

  section: z.number()
    .int('Sekce musí být celé číslo.') 
    .positive('Sekce musí být kladné číslo.'),

  description: z.string()
    .min(15, 'Popis musí mít alespoň 15 znaků.')
    .max(2000, 'Popis může mít maximálně 2000 znaků.')
    .refine((value) => !/[<>]/.test(value), {
      message: 'Popis nesmí obsahovat znaky < a >.',
    })
    .transform((value) => value.replace(/['";]/g, '')), // Odstraní uvozovky a středníky

    location: z.string()
    .refine((value) =>
      [
        'Praha',
        'Brno',
        'Ostrava',
        'Olomouc',
        'Plzeň',
        'Středočeský kraj',
        'Jihočeský kraj',
        'Plzeňský kraj',
        'Karlovarský kraj',
        'Ústecký kraj',
        'Liberecký kraj',
        'Královéhradecký kraj',
        'Pardubický kraj',
        'Jihomoravský kraj',
        'Zlínský kraj',
        'Olomoucký kraj',
        'Moravskoslezský kraj',
        'Kraj Vysočina',
      ].includes(value),
      {
        message: 'Neplatná lokalita.',
      }
    ),

  price: z.preprocess(
    (value) => {
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return parseFloat(value); // Převede řetězec čísla na číslo
      }
      return value;
    },
    z.union([
      z.number()
        .min(1, 'Cena musí být minimálně 1.')
        .max(5000000, 'Cena může být maximálně 5000000.')
        .refine(
          (value) => Number.isInteger(value),
          'Cena nemůže být desetinné číslo.'
        ),
      z.string()
        .regex(/^(Dohodou|V textu|Zdarma)$/, 'Cena musí být "Dohodou", "V textu" nebo "Zdarma".'),
    ])
  ),
});

const s3Client = new S3Client({
  region :process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
  }
})
async function resizeImage(buffer) {
  const resizedBuffer = await sharp(buffer)
    .rotate() // Automaticky použije EXIF data k zachování orientace
    .resize({
      width: 1200,
      height: 1200,
      fit: sharp.fit.inside,
      withoutEnlargement: true, // Zamezí zvětšování obrázku, pokud je menší
    })
    .toBuffer();

  return resizedBuffer;
}
async function invalidateImagesOnCloudFrontByPostId(postId) {

  try {

const cloudfront = new CloudFrontClient({
  region :process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  }
});
const cfCommand = new CreateInvalidationCommand({
  DistributionId: process.env.CLOUD_FRONT_DISTRIBUTION_ID,
  InvalidationBatch: {
    CallerReference: postId,
    Paths: {
      Quantity: 1,
      Items: [
        `/${postId}/*` 
      ]
    }
  }
})

const response = await cloudfront.send(cfCommand)

 

    return response;
  } catch (error) {
    throw new Error(`Failed to invalidate images on CloudFront for postId  ${postId}: ${error}`);
  }
}
async function deleteImagesByPostId(postId) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const prefix = `${postId}/`; // Prefix for all images associated with this postId
  
  try {
    // List all objects with the specific postId prefix
    const listParams = {
      Bucket: bucketName,
      Prefix: prefix,
    };
    const listCommand = new ListObjectsV2Command(listParams);
    const listedObjects = await s3Client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return `No images found for postId: ${postId}`;
    }

    // Map all found objects to be deleted
    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: listedObjects.Contents.map((item) => ({ Key: item.Key })),
      },
    };
    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    const deleteResponse = await s3Client.send(deleteCommand);

    return deleteResponse;
  } catch (error) {
    throw new Error(`Failed to delete images for postId ${postId}: ${error}`);
  }
}
async function uploadImagesToS3(files,postId) {
  const uploadResponses = await Promise.all(files.map(async (file, index) => {
    const resizedImage = await resizeImage(file);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${postId}/${Date.now()}-image-${index}.jpg`,
      Body: resizedImage,
      ContentType: "image/jpeg"
    };

    const command = new PutObjectCommand(params);
    try {
      let responseAWS = await s3Client.send(command)

      // Construct the URL of the uploaded image
      const imageUrl = `https://photos.dezy.cz/${params.Key}`;
      return imageUrl; // Return the URL of the uploaded image
    } catch (error) {
      
      await prisma.Posts.delete({
        where: {
          id: postId,
        },
      });

      return new Response(JSON.stringify({ message: "Chyba při nahrávaní obrázků na cloud:",error }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
    });
    }
  }));
  return uploadResponses
}


export async function POST(req) {
  let allowedTypeOfPost
  let formData;
  let allImages
  let typPost
  let isAllowed 
    try {
      
        try {
            formData = await req.formData();
           typPost =  formData.get('typeOfPost')
            console.log(formData.get('location'))

           allImages = formData.getAll("images")
           if(allImages.length > 25) {
            return new Response(JSON.stringify({ message: "Chyba. Nahráno nedovolené množství obrázků!" }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            });
           }
      

           
          } catch (error) {
            return new Response(JSON.stringify({ message: "Chybně formátovaný požadavek." }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
       // Inside your POST function
const session = await getSession();
if (!session || !session.isLoggedIn || !session.email) {
    return new Response(JSON.stringify({
        message: "Chyba na serveru [POST] požadavek na vytvoření příspěvku. Session nebyla nalezena "
    }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    });
}
console.log("Pravomoce :",session.role.privileges)
if (Number(session.role.privileges) !== 4) {


const posts = await prisma.posts.findMany({
  where: { userId: session.userId },
});

// Count the visible and invisible posts
const visiblePosts = posts.filter(post => post.visible === true).length;
const invisiblePosts = posts.filter(post => post.visible === false).length;
console.log("visible:",visiblePosts)
console.log("invisiblePosts:",invisiblePosts)
// Check the conditions
if (visiblePosts > 30) {
  const rawIp =
  req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
  req.headers.get("x-real-ip") ||                      // Alternativní hlavička
  req.socket?.remoteAddress ||                         // Lokální fallback
  null;

// Odstranění případného prefixu ::ffff:
const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;



      const dateAndTime = DateTime.now()
      .setZone('Europe/Prague')
      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        await prisma.errors.create({
          info: `Chyba na /api/posts - POST - (Již jste nahrál maximalní počet obrázků .)  formData: ${formData}  `,
          dateAndTime: dateAndTime,
          userId: session?.userId,
          ipAddress:ip,
        })
  return new Response(JSON.stringify({ messageToDisplay: "Již jste nahráli maximální počet příspěvků." }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}

if (invisiblePosts > 100) {
  const rawIp =
  req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
  req.headers.get("x-real-ip") ||                      // Alternativní hlavička
  req.socket?.remoteAddress ||                         // Lokální fallback
  null;

// Odstranění případného prefixu ::ffff:
const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;



      const dateAndTime = DateTime.now()
      .setZone('Europe/Prague')
      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        await prisma.errors.create({
          info: `Chyba na /api/posts - POST - (Maximalní počet neviditelných obrázků byl dosažen .)  formData: ${formData}  `,
          dateAndTime: dateAndTime,
          userId: session?.userId,
          ipAddress:ip,
        })
  return new Response(JSON.stringify({ messageToDisplay: "Maximální počet neviditelných příspěvků byl dosažen." }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}

}

// Now you can use session directly throughout your function
const userId = session.userId; // Use userId directly from session
console.log("pred !!!")
if (typPost) {
  console.log("Jdu dovnitr!!!")
let monthIn = await getUserAccountTypeOnStripe(session.email)
console.log(monthIn?.monthIn)

console.log("Jdu kontrolvat top")

 isAllowed = await prisma.tops.findFirst({
  where: {
    name: typPost
  }
});
console.log("Nasel sem top:",isAllowed)

if(isAllowed?.hidden){
  const rawIp =
  req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
  req.headers.get("x-real-ip") ||                      // Alternativní hlavička
  req.socket?.remoteAddress ||                         // Lokální fallback
  null;

// Odstranění případného prefixu ::ffff:
const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;



      const dateAndTime = DateTime.now()
      .setZone('Europe/Prague')
      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        await prisma.errors.create({
          info: `Chyba na /api/posts - POST - (Tento typ topovaní je skrytý .)  formData: ${formData}  `,
          dateAndTime: dateAndTime,
          userId: session?.userId,
          ipAddress:ip,
        })
  return new Response(JSON.stringify({ messageToDisplay: "Tento typ topovaní není dostupný" }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}
const accOfUser = await prisma.accountType.findMany({
  where: {
    name: monthIn.name
  }
});

if(allImages?.length > accOfUser?.numberOfAllowedImages ){
  const rawIp =
  req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
  req.headers.get("x-real-ip") ||                      // Alternativní hlavička
  req.socket?.remoteAddress ||                         // Lokální fallback
  null;

// Odstranění případného prefixu ::ffff:
const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;



      const dateAndTime = DateTime.now()
      .setZone('Europe/Prague')
      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        await prisma.errors.create({
          info: `Chyba na /api/posts - POST - (Bylo nahráno nedovolené množství obrázků .)  formData: ${formData}  `,
          dateAndTime: dateAndTime,
          userId: session?.userId,
          ipAddress:ip,
        })
  return new Response(JSON.stringify({ messageToDisplay: "Bylo nahráno nedovolené množství obrázků." }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}
console.log("Počet měsícu abych ho mohl tento top:",isAllowed?.numberOfMonthsToValid )
console.log("Počet měsícu které mám:", monthIn?.monthIn)
console.log(isAllowed?.numberOfMonthsToValid  > monthIn?.monthIn)
 if(isAllowed?.numberOfMonthsToValid > monthIn?.monthIn)   {
  const rawIp =
  req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
  req.headers.get("x-real-ip") ||                      // Alternativní hlavička
  req.socket?.remoteAddress ||                         // Lokální fallback
  null;

// Odstranění případného prefixu ::ffff:
const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;



      const dateAndTime = DateTime.now()
      .setZone('Europe/Prague')
      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        await prisma.errors.create({
          info: `Chyba na /api/posts - POST - (Na tento druh topovaní nemáte právo .)  formData: ${formData}  `,
          dateAndTime: dateAndTime,
          userId: session?.userId,
          ipAddress:ip,
        })
  return new Response(JSON.stringify({ messageToDisplay: "Tento druh topovaní není pro vás dostupný" }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
 }
}
console.log("Můžu!!")
// Získání všech hodnot pro 'price'
let prices = formData.getAll('price');

// Najděte první nenulovou hodnotu
let priceConverted = prices.find(price => price !== '');

// Pokud máme cenu a je platná, převedeme ji
if (priceConverted && !isNaN(priceConverted) && Number.isInteger(parseFloat(priceConverted))) {
    priceConverted = parseInt(priceConverted, 10); // Převeď na celé číslo
    console.log('Valid price:', priceConverted);
} else {
  if (!['Dohodou', 'V textu', 'Zdarma'].includes(priceConverted)) {
    priceConverted = 0;
  }

    console.log('Invalid price or no price entered');
}
           
          const validatedFields = schema.safeParse({
            name: formData.get('name'),
            category: parseInt(formData.get('category')),
            section: parseInt(formData.get('section')),
            description: formData.get('description'),
            location: formData.get('location'),
            nickname: formData.get('nickname'), // Opraveno, aby to odpovídalo zadaným datům
            phoneNumber: formData.get('phoneNumber'),
            price: priceConverted,
          });

          if (!validatedFields.success) {
          
            return new Response(JSON.stringify({
              message: 'Nevalidní vstupy.',
              errors: validatedFields.error.flatten().fieldErrors // Vrátí konkrétní chyby jako součást odpovědi
            }), {
              status: 400, // Můžeš vrátit 400, pokud je něco špatně
              headers: { 'Content-Type': 'application/json' }
            });
          } else {




            console.log("Tadyyyy")
         
    



               const categoryExist = await prisma.Categories.findUnique({
                where: { id: parseInt(formData.get('category')) }
              });
              if (!categoryExist) {
                const rawIp =
                req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
                req.headers.get("x-real-ip") ||                      // Alternativní hlavička
                req.socket?.remoteAddress ||                         // Lokální fallback
                null;
              
              // Odstranění případného prefixu ::ffff:
              const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
              
            
              
                    const dateAndTime = DateTime.now()
                    .setZone('Europe/Prague')
                    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
                      await prisma.errors.create({
                        info: `Chyba na /api/posts - POST - (Tato kategorie neexistuje.)  formData: ${formData}  `,
                        dateAndTime: dateAndTime,
                        userId: session?.userId,
                        ipAddress:ip,
                      })
                return new Response(JSON.stringify({ message: "Tato kategorie neexistuje." }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              const sectionExist = await prisma.Sections.findUnique({
                where: { id: parseInt(formData.get('section')) }
              });

              if (!sectionExist) {
                const rawIp =
                req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
                req.headers.get("x-real-ip") ||                      // Alternativní hlavička
                req.socket?.remoteAddress ||                         // Lokální fallback
                null;
              
              // Odstranění případného prefixu ::ffff:
              const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
              
            
              
                    const dateAndTime = DateTime.now()
                    .setZone('Europe/Prague')
                    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
                      await prisma.errors.create({
                        info: `Chyba na /api/posts - POST - (Tato sekce neexistuje.)  formData: ${formData}  `,
                        dateAndTime: dateAndTime,
                        userId: session?.userId,
                        ipAddress:ip,
                      })
                return new Response(JSON.stringify({ message: "Tato sekce neexistuje." }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              const categorySectionExist = await prisma.Sections.findUnique({
                where: { id: parseInt(formData.get('section')) , categoryId:  parseInt(formData.get('category'))}
              });
              if (!categorySectionExist) {
                                
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                info: `Chyba na /api/posts - POST - (Tato kombinace kategorie sekce neexistuje.)  formData: ${formData}  `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,
              })
                return new Response(JSON.stringify({ message: "Tato kategorie kombinace sekce neexistuje." }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              
              const buffers = await Promise.all(allImages.map(async (image) => {
                const arrayBuffer = await image.arrayBuffer(); // Convert each file to arrayBuffer
                return Buffer.from(arrayBuffer);  // Convert arrayBuffer to Buffer
              }));
              let newPost
               
              console.log("Tadyyyy 1")
              const localISODateFixedOffset = DateTime.now()
              .setZone('Europe/Prague') // Čas zůstane v českém pásmu
              .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'"); // Pevně přidá offset "+00:00"
              try{
                console.log( "Nasel sem top",isAllowed?.length > 0)
                console.log("tento top:",isAllowed?.id)
                const price = validatedFields.data.price;
                const validatedPrice = typeof price === 'number' && Number.isInteger(price) ? price.toString() : price;
                 newPost = await prisma.posts.create({
                  data: {
                    dateAndTime: localISODateFixedOffset,
                    name: validatedFields.data.name,
                    description: validatedFields.data.description,
                    price: validatedPrice,
                    location: validatedFields.data.location,
                    topId:  isAllowed?.id ?  isAllowed?.id : null,
                    categoryId: validatedFields.data.category,
                    sectionId : validatedFields.data.section,
                    phoneNumber : validatedFields.data.phoneNumber,
                    userId : session.userId
                  }
                });
                
                const FilePath = await uploadImagesToS3(buffers,newPost.id)
               
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
         
              } catch(error) {
                
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                info: `Chyba na /api/posts - POST - (Nastala chyba při přidávání příspěvku do db.)  formData: ${formData}  `,
                dateAndTime: dateAndTime,
                errorPrinted: error,
                userId: session?.userId,
                ipAddress:ip,
              })
                return new Response(JSON.stringify({ message: "Nastala chyba při přidávání příspěvku do db." }), {
                  status: 403,
                  headers: { 'Content-Type': 'application/json' }
              });
              }

            
              return new Response(JSON.stringify({ message: "Příspěvek úspěšně vytvořen" , id : newPost.id }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
               

           
          }



       


       


    } catch (error) {
      formData = await req.formData();
      try{
           
  
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                info: `Chyba na /api/posts - POST - (catch)  formData: ${formData}  `,
                dateAndTime: dateAndTime,
                errorPrinted: error,
                userId: session?.userId,
                ipAddress:ip,
              })
  
            }catch(error){}
        console.error('Chyba na serveru [POST] požadavek vytvoření příspěvku: ', error);
        return new NextResponse(JSON.stringify({
            message: 'Chyba na serveru [POST] požadavek informace o předplatném'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }finally {
      await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
}










export async function PUT(req) {
  try {
    const session = await getSession();
    if (!session || !session.isLoggedIn || !session.email) {
      return new Response(JSON.stringify({
        message: "Chyba na serveru [PUT] požadavek na editaci příspěvku. Session nebyla nalezena "
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await req.json();


    // Fetch the post and the creator's role
    const post = await prisma.posts.findUnique({
      where: { id: data.postId },
      include: { user: { include: { role: true } } }  // Include the user and their role
    });

    if (!post) {
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - PUT - (Příspěvek nenalezen)  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })
      return new Response(JSON.stringify({
        message: "Příspěvek nenalezen"
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If the session user is the post creator, allow editing
    if (post.userId === session.userId) {

      //validation starts here
      let priceConverted = data.price // Vždy vrací string
 
      
      if (!isNaN(priceConverted) && Number.isInteger(parseFloat(priceConverted))) {
          priceConverted = parseInt(priceConverted, 10); // Převeď na celé číslo
      }
      console.log("data co dorazily na server na editaci:",data)
    const validatedFields = schema.safeParse({
      name: data.name,
      location: data.location,
      category: parseInt(data.category),
      section: parseInt(data.section),
      description: data.description,
      phoneNumber : data.phoneNumber,
      price: priceConverted,
    });
 
    if (!validatedFields.success) {

      return new Response(JSON.stringify({
        message: 'Nevalidní vstupy.',
        errors: validatedFields.error.flatten().fieldErrors // Vrátí konkrétní chyby jako součást odpovědi
      }), {
        status: 400, // Můžeš vrátit 400, pokud je něco špatně
        headers: { 'Content-Type': 'application/json' }
      });
    } 


      const categoryExist = await prisma.Categories.findUnique({
        where: { id: parseInt(data.category) }
      });
      if (!categoryExist) {
        const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - PUT - (Tato kategorie  neexistuje)  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })
        return new Response(JSON.stringify({ message: "Tato kategorie neexistuje." }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const sectionExist = await prisma.Sections.findUnique({
        where: { id: parseInt(data.section) }
      });

      if (!sectionExist) {
        const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - PUT - (Tato sekce neexistuje)  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })
        return new Response(JSON.stringify({ message: "Tato sekce neexistuje." }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const categorySectionExist = await prisma.Sections.findUnique({
        where: {
          id: parseInt(data.section),
          categoryId: parseInt(data.category),
        },
      });
      if (!categorySectionExist) {

      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - PUT - (Tato kategorie sekce kombinace neexistuje)  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })
        return new Response(JSON.stringify({ message: "Tato kategorie kombinace sekce neexistuje." }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
     //validation ends here




      await updatePost(data.postId, data);
      return new Response(JSON.stringify({
        message: "Úspěšná aktualizace příspěvku"
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch the session user's role and privileges only if they are not the creator
    const sessionUser = await prisma.users.findUnique({
      where: { id: session.userId },
      include: { role: true }
    });

    if (!sessionUser) {
      return new Response(JSON.stringify({
        message: "Uživatel nenalezen"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if the session user has strictly higher privileges than the post creator
    if (sessionUser.role.privileges <= post.user.role.privileges) {
          
  
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - PUT - (Nemáte pravomoce k editaci příspěvku uživatele s vyššími pravomocemi)  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })

      return new Response(JSON.stringify({
        message: "Nemáte pravomoce k úpravě tohoto příspěvku"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const currentDate = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat('yyyy-MM-dd');

    let numberOfActionsToday = await prisma.managementActions.count({
      where: {
        fromUserId: session.userId,
        doneAt: {
          gte: new Date(`${currentDate}T00:00:00.000Z`),
          lt: new Date(`${currentDate}T23:59:59.999Z`),
        },
      },
    });
    
    if(session.role.privileges  === 2 && numberOfActionsToday > 50 || session.role.privileges  === 3 && numberOfActionsToday > 100 ){
          
  
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - PUT - (Již jste vyčerpal adm. pravomocí)  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })

      return new Response(JSON.stringify({
        message: 'Již jste vyčerpal administrativních pravomocí dnes'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
      //validation starts here
      let priceConverted = data.price // Vždy vrací string
 
      
      if (!isNaN(priceConverted) && Number.isInteger(parseFloat(priceConverted))) {
          priceConverted = parseInt(priceConverted, 10); // Převeď na celé číslo
      }

    const validatedFields = schema.safeParse({
      name: data.name,
      location: data.location,
      category: parseInt(data.category),
      section: parseInt(data.section),
      description: data.description,
      phoneNumber: data.phoneNumber,
      price: priceConverted,
    });
 
    if (!validatedFields.success) {

      return new Response(JSON.stringify({
        message: 'Nevalidní vstupy.',
        errors: validatedFields.error.flatten().fieldErrors // Vrátí konkrétní chyby jako součást odpovědi
      }), {
        status: 400, // Můžeš vrátit 400, pokud je něco špatně
        headers: { 'Content-Type': 'application/json' }
      });
    } 
    const categoryExist = await prisma.Categories.findUnique({
      where: { id: parseInt(data.category) }
    });
    if (!categoryExist) {
          
  
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - PUT - (Tato kategoi neexistuje)  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })

      return new Response(JSON.stringify({ message: "Tato kategorie neexistuje." }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const sectionExist = await prisma.Sections.findUnique({
      where: { id: parseInt(data.section) }
    });

    if (!sectionExist) {
          
  
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - PUT - (Tato sekce neexistuje)  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })

      return new Response(JSON.stringify({ message: "Tato sekce neexistuje." }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const categorySectionExist = await prisma.Sections.findUnique({
      where: {
        id: parseInt(data.section),
        categoryId: parseInt(data.category),
      },
    });
    if (!categorySectionExist) {
          
  
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - PUT - (Tato kombinace kategorii a sekcí neexistuje)  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })

      return new Response(JSON.stringify({ message: "Tato kategorie kombinace sekce neexistuje." }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

   

      async function checkDifferencesAndLogChanges(postId, newData, userId) {
        // Načtení starého příspěvku včetně názvů kategorií a sekcí
        const oldPost = await prisma.posts.findFirst({
          where: { id: postId },
          include: {
            category: true, // Předpoklad, že tabulka Categories existuje a je propojena
            section: true,   // Předpoklad, že tabulka Sections existuje a je propojena
          },
        });
      
        if (!oldPost) {
              
  
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                info: `Chyba na /api/posts - PUT - (Příspěvek nebyl nalezen (!oldPost))  data: ${data}  `,
                dateAndTime: dateAndTime,
                userId: session?.userId,
                ipAddress:ip,
              })
  
          return new Response(JSON.stringify({ message: "Příspěvek nebyl nalezen." }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      
        // Načtení nových kategorií a sekcí podle jejich ID
        const newCategory = newData.category
          ? await prisma.categories.findFirst({ where: { id: parseInt(newData.category, 10) } })
          : null;
      
        const newSection = newData.section
          ? await prisma.sections.findFirst({ where: { id: parseInt(newData.section, 10) } })
          : null;
      
        const changes = [];
      
        // Mapování polí
        const fieldsToCompare = {
          phoneNumber: newData.phoneNumber,
          location: newData.location,
          description: newData.description,
          name: newData.name,
          price: newData.price,
          categoryId: {
            oldId: oldPost.categoryId, // Porovnáváme ID
            newId: parseInt(newData.category, 10), // Nové ID kategorie
            oldName: oldPost.category?.name || null, // Název staré kategorie
            newName: newCategory?.name || null, // Název nové kategorie z DB
          },
          sectionId: {
            oldId: oldPost.sectionId, // Porovnáváme ID
            newId: parseInt(newData.section, 10), // Nové ID sekce
            oldName: oldPost.section?.name || null, // Název staré sekce
            newName: newSection?.name || null, // Název nové sekce z DB
          },
        };
      
        // Porovnání polí
        for (const [field, value] of Object.entries(fieldsToCompare)) {
          if (typeof value === "object") {
            // Speciální porovnání pro ID kategorií a sekcí
            if (value.oldId !== value.newId) {
              changes.push({
                field,
                valueBefore: value.oldName, // Do DB vložíme starý název
                valueAfter: value.newName,  // Do DB vložíme nový název
              });
            }
          } else {
            const oldValue = oldPost[field];
            const newValue = value;
            if (oldValue !== newValue) {
              changes.push({
                field,
                valueBefore: oldValue,
                valueAfter: newValue,
              });
            }
          }
        }
        const timeeeeNow = DateTime.now()
        .setZone('Europe/Prague') // Čas zůstane v českém pásmu
        .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

        for (const change of changes) {
          await prisma.managementActions.create({
            data: {
              doneAt: timeeeeNow,
              fromUserId: userId,
              toUserId: oldPost.userId, // Předpoklad, že `userId` existuje
              info: `Editace příspěvek (${change.field})`,
              postId: postId,
              valueBefore: String(change.valueBefore),
              valueAfter: String(change.valueAfter),
            },
          });
        }
      }
    await checkDifferencesAndLogChanges(data.postId, data, session.userId);

    // Proceed with updating the post if privileges are higher
    await updatePost(data.postId, data);
    return new Response(JSON.stringify({
      message: "Úspěšná aktualizace příspěvku"
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    let data = await req.json();
      try{
           
  
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                info: `Chyba na /api/posts - PUT - (catch)  data: ${data}  `,
                dateAndTime: dateAndTime,
                errorPrinted: error,
                userId: session?.userId,
                ipAddress:ip,
              })
  
            }catch(error){}

    console.error('Chyba na serveru [PUT] požadavek na editaci příspěvku: ', error);
    return new Response(JSON.stringify({
      message: 'Chyba na serveru [PUT] požadavek na editaci příspěvku'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
}
}




export async function DELETE(req) {
  try {
    const session = await getSession();

    if (!session || !session.isLoggedIn || !session.email) {
      return new Response(JSON.stringify({
        message: "Chyba na serveru [DELETE] požadavek na smazání  příspěvku. Session nebyla nalezena "
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await req.json();
    
     
    // Fetch the post and the creator's role
    const post = await prisma.posts.findUnique({
      where: { id: data.postId },
      include: { user: { include: { role: true } } }  // Include the user and their role
    });

    if (!post) {
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - DELETE - (Příspěvek nenalezen))  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })
      return new Response(JSON.stringify({
        message: "Příspěvek nenalezen"
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }


    // If the session user is the post creator, allow removing
    if (post.userId === session.userId) {
     let haveImages =  await prisma.image.findMany({
        where: { postId: data.postId }
      });

      if(session.role.privileges > 1 && data.pernament == true){

        await prisma.posts.delete({
          where: { id: data.postId }
        })

              //ještě z s3 deletnout
              if(haveImages.length > 0){
    
                let res =  await  deleteImagesByPostId(data.postId)
               //  here invalidating path 1000 free per month
               //>>>  INVALIDATING HERE  <<<
               // let resCloudFront = await invalidateImagesOnCloudFrontByPostId(data.postId)
                    
               }
      } else{
        await prisma.posts.update({
          where: { id: data.postId },
          data: { visible: false },
        });
      }
        //sets its visibility to false istead of removing
     

 ;
    
       
      return new Response(JSON.stringify({
        message: 'Příspěvek byl úspěšně smazán'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    }
  

    // Check if the session user has strictly higher privileges than the post creator
    if (session.role.privileges <= post.user.role.privileges) {
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - DELETE - (Nemáte pravomoce k úpravě tohoto příspěvku(majitel příspěvků má vetší pravomoce))  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })
      return new Response(JSON.stringify({
        message: "Nemáte pravomoce k úpravě tohoto příspěvku"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const currentDate = DateTime.now()
    .setZone('Europe/Prague')
    .toFormat('yyyy-MM-dd');

    let numberOfActionsToday = await prisma.managementActions.count({
      where: {
        fromUserId: session.userId,
        doneAt: {
          gte: new Date(`${currentDate}T00:00:00.000Z`),
          lt: new Date(`${currentDate}T23:59:59.999Z`),
        },
      },
    });
    if(session.role.privileges  === 2 && numberOfActionsToday > 100 || session.role.privileges  === 3 && numberOfActionsToday > 200 ){
      const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
      req.headers.get("x-real-ip") ||                      // Alternativní hlavička
      req.socket?.remoteAddress ||                         // Lokální fallback
      null;
    
    // Odstranění případného prefixu ::ffff:
    const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
    
  
    
          const dateAndTime = DateTime.now()
          .setZone('Europe/Prague')
          .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
            await prisma.errors.create({
              info: `Chyba na /api/posts - DELETE - (Již jste vyčerpal adm. pravomocí)  data: ${data}  `,
              dateAndTime: dateAndTime,
              userId: session?.userId,
              ipAddress:ip,
            })
      return new Response(JSON.stringify({
        message: 'Již jste vyčerpal administrativních pravomocí dnes'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let haveImages =  await prisma.image.findMany({
      where: { postId: data.postId }
    });

    const timeee = DateTime.now()
    .setZone('Europe/Prague') // Čas zůstane v českém pásmu
    .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'"); // Pevně přidá offset "+00:00"
     await prisma.managementActions.create({
       data: { 
         doneAt: timeee, 
         fromUserId: session.userId, 
         toUserId: post.user.id, 
         info: `${data.pernament ? 'Trvale smazat příspěvek' : 'Smazat příspěvek [zneviditelnit]'}`, 
         postId: post.id 
       },
     });
    if(session.role.privileges > 1 && data.pernament == true){

      await prisma.posts.delete({
        where: { id: data.postId }
      })

            //ještě z s3 deletnout
            if(haveImages.length > 0){
  
              let res =  await  deleteImagesByPostId(data.postId)
             //  here invalidating path 1000 free per month
             //>>>  INVALIDATING HERE  <<<
             // let resCloudFront = await invalidateImagesOnCloudFrontByPostId(data.postId)
                  
             }
    } else{
      await prisma.posts.update({
        where: { id: data.postId },
        data: { visible: false },
      });
    }

    

    //ještě z s3 deletnout
    return new Response(JSON.stringify({
      message: 'Příspěvek byl úspěšně smazán'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });


  } catch (error) {

    let data = await req.json();
      try{
           
  
        const rawIp =
        req.headers.get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
        req.headers.get("x-real-ip") ||                      // Alternativní hlavička
        req.socket?.remoteAddress ||                         // Lokální fallback
        null;
      
      // Odstranění případného prefixu ::ffff:
      const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;
      
    
      
            const dateAndTime = DateTime.now()
            .setZone('Europe/Prague')
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
              await prisma.errors.create({
                info: `Chyba na /api/posts - DELETE - (catch)  data: ${data}  `,
                dateAndTime: dateAndTime,
                errorPrinted: error,
                userId: session?.userId,
                ipAddress:ip,
              })
  
            }catch(error){}


    console.error('Chyba na serveru [DELETE] požadavek na smazání příspěvku: ', error);
    return new Response(JSON.stringify({
      message: 'Chyba na serveru [DELETE] požadavek  na smazání příspěvku'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
}
}

// Function to update the post
async function updatePost(postId, data) {




  await prisma.posts.update({
    where: { id: postId },
    data: { phoneNumber: data.phoneNumber,location: data.location,description: data.description, name: data.name, price: data.price, categoryId: parseInt(data.category), sectionId: parseInt(data.section) }  // Update fields as needed
  });
}