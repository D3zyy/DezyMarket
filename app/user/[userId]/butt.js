"use client";
import { openAddBanModal } from "./addBanModal";

export const ButtOp = ({ userId }) => {  // Destructure userId from props
  return (
    <button onClick={() => openAddBanModal()} className="btn btn-sm text-center">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>
 Ban
    </button>
  );
};