"use client";
import { openAddBanModal } from "./addBanModal";

export const ButtOp = ({ userId }) => {  // Destructure userId from props
  return (
    <button onClick={() => openAddBanModal()} className="btn btn-sm text-center">
      Přidat ban
    </button>
  );
};