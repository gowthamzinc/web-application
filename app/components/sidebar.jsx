import { useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () =>{
    try{
        await signOut(auth);
        router.push("/login")
    }catch(error){
        console.log("Logout Error:", error);
    }
}

  return (
    <div className='header border-b'>
      {/* Button to open sidebar */}
      
      <div className="flex shrink-0 items-center p-2">
        <Bars3Icon onClick={toggleSidebar} aria-hidden="true" className="block size-6" />
        <img alt="Thuyavan" src="logo.png" className="h-8 w-auto ml-2 "/>
      </div>
      
      

      {/* Sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-gray-800 bg-opacity-50 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      ></div>

      <div
        className={`fixed top-0 left-0 z-50 w-64 bg-white h-full shadow-lg transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-semibold"><img alt="Thuyavan" src="logo.png" className="h-8 w-auto ml-2 "/></h2>
          <button onClick={toggleSidebar} className="text-xl">&times;</button>
        </div>
        <div className="p-4">
          <ul>
            <li className="py-2">
              <Link href="/dashboard" className="block text-gray-700">Dashboard</Link>
            </li>
            <li className="py-2">
              <Link href="/customers" className="block text-gray-700">Customers</Link>
            </li>
            <li className="py-2">
              <Link href="/sites" className="block text-gray-700">Sites</Link>
            </li>
            <li className="py-2" onClick={handleLogout}>
              <a href="#" className="block text-gray-700">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
