import { Heart, Search, ShoppingCart, UserCircle2 } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import AuthContextProvider from "@/contexts/AuthContext";
import HeaderClientButtons from "./HeaderClientButtons";
import AdminButton from "./AdminButton";
import Image from "next/image";

export default function Header() {
  const menuList = [
    {
      name: "Boutique",
      link: "/",
    },
    {
      name: "À propos",
      link: "/about-us",
    },
    {
      name: "Contact",
      link: "/contact-us",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white bg-opacity-65 backdrop-blur-2xl py-3 px-4 md:py-4 md:px-16 border-b flex items-center justify-between">
      <Link href={"/"} className="flex items-center">
        <Image
          className="h-auto object-contain" // Changement important ici
          src="/logoShoesrbg.png"
          width={120} // Ajustez selon vos besoins
          height={40} // Ajustez selon vos besoins
          alt="Logo Shoes"
          priority // Pour charger l'image en priorité
        />
      </Link>
      <div className="hidden md:flex gap-2 items-center font-semibold">
        {menuList?.map((item, index) => {
          // Ajout de la key
          return (
            <Link key={index} href={item?.link}>
              <button className="text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
                {item?.name}
              </button>
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-1">
        <AuthContextProvider>
          <AdminButton />
        </AuthContextProvider>
        <Link href={`/search`}>
          <button
            title="Search Products"
            className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
          >
            <Search size={14} />
          </button>
        </Link>
        <AuthContextProvider>
          <HeaderClientButtons />
        </AuthContextProvider>
        <Link href={`/account`}>
          <button
            title="My Account"
            className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
          >
            <UserCircle2 size={14} />
          </button>
        </Link>
        <AuthContextProvider>
          <LogoutButton />
        </AuthContextProvider>
      </div>
    </nav>
  );
}
