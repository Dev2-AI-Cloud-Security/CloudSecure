"use client";

import React, { useState } from "react";

const RolePermissions: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleAssignRole = () => {
    console.log(`Assigning role: ${selectedRole}`);
  };

  return (
    <section className="flex overflow-hidden flex-col p-6 mt-8 w-full font-semibold bg-white rounded-lg shadow-sm max-md:px-5 max-md:max-w-full">
      <h2 className="self-start text-xl leading-snug text-black">
        Role-based Permissions
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAssignRole();
        }}
      >
        <label
          htmlFor="role-select"
          className="self-start mt-4 text-sm font-medium leading-none text-gray-700 block"
        >
          Assign Role
        </label>

        <select
          id="role-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full mt-1 h-[39px] bg-white rounded-md border border-gray-300 border-solid px-3 py-2"
        >
          <option value="">Select a role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="security_analyst">Security Analyst</option>
        </select>

        <button
          type="submit"
          className="px-16 py-2 mt-4 text-base text-center text-white bg-blue-600 rounded-md max-md:px-5 max-md:max-w-full"
        >
          Assign Role
        </button>
      </form>
    </section>
  );
};

export default RolePermissions;
