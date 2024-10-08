import { getPostFromDb } from "../methodsForPost"
import { getSession } from "@/app/authentication/actions"
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods"
import Link from "next/link";


const Page = async ({ params }) => {
    let session;
    let accType;
    let postRecord;
    let description;
    let isOverflowing;
  
    try {
      session = await getSession();
      postRecord = await getPostFromDb(params.postId);
      accType = await getUserAccountTypeOnStripe(postRecord.user.email);
      console.log("ucet uzivatele prispevku : ",accType)
      description = postRecord?.description;
      isOverflowing = description.length >= 200;
    } catch (error) {
      console.error("Chyba načítání příspěvku :", error);
      return (
        <div className="p-4">
          <h1 className="text-xl font-bold">Nastala chyba při načítání příspěvku</h1>
        </div>
      );
    }
  
    if (!postRecord) {
      return (
        <div className="p-4">
          <h1 className="text-xl font-bold">Příspěvek nenalezen</h1>
        </div>
      );
    }
  
    return (
      <div className="flex flex-col lg:flex-row items-start justify-between p-4 lg:p-8">
        {/* Left side - Images Placeholder */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start mb-4 lg:mb-0">
          <div className="bg-gray-100 w-full h-96 flex items-center justify-center rounded-lg">
            <p className="text-lg text-gray-600">Obrázky zde</p>
          </div>
        </div>
  
        {/* Right side - Information */}
        <div className="w-full lg:w-1/2 lg:pl-8">
          <h1 className="text-2xl font-bold mb-4">
            {postRecord?.name}
            </h1>
          {/* First section - Information */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-3 h-10 w-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
          </svg>
          <strong>
            <span className="mr-3"><Link className="link" href={`/user/${postRecord?.user?.id}`}>
            {postRecord?.user?.fullName}
        </Link></span>
            {accType === process.env.BEST_RANK ? (
              <div className="badge badge-md badge-secondary badge-outline" style={{ color: '#c792e9', borderColor: '#c792e9', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                 <Link href={session?.isLoggedIn ? `/typeOfAccount` : ``}>{process.env.BEST_RANK}</Link>              
              </div>
            ) : accType === process.env.MEDIUM_RANK ? (
              <div className="badge badge-md badge-secondary badge-outline" style={{ color: '#ff7d5c', borderColor: '#ff7d5c', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
              <Link href={session?.isLoggedIn ? `/typeOfAccount` : ``}>{process.env.MEDIUM_RANK}</Link>
              </div>
            ) : null}
          </strong>
          <p className="mt-1 mb-1 flex items-center">
            <strong>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
            </strong>
            <span className="ml-3">{postRecord?.phoneNumber?.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}</span>
          </p>
          <p className="flex items-center">
            <strong>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
              </svg>
            </strong>
            <span className="ml-3">{postRecord?.user?.email}</span>
          </p>
               {/* Second section - Information */}
          <svg  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-3  mt-4 h-10 w-10">
  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
</svg>
        
             <div>
      <strong className="text-sm">Cena</strong>
      <span className="ml-1">{postRecord.price} Kč</span> {/* Margin between label and value */}
    </div>
    <div>
      <strong className="text-sm">Kategorie</strong>
      <span className="ml-1">
        <Link href={`/category?id=${postRecord?.categoryId}`}>
          <span style={{ marginRight: "2px" }} dangerouslySetInnerHTML={{ __html: postRecord?.category?.logo }}></span>
          <span className="link">{postRecord?.category?.name}</span>
        </Link>
      </span>
    </div>
    <div>
      <strong className="text-sm">Sekce</strong>
      <span className="ml-1">
        <Link className="link" href={`/category?categoryId=${postRecord?.categoryId}&sectionId=${postRecord?.sectionId}`}>
          {postRecord?.section?.name}
        </Link>
      </span>
    </div>
    <div className="relative">
  <strong className="text-sm">Popis</strong>
  <p
    style={{ whiteSpace: 'pre-line', fontSize: 'small', maxHeight: '200px' }}
    className="overflow-y-auto text-base mb-4 w-full overflow-wrap break-word break-words"
  >
    {description}
  </p>
  {/* Render the SVG only if the content is overflowing */}
  {isOverflowing && (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 absolute top-0 right-0"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
    </svg>
  )}
</div>
        </div>
        
      </div>
    );
  };
  
  export default Page;