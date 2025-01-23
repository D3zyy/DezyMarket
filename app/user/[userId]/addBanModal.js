"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";

// Open Modal function
export const openAddBanModal = () => {
  const modal = document.getElementById("ban_add_modal");
  if (modal) {
    modal.showModal(); // Open the modal
  }
};

const CreateBanModal = ({ userIdd }) => {
  const [userId, setUserId] = useState(userIdd);
  const [reason, setReason] = useState("");
  const [permanent, setPermanent] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState(3); // Default to 3 days
  const [selectedDuration, setSelectedDuration] = useState(3); // Default selected duration

  const router = useRouter();

  // Function to close the modal
  const closeModal = () => {
    const modal = document.getElementById("ban_add_modal");
    if (modal) {
      modal.close(); // Close the modal
    }
  };

  const createBan = async () => {
    // Získání aktuálního času v Praze a správného formátu
    const bannedFrom = DateTime.now()
      .setZone("Europe/Prague")
      .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");

    let bannedTo = null;
    if (!permanent && numberOfDays) {
        // Výpočet bannedTo přidáním dnů/měsíců v Pražském čase
        const nowInPrague = DateTime.now().setZone("Europe/Prague");
      
        if (numberOfDays === 30) {
          // Přidání 1 měsíce a zajištění, že den zůstane konzistentní
          bannedTo = nowInPrague
            .plus({ months: 1 })
            .set({ hour: nowInPrague.hour, minute: nowInPrague.minute, second: nowInPrague.second })
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        } else {
          // Přidání dnů
          bannedTo = nowInPrague
            .plus({ days: numberOfDays })
            .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
        }
      }

    const updatedBanData = {
      userId,
      reason,
      bannedFrom,
      bannedTo,
      permanent,
    };

    try {
      const response = await fetch("/api/createBan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBanData),
      });

      const result = await response.json();
     router.refresh()
     closeModal()
      console.log("Ban created successfully", result);
    } catch (error) {
      console.error("Error creating ban:", error);
    }
  };

  // Function to handle button click and set the selected duration
  const handleDurationClick = (days) => {
    setNumberOfDays(days);
    setSelectedDuration(days); // Set the selected duration to apply the bg-primary class
    setPermanent(false); // Unset permanent if a duration is selected
  };

  return (
    <div className="mt-4">
      <dialog
        id="ban_add_modal"
        className="modal bg-slate-950/25 modal-bottom sm:modal-middle"
        data-backdrop="true"
      >
        <div className="modal-box">
          <span className="block text-lg text-center font-bold mb-4">Přidat ban</span>

          <table className="table table-zebra w-full mb-4">
            <tbody>
              <tr>
                <td>
                  <strong>Počet dní:</strong>
                </td>
                <td>
                  {selectedDuration === 0.5
                    ? "30 minut"
                    : selectedDuration}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Důvod:</strong>
                </td>
                <td>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    style={{ height: "150px", resize: "none" }}
                    placeholder="Důvod"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mb-6">
            <button
              className={`btn mt-2 btn-xs mr-2 ${
                selectedDuration === 1 ? "btn-primary" : ""
              }`}
              onClick={() => handleDurationClick(1)}
            >
              1 den
            </button>
            <button
              className={`btn mt-2 btn-xs mr-2 ${
                selectedDuration === 3 ? "btn-primary " : ""
              }`}
              onClick={() => handleDurationClick(3)}
            >
              3 dny
            </button>
            <button
              className={`btn mt-2 btn-xs mr-2 ${
                selectedDuration === 7 ? "btn-primary" : ""
              }`}
              onClick={() => handleDurationClick(7)}
            >
              7 dní
            </button>
            <button
              className={`btn mt-2 btn-xs mr-2 ${
                selectedDuration === 30 ? "btn-primary" : ""
              }`}
              onClick={() => handleDurationClick(30)}
            >
              1 měsíc
            </button>
            <button
              className={`btn mt-2 btn-xs mr-2 ${
                selectedDuration === 365 ? "btn-primary" : ""
              }`}
              onClick={() => handleDurationClick(365)}
            >
              1 rok
            </button>
            <button
              className={`btn mt-1 btn-xs mr-2 ${permanent ? "bg-primary" : ""}`}
              onClick={() => {
                setPermanent(true);
                setSelectedDuration(null); // Clear the selected duration
              }}
            >
              Trvalý ban
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={createBan}
            >
              Přidat ban
            </button>

            <button
              type="button"
              className="btn ml-4"
              onClick={closeModal}
            >
              Zavřít
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default CreateBanModal;