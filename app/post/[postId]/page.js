import { prisma } from "@/app/database/db";
import Link from "next/link";
import { getSession } from "@/app/authentication/actions";

const Page = async ({ params }) => {
  let postRecord = null;
  let session = null;

  try {
    session = await getSession();
    console.log(session)
    // Fetch the post, including related category and section names
    postRecord = await prisma.Posts.findUnique({
      where: {
        id: parseInt(params.postId), // Ensure postId is parsed to a number
      },
      include: {
        category: true,  // Assuming 'category' is the relation name for categoryId
        section: true,   // Assuming 'section' is the relation name for sectionId
      },
    });
  } catch (error) {
    // If an error occurs, log it and return an error message
    console.error("Error fetching post:", error);
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Nastala chyba</h1>
      </div>
    );
  }

  // If no post was found, show a message
  if (!postRecord) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Post nenalezen</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Top: Reserved for images on mobile, left side on desktop */}
      <div className="flex-1 md:mr-4 mb-4 md:mb-0">
        Obrázky
      </div>
  
      {/* Right Side: Post details split into two sections */}
      <div className="flex-1 p-4">
        <h3 className="text-xl font-bold" style={{ fontSize: "35px", marginBottom: "30px" }}>{postRecord?.name}</h3>
        {/* First Section */}
        <div className="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
          </svg>
          <strong>
          {session?.fullName}  

          </strong> 
          <p className="mt-1 mb-1 flex items-center">
          <strong>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
          </strong> 
          <span className="ml-3">
            {postRecord?.phoneNumber?.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}
          </span>
        </p>
          <p  className="flex items-center">
          <strong>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
            </svg>
          </strong> 
          <span className="ml-3">
            {session?.email}
          </span>
        </p>
        </div>
  
        {/* Second Section */}
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-9 w-9">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
          <p>
          <strong>Cena:</strong> {Number.isInteger(Number(postRecord?.price)) ? `${postRecord.price} Kč` : postRecord.price}
        </p>
        <p style={{fontSize: "small", whiteSpace: 'pre-line' }}>
  <strong style={{fontSize: "medium"}}>Popis:</strong> {postRecord?.description}
</p>
          <p><strong>Kde:</strong> {postRecord?.location}</p>
        </div>
  
        {/* Category with Link */}
        <p>
          <strong>Kategorie:</strong>{' '}
          <Link href={`/category?id=${postRecord?.categoryId}`}>
            <span style={{ marginRight: "2px" }} dangerouslySetInnerHTML={{ __html: postRecord?.category?.logo }}></span>
            <span className="link">{postRecord?.category?.name}</span>
          </Link>
        </p>
  
        {/* Section with Link */}
        <p>
          <strong>Sekce:</strong>{' '}
          <Link className="link" href={`/category?categoryId=${postRecord?.categoryId}&sectionId=${postRecord?.sectionId}`}>
            {postRecord?.section?.name}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page;