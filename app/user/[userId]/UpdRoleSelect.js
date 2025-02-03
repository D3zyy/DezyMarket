"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

function UpdRoleSelect({ idOfUser,allroles, sessionroleid }) {
  const router = useRouter();

  async function updateRole(roleId) {
    try {
      const res = await fetch('/api/updateRole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId,idOfUser }),
      });

      if (!res.ok) {
        throw new Error('Failed to update role');
      }

      // Obnoví stránku, aby reflektovala změny
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <select
      onChange={(event) => updateRole(Number(event.target.value))}
      className="select select-bordered w-full max-w-28"
      defaultValue={sessionroleid}
    >
      {allroles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name} 
        </option>
      ))}
    </select>
  );
}

export default UpdRoleSelect;