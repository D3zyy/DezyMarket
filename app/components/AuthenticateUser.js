


import Link from 'next/link';
import ProfileNavBarLoggedIn from './profileNavBarLoggedIn';
import ProfileNavBarNotLoggedIn from './profileNavBarNotLoggedIn';
import InfoModal from "@/app/components/modals/InfoModal";
import { getSession } from '../authentication/actions';
const AuthenticateUser = async () => {
 

  const session = await getSession();
  console.log("session odpoved ze serveru: ",session)
  

  return (
    <div>
      {session.isLoggedIn ? (
        <ProfileNavBarLoggedIn />
      ) : (
        <ProfileNavBarNotLoggedIn />
      )}
    </div>
  );
};

export default AuthenticateUser;