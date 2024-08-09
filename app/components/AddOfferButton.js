"use client"; // Ensure this file is used in a client component context

import { useRouter } from 'next/navigation';

const AddOfferButton = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/addPost");
  };

  return (
  
      
      <button
        id="add-offer-btn"
        onClick={handleClick}
        onTouchStart={handleClick}
        style={{ margin: "10px 0px" }}
        className="btn"
      >
        Přidat inzerát
      </button>
    
  );
};

export default AddOfferButton;