"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth,firebase, firestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password,setPassword] = useState();
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async function(event){
        event.preventDefault();
        setError(null);
        try{
            const userCredential = await signInWithEmailAndPassword(auth,email,password);
            const user = userCredential.user;
            if(user.emailVerified){
                const userData  = localStorage.getItem("userData");
                const {
                    firstName ="",
                    lastName = "",
                    email = ""
                  } = userData ? JSON.parse(userData) : {};

                const userDoc = await getDoc(doc(firestore,"users",user.uid));
                if(!userDoc.exists()){
                    await setDoc(doc(firestore,"users",user.uid),{
                        firstName,
                        lastName,
                        email:user.email
                    })
                }
                router.push("/dashboard");
            }else{
                setError("Please verify email before logging in");
            }

        }catch(error){
            setError(error.message);
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
              Login
            </h2>
          </div>
  
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form action="#" method="POST" onSubmit={handleLogin} className="space-y-1">
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
                    value ={email || ''}
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
                    value ={password || ''}
                    onChange={(e)=> setPassword(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
  
              <div>
                {error && <p>{error}</p>}
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Login
                </button>
              </div>
            </form>
            <p>Don't Have Account? <Link href="/signup">Register here</Link> </p>
          </div>
        </div>
    );
}



