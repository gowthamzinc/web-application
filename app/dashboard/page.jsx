"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged,signOut } from 'firebase/auth';
import { auth, firestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Sidebar from "../components/sidebar";

export default function dashboard() {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState();
    const [loading, setLoading] = useState(true); 
    const router = useRouter();

    useEffect(()=> {
        const unsubscribe = onAuthStateChanged(auth, async function(user){
            if(user){
                setUser(user);
                const userDoc = await getDoc(doc(firestore,"users",user.uid));
                if(userDoc.exists()){
                    const userData = userDoc.data();
                    setUserName(`${userData.firstName} ${userData.lastName}`)
                }
            } else {
                router.push("/login");
            }
            setLoading(false)
        });
        return () => unsubscribe();
    },[router]);

    if(loading){
        return <p>Loading ....</p>
    }
    return (
        <>
        <Sidebar></Sidebar>
        <div className="p-2 bg-no-repeat bg-[url('./dashboard.png')] bg-blend-multiply" style={{ height: 'calc(100vh - 49px)', padding:"50px 0 0 50px", fontSize:"50px",backgroundPosition:"right 20%",color:"#034a8f" }}>Welcome !</div>
        </>
    );
}

