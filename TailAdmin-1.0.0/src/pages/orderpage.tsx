import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useContext, useEffect } from 'react'
import { FullSiteContext } from '../context/fullsitecontext'
import { ArrowLeft } from 'lucide-react'
import axios from 'axios'
import { Authenticate } from '../context/AuthenticContext'



const orderpage = () => {
  const { id } = useParams()
  const context: any = useContext(FullSiteContext)
  const authcontext: any = useContext(Authenticate)
  const [order, setOrder] = useState()
  const Navigate = useNavigate()


  const fetchorder = async () => {
    try {
    const res = await axios.get(`${context.url}order/get/order/${id}`, { headers: { Authorization: `Bearer ${authcontext.access}` } })
      setOrder(res.data)
    }
    catch(error:any){
      if (error.response?.status === 401){
        const flag = authcontext.runfunction(null,null,"checkuserauth")
        if (flag){
          const res = await axios.get(`${context.url}order/get/order/${id}`, { headers: { Authorization: `Bearer ${authcontext.access}` } })
          setOrder(res.data)
        }
      }
      else{console.log(error)}
    }
    }

  useEffect(() => {
    fetchorder()
  }, [])

  return (
    <>
      <div className='bg-white min-h-[calc(100vh-100px)] p-4'>
        <ArrowLeft className='cursor-pointer hover:text-gray-500 ' onClick={() => (Navigate(-1))}></ArrowLeft>
        <p className='text-center font-bold text-[30px] mb-5'>Full Order Information</p>
        {order ? Object.entries(order).map(([key, value]) => (
          <div className='mb-4'>
            <p className='font-bold'>{key} :<span className='font-normal'> {value}</span></p>

          </div>

        )) : null}
      </div>
    </>
  )
}

export default orderpage
