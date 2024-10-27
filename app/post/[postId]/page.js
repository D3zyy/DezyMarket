import { prisma } from "@/app/database/db";
import Link from "next/link";
import { getSession } from "@/app/authentication/actions";
import { getUserAccountTypeOnStripe } from "@/app/typeOfAccount/Methods";

const Page = async ({ params }) => {
  let postRecord = null;
  let session = null;
  let accType;
  let description
  let isOverflowing
  try {
    session = await getSession();
    console.log(session);
    
    // Fetch the post, including related category and section names
    postRecord = await prisma.Posts.findUnique({
      where: {
        id: parseInt(params.postId), // Ensure postId is parsed to a number
      },
      include: {
        category: true,  // Assuming 'category' is the relation name for categoryId
        section: true,   // Assuming 'section' is the relation name for sectionId
        user: true,
      },
    });
    description = postRecord?.description
    isOverflowing = description.length >= 200;
    console.log(postRecord);
  } catch (error) {
    console.error("Error fetching post:", error);
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Nastala chyba</h1>
      </div>
    );
  }finally {
    await prisma.$disconnect(); // Close the connection after finishing
  }

  // If no post was found, show a message
  if (!postRecord) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Příspěvek nenalezen</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Left Side: Reserved for images */}
      <div className="flex-1 md:mr-4 mb-4 md:mb-0">
        <div className="bg-gray-100 h-full flex justify-center items-center p-4 rounded-lg">
          {/* Placeholder for images */}
          <p className="text-lg text-gray-600">Obrázky zde</p>
        </div>
      </div>

      {/* Right Side: Post details */}
      <div className="flex-1 p-4">
     
  <h3 className="text-xl font-bold" style={{ fontSize: "35px", marginRight: "100px" }}> {/* Add margin-right to create space */}
    {postRecord?.name} 
  </h3>
  <div className="flex items-center">
  <span className="text-sm " style={{ margin: "20px 0px" }}>
   <span className="mr-1">20</span>
  </span>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
</div>


        
        {/* User Info Section */}
        <div className="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
          </svg>
          <strong>
            <span className="mr-3">{postRecord?.user?.fullName}</span>
            {accType === process.env.BEST_RANK ? (
              <div className="badge badge-md badge-secondary badge-outline" style={{ color: '#c792e9', borderColor: '#c792e9', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                {process.env.BEST_RANK}
              </div>
            ) : accType === process.env.MEDIUM_RANK ? (
              <div className="badge badge-md badge-secondary badge-outline" style={{ color: '#ff7d5c', borderColor: '#ff7d5c', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                {process.env.MEDIUM_RANK}
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
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10">
  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
</svg>

        {/* Price, Category, Section, and Description Section */}
        <div className="flex">
  {/* Left Side: Price, Category, Section */}
  <div className="flex-1 pr-4 flex flex-col space-y-2"> {/* Flex for vertical alignment */}
    <div>
      <strong className="text-sm">Cena:</strong>
      <span className="ml-1">{postRecord.price} Kč</span> {/* Margin between label and value */}
    </div>
    <div>
      <strong className="text-sm">Kategorie:</strong>
      <span className="ml-1">
        <Link href={`/category?id=${postRecord?.categoryId}`}>
          <span style={{ marginRight: "2px" }} dangerouslySetInnerHTML={{ __html: postRecord?.category?.logo }}></span>
          <span className="link">{postRecord?.category?.name}</span>
        </Link>
      </span>
    </div>
    <div>
      <strong className="text-sm">Sekce:</strong>
      <span className="ml-1">
        <Link className="link" href={`/category?categoryId=${postRecord?.categoryId}&sectionId=${postRecord?.sectionId}`}>
          {postRecord?.section?.name}
        </Link>
      </span>
    </div>
   
    <div>
  <div className="flex items-center mb-2"> {/* Flex container for "Nahlásit uživatele" */}
    <strong className="text-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
    </strong>
    <span className="ml-1">Nahlásit uživatele</span>
  </div>
  <div className="flex items-center"> {/* Flex container for "Nahlásit příspěvek" */}
    <strong className="text-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
        />
      </svg>
    </strong>
    <span className="ml-1">Nahlásit příspěvek</span>
  </div>
  <div className="flex items-center mt-2"> {/* Flex container for "Nahlásit uživatele" */}
    <strong className="text-sm">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
</svg>

    </strong>
    <span className="ml-1">Ohodnotit uživatele</span>
  </div>
</div>
  </div>


  {/* Right Side: Description with Scroll */}
  <div className="flex-1 border-l pl-4 overflow-y-auto" style={{ maxHeight: '200px' }}> {/* Max height for scroll */}
    <div className="flex flex-col">
      <strong className="text-lg mb-2">Popis</strong>
      <p style={{ whiteSpace: 'pre-line' }}> {postRecord?.description}</p>
    </div>

  </div>
   {/* Render the SVG only if the content is overflowing */}
   {isOverflowing && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
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