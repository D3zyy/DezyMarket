import { getPostFromDb } from "../methodsForPost";
import { getSession } from "@/app/authentication/actions";
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods";
import Link from "next/link";
import NotLoggedInButton from "@/app/components/NotLoggedInButton";
import ImageGallery from "@/app/components/ImageGallery";
import { isNotFoundError } from "next/dist/client/components/not-found";
import NotFound from "@/app/not-found";
import { EditPostModal,openEditPostModal,closeEditPostModal } from "@/app/components/modals/EditPostModal";


const Page = async ({ params }) => {
  let session;
  let accType;
  let postRecord;
  let description;
  let isOverflowing;


  try {
    session = await getSession();
    postRecord = await getPostFromDb(params.postId);
   // console.log(postRecord)
    if (!postRecord) {
      return (
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"  className="w-12 h-12 mx-auto text-red-500 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
            </svg>
            Příspěvek nenalezen
            <br />
           <Link  className="btn mt-2" href={"/"}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
</svg>
</Link>
          </h1>
        </div>
      );
    }
  
    accType = await getUserAccountTypeOnStripe(postRecord.user.email);
    description = postRecord?.description;
    isOverflowing = description.length >= 280;
  
  } catch (error) {
    throw Error("Nastala chyba při načítání příspěvku.")
  }





  return (
  <div>
    

    <div
    className="flex flex-col lg:flex-row p-4 lg:p-8"
    style={{ boxShadow: '0 0 10px var(--fallback-p,oklch(var(--p)/var(--tw-bg-opacity)))' }}
  >
    
     <ImageGallery />



      {/* Right section - Information */}
      
      <div className="lg:w-1/2   flex flex-col justify-between lg:pl-8">
      {!(postRecord.typeOfPost === process.env.BASE_RANK) && (
  <div
  className="mt-3 lg:mt-0 badge badge-md badge-outline "
  style={{
    fontSize: '0.875rem',
    padding: '8px',
    borderWidth: '1.2px',
    borderStyle: 'solid',
   
    height: '2rem', // Přidej pro větší výšku
  }}
>
    <Link
      href={session?.isLoggedIn ? `/typeOfAccount` : ``}
      style={{ fontWeight: 'bold', fontSize: '1rem' }}
    >
      TOP
    </Link>
  </div>
)}
      <h1 style={{ fontSize: "25px" }} className="text-xl font-bold mb-4 sm:mt-5 mt-5">
              {postRecord?.name}
            </h1>

            <div className="mb-5" style={{ display: 'flex', alignItems: 'center' }}>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{ marginRight: '8px' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
  <span>200x</span>
</div>

 
  

           

        <div className="flex flex-col lg:flex-row md:flex-row ">
          {/* First part of the right section */}
          <div className="lg:w-3/4 md:w-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-5 h-10 w-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
            </svg>
           

            <div className="flex items-center">
  <Link  href={`/user/${postRecord?.user?.id}`}>
    <strong>
      <span className="underline mr-3">{postRecord?.user?.fullName}</span>
    </strong>
  </Link>

  {accType === process.env.BEST_RANK ? (
    <div className="badge badge-md badge-secondary badge-outline" style={{ color: '#c792e9', borderColor: '#c792e9', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
      <Link href={session?.isLoggedIn ? `/typeOfAccount` : ``}>
        {process.env.BEST_RANK}
      </Link>
    </div>
  ) : accType === process.env.MEDIUM_RANK ? (
    <div className="badge badge-md badge-secondary badge-outline" style={{ color: '#ff7d5c', borderColor: '#ff7d5c', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
      <Link href={session?.isLoggedIn ? `/typeOfAccount` : ``}>
        {process.env.MEDIUM_RANK}
      </Link>
    </div>
  ) : null}

  
</div>








<div className="flex mt-5">
  
  {/* Left side with two sections (top and bottom) */}
  <div className="flex flex-col justify-between mr-4">
    {/* Top section */}
    <div className="mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    </div>
    {/* Bottom section */}
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
      </svg>
    </div>
  </div>

  {/* Right side with phone number and email */}
  <div className="relative flex flex-col justify-between w-full">
    <div className={`mb-4 ${!session.isLoggedIn ? 'blur-lg' : ''}`}>
      {session.isLoggedIn ? postRecord?.phoneNumber?.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : "Nepřihlášen"}
    </div>
    <div className={`${!session.isLoggedIn ? 'blur-lg' : ''}`}>
      {session.isLoggedIn ? postRecord?.user?.email : "Nepříhlašen"}
    </div>

    {/* Centered button when not logged in */}
    {!session.isLoggedIn && (
      <div className=" absolute inset-0 flex items-center ">
        < NotLoggedInButton />
      </div>
    )} 
  </div>
</div>


    

          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mt-5 h-10 w-10">
  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
</svg>



            <div className="mt-3">
              <strong className="text-sm">Cena</strong>
              <span className="ml-1">{Number.isInteger(Number(postRecord.price)) ? `${postRecord.price} Kč` : postRecord.price}</span>
            </div>
            <div className="mt-3">
              <strong className="text-sm">Zveřejněno</strong>
              <span className="ml-1">
  {new Date(postRecord.dateAndTime).toISOString().slice(0, 10).split('-').reverse().join('.')}
</span>
            </div>
            <div className="mt-3">
      <strong className="text-sm">Kategorie:</strong>
      <span className="ml-1">
        <Link href={`/category?id=${postRecord?.categoryId}`}>
          <span style={{ marginRight: "2px" }} dangerouslySetInnerHTML={{ __html: postRecord?.category?.logo }}></span>
          <span className="link">{postRecord?.category?.name}</span>
        </Link>
      </span>
    </div>
    <div className="mt-3">
      <strong className="text-sm">Sekce:</strong>
      <span className="ml-1">
        <Link className="link" href={`/category?categoryId=${postRecord?.categoryId}&sectionId=${postRecord?.sectionId}`}>
          {postRecord?.section?.name}
        </Link>
      </span>
    </div>
          </div>
          

          {/* Vertical line between sections */}
          <div className="border-l border-gray-300 mx-4"></div>

          {/* Second part of the right section - Description */}
          <div className="mt-5 md:mt-0 lg:mt-0 relative overflow-hidden">{/* Add overflow-hidden to the parent */}
  <strong className="text-xl">Popis</strong>
  <div className="mt-2 overflow-y-auto max-h-[310px] lg:max-w-[648px] md:max-w-[900px]"> {/* Wrap in a div for better overflow handling */}
    <p style={{ whiteSpace: 'pre-line' }} className="text-base mb-4 break-words">
      {description}
    </p>
  </div>
  {isOverflowing && (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 absolute top-2 right-2" // Adjusted to prevent overlapping with the text
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
    </svg>
  )}
</div>
        </div>

        {/* SVG Icons at the bottom */}
       
        <div className="flex justify-center space-x-6 mt-4 border-t pt-4">
 
 {postRecord.userId === session.userId ? <><div style={{textAlign: "center"}} className="flex items-center space-x-2">
  
<EditPostModal post={postRecord} descriptionPost={description}/>
<a className="btn" onClick={openEditPostModal}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-yellow-300">
<path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg> Upravit příspěvek</a>
</div>
<div style={{textAlign: "center"}} className="flex items-center space-x-2">


<a className="btn"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-500">
<path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg> Smazat příspěvek </a>
</div>
</> 
: <>
<div style={{textAlign: "center"}} className="flex items-center ">
<a className="btn">
<svg
xmlns="http://www.w3.org/2000/svg"
fill="none"
viewBox="0 0 24 24"
strokeWidth={1.5}
stroke="currentColor"
className="h-6 w-6 text-red-600"
>
<path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
/>
</svg>
Nahlásit příspěvek</a>
</div>
<div style={{textAlign: "center"}} className=" flex items-center">
<a className="btn">
<svg
xmlns="http://www.w3.org/2000/svg"
fill="none"
viewBox="0 0 24 24"
strokeWidth={1.5}
stroke="currentColor"
className="h-6 w-6 text-yellow-600"
>
<path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
/>
</svg>
Ohodnotit uživatele</a>
</div></> }


</div>
      </div>
    </div>
    </div>
  );
};

export default Page;