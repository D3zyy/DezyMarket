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
        setLoading(false);
      }
    };

    getReportsForPost();
  }, [postId]);

  return (
    <dialog id="reports_post_modal" className="modal modal-bottom sm:modal-middle sm:max-w-none max-w-none">
      <div className="modal-box p-6 sm:max-w-[1100px] rounded-lg relative">
        {loading && (
          <div className="flex justify-center items-center w-full h-full absolute top-0 left-0 rounded-lg">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        <div className="flex flex-col items-center">
          <h3 className="text-2xl font-semibold text-primary mb-4">Reporty Příspěvku</h3>

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
                    <Link href={`/user/${group.user.id}`} className="underline text-primary hover:underline" target="_blank">
  {group.user.fullName}
</Link>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-yellow-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">{group.topic || "Více nebylo uvedeno"}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    <span className="text-sm text-gray-500">
                      {new Date(group.reports[0].reportedAt).toLocaleString()}
                    </span>
                  </div>

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
            <button onClick={closeReportsPostModal} className="btn btn-primary w-full sm:w-auto">
              Zavřít
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};