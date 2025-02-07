"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import { IInvoice, TeamMember} from "@/types/types";
import { hasPermission } from "@/libs/hasPermission";
import Loader from "@/components/loader";
import { generateRegisterStatementPdf } from "@/libs/generateInvoice";
import { convertImageUrlToBase64 } from "@/libs/convertImage";
import { useAuth } from "@/context/AuthContext";
const imageUrl = "/futurefocuslogo.png";

interface Course {
  _id:string
  title: string;
  shifts: {_id:string,name:string}[];
}

interface registrationData {
  name: string;
  email: string;
  phone: string;
  referer:string
  selectedCourse: string;
  selectedShift: string;
  intake: string;
  message: string;
  payment:string
  user: string | undefined;
}

const Registration: React.FC = () => {
  
   const [courses, setCourses] = useState<Course[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [submiting, setSubmiting] = useState<boolean>(false);
   const [error, setError] = useState<string | null>(null);
  const { fetchLoggedUser, loggedUser } = useAuth();
   const [formData, setFormData] = useState<registrationData>({
     name: "",
     email: "",
     phone: "",
     selectedCourse: "",
     selectedShift: "",
     intake: "",
     referer:'default',
     message: "",
     user: loggedUser?.name,
     payment: "cash",
   });
   const [intakes, setIntakes] = useState<{ _id: string; intake: string }[]>(
     []
   );
   const [submissionResult, setSubmissionResult] = useState<string | null>(
     null
   );

   useEffect(() => {
     const fetchCourses = async () => {
       try {
         const response = await axios.get(`${API_BASE_URL}/course`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
          },
         });
         await fetchLoggedUser();
         setCourses(response.data);

         if (response.data.length > 0) {
           setFormData((prevData) => ({
             ...prevData,
             selectedCourse: response.data[0].title,
             selectedShift: response.data[0].shifts[0],
           }));
         }
         setLoading(false);
       } catch (err) {
         setError("Failed to load courses.");
         setLoading(false);
         console.log(err)
       }
     };
     const getIntakes = async () => {
       try {
         const response = await axios.get(`${API_BASE_URL}/others/intake`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
          },
         });
         setIntakes(response.data.intakes);
         if (response.data.length > 0) {
           setFormData((prevData) => ({
             ...prevData,
             intake: response.data.intakes[0].intake,
           }));
         }
       } catch (error) {
         console.log(error);
         setError("Failed to load intakes.");
       }
     };
     getIntakes();
     fetchCourses();
   }, []);

   const handleChange = (
     e: React.ChangeEvent<
       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
     >
   ) => {
     const { name, value } = e.target;
     setFormData((prevData) => ({
       ...prevData,
       [name]: value,
     }));

     if (name === "selectedCourse") {
       const selectedCourse = courses.find((course) => course.title === value);
       if (selectedCourse) {
         setFormData((prevData) => ({
           ...prevData,
           selectedShift: selectedCourse.shifts[0]._id,
         }));
       }
     }
   };
// const handleSendMessage = async(id:string,message:string)=>{
//   const response = await axios.post(`${API_BASE_URL}/student/message/${id}`,{
//     message
//   })

// }
   const handleSubmit = async () => {
    const ourlogo = await convertImageUrlToBase64(imageUrl as string);
const data:IInvoice = {
  paymentMethod: formData.payment,
  student: formData.name,
  amount: 10000,
  reason: "Registration fees",
  date: new Date(),
  remaining: 0,
  status: ""
}
    //  e.preventDefault();
     setSubmissionResult(null);

     try {
      setSubmiting(true)
      formData.user=loggedUser?.name
       const response = await axios.post(
         `${API_BASE_URL}/students/register`,
         formData,
         {
           headers: {
             "Content-Type": "application/json",
          
              Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
            
           },
         }
       );
        generateRegisterStatementPdf(data, ourlogo);
       if (response.data && response.data.message) {
         setSubmissionResult(response.data.message);
       } else {
         setSubmissionResult("Application submitted successfully");
       }

       setFormData({
         name: "",
         referer:"default",
         email: "",
         phone: "",
         selectedCourse: courses.length > 0 ? courses[0].title : "",
         selectedShift: courses.length > 0 ? courses[0].shifts[0]._id : "",
         message: "",
         intake: intakes.length > 0 ? intakes[0].intake : "",
         user:loggedUser?.name,
         payment:""
       });
     } catch (error) {
       if (axios.isAxiosError(error) && error.response) {
         const errorMessage =
           error.response.data.message ||
           "An error occurred. Please try again.";
         setSubmissionResult(errorMessage);
       } else {
         setSubmissionResult("An unexpected error occurred. Please try again.");
       }
     }
     finally{
      setSubmiting(false)
     }
   };

   if (loading) {
     return (
       <div>
         <SideBar />
         <Loader />
       </div>
     );
   }

   if (error) {
     return (
       <div>
         <SideBar />
         Error: {error}
       </div>
     );
   }

   return (
     <div className="max-w-3xl mx-auto p-6 my-32 pl-32 lg:pl-6 my bg-white shadow-md rounded-lg ">
       <SideBar />
       <a
         href="/students"
         className="p-2 fixed top-3 left-52 bg-blue-600 text-white hover:bg-blue-500 rounded-md"
       >
         Back
       </a>
       <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">
        FILL OUT THE FORM
       </h2>
       {submissionResult && (
         <div
           className={`mb-4 p-4 rounded-md ${
             submissionResult.includes("success")
               ? "bg-green-100 text-green-700"
               : "bg-red-100 text-red-700"
           }`}
         >
           {submissionResult}
         </div>
       )}
       <div  className="space-y-4">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-extrabold text-gray-700">
              FULL NAME
             </label>
             <input
               type="text"
               name="name"
               value={formData.name}
               onChange={handleChange}
               required
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
             />
           </div>
           <div>
             <label className="block text-sm font-extrabold text-gray-700">
               EMAIL
             </label>
             <input
               type="email"
               name="email"
               defaultValue="academic@futurefocus.rw"
               value={formData.email}
               onChange={handleChange}
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
             />
           </div>
         </div>
         <div>
           <label className="block text-sm font-extrabold text-gray-700">
             PHONE
           </label>
           <input
             type="tel"
             name="phone"
             value={formData.phone}
             onChange={handleChange}
             required
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           />
         </div>
         <div>
           <label className="block text-sm font-extrabold text-gray-700">
            SELECT COURSE
           </label>
           <select
             name="selectedCourse"
             value={formData.selectedCourse}
             onChange={handleChange}
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           >
                <option disabled> Select Shift (Required)</option>

             {courses.map((course) => (
               <option key={course.title} value={course._id}>
                 {course.title}
               </option>
             ))}
           </select>
         </div>
         <div>
           <label className="block text-sm font-extrabold text-gray-700">
            SELECT SHIFT
           </label>
           <select
             name="selectedShift"
             value={formData.selectedShift}
             onChange={handleChange}
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           >
                <option disabled> Select Shift (Required)</option>
           
                         {courses
               .find((course) => course._id === formData.selectedCourse)
               ?.shifts.map((shift) => (
                 <option key={shift._id} value={shift._id}>
                   {shift.name}
                 </option>
               ))}
           </select>
         </div>
         <div>
           <label className="block text-sm font-extrabold text-gray-700">
             SELECT INTAKE
           </label>
           <select
             name="intake"
             value={formData.intake}
             onChange={handleChange}
             required
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           >
             <option value="" disabled>
               Select Intake (Required)
             </option>
             {intakes.map((intake) => (
               <option key={intake._id} value={intake.intake}>
                 {intake.intake}
               </option>
             ))}
           </select>
         </div>
         <div>
           <label className="block text-sm font-extrabold text-gray-700">
             Referer
           </label>
           <select
             name="referer"
             value={formData.referer}
             onChange={handleChange}
             required
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           >
             <option  disabled>
               Select Referer(Required)
             </option>
             <option value="cyd">Cyd</option>
             <option value="default">Future Focus</option>
           </select>
         </div>
         <div>
           <label className="block text-sm font-extrabold text-gray-700">
          PAYMENT METHOD
           </label>
           <input
             type="text"
             name="payment"
             defaultValue="Cash"
             onChange={handleChange}
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           />
         </div>
         <div className="text-center">
           {hasPermission(loggedUser as TeamMember, "students", "register") ? (
             <button
             onClick={()=>handleSubmit()}
               className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-extrabold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
             >
              {submiting?"SUBMITING..":"SUBMIT"}
             </button>
           ) : (
             ""
           )}
         </div>
       </div>
     </div>
   );
 };

export default withAdminAuth(Registration);
