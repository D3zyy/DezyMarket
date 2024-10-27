import { redirect } from 'next/navigation';
import React from 'react';
import { getSession } from '../authentication/actions';
import NotLoggedIn from '../components/NotLoggedIn';
import { getUserAccountTypeOnStripe } from '../typeOfAccount/Methods';
import Account from '../typeOfAccount/Account';
import Post from './Post';
import AddUI from './AddUI';
import { prisma } from '../database/db';

const Page = async () => {
    let session
    let accType
        try{
            session = await getSession();
            if (!session) {
                throw new Error('Session nebyla nalezena');
            }
    
             accType = await getUserAccountTypeOnStripe(session.email);
            console.log("Account Type:", accType);
    
        }catch(error){
            throw new Error('Session nebo získaní typu účtu error:',error);
        }

        // Perform redirect if no account type is found and the user is logged in
        if (!accType && session.isLoggedIn) {
           await redirect('/typeOfAccount'); // Call redirect without await
        }
        try {
        // Fetching Categories and Sections with error handling
        let CategoriesFromDb, SectionsFromDb;
        try {
            CategoriesFromDb = await prisma.Categories.findMany({});
        } catch (dbError) {
            throw new Error("Chyba při načítání kategorií na /addPost - přidání příspěvku : " + dbError.message);
        }

        try {
            SectionsFromDb = await prisma.Sections.findMany({});
        } catch (dbError) {
            throw new Error("Chyba při načítání sekcí na /addPost - přidání příspěvku : " + dbError.message);
        }

        let userCategories = await prisma.userCategories.findMany({
            where: {
                userId: session.userId,
            },
            include: {
                category: {
                    select: {
                        name: true,
                        logo: true,
                    },
                },
            },
        });

        return (
            <div>
                {session.isLoggedIn ? (
                    <>
                        <div id='scrollHereAddPost' style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                            <ul style={{ paddingLeft: "15px", marginBottom: "20px" }} className="steps isolate">
                                <li className="step step-primary firstStep">Vyberte typ inzerátu</li>
                                <li className="step secondStep">Vytvořit inzerát</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: "40px" }} className="typeOfPosts flex flex-col md:flex-row items-center justify-center gap-2 p-2">
                            <Post
                                hasThisType={accType}
                                name={
                                    accType === process.env.BASE_RANK
                                        ? 'Topovaný'
                                        : accType === process.env.MEDIUM_RANK
                                            ? `Topovaný`
                                            : accType === process.env.BEST_RANK
                                                ? `Topovaný+ `
                                                : ''
                                }
                                emoji={
                                    accType === process.env.BASE_RANK
                                        ? "<div class='badge badge-lg badge-secondary badge-outline' style='color: #ff7d5c; border-color: #ff7d5c;'>Šikula</div> <div class='badge badge-lg badge-secondary badge-outline' style='color: #c792e9; border-color: #c792e9;'>Profík</div>"
                                        : accType === process.env.MEDIUM_RANK
                                            ? "<div class='badge badge-lg badge-secondary badge-outline' style='color: #ff7d5c; border-color: #ff7d5c;'>Šikula</div>"
                                            : accType === process.env.BEST_RANK
                                                ? "<div class='badge badge-lg badge-secondary badge-outline' style='color: #c792e9; border-color: #c792e9;'>Profík</div>"
                                                : ''
                                }
                                price={
                                    accType === process.env.BASE_RANK
                                        ? 28
                                        : accType === process.env.MEDIUM_RANK
                                            ? 0
                                            : accType === process.env.BEST_RANK
                                                ? 0
                                                : 28
                                }
                                priceId={"price_1PzMcUHvhgFZWc3Hb6o7RPbk"}
                                benefits={[
                                    [accType === process.env.BASE_RANK ? "X fotografií" : accType === process.env.MEDIUM_RANK ? "až 25 obrázků" : accType === process.env.BEST_RANK ? "až 30 obrázků" : "X obrázků", true],
                                    [accType === process.env.BASE_RANK ? "Doba uložení 2 měsíce" : accType === process.env.MEDIUM_RANK ? "Doba uložení 3 měsíce" : accType === process.env.BEST_RANK ? "Doba uložení 4 měsíce" : "Doba uložení X měsíce", true],
                                    ["Topovaný v kategorii ", true],
                                    ["Kdo si zobrazil inzerát", true],
                                    ["Počet zobrazení inzerátu", true],
                                    ["Topovaný v sekci", accType === process.env.BASE_RANK ? true : accType === process.env.MEDIUM_RANK ? false : accType === process.env.BEST_RANK ? process.env.BEST_RANK : true],
                                ]}
                            />

                            <Post
                                hasThisType={accType}
                                name={process.env.BASE_RANK}
                                emoji=""
                                price={0}
                                priceId={"price_1PuH84HvhgFZWc3HGd8JElE1"}
                                benefits={[
                                    ["až 20 obrázků ", true],
                                    ["Doba uložení  2 měsíce", true],
                                    ["Počet zobrazení inzerátu", true],
                                    ["Kdo si zobrazil inzerát", false],
                                    ["Topovaný v kategorii ", false],
                                    ["Topovaný v sekci", false],
                             
                                ]}
                            />
                        </div>

                        <div className='addPostSecondStep' style={{ display: "none" }}>
                            <AddUI accType={accType} userCategories={userCategories} categories={CategoriesFromDb} sections={SectionsFromDb} />
                        </div>
                    </>
                ) : (
                    <NotLoggedIn />
                )}
            </div>
        );
    } catch (error) {
        console.error("Chyba:", error);
        return <div>Nastala chyba při načítání této stránky: {error.message}</div>;
    }finally {
        await prisma.$disconnect(); // Uzavřete připojení po dokončení
    }
};

export default Page;