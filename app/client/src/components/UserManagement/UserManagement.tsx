"use client";

import React from "react";
import UserList from "./UserList.tsx";
import RolePermissions from "./RolePermissions.tsx";
import ActivityLogs from "./ActivityLogs.tsx";
const UserManagement: React.FC = () => {
  return (
 
    
    <section className="flex flex-col">
      <h1 className="z-10 self-start -mt-1.5 text-3xl font-semibold leading-tight text-black max-md:max-w-full">
        User Management & Access Control
      </h1>
      <UserList />
      <RolePermissions />
      <ActivityLogs />
      
    </section>
    
  );
};

export default UserManagement;
