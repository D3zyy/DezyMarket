import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/authentication/actions";
import { z } from 'zod';
import { prisma } from "@/app/database/db";
import { S3Client, PutObjectCommand,ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import sharp from 'sharp';


const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
let sessionGeneral
const schema = z.object({
  name: z.string()
  .max(70, 'Název může mít maximálně 70 znaků.') 
  .min(5, 'Název musí mít alespoň 5 znaků.')
  .regex(/^[A-Za-z0-9á-žÁ-Ž., /-]*(?![<>;])$/, 'Název nesmí obsahovat < > nebo ;.'),
    
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
   

  price: z.union([
    z.number()
      .min(1, 'Cena musí být minimálně 1.')
      .max(5000000, 'Cena může být maximálně 5000000.'),
    z.string()
      .regex(/^(Dohodou|V textu|Zdarma)$/, 'Cena musí být "Dohodou", "V textu" nebo "Zdarma".'),
  ]),
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
           console.log("data ktery sem dostal od klienta :",formData)
           console.log(formData.getAll("images"))
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
console.log("počet příspěvků uživatele:",numberOfPostsOfUser.length)
if(numberOfPostsOfUser.length > 30){
  return new Response(JSON.stringify({ messageToDisplay: "Již jste nahráli maximální počet příspěvků." }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}
// Now you can use session directly throughout your function
const userId = session.userId; // Use userId directly from session


        
       

          let priceConverted = formData.get('price'); // Vždy vrací string
 
      
            if (!isNaN(priceConverted) && Number.isInteger(parseFloat(priceConverted))) {
                priceConverted = parseInt(priceConverted, 10); // Převeď na celé číslo
            }
            console.log("tady")
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
          console.log("tady po ")
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
            console.log("Povolený druh příspěvku :", allowedTypeOfPost)
       
            if (allowedTypeOfPost === formData.get('typeOfPost') ||  formData.get('typeOfPost') === process.env.NEXT_PUBLIC_BASE_RANK && allowedTypeOfPost ===process.env.NEXT_PUBLIC_BEST_RANK || formData.get('typeOfPost') === process.env.NEXT_PUBLIC_BASE_RANK && allowedTypeOfPost ===process.env.NEXT_PUBLIC_MEDIUM_RANK  ){
               console.log(validatedFields)
               if (!( (allowedTypeOfPost === process.env.NEXT_PUBLIC_BASE_RANK && allImages.length <= 15) ||
                      (allowedTypeOfPost === process.env.NEXT_PUBLIC_MEDIUM_RANK && allImages.length <= 20) ||
                      (allowedTypeOfPost === process.env.NEXT_PUBLIC_BEST_RANK && allImages.length <= 25) )) {
                    console.log("Počet obrazku neni povolen pocet :",allImages.length)
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
              try{
                const price = validatedFields.data.price;
                const validatedPrice = typeof price === 'number' && Number.isInteger(price) ? price.toString() : price;
                 newPost = await prisma.Posts.create({
                  data: {
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
         
              } catch(error) {
                console.log("tady db problem ",error)
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
    console.log("Received data:", data);

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

    const validatedFields = schema.safeParse({
      name: data.name,
      location: data.location,
      category: parseInt(data.category),
      section: parseInt(data.section),
      description: data.description,
     // location: formData.get('location'),
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
     // location: formData.get('location'),
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
    console.log(session)
    if (!session || !session.isLoggedIn || !session.email) {
      return new Response(JSON.stringify({
        message: "Chyba na serveru [DELETE] požadavek na smazání  příspěvku. Session nebyla nalezena "
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await req.json();
    console.log("Received data DELETE POST:", data);

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


    // If the session user is the post creator, allow removing
    if (post.userId === session.userId) {
     let haveImages =  await prisma.Image.findMany({
        where: { postId: data.postId }
      });
      await prisma.posts.delete({
        where: { id: data.postId }
      });
          //ještě z s3 deletnout
          if(haveImages.length > 0){
            console.log("Má obrázky")
           let res =  await  deleteImagesByPostId(data.postId)
                console.log("odpoved na vymazani obrazku z s3 :",res) 
            } else {
              console.log("Nemá obrázky")
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
    let haveImages =  await prisma.Image.findMany({
      where: { postId: data.postId }
    });

    await prisma.posts.delete({
      where: { id: data.postId }
    });
    if(haveImages.length > 0){
      console.log("Má obrázky")
      let res =  await  deleteImagesByPostId(data.postId)
      console.log("odpoved na vymazani obrazku z s3 :",res) 
     } else {
        console.log("Nemá obrázky")
      }
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
    data: { location: data.location,description: data.description, name: data.name, price: data.price, categoryId: parseInt(data.category), sectionId: parseInt(data.section) }  // Update fields as needed
  });
}