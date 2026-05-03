import React from 'react'
import { createContext ,useRef,useContext} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FullSiteContext } from './fullsitecontext'



export const Authenticate= createContext<any>(null)


const Authcontext = ({children}:any) => {
    const url= "http://127.0.0.1:8000/"
    const context:any=useContext(FullSiteContext)
    const accessToken = useRef(null)
    const Navigation = useNavigate()



    const checkuserauth = async () => {
        try {
            const res = await axios.post(`${url}/api/user/token/`, {}, { withCredentials: true })
            if (res.data.access) {
                accessToken.current = res.data.access;
                
                return true
            } else { return false }
        }
        catch (error:any) {
            if (error.response?.status === 401) {
                
                Navigation('/signin')
                context.setchecknote("please login first")
                return false
            }
        }
    }


    async function login(data:any) {
        try {
            const res = await axios.post(`${url}/api/user/login/`, data, { withCredentials: true ,params:{dashboard:"true"} })
            accessToken.current = res.data.access
            localStorage.setItem("user", JSON.stringify(res.data.user))            
            Navigation("/Dashboard/")
            context.setchecknote( res.data.message )
        }
        catch (error:any) {
            // console.log('error', error.response.data.message)
            context.setchecknote(error.response.data.message )
        }
    }




    function runfunction(e=null,data=null,type=null){
        if (type==="login") {login(data)};
        if (type==="checkuserauth"){checkuserauth()};
    }


    const data:any={
        runfunction:runfunction,
        url:url,
        access:accessToken.current,
    }

  return (
    <Authenticate.Provider value={data}>
    {children}
    </Authenticate.Provider>
      
    
  )
}

export default Authcontext
