import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { z } from 'zod';
import { prisma } from "@/app/database/db";
import { S3Client, PutObjectCommand,ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import sharp from 'sharp';
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront"
import { DateTime } from 'luxon';
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
let sessionGeneral
const schema = z.object({
  name: z.string()
  .max(70, 'Název může mít maximálně 70 znaků.') 
  .min(5, 'Název musí mít alespoň 5 znaků.')
  .regex(/^[A-Za-z0-9á-žÁ-Ž., /()/-]*(?![<>;])$/, 'Název nesmí obsahovat < > nebo ;.'),
    
  phoneNumber: z.string()
    .max(9, 'Telefoní číslo musí mít přesně 9 číslic.') 
    .min(9, 'Telefoní číslo musí mít přesně 9 číslic.')
    .regex(/^[0-9]*$/, 'Telefoní číslo musí obsahovat pouze číslice.') // Fixed regex to only allow digits
    .optional(), // Make phoneNumber optional
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
      message: 'Popis nesmí obsahovat znaky < a >.'
    })
    .transform((value) => value.replace(/['";]/g, '')), // Remove quotes and semicolons

  location: z.string()
    .min(2, 'Místo musí mít alespoň 2 znaky.')
    .max(50, 'Místo může mít maximálně 50 znaků.')
    .regex(/^(?:[A-Za-z0-9á-žÁ-Ž]+(?: [A-Za-z0-9á-žÁ-Ž]+)?|[A-Za-z0-9á-žÁ-Ž]+ [A-Za-z0-9á-žÁ-Ž.]+)$/, 'Místo musí mít tvar "Název Číslo", "Název Název", nebo pouze "Název".'),
   

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
    try {
        let allowedTypeOfPost
        let formData;
        let allImages
 
        try {
            formData = await req.formData();
   
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

const numberOfPostsOfUser = await prisma.Posts.findMany({
  where: { userId: session.userID}
});
console.log(numberOfPostsOfUser)
if(numberOfPostsOfUser.length > 30){
  return new Response(JSON.stringify({ messageToDisplay: "Již jste nahráli maximální počet příspěvků." }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}
// Now you can use session directly throughout your function
const userId = session.userId; // Use userId directly from session


        
       


// Získání všech hodnot pro 'price'
let prices = formData.getAll('price');
console.log("data",formData)
// Najděte první nenulovou hodnotu
let priceConverted = prices.find(price => price !== '');

// Pokud máme cenu a je platná, převedeme ji
if (priceConverted && !isNaN(priceConverted) && Number.isInteger(parseFloat(priceConverted))) {
    priceConverted = parseInt(priceConverted, 10); // Převeď na celé číslo
    console.log('Valid price:', priceConverted);
} else {
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
              
               if (!( (allowedTypeOfPost === process.env.NEXT_PUBLIC_BASE_RANK && allImages.length <= 15) ||
                      (allowedTypeOfPost === process.env.NEXT_PUBLIC_MEDIUM_RANK && allImages.length <= 20) ||
                      (allowedTypeOfPost === process.env.NEXT_PUBLIC_BEST_RANK && allImages.length <= 25) )) {
                   
                  return new Response(JSON.stringify({ message: "Počet obrázků není povolen!" }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
               const categoryExist = await prisma.Categories.findUnique({
                where: { id: parseInt(formData.get('category')) }
              });
              if (!categoryExist) {
                return new Response(JSON.stringify({ message: "Tato kategorie neexistuje." }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              const sectionExist = await prisma.Sections.findUnique({
                where: { id: parseInt(formData.get('section')) }
              });

              if (!sectionExist) {
                return new Response(JSON.stringify({ message: "Tato sekce neexistuje." }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              const categorySectionExist = await prisma.Sections.findUnique({
                where: { id: parseInt(formData.get('section')) , categoryId:  parseInt(formData.get('category'))}
              });
              if (!categorySectionExist) {
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

              const localISODateFixedOffset = DateTime.now()
              .setZone('Europe/Prague') // Čas zůstane v českém pásmu
              .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'"); // Pevně přidá offset "+00:00"
              try{
                const price = validatedFields.data.price;
                const validatedPrice = typeof price === 'number' && Number.isInteger(price) ? price.toString() : price;
                 newPost = await prisma.Posts.create({
                  data: {
                    dateAndTime: localISODateFixedOffset,
                    name: validatedFields.data.name,
                    description: validatedFields.data.description,
                    price: validatedPrice,
                    location: validatedFields.data.location,
                    typeOfPost: formData.get('typeOfPost'),
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
                
                return new Response(JSON.stringify({ message: "Nastala chyba při přidávání příspěvku do db." }), {
                  status: 403,
                  headers: { 'Content-Type': 'application/json' }
              });
              }

            
              return new Response(JSON.stringify({ message: "Příspěvek úspěšně vytvořen" , id : newPost.id }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
               

            } else {
   
                if(formData.get('typeOfPost') != process.env.NEXT_PUBLIC_BASE_RANK && formData.get('typeOfPost') != process.env.NEXT_PUBLIC_MEDIUM_RANK && formData.get('typeOfPost') != process.env.NEXT_PUBLIC_BEST_RANK ){
                   
                    return new Response(JSON.stringify({ message: "Tento typ příspěvku neexistuje." }), {
                        status: 403,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

        
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
        return new Response(JSON.stringify({ message: "Tato kategorie neexistuje." }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const sectionExist = await prisma.Sections.findUnique({
        where: { id: parseInt(data.section) }
      });

      if (!sectionExist) {
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
    if( numberOfActionsToday >25){
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
      return new Response(JSON.stringify({ message: "Tato kategorie neexistuje." }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const sectionExist = await prisma.Sections.findUnique({
      where: { id: parseInt(data.section) }
    });

    if (!sectionExist) {
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
    console.error('Chyba na serveru [PUT] požadavek na editaci příspěvku: ', error);
    return new Response(JSON.stringify({
      message: 'Chyba na serveru [PUT] požadavek na editaci příspěvku'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
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
      where: { id: data.postId , visible: true,},
      include: { user: { include: { role: true } } }  // Include the user and their role
    });

    if (!post) {
      return new Response(JSON.stringify({
        message: "Příspěvek nenalezen"
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }


    // If the session user is the post creator, allow removing
    if (post.userId === session.userId) {
     let haveImages =  await prisma.Image.findMany({
        where: { postId: data.postId }
      });

        //sets its visibility to false istead of removing
      await prisma.posts.update({
        where: { id: data.postId },
        data: { visible: false },
      });

     // await prisma.posts.delete({
      //  where: { id: data.postId }
      //});
          //ještě z s3 deletnout
          if(haveImages.length > 0){
    
           let res =  await  deleteImagesByPostId(data.postId)
           // here invalidating path 1000 free per month
          // let resCloudFront = await invalidateImagesOnCloudFrontByPostId(data.postId)
               
            } else {
        
            }
       
      return new Response(JSON.stringify({
        message: 'Příspěvek byl úspěšně smazán'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    }
  

    // Check if the session user has strictly higher privileges than the post creator
    if (session.role.privileges <= post.user.role.privileges) {
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
    if( numberOfActionsToday > 25){
      return new Response(JSON.stringify({
        message: 'Již jste vyčerpal administrativních pravomocí dnes'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let haveImages =  await prisma.Image.findMany({
      where: { postId: data.postId }
    });

    await prisma.posts.update({
      where: { id: data.postId },
      data: { visible: false },
    });
  //  await prisma.posts.delete({
    //  where: { id: data.postId }
    //});
    if(haveImages.length > 0){
 
      let res =  await  deleteImagesByPostId(data.postId)
      
     } 
     const timeee = DateTime.now()
     .setZone('Europe/Prague') // Čas zůstane v českém pásmu
     .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'"); // Pevně přidá offset "+00:00"
      await prisma.managementActions.create({
        data: { doneAt: timeee , fromUserId: session.userId,toUserId:  post.user.id, info: "Smazat příspěvek [zneviditelnit]" , postId: post.id },
      });

    //ještě z s3 deletnout
    return new Response(JSON.stringify({
      message: 'Příspěvek byl úspěšně smazán'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });


  } catch (error) {
    console.error('Chyba na serveru [DELETE] požadavek na smazání příspěvku: ', error);
    return new Response(JSON.stringify({
      message: 'Chyba na serveru [DELETE] požadavek  na smazání příspěvku'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Function to update the post
async function updatePost(postId, data) {




  await prisma.posts.update({
    where: { id: postId },
    data: { phoneNumber: data.phoneNumber,location: data.location,description: data.description, name: data.name, price: data.price, categoryId: parseInt(data.category), sectionId: parseInt(data.section) }  // Update fields as needed
  });
}