"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { openReportPostModal } from "@/app/components/modals/ReportPostModal";
// Dynamicky načtený komponent bez SSR
const ReportPostModal = dynamic(
  () => import("@/app/components/modals/ReportPostModal"),
  { ssr: false }
);

export const handleOpenModalReportLazy = (
  openReportPostModal,
  isModalVisible,
  setIsModalVisible,
  setHasError
) => {
  try {
    setIsModalVisible(true);
    if (!isModalVisible) {
      setTimeout(() => {
        try {
          openReportPostModal();
        } catch (error) {
          setHasError(true);
          console.error("Chyba při otevírání modalu v timeoutu:", error);
        }
      }, 1000);
    } else {
      openReportPostModal();
    }
  } catch (error) {
    setHasError(true);
  }
};

export const ReportPostModalWrapperLazy = ({
  ppostId,
  creator,
  creatorId,
  imagesLen,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasError, setHasError] = useState(false); // Stav pro detekci chyby

  return (
    <div>
      <a
        href="#"
        className="btn sm:h-0 h-20 flex-shrink"
        onClick={(event) => {
          event.preventDefault(); // Zabránění výchozímu chování odkazu
          try {
            handleOpenModalReportLazy(
              openReportPostModal, // Zde nahraď svou implementací openReportPostModal
              isModalVisible,
              setIsModalVisible,
              setHasError
            );
          } catch (error) {
            setHasError(true);
            console.error("Chyba při onClick události:", error);
          }
        }}
      >
        {hasError ? (
          <span>Nastala chyba</span> // Zobrazí se text místo ikony
        ) : (
          <>
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
            Nahlásit příspěvek
          </>
        )}
      </a>

      {isModalVisible && (
        <div>
          {hasError ? (
            <span>Chyba při načítání modalu.</span>
          ) : (
            <ReportPostModal
              posttId={ppostId}
              postCreatorName={creator}
              postCreatorId={creatorId}
              imagesLength={imagesLen}
            />
          )}
        </div>
      )}
    </div>
  );
};