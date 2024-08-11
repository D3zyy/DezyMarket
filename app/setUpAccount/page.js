import { getSession } from '../authentication/actions'; // Ensure this returns plain objects
import { redirect } from 'next/navigation';
import Categories from './categories';




const page = async () => {
  const session = await getSession(); 
  if (!session.isLoggedIn)  redirect('/');
  let user_id = session.userId 

  const res = await fetch( `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id })
  });
  let categories = await res.json()
  




    return (
      <div>
        {session.isLoggedIn? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3>Zvolte kategorie, které Vás zajímají</h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            padding: "30px",
            justifyContent: 'center',
            maxWidth: '700px', // Maximální šířka kontejneru, kterou můžete upravit
            width: '100%'
          }}>
            {categories.map(category => (
              <div key={category.id} style={{ flex: '1 1 calc(20% - 16px)', boxSizing: 'border-box' }}>
                <Categories
                  id={category.id}
                  name={category.name}
                  isChecked={category.checked}
                  logo={category.logo}
                />
              </div>
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