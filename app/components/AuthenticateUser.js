import Link from 'next/link';
import ProfileNavBarLoggedIn from './profileNavBarLoggedIn';
import ProfileNavBarNotLoggedIn from './profileNavBarNotLoggedIn';
import { getSession } from '../authentication/actions';

const AuthenticateUser = async () => {
 

  const session = await getSession();

  

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