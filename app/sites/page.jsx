"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { firestore } from '@/firebase';
import { doc, collection, addDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule,ColumnAutoSizeModule } from 'ag-grid-community';
import useAuth from '../hooks/useAuth';
import Sidebar from '../components/sidebar';
import Alert from '../components/alerts';
import Select from 'react-select';

const customStyles = {
  menuList: (provided) => ({
    ...provided,
    maxHeight: 150, // Set maximum height for the list inside the dropdown
    overflowY: 'auto', // Enable vertical scrolling
  }),
};

ModuleRegistry.registerModules([ClientSideRowModelModule,ValidationModule,ColumnAutoSizeModule]);

export default function sites() {
   
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [alert, setAlert] = useState({ type: '', message: '', show: false });
    const [siteName, setSiteName] = useState('');
    const [siteAddress, setSiteAddress] = useState('');
    const [siteId, setSiteId] = useState('');
    const [sites, setSites] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    
    const [columnDefs] = useState([
        { field: 'customerName', headerName: 'Customer Name', sortable: true},
        { field: 'siteName', headerName: 'Site Name', sortable: true},
        { field: 'siteAddress', headerName: 'Site Address', sortable: true },
        {
            headerName: 'Actions',
            field: 'actions',
            cellRenderer: (params) => {
                const handleEdit = () => {
                    setSelectedCustomer(params.data.customer)
                    setSiteName(params.data.siteName);
                    setSiteAddress(params.data.siteAddress);
                    setSiteId(params.data.id);
                    setIsUpdate(true);
                    setOpen(true);
                };

                const handleDelete = async () => {
                    try {
                      // Create a reference to the document you want to delete
                      const siteDocRef = doc(firestore, "sites", params.data.id);
                      // Delete the document
                      await deleteDoc(siteDocRef);
                      setSites((prevSites) =>
                      prevSites.filter((site) => site.id !== params.data.id)
                       );
                      setAlert({
                        type: 'success',
                        message: 'Site deleted successfully!',
                        show: true,
                      });
                    } catch (error) {
                      console.error("Error deleting site: ", error);
                      setAlert({
                        type: 'error',
                        message: 'Error deleting site!',
                        show: true,
                      });
                    }
                  };
        
                return (
                  <div className="flex space-x-2 p-2">
                    <button onClick={handleEdit}>
                      <PencilIcon className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                    </button>
                    <button onClick={handleDelete}>
                      <TrashIcon className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </button>
                  </div>
                );
              },
            sortable: false,
            filter: false,
          }
        ]);

    const gridApi = useRef(null);

    useEffect(() => {
        if (!loading && !user) {
          router.push("/login");
        }
    }, [loading, user, router]);

    useEffect(() => {
      const fetchCustomers = async () => {
        const querySnapshot = await getDocs(collection(firestore, 'customers'));
        const customerData = querySnapshot.docs.map((doc) => ({
        value: doc.id, 
        label:doc.data().customerName
        }));
        
        setCustomers(customerData);
      };

      const fetchSites = async () => {
            const querySnapshot = await getDocs(collection(firestore, 'sites'));
            const siteData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            customerName:doc.data().customer.label,
            ...doc.data(),
            }));
            console.log(siteData);
            setSites(siteData);
      };

        fetchCustomers();
        fetchSites();

    }, []);

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit(); // Adjust columns to fit the grid width
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(firestore, 'sites'), {
                siteName: siteName,
                siteAddress: siteAddress,
                customer:selectedCustomer
            });
            const newSite = {
                id: docRef.id,
                siteName: siteName,
                siteAddress: siteAddress,
                customerName:selectedCustomer.label,
                customer:selectedCustomer
            };

            setSites((prevSites) => [...prevSites, newSite]);
            setOpen(false);
            setAlert({
            type: 'success',
            message: 'Site added successfully!',
            show: true,
            });
        } catch (error) {
          console.error('Error adding document: ', error);
          setAlert({
            type: 'error',
            message: 'Error adding site!',
            show: true,
          });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
    
        try {
          // Reference to the specific site document
          const siteRef = doc(firestore, 'sites', siteId);
    
          // Update specific fields in the Firestore document
          await updateDoc(siteRef, {
            siteName: siteName,
            siteAddress: siteAddress,
            customer:selectedCustomer
          });
          setSites((prevSites) =>
          prevSites.map((site) =>
            site.id === siteId
                ? { ...site, siteName, siteAddress, customer:selectedCustomer,customerName:selectedCustomer.label }
                : site
            )
          );
          setOpen(false);
          setAlert({
            type: 'success',
            message: 'Site updated successfully!',
            show: true,
          });
        } catch (error) {
          console.error('Error updating site:', error);
          setAlert({
            type: 'error',
            message: 'Error updating site!',
            show: true,
          });
        }
      };

      const handleCloseAlert = () => {
        setAlert({ ...alert, show: false });
      };

    const handleCustomerChange = (option) => {
      setSelectedCustomer(option);
    };
    
    
      return (
        <>
        { loading ?
            (<p>Loading ....</p>) :
            (
            <>
             {alert.show && (
                <Alert
                type={alert.type}
                message={alert.message}
                onClose={handleCloseAlert}
                />
            )}
            <Sidebar></Sidebar>
            <div className="sites">
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                   <h1 className="p-2 text-blue-600">Sites</h1>
                   <div className="p-2  pr-10 text-right flex justify-end ">
                   <PlusIcon  className="h-6 w-6 text-blue-500 cursor-pointer" onClick={() => {setOpen(true);setSiteName("");setSiteAddress("");setSiteId("");setIsUpdate(false);setSelectedCustomer(null);}} />
                   </div>
                </div>
                <div className="ag-theme-alpine" style={{ height: "calc(100vh - 90px)", width: "100%" }}>
                <AgGridReact
                    rowData={sites}
                    columnDefs={columnDefs}
                    defaultColDef={{ sortable: true }}
                    onGridReady={onGridReady} // Attach the grid ready event
                    ref={gridApi}
                />
                </div>
                <Dialog open={open} onClose={setOpen} className="relative z-10">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                    />

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                        >
                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                        {isUpdate ? "Update Site" : "Add Site"}
                                    </DialogTitle>
                                    <div className="mt-2">
                                    <form onSubmit={ isUpdate ? handleUpdate : handleSubmit}>
                                        <div className="mb-5">
                                        <label htmlFor="customer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Customer Name</label>
                                          <Select
                                            id="customer"
                                            value={selectedCustomer}
                                            onChange={handleCustomerChange}
                                            options={customers}
                                            styles={customStyles}
                                          />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="sitename" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Site Name</label>
                                            <input type="text" id="sitename" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Site name" 
                                            value={siteName}
                                            onChange={(e) => setSiteName(e.target.value)}
                                            required />
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="siteaddress" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Site Address</label>
                                            <input type="text" id="siteaddress" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Site Address" 
                                            value={siteAddress}
                                            onChange={(e) => setSiteAddress(e.target.value)}
                                            required />
                                        </div>  
                                                                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                            <button
                                                type="submit"
                                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                            >
                                                {isUpdate ? "Update" : "Submit"}
                                            </button>
                                            <button
                                                type="button"
                                                data-autofocus
                                                onClick={() => setOpen(false)}
                                                className="mt-3 mr-2 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            >
                                                Cancel
                                            </button>
                                        </div>  
                                    </form>
                                   
                                    </div>
                                </div>
                            </div>
                            </div>
                            
                        </DialogPanel>
                        </div>
                    </div>
                </Dialog>
                
            </div>
            </>
            )
        }
        
        </>
      );
}