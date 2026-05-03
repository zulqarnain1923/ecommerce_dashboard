import { useState, useEffect, createContext, ReactNode, useRef } from "react";
import axios from "axios";


// ✅ Type for context
type FullSiteContextType = {
  setchecknote: React.Dispatch<React.SetStateAction<string>>;
  check: boolean;
  checknote:string;
};

// ✅ Create context
export const FullSiteContext = createContext<FullSiteContextType | undefined>(undefined);

// ✅ Props type
type Props = {
  children: ReactNode;
};

// ✅ Provider Component
export const FullSiteProvider = ({ children }: Props) => {
  const [checknote, setchecknote] = useState(undefined);
  const [check, setcheck] = useState<boolean>(false);
  const [deleteconfirm,setdeleteconfirm]= useState(false)
  
  const [deleteflag,setdeleteflag]= useState<boolean>(false)
  const deleteproductid= useRef<string>("")
  const url= "http://127.0.0.1:8000/"


   



  useEffect(() => {
    if (checknote!==undefined && checknote!==""){ setcheck(true);}

    setTimeout(() => { setcheck(false); }, 5000);
    setTimeout(()=>{ setchecknote("")},6000)
    
  }, [checknote]);

    // function call on delete button click 
   const deletecall = async (id:string) => {    
          deleteproductid.current = id;
          setdeleteconfirm(true)
      }

    // actual dlete api call function 
    const deleteproduct = async(id:string) =>{
       try{
          const res=await axios.delete(`${url}put/${id}`)
           setchecknote(res.data.message)
           setdeleteflag(true)
          }catch(err){
            console.log(err)
            setchecknote("Error deleting product")
          }
    }
    
    // function to cancle delete product 
    const cancledelete =()=>{
      setdeleteconfirm(false)
      deleteproductid.current=""
    }

    // function to confirm delete product 
    const confirmdelete =async()=>{
      await deleteproduct(deleteproductid.current)
      deleteproductid.current=""
      setdeleteconfirm(false)
    }


    // authentiction logic here 

   
  

  const data={
    setchecknote:setchecknote,
    checknote:checknote,
    check:check,
    deleteconfirm:deleteconfirm,
    setdeleteconfirm:setdeleteconfirm,
    url:url,
    deletecall:deletecall,
    cancledelete:cancledelete,
    confirmdelete:confirmdelete,
    setdeleteflag:setdeleteflag,
    deleteflag:deleteflag,

  };

 
  return (
    <FullSiteContext.Provider value={data}>
      {children}
    </FullSiteContext.Provider>
  );
};




export default FullSiteProvider;