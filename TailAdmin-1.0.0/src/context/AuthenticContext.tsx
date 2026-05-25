import React from 'react'
import { createContext ,useRef,useContext,useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FullSiteContext } from './fullsitecontext'



export const Authenticate= createContext<any>(null)


const Authcontext = ({children}:any) => {
    const url= "http://127.0.0.1:8000/"
    const context:any=useContext(FullSiteContext)
    // const [access,setaccess]=useState()
    const accessToken = useRef(null)
    const Navigation = useNavigate()



    const checkuserauth = async () => {
        try {
            const refresh=localStorage.getItem("refresh_token")
            const res = await axios.post(`${url}/api/user/token/`, {refresh_token:refresh})
            if (res.data.access) {
                accessToken.current = res.data.access
               
                return (true)
            } else{
                 return false 
                }
        }
        catch (error:any) {
            if (error.response?.status === 401) {
                
                Navigation('/Dashboard/signin')
                context.setchecknote("please login first")
                return false
            }
        }
    }


    async function login(data:any) {
        try {
            const res = await axios.post(`${url}/api/user/login/`, data, { withCredentials: true ,params:{dashboard:"true"} })
            accessToken.current = res.data.access
            // setaccess(res.data.access);
            localStorage.setItem("refresh_token",res.data.refresh)
            
            localStorage.setItem("user", JSON.stringify(res.data.user))            
            Navigation("/Dashboard/")
            context.setchecknote( res.data.message )
        }
        catch (error:any) {
        
            context.setchecknote(error.response.data.message )
        }
    }




    async function runfunction(e=null,data=null,type=null){
        if (type==="login") {return await login(data)};
        if (type==="checkuserauth"){return await checkuserauth()};
    }


    const data:any={
        runfunction:runfunction,
        url:url,
        access:accessToken,
    }

  return (
    <Authenticate.Provider value={data}>
    {children}
    </Authenticate.Provider>
      
    
  )
}

export default Authcontext
