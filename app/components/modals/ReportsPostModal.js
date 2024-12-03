"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function openReportsPostModal() {
  document.getElementById("reports_post_modal").showModal();
}

export function closeReportsPostModal() {
  document.getElementById("reports_post_modal").close();
}

export const ReportsPostModal = ({ postId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const getReportsForPost = async () => {
      try {
        const response = await fetch("/api/postReports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });

        if (response.ok) {
          const data = await response.json();
          setReports(data.reports || []);
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.message || "Failed to fetch reports.");
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        setErrorMessage("An error occurred while fetching reports.");
      } finally {
        setTimeout(() => setLoading(false), 1000); // Ensures smooth UI transition
      }
    };

    getReportsForPost();
  }, [postId]);

  return (
    <dialog id="reports_post_modal" className="modal modal-bottom sm:modal-middle sm:max-w-none max-w-none">
      <div className="modal-box p-6 rounded-lg relative">
        {loading && (
          <div className="flex justify-center items-center  bg-opacity-75 p-1 z-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col items-center ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 mb-5 text-orange-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
</svg>

            {reports.length > 0 ? (
              <div className="space-y-4 w-full">
                {Object.values(
                  reports.reduce((groups, report) => {
                    const userId = report.fromUser.id;
                    if (!groups[userId]) {
                      groups[userId] = {
                        user: report.fromUser,
                        reports: [],
                        topic: report.topic,
                      };
                    }
                    groups[userId].reports.push(report);
                    return groups;
                  }, {})
                ).map((group, index) => (
                  <div key={index} className="flex flex-col space-y-4 bg-base-200 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-gray-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                      </svg>
                      <Link
                        href={`/user/${group.user.id}`}
                        className="underline  hover:underline"
                        target="_blank"
                      >
                        {group.user.fullName}
                      </Link>
                    </div>
                    {group.topic && (
                      <div className="flex items-center  space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-8 text-orange-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">{group.topic}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      {group.reports.map((report, idx) => (
                        <div key={idx} className="p-4 bg-base-100 rounded-lg">
                          <p className="font-semibold text-red-500">{report.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Žádné nahlášení.</p>
            )}
            {errorMessage && <p className="text-sm text-red-500 mt-4">{errorMessage}</p>}
            <div className="flex justify-center mt-6">
              <button onClick={closeReportsPostModal} className="btn  w-full sm:w-auto">
                Zavřít
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
};