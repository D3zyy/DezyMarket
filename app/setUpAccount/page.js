import { getSession } from '../authentication/actions'; // Ensure this returns plain objects
import { redirect } from 'next/navigation';
import Categories from './categories';




const page = async () => {
  const session = await getSession(); 
  let user_id = session.userId 

  const res = await fetch( `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id })
  });
  let categories = await res.json()
  


  if (!session.isLoggedIn)  redirect('/');

    return (
      <div>
        {session.isLoggedIn? (
          <div style={{ display: 'flex', justifyContent: "centre" }}>
            <div> 
              <h3> Zvolte kategorie které Vás zajímají</h3>
              {categories.map(category => (
                <Categories
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  isChecked={category.checked}
                />
               ))}
          
           
              
   
            
            
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    );

};

export default page;