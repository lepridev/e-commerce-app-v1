"use client";

import { useUsers } from "@/lib/firestore/user/read";
import { Avatar, CircularProgress } from "@nextui-org/react";
import { useState } from "react";

export default function ListView() {
  const { data: users, error, isLoading } = useUsers();

  // Debug: afficher les données reçues
  console.log("Users data:", users);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Erreur de chargement: {error}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Aucun utilisateur trouvé
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-3 md:pr-5 md:px-0 px-5 rounded-xl">
      <table className="border-separate border-spacing-y-3 w-full">
        <thead>
          <tr>
            <th className="font-semibold border-y bg-white px-3 py-2 border-l rounded-l-lg">
              N°
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2">Photo</th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Nom
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Email
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((item, index) => (
            <Row index={index} item={item} key={item?.id || index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ item, index }) {
  const [imgError, setImgError] = useState(false);

  // Gestion des valeurs par défaut
  const displayName = item?.displayName || "Nom non renseigné";
  const email = item?.email || "Email non renseigné";
  const photoURL = item?.photoURL;

  return (
    <tr>
      <td className="border-y bg-white px-3 py-2 border-l rounded-l-lg text-center">
        {index + 1}
      </td>
      <td className="border-y bg-white px-3 py-2 text-center">
        <div className="flex justify-center">
          <Avatar
            src={photoURL && !imgError ? photoURL : undefined}
            name={displayName.charAt(0).toUpperCase()}
            onError={() => setImgError(true)}
            className="w-8 h-8"
          />
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2">{displayName}</td>
      <td className="border-y bg-white px-3 py-2">{email}</td>
    </tr>
  );
}
