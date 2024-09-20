import { redirect } from 'next/navigation';
import React from 'react';
import { getSession } from '../authentication/actions';
import NotLoggedIn from '../components/NotLoggedIn';
import { getUserAccountTypeOnStripe } from '../typeOfAccount/Methods';

const Page = async () => {

    const session = await getSession();
    if (session.isLoggedIn) {
        let accType = await getUserAccountTypeOnStripe(session.email);
        console.log("Typ účtu na /AddPost:", accType);
        if (!accType) {
           await redirect('/typeOfAccount');
        }
    }



    
    return (
        <div>
            {session.isLoggedIn ? (
                "Logged in"
            ) : (
                <NotLoggedIn />
            )}
        </div>
    );
};

export default Page;