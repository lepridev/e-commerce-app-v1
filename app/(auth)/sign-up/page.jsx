"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { createUser } from "@/lib/firestore/user/write";
import { Button } from "@nextui-org/react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});

  const handleData = (key, value) => {
    setData({
      ...data,
      [key]: value,
    });
  };

  const handleSignUp = async () => {
    if (!data?.name || !data?.email || !data?.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (data?.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        data?.email,
        data?.password
      );

      await updateProfile(credential.user, {
        displayName: data?.name,
      });

      const user = credential.user;

      await createUser({
        uid: user?.uid,
        displayName: data?.name,
        email: data?.email,
        photoURL: user?.photoURL,
      });

      toast.success("Compte créé avec succès");
      router.push("/account");
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      router.push("/account");
    }
  }, [user]);

  return (
    <main className="w-full flex justify-center items-center bg-gradient-to-br from-blue-50 to-gray-100 md:p-24 p-10 min-h-screen">
      <section className="flex flex-col gap-6 w-full max-w-md">
        {/* Logo - CORRIGÉ */}
        <div className="flex justify-center">
          <div className="relative w-56 h-28">
            {/* Conteneur avec dimensions fixes */}
            <Image
              src="/logoShoesrbg.png"
              alt="Logo Shoes"
              fill
              className="object-contain" // ✅ S'adapte au conteneur
              priority // ✅ Charge en priorité
            />
          </div>
        </div>

        {/* Carte d'inscription */}
        <div className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center">
            <h1 className="font-bold text-2xl text-gray-800">
              Créer un compte
            </h1>
            <p className="text-gray-600 mt-2">Rejoignez notre communauté</p>
          </div>

          {/* Formulaire d'inscription */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
            className="flex flex-col gap-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="user-name"
                className="text-sm font-medium text-gray-700"
              >
                Nom complet
              </label>
              <input
                placeholder="Votre nom complet"
                type="text"
                name="user-name"
                id="user-name"
                value={data?.name}
                onChange={(e) => {
                  handleData("name", e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="user-email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                placeholder="votre@email.com"
                type="email"
                name="user-email"
                id="user-email"
                value={data?.email}
                onChange={(e) => {
                  handleData("email", e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="user-password"
                className="text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <input
                placeholder="Au moins 8 caractères"
                type="password"
                name="user-password"
                id="user-password"
                value={data?.password}
                onChange={(e) => {
                  handleData("password", e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500">
                Le mot de passe doit contenir au moins 8 caractères
              </p>
            </div>

            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              type="submit"
              color="primary"
              className="w-full py-3 font-semibold text-base mt-2"
            >
              {isLoading ? "Création du compte..." : "Créer mon compte"}
            </Button>
          </form>

          {/* Séparateur */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Déjà membre ?</span>
            </div>
          </div>

          {/* Lien de connexion */}
          <div className="text-center">
            <Link href={`/login`}>
              <button className="font-medium text-blue-600 hover:text-blue-700 transition-colors text-sm">
                Se connecter à mon compte existant
              </button>
            </Link>
          </div>

          {/* Informations de sécurité */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              🔒 Vos informations sont sécurisées et cryptées
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
