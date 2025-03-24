import RouteButton from "./route_button";
import { Form, Link, useFetcher } from "@remix-run/react";
import IconProfile from "./icons/iconProfile";
import IconSearch from "./icons/iconSearch";
import { useState, useEffect } from "react";
import { primaryOrangeColor } from "./colors";
import type { Cart } from "~/models/cart";

const Photo = process.env.PHOTO!;

export default function Header({username, isAdmin} : {username : string | undefined, isAdmin: boolean | undefined}) {
  console.log("Header session username :", username);
  console.log("Header session isAdmin :", isAdmin);
  const [select, setSelect] = useState("home");
  const [signOut, setSignOut] = useState<boolean>(false);
  const cartFetcher = useFetcher<{ cart: Cart }>();
  
  useEffect(() => {
    // Fetch cart data when component mounts
    cartFetcher.load("/cart");
  }, []);

  const cartItemCount = cartFetcher.data?.cart.items.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    // Home
    <div className="fixed top-0 left-0 z-50 overflow-hidden flex flex-col md:flex-row w-svw h-auto justify-between items-center bg-primary-cream drop-shadow-xl px-2 md:px-12">
      <Link
        onClick={() => {
          setSelect("home");
        }}
        to="/"
        prefetch="intent"
        className="flex flex-col items-center"
      >
        <img
          src={Photo + "logo-dog-paw.png"}
          className="w-20 h-20 hover:scale-110 duration-200"
        />
        <h1
          className={`text-black -translate-y-2 ${
            select === "home" ? "underline" : ""
          }`}
        >
          Home
        </h1>
      </Link>

      {/* Text Buttons */}
      <div className="justify-evenly items-center space-x-10 md:space-x-32">
        {isAdmin && (
          <RouteButton
            text="Admin"
            destination="/admin"
            setSelect={setSelect}
            select={select}
          />
        )}
        <RouteButton
          text="Pets"
          destination="/pets"
          setSelect={setSelect}
          select={select}
        />
        <RouteButton
          text="Behavior"
          destination="/behaviormain"
          setSelect={setSelect}
          select={select}
        />
        <RouteButton
          text="Pet Help"
          destination="/pethelp"
          setSelect={setSelect}
          select={select}
        />
        <RouteButton
          text="Add Pet"
          destination="/addpet"
          setSelect={setSelect}
          select={select}
        />
      </div>

      {/* Icon Buttons */}
      <div className="flex justify-evenly items-center space-x-6">
        {username && (
          <Form method="post" action="/signout" className="translate-y-1">
            <button
              type="submit"
              className="hover:scale-110 duration-200"
              onClick={() => {
                setSignOut(true);
                setTimeout(() => setSignOut(false), 2000);
              }}
            >
              {/* I think this icon is signout icon, not search lol */}
              <IconSearch
                colorCode={primaryOrangeColor}
                width="24"
                height="24"
              />
            </button>
          </Form>
        )}
        <button className="hover:scale-110 duration-200">
          <Link to={username ? "/profile" : "/signin"}>
            <IconProfile
              colorCode={primaryOrangeColor}
              width="24"
              height="24"
            />
          </Link>
        </button>
        {username && <Link to="/cart" className="relative">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke={primaryOrangeColor}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Link>}
        {/* <Search /> */}
      </div>
      {signOut && (
        <div className="fixed right-32 w-28 animate-pulse">
          <h1 className="text-red-600 font-bold font-sans">Signing out...</h1>
        </div>
      )}
    </div>
  );
}
