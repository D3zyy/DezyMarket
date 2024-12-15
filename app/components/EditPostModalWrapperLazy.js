"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { openEditPostModal } from "@/app/components/modals/EditPostModal";

// Dynamicky načtený komponent bez SSR
const EditPostModal = dynamic(
  () => import("@/app/components/modals/EditPostModal"),
  { ssr: false }
);

export const handleOpenModalEditLazy = (
  openEditPostModal,
  isModalVisible,
  setIsModalVisible,
  setHasError
) => {
  try {
    setIsModalVisible(true);
    if (!isModalVisible) {
      setTimeout(() => {
        openEditPostModal();
      }, 1000);
    } else {
      openEditPostModal();
    }
  } catch (error) {
    setHasError(true); // Pokud dojde k chybě, nastavíme stav na true
    console.error("Chyba otevírání modalu:", error);
  }
};

export const EditPostModalWrapperLazy = ({
  typePost,
  idUserOfEditor,
  idUserOfPost,
  roleOfEditor,
  descriptionPost,
  posttId,
  posttName,
  posttPrice,
  postPhoneNumber,
  postLocation,
  postCategoryId,
  postSectionId,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasError, setHasError] = useState(false); // Stav pro detekci chyby

  return (
    <div>
     <a
  href="#"
  className={`${
    roleOfEditor > 1 && idUserOfEditor !== idUserOfPost
      ? "btn border-dotted border-red-600 border-2 flex-shrink hover:border-red-600"
      : "btn sm:h-0 h-20 flex-shrink"
  }`}
  onClick={(event) => {
    event.preventDefault(); // Zabránění výchozímu chování odkazu
    handleOpenModalEditLazy(
      openEditPostModal,
      isModalVisible,
      setIsModalVisible,
      setHasError
    );
  }}
>
        {hasError ? (
          <span>Nastala chyba</span> // Zobrazí se text místo ikony
        ) : roleOfEditor > 1 && idUserOfEditor != idUserOfPost ? (
          <>
            <span>Upravit</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-yellow-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
            <span>Upravit příspěvek</span>
          </>
        )}
      </a>

      {isModalVisible && (
        <EditPostModal
          typePost={typePost}
          idUserOfEditor={idUserOfEditor}
          idUserOfPost={idUserOfPost}
          roleOfEditor={roleOfEditor}
          descriptionPost={descriptionPost}
          posttId={posttId}
          posttName={posttName}
          posttPrice={posttPrice}
          postPhoneNumber={postPhoneNumber}
          postLocation={postLocation}
          postCategoryId={postCategoryId}
          postSectionId={postSectionId}
        />
      )}
    </div>
  );
};