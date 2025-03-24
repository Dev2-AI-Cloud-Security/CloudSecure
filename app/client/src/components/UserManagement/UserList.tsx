"use client";

import React from "react";

interface User {
  username: string;
  email: string;
  role: string;
}

const UserList: React.FC = () => {
  const users: User[] = [
    { username: "user1", email: "user1@example.com", role: "Admin" },
    { username: "user2", email: "user2@example.com", role: "User" },
    { username: "user3", email: "user3@example.com", role: "Security Analyst" },
  ];

  const handleDelete = (username: string) => {
    console.log(`Delete user: ${username}`);
  };

  return (
    <section className="flex overflow-hidden flex-col p-6 mt-6 w-full text-base text-black bg-white rounded-lg shadow-sm max-md:px-5 max-md:max-w-full">
      <h2 className="self-start text-xl font-semibold leading-snug">
        User List
      </h2>

      <div className="mt-4 max-w-full w-[1150px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2.5 pl-4 pr-10 text-left font-bold whitespace-nowrap">
                Username
              </th>
              <th className="py-2.5 pr-10 text-left font-bold whitespace-nowrap">
                Email
              </th>
              <th className="py-2.5 pr-10 text-left font-bold whitespace-nowrap">
                Role
              </th>
              <th className="py-2.5 pr-10 text-left font-bold whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.username}>
                <td className="px-4 py-2.5 border border-solid">
                  {user.username}
                </td>
                <td className="px-4 py-2.5 border border-solid">
                  {user.email}
                </td>
                <td className="z-10 px-4 py-2.5 border border-solid">
                  {user.role}
                </td>
                <td className="px-7 py-2.5 text-center text-red-600 border border-solid max-md:px-5">
                  <button
                    onClick={() => handleDelete(user.username)}
                    aria-label={`Delete ${user.username}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UserList;
