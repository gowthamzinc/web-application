"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if(user){
        if(user.emailVerified){
              const userDoc = await getDoc(doc(firestore,"users",user.uid));
              if(!userDoc.exists()){
                const userData  = localStorage.getItem("userData");
                const {
                  firstName ="",
                  lastName = "",
                  email = ""
                } = userData ? JSON.parse(userData) : {};

                await setDoc(doc(firestore,"users",users.uid),{
                  firstName,
                  lastName,
                  email:user.email
                });
                
                localStorage.removeItem("userData");
                setUser(user);
                router.push("/dashboard");
              }else{
                setUser(null);
                router.push("/login");
              }
            }else{
                setUser(null);
                router.push("/login");
            }
            setLoading(false);
      }else{
        setUser(null); // Set the user or null
        router.push("/login");
      }
      
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [router]);

  if(loading){
        return <p> Loading ....</p>;
  }

  return (
    <div>
      {user ? "Redirecting to dashboard ... " : "Redirecting to login "}
     </div>
  );
};

