"use client";

import React from "react";

const ActivityLogs: React.FC = () => {
  const logs = [
    "User1 logged in",
    "User2 updated profile",
    "User3 accessed sensitive data",
    "User1 logged out",
  ];

  return (
    <section className="flex overflow-hidden flex-col p-6 mt-8 w-full text-black bg-white rounded-lg shadow-sm max-md:px-5 max-md:max-w-full">
      <h2 className="self-start text-xl font-semibold leading-snug">
        Activity Logs
      </h2>

      <div className="flex overflow-hidden flex-col items-start pt-2 pr-20 pb-40 pl-8 mt-4 text-base bg-gray-200 rounded-lg max-md:px-5 max-md:pb-24 max-md:max-w-full">
        <ul className="w-full">
          {logs.map((log, index) => (
            <li
              key={index}
              className={index === logs.length - 1 ? "mb-0 max-md:mb-2.5" : ""}
            >
              {log}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ActivityLogs;
