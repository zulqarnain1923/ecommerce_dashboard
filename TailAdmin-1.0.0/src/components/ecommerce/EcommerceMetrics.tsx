import { BoxIconLine,} from "../../icons";
import axios from "axios";
import { useEffect,useState,useContext } from "react";
import { Authenticate } from "../../context/AuthenticContext";



export default function EcommerceMetrics() {
    
    const authcontext=useContext(Authenticate)
    const [data,setData]=useState<any>(null)

   useEffect(()=>{
    const fetchdata=async()=>{
      try{
        const res=await axios.get(`${authcontext.url}order/total/data/`, {headers:{Authorization:`Bearer ${authcontext.access}`}})
        setData(res.data)
        
      } catch (error:any) {
        if (error.response?.status === 401){

          const flag= authcontext.runfunction(null,null,"checkuserauth")
          if (flag){
            const res=await axios.get(`${authcontext.url}order/total/data/`, {headers:{Authorization:`Bearer ${authcontext.access}`}})
            setData(res.data)
          }

        }
      }
    }
    fetchdata()
   },[])
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div className="flex  items-center justify-between w-full"> 
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Products
            </p>
           <h4 className="mt-2 font-bold text-green-800 text-title-sm dark:text-white/90">
              {data?.total_products}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div className="flex  items-center justify-between w-full"> 
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </p>
            <h4 className="mt-2 font-bold text-green-800 text-title-sm dark:text-white/90">
              {data?.total_orders}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div className="flex  items-center justify-between w-full"> 
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Users
            </p>
            <h4 className="mt-2 font-bold text-green-800 text-title-sm dark:text-white/90">
              {data?.total_users}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
