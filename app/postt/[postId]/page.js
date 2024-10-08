import { getPostFromDb } from "../methodsForPost";
import { getSession } from "@/app/authentication/actions";
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods";
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
    description = postRecord?.description;
    isOverflowing = description.length >= 280;
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
    <div className="flex flex-col lg:flex-row p-4 lg:p-8">
      {/* Left section - Images */}
      <div className="lg:w-1/2 flex justify-center">
        <div className="bg-gray-100 w-full h-96 md:h-[30rem] lg:h-[30rem] flex items-center justify-center rounded-lg">
          <p className="text-lg text-gray-600">Obrázky zde</p>
        </div>
      </div>

      {/* Right section - Information */}
      <div className="lg:w-1/2 flex flex-col justify-between lg:pl-8">
      <h1 style={{ fontSize: "30px" }} className="text-xl font-bold mb-4 sm:mt-0 mt-5">
              {postRecord?.name}
            </h1>
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* First part of the right section */}
          <div className="lg:w-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-5 h-10 w-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
            </svg>
           

            <div className="flex items-center">
  <Link  href={`/user/${postRecord?.user?.id}`}>
    <strong>
      <span className="mr-3">{postRecord?.user?.fullName}</span>
    </strong>
  </Link>

  {accType === process.env.BEST_RANK ? (
    <div className="badge badge-md badge-secondary badge-outline" style={{ color: '#c792e9', borderColor: '#c792e9', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
      {process.env.BEST_RANK}
    </div>
  ) : accType === process.env.MEDIUM_RANK ? (
    <div className="badge badge-md badge-secondary badge-outline" style={{ color: '#ff7d5c', borderColor: '#ff7d5c', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
      {process.env.MEDIUM_RANK}
    </div>
  ) : null}

  {accType === process.env.BEST_RANK && (
    <div className="badge ml-3" style={{ color: '#c792e9' }}>
      <Link href={session?.isLoggedIn ? `/typeOfAccount` : ``}>
        {process.env.BEST_RANK}
      </Link>
    </div>
  )}
</div>






            <p className="mt-3 mb-1 flex items-center">
            <strong>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
            </strong>
            <span className="ml-3">{postRecord?.phoneNumber?.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}</span>
          </p>
          <p className="mt-3 mb-1 flex items-center">
            <strong>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
              </svg>
            </strong>
            <span className="ml-3">{postRecord?.user?.email}</span>
          </p>

          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mt-5 h-10 w-10">
  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
</svg>



            <div className="mt-5">
              <strong className="text-sm">Cena</strong>
              <span className="ml-1">{postRecord.price} Kč</span>
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
          <div className="sm:mt-0 mt-5 lg:w-1/2 relative">
  <strong className="text-xl">Popis</strong>
  <p style={{whiteSpace: 'pre-line'}} className="mt-2 overflow-y-auto text-base mb-4 break-words max-h-[310px] min-w-[250]">
    {description}
  </p>
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

        {/* SVG Icons at the bottom */}
        <div className="flex justify-center space-x-4 mt-4 border-t pt-4">
  <div style={{textAlign: "center"}} className="flex items-center space-x-2">
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
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
    <p>Nahlásit uživatele</p>
  </div>
  <div style={{textAlign: "center"}} className="flex items-center space-x-2">
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
    <p>Nahlásit příspěvek</p>
  </div>
  <div style={{textAlign: "center"}} className=" flex items-center space-x-2">
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
    <p>Ohodnotit uživatele</p>
  </div>
  
</div>
      </div>
    </div>
  );
};

export default Page;