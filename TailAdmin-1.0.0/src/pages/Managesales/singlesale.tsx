import React from 'react'
import { useState, useEffect, useContext, } from 'react'
import { FullSiteContext } from '../../context/fullsitecontext'
import axios from 'axios'
import { useParams,useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Authenticate } from '../../context/AuthenticContext'

const Singlesale = () => {
    const context: any = useContext(FullSiteContext)
    const authcontext: any = useContext(Authenticate)
    const Navigation= useNavigate()
    const { id } = useParams()
    const [sale, setsale] = useState<any>()

    useEffect(() => {
        const fetchsale = async() => {
            try{
            const res =await axios.get(`${context.url}sales/get/${id}`, {headers: {Authorization:`Bearer ${authcontext.access}`}})
            setsale(res.data);
            }
            catch (error:any){
              if (error.response?.status=== 401){
                const flag= authcontext.runfunction(null,null,"checkuserauth")
                if (flag){
                    const res =await axios.get(`${context.url}sales/get/${id}`, {headers: {Authorization:`Bearer ${authcontext.access}`}})
                    setsale(res.data);  
                }
              }
            }
        }
        fetchsale()
    }, [])
    return (
        <div>
            <div className=' relative'>
                <div className="w-full h-[200px] md:h-60 bg-gray-100 flex items-center justify-center rounded-lg relative overflow-hidden">
                    <img src={sale && sale.banner_image} alt={sale && sale.name} className="w-full h-full object-cover rounded-lg brightness-[70%]" />
                </div>
                <ArrowLeft className='absolute top-0 left-0 text-white hover:text-gray-300 cursor-pointer' onClick={()=> Navigation(-1)}></ArrowLeft>

                <div className='w-full max-w-[500px] absolute flex justify-center items-center top-5 left-[50%] translate-x-[-50%] '>
                    <div className='flex flex-col items-center justify-center w-[100%] '>
                        <p className="text-sm sm:text-md md:text-lg text-yellow-400 text-center mb-2 font-semibold uppercase text-shadow-[0_0_5px_black]">{sale && sale.name}</p>
                        <div>
                            <p className="text-3xl md:text-[45px] font-bold white text-center block mb-3 capitalize [text-shadow:0px_0px_6px_white]">
                                {sale && sale.title}
                            </p>
                            <p className="  text-gray-100 text-shadow-[0_0_5px_black] text-center text-[12px] sm:text-[14px] md:text-md mb-4  px-2 sm:px-3 [text-shadow:0px_0px_10px_black]">
                                {sale && sale.description}
                            </p>
                        </div>
                        <button className="bg-indigo-600 hover:bg-yellow-600 text-white font-bold p-1 px-4  rounded-md transition duration-300 ease-in-out" onClick={() => navigation('/all/products')}>
                            {sale && sale.name}
                        </button>

                    </div>
                </div>
            </div>
            <div className='bg-white p-3 mt-5 rounded'>
                <p className='text-[23px] font-bold text-center underline mb-3'>Full information</p>
                <div className='flex flex-col'>
                <p className='text-[18px] font-bold'>Name : <span className='text-[16px] text-gray-600 font-normal'> {sale && sale.name}</span> </p>
                <p className='text-[18px] font-bold'>Title : <span className='text-[16px] text-gray-600 font-normal'> {sale && sale.title}</span> </p>
                <p className='text-[18px] font-bold'>Description : <span className='text-[16px] text-gray-600 font-normal'> {sale && sale.description}</span> </p>
                <p className='text-[18px] font-bold'>Discount : <span className='text-[16px] text-gray-600 font-normal'> {sale && sale.discount_percent}%</span> </p>
                <p className='text-[18px] font-bold'>Id : <span className='text-[16px] text-gray-600 font-normal'> {sale && sale.id}</span> </p>
                <p className='text-[18px] font-bold'>Start date : <span className='text-[16px] text-gray-600 font-normal'> {sale && sale.start_date}</span> </p>
                <p className='text-[18px] font-bold'>End date : <span className='text-[16px] text-gray-600 font-normal'> {sale && sale.end_date}</span> </p>
                <p className='text-[18px] font-bold'>Status : <span className='text-[16px] text-gray-600 font-normal'> {sale && sale.is_active=== true? "true" : "false"}</span> </p>
                <p className='text-[18px] font-bold'>Apply on : <span className='text-[16px] text-gray-600 font-normal'> {sale && sale.apply_on}</span> </p>
                <p className='text-[18px] font-bold'>Category : <span className='text-[16px] text-gray-600 font-normal'> {sale && sale.category.map((name:string, index:number)=>(
                    <span key={index}>{name}, </span>))}
                </span> </p>
               
                </div>
            </div>
        </div>
        
    )
}

export default Singlesale
