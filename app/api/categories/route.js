import { verifyToken } from "../email/verifyToken";
import { prisma } from "@/app/database/db";
import { getSession } from "@/app/authentication/actions";

export async function POST(req) {

  try {
   let  data = await req.json();

   if(!data) {
    return new Response(
        JSON.stringify({ message: 'Uživatel nebyl nalezen' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
   }
      const categories = await prisma.categories.findMany({});
      const categoriesFromUser = await prisma.userCategories.findMany({});

      const updatedCategories = categories.map(category => {
        // Zjistíme, zda je kategorie zaškrtnutá
        const isChecked = categoriesFromUser.some(userCategory => userCategory.categoryId === category.id);
        
        // Vrátíme novou kategorii s `checked` vlastností
        return {
          ...category,
          checked: isChecked
        };
      });
      if(categories){
        return new Response( JSON.stringify(updatedCategories),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
      }

    
  } catch (error) {
    // Handle errors
    console.error('Chyba při získávaní kategorii : :', error);
    return new Response(
      JSON.stringify({ message: 'Chyba na serveru [POST] získávání kategorií'}),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function updateUserCategory(data, session) {
    const { id: categoryId } = data;
    const userId = session.userId;
    
    try {
      if (data.isChecked) {
        // Pokud isChecked je true, zkontroluj, zda záznam existuje
        const existingCategory = await prisma.userCategories.findFirst({
          where: {
            categoryId: categoryId,
            userId: userId
          }
        });
  
        if (!existingCategory) {
          // Pokud záznam neexistuje, vytvoř nový
          const newCategory = await prisma.userCategories.create({
            data: {
              categoryId: categoryId,
              userId: userId
            }
          });
          console.log('Created Category:', newCategory);
          return newCategory;
        } else {
          console.log('Category already exists');
          return existingCategory;
        }
      } else {
        console.log("existuje dem to zoktnrolvat")
        // Pokud isChecked je false, zkontroluj, zda záznam existuje
        const existingCategory = await prisma.userCategories.findFirst({
          where: {
            categoryId: categoryId,
            userId: userId
          }
        });
        console.log("existuje ? :",existingCategory)
        if (existingCategory) {
          // Pokud záznam existuje, smaž ho
          const deletedCategory = await prisma.userCategories.delete({
            where: {
                userId_categoryId: {
                  userId: userId,
                  categoryId: categoryId
                }
              }
          });
          console.log('Deleted Category:', deletedCategory);
          return deletedCategory;
        } else {
          console.log('No category to delete');
        }
      }
    } catch (error) {
      console.error('Error processing category:', error);
      throw error;
    }
  }



export async function PUT(req) {

    try {
       const session = await getSession()
     if (!session.isLoggedIn) {
        return new Response(
            JSON.stringify({ message: 'Uživatel nebyl nalezen' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          );
     } 
     let  data = await req.json();
        console.log("data co jsem dostal :", data)
     if(!data) {
      return new Response(
          JSON.stringify({ message: 'Kategorie nebo uživatel nebyli nalezeny' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
     }

     
      updateUserCategory(data,session)
      
        return new Response( JSON.stringify("Uspesne upravena kategorie uzivatelem"),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
  
      
    } catch (error) {
      // Handle errors
      console.error('Chyba při editovaní kategorii :', error);
      return new Response(
        JSON.stringify({ message: 'Chyba na serveru [POST] získávání kategorií'}),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }