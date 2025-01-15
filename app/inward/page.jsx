"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { firestore } from '@/firebase';
import { doc, collection, addDoc, getDocs, updateDoc, deleteDoc, Timestamp  } from 'firebase/firestore';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule,ColumnAutoSizeModule } from 'ag-grid-community';
import useAuth from '../hooks/useAuth';
import Sidebar from '../components/sidebar';
import Alert from '../components/alerts';
import Select from 'react-select';

ModuleRegistry.registerModules([ClientSideRowModelModule,ValidationModule,ColumnAutoSizeModule]);

const customStyles = {
    menuList: (provided) => ({
        ...provided,
        maxHeight: 150, // Set maximum height for the list inside the dropdown
        overflowY: 'auto', // Enable vertical scrolling
    }),
};
function formatToAMPM(params) {
    const date = params.data.createdAt.toDate()
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;  // Convert 24-hour format to 12-hour format
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;    
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} : ${formattedHours}:${formattedMinutes} ${ampm}`;
    
    return formattedDate;
  }
export default function inward() {
    const router = useRouter();
    const { user, userData, loading } = useAuth();
    const [open, setOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [alert, setAlert] = useState({ type: '', message: '', show: false });

   

    const [inwards, setInwards] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [inwardId, setInwardId] = useState("");

    const [allSites, setAllSites] = useState([]);
    const [sites, setSites] = useState([]);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);



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
            const sitesData = querySnapshot.docs.map((doc) => ({
              value: doc.id,
              label: doc.data().siteName,
              customerId: doc.data().customer.value,
            }));
            setAllSites(sitesData); 
            setSites(sitesData);
        };

        const fetchMaterials = async () => {
            const querySnapshot = await getDocs(collection(firestore, 'materials'));
            const sitesData = querySnapshot.docs.map((doc) => ({
              value: doc.id,
              label: doc.data().materialName,
            }));
            setMaterials(sitesData);
        };

        const fetchInwards = async () => {
            const querySnapshot = await getDocs(collection(firestore, 'inwards'));
            const inwardsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                customerName:doc.data().customer.label,
                siteName:doc.data().site.label,
                materialName:doc.data().material.label,
                ...doc.data()
            }));
            setInwards(inwardsData);
        };
        
        fetchInwards();
        fetchCustomers();
        fetchSites();
        fetchMaterials();
    }, []);

    const [columnDefs] = useState([
        { field: 'customerName', headerName: 'Customer Name', sortable: true},
        { field: 'siteName', headerName: 'Site Name', sortable: true },
        { field: 'materialName', headerName: 'Material Name', sortable: true },
        {
            headerName: 'Date & Time',
            field: 'createdAt',
            valueFormatter: formatToAMPM,
            sortable: false
           
        },
        {
            headerName: 'Actions',
            field: 'actions',
            cellRenderer: (params) => {
                const handleEdit = () => {
                  setSelectedCustomer(params.data.customer);
                  setSelectedMaterial(params.data.material);
                  setSelectedSite(params.data.site);
                  setInwardId(params.data.id);
                  setIsUpdate(true);
                  setOpen(true);
                };

                const handleDelete = async () => {
                    try {
                      // Create a reference to the document you want to delete
                      const inwardDocRef = doc(firestore, "inwards", params.data.id);
                      // Delete the document
                      await deleteDoc(inwardDocRef);
                      setInwards((prevInwards) =>
                      prevInwards.filter((inward) => inward.id !== params.data.id)
                      );
                      setAlert({
                        type: 'success',
                        message: 'Inward deleted successfully!',
                        show: true,
                      });
                    } catch (error) {
                      console.error("Error deleting inward: ", error);
                      setAlert({
                        type: 'error',
                        message: 'Error deleting inward!',
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

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit(); // Adjust columns to fit the grid width
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            var createdAt = new Date();
            const docRef = await addDoc(collection(firestore, 'inwards'), {
                customer: selectedCustomer,
                site: selectedSite,
                material:selectedMaterial,
                createdAt:createdAt
            });
            const newInward = {
                id: docRef.id,
                customer: selectedCustomer,
                site: selectedSite,
                material:selectedMaterial,
                customerName:selectedCustomer.label,
                siteName:selectedSite.label,
                materialName:selectedMaterial.label,
                createdAt:Timestamp.fromDate(createdAt)
            };

            setInwards((prevInwards) => [...prevInwards, newInward]);
            setOpen(false);
            setAlert({
            type: 'success',
            message: 'Inward added successfully!',
            show: true,
            });
        } catch (error) {
          console.error('Error adding document: ', error);
          setAlert({
            type: 'error',
            message: 'Error adding inward!',
            show: true,
          });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        var createdAt = new Date();
        try {
          // Reference to the specific inward document
          const inwardRef = doc(firestore, 'inwards', inwardId);
    
          // Update specific fields in the Firestore document
          await updateDoc(inwardRef, {
            customer: selectedCustomer,
            site: selectedSite,
            material:selectedMaterial,
            createdAt:createdAt
          });
          setInwards((prevInwards) =>
          prevInwards.map((inward) =>
            inward.id === inwardId
                ? { ...inward, 
                    customer:selectedCustomer,
                    customerName:selectedCustomer.label, 
                    site:selectedSite,
                    siteName:selectedSite.label, 
                    material:selectedMaterial,
                    materialName:selectedMaterial.label,
                    createdAt:Timestamp.fromDate(createdAt)

                   }
                : inward
            )
          );
          setOpen(false);
          setAlert({
            type: 'success',
            message: 'Inward updated successfully!',
            show: true,
          });
        } catch (error) {
          console.error('Error updating inward:', error);
          setAlert({
            type: 'error',
            message: 'Error updating inward!',
            show: true,
          });
        }
      };

    const handleCloseAlert = () => {
    setAlert({ ...alert, show: false });
    };

    const handleCustomerChange = (option) => {
        setSelectedCustomer(option); 
        setSelectedSite(null);

        const filteredSites = allSites.filter(site => site.customerId === option?.value);
        setSites(filteredSites);
      };
    const handleSiteChange = (option) => {
        setSelectedSite(option); 
    };
    const handleMaterialChange = (option) => {
        setSelectedMaterial(option); 
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
            <div className="inwards">
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                   <h1 className="p-2 text-blue-600">Inward</h1>
                   <div className="p-2  pr-10 text-right flex justify-end ">
                   <PlusIcon  className="h-6 w-6 text-blue-500 cursor-pointer" 
                        onClick={() => {
                            setOpen(true);
                            setSelectedCustomer(null);
                            setSelectedSite(null)
                            setSelectedMaterial(null);
                            setInwardId("");
                            setIsUpdate(false); 
                            }} />
                   </div>
                </div>
                <div className="ag-theme-alpine" style={{ height: "calc(100vh - 90px)", width: "100%" }}>
                <AgGridReact
                    rowData={inwards}
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
                                        {isUpdate ? "Update Inward" : "Add Inward"}
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
                                            <label htmlFor="site" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Site Name</label>
                                          <Select
                                            id="site"
                                            value={selectedSite}
                                            onChange={handleSiteChange}
                                            options={sites}
                                            styles={customStyles}
                                            isDisabled={!selectedCustomer}
                                          />
                                        </div> 
                                        <div className="mb-5">
                                            <label htmlFor="material" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Material Name</label>
                                          <Select
                                            id="material"
                                            value={selectedMaterial}
                                            onChange={handleMaterialChange}
                                            options={materials}
                                            styles={customStyles}
                                          />
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