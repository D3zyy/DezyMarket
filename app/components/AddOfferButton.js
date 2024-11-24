"use client"; // Ensure this file is used in a client component context

import { useRouter } from "next/navigation";

const AddOfferButton = ({ onClick }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(); // Call the passed onClick function
    }
    router.push("/addPost"); // Then navigate to the /addPost route
  };

  return (
    <button
      id="add-offer-btn"
      onClick={handleClick}
      onTouchStart={handleClick}
      style={{ margin: "0px 10px" }}
      className="btn"
    >
      Přidat inzerát
    </button>
  );
};

export default AddOfferButton;