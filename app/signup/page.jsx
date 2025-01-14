"use client";

import { auth } from "@/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/router";
import { useState, FormEvent } from "react";


export default function SignupPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email,setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    //const router = useRouter();
    const handleSignup = async function(event){
        event.preventDefault();
        setError(null);
        setMessage(null);
        try{
            const userCredentials = await createUserWithEmailAndPassword(auth,email,password);
            const user = userCredentials.user;
            await sendEmailVerification(user);
            localStorage.setItem("userData",JSON.stringify({firstName,lastName,email}));
            setMessage("Signup successfull");
            setFirstName();
            setLastName();
            setEmail();
            setPassword();
        }catch(error){
            if(error instanceof Error){
                setError(error.message);
            }else{
                setError("Unknown Error");
            }

        }

    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            {/* <img
              alt="Your Company"
              src="logo.png"
              className="mx-auto max-h-40"
            /> */}
            <h2 className="text-center text-2xl/9 font-bold tracking-tight text-gray-900">
              Signup
            </h2>
          </div>
  
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form action="#" method="POST" onSubmit={handleSignup} className="space-y-1">
            <div>
                <label htmlFor="firstname" className="block text-sm/6 font-medium text-gray-900">
                  First Name
                </label>
                <div className="mt-2">
                  <input
                    id="firstname"
                    name="firstname"
                    type="firstname"
                    required
                    autoComplete="firstname"
                    value ={firstName}
                    onChange={(e)=> setFirstName(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastname" className="block text-sm/6 font-medium text-gray-900">
                  Last Name
                </label>
                <div className="mt-2">
                  <input
                    id="lastname"
                    name="lastname"
                    type="lastname"
                    required
                    autoComplete="lastname"
                    value ={lastName}
                    onChange={(e)=> setLastName(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value ={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
  
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value ={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
  
              <div>
                {error && <p>{error}</p>}
                {message && <p>{message}</p>}
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
    );
}



