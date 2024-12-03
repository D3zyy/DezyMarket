"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { openReportsPostModal } from "@/app/components/modals/ReportsPostModal";

// Dynamically import ReportsPostModal without SSR
const ReportsPostModal = dynamic(
  () => import("@/app/components/modals/ReportsPostModal"),
  { ssr: false }
);

export const openReportsModalWrapper = (setIsModalVisible, openFunction) => {
  if (typeof setIsModalVisible === "function") {
    setIsModalVisible(true); // Show the modal
    console.log("Modal is set to visible.");
  } else {
    console.error("setIsModalVisible is not a function");
  }

  // If openFunction is provided, invoke it (if it's a function)
  if (typeof openFunction === "function") {
    openFunction(); // Call the passed function (optional)
    console.log("openFunction has been triggered");
  } else {
    console.error("openFunction is not a function");
  }
};

export const ReportsPostModalWrapperLazy = ({ postId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalLoaded, setIsModalLoaded] = useState(false);

  useEffect(() => {
    // Ensure that ReportsPostModal is loaded once
    if (ReportsPostModal) {
      setIsModalLoaded(true);
    }
  }, [ReportsPostModal]);

  // Debugging state to ensure the setter is working correctly
  console.log("isModalVisible state:", isModalVisible);
  console.log("isModalLoaded:", isModalLoaded);

  const handleOpenModal = () => {
    if (isModalLoaded) {
      // First round: Trigger the function to load the modal
      console.log("Loading the modal...");
      openReportsModalWrapper(setIsModalVisible, () => {
        console.log("First function call, preparing modal...");
      });

      // Second round: Immediately trigger the function to open the modal
      setTimeout(() => {
        console.log("Opening the modal...");
        openReportsModalWrapper(setIsModalVisible, () => {
          openReportsPostModal(); // Actually open the modal on the second call
        });
      }, 1000); // Use 0 to ensure it happens immediately after the first call
    } else {
      console.log("Modal is still loading, please wait...");
    }
  };

  return (
    <div>

  
      <a 
    className="btn border-dotted border-orange-500 border-2 flex-shrink hover:border-orange-500" 
    onClick={handleOpenModal}
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-orange-500 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
</svg>
  </a>

      {isModalVisible && <ReportsPostModal postId={postId} />}
    </div>
  );
};