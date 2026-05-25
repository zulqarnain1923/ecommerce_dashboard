import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import axios from "axios";
import { useEffect, useState, useContext, useRef } from "react";
import { X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { FullSiteContext } from "../../context/fullsitecontext";
import { useNavigate } from "react-router";
import { Authenticate } from "../../context/AuthenticContext";
import Header from "../header/Header";



export default function RecentOrders() {
  const { theme } = useTheme()
  const context: any = useContext(FullSiteContext)
  const authcontext: any = useContext(Authenticate)
  const Navigation = useNavigate()

  const [order, setOrders] = useState<any>()
  const [option, setoption] = useState<any>(null)
  const [filter, setfilter] = useState({})
  const [checkfilter, setcheckfilter] = useState("top-[-100px]")


  const putstatus = useRef({})

  const addfiltervalue = (e: any) => {
    setfilter({ ...filter, [e.target.name]: e.target.value })
  }

  const fetchorders = async () => {
    try {

      const res = await axios.get(`${context.url}order/get/`, { params: { dashboard: "true", ...filter }, headers: { Authorization: `Bearer ${authcontext.access.current}` } })
      setOrders((res.data));

    } catch (error: any) {
      if (error.response?.status === 401) {

        const flag = await authcontext.runfunction(null, null, "checkuserauth")

        if (flag) {

          const res = await axios.get(`${context.url}order/get/`, { params: { dashboard: "true", ...filter }, headers: { Authorization: `Bearer ${authcontext.access.current}` } })
          setOrders((res.data));
        }
      } else {
        console.log("error")
      }
    };
  }

  useEffect(() => {
    fetchorders();
  }, [])

  const clearfunction = async () => {
    setcheckfilter("top-[-100px]")
    setfilter({ status: "" })
    try {

      const res = await axios.get(`${context.url}order/get/`, { headers: { Authorization: `Bearer ${authcontext.access.current}` } })
      setOrders((res.data))

    } catch (error: any) {
      if (error.response?.status === 401) {

        const flag = await authcontext.runfunction(null, null, "checkuserauth")

        if (flag) {
          const res = await axios.get(`${context.url}order/get/`, { headers: { Authorization: `Bearer ${authcontext.access.current}` } })
          setOrders((res.data))
        }
      }
      else {
        console.log("error")
      }
    };

  }

  useEffect(() => {
    const click = () => {
      setoption(null)
    }
    window.addEventListener('click', click)
    return () => {
      window.removeEventListener('click', click)
    }
  }, [])

  const toogle = (e: any, index: number) => {
    e.stopPropagation();

    if (option === null) { setoption(index); return true }

    if (option === index) { setoption(null); return true }
    else { setoption(index) }

  }

  const changestatus = async (e: any, index: number, status: string, id: string) => {
    toogle(e, index)
    putstatus.current = { id: id, status: status }
    try {
      const res = await axios.put(`${context.url}order/add/order/`, putstatus.current, { headers: { Authorization: `Bearer ${authcontext.access.current}` } })
      context.setchecknote(res.data.message)
      fetchorders()
    }
    catch (error: any) {
      if (error.response?.status === 401) {
        const flag = await authcontext.runfunction(null, null, "checkuserauth")
        if (flag) {
          const res = await axios.put(`${context.url}order/add/order/`, putstatus.current, { headers: { Authorization: `Bearer ${authcontext.access.current}` } })
          context.setchecknote(res.data.message)
          fetchorders()
        }
      }
      else {
        console.log("error")
      }
    }
  }
  // redirect to manage product page after delete proeuct 
  useEffect(() => {
    if (context.deleteflag) {
      fetchorders();
      context.setdeleteflag(false);
    }
  }, [context.deleteflag]);

  const mainbg = theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-black"

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 overflow-hidden relative">
      <div className={`${mainbg} h-[50px] items-center flex justify-between block border px-1 rounded absolute w-[calc(100%-30px)] sm:w-[calc(100%-44px)] z-30 transition-all duration-1000 ${checkfilter}`}>
        <div className={`${mainbg} flex gap-2 flex items-center justify-center`}>

          <select value={filter.status} name="status" id="" className={`h-[35px] w-[120px] rounded text-[14px] ${mainbg} `} onChange={(e) => addfiltervalue(e)}>
            <option value="" >status</option>
            <option value="shipped">shipped</option>
            <option value="pending">pending</option>
            <option value="delivered">delivered</option>
          </select>

        </div>
        <div className="flex  gap-6 items-center justify-center ">
          <p className="bg-blue-500 h-6 text-white text-[12px] rounded px-1 cursor-pointer hover:bg-blue-600 cursor-pointer" onClick={fetchorders}>Apply</p>

          <div className="flex flex-col justify-center items-center">
            <X className={`${mainbg} w-4 pointer cursor-pointer hover:text-gray-500 `} onClick={() => setcheckfilter("top-[-100px]")}></X>
            <p className="text-red-500 text-[14px] hover:text-red-700 cursor-pointer" onClick={() => (clearfunction())}>clear</p>
          </div>

        </div>

      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <div className={`text-[20px] font-bold hidden sm:block ${theme === "dark" ? "text-white" : "text-black"}`}>Orders</div>
          {/* <input type="text" placeholder="Search ....." className="rounded h-[40px]" /> */}

          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200" onClick={() => setcheckfilter("top-[10px]")}>
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="15"
              height="15"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filter
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <th className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400" >
                Orders
              </th>
              <th className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Category
              </th>
              <th className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400" >
                Price
              </th>
              <th className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </th>
            </TableRow>
          </TableHeader>

          {/* Table Body */}

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {order ? order.map((ord: any, index: number) => (
              <TableRow key={index} className="relative">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <img
                        src={`${ord.image}`}
                        className="h-[50px] w-[50px]"
                        alt={ord.pr_name}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 hover:underline cursor-pointer" onClick={() => Navigation(`/Dashboard/order/${ord.order_id} `)}>
                        {ord.pr_name}
                      </p>
                      <span className="text-[12px] text-gray-500 text-theme-xs dark:text-gray-400">
                        {ord.pr_id}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-[12px] text-gray-500 text-theme-sm dark:text-gray-400">
                  {ord.catagory}
                </TableCell>
                <TableCell className="py-3 text-[10px] text-gray-500 text-theme-sm dark:text-gray-400">
                  {ord.pr_price}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <div className={`cursor-pointer max-w-[70px]`} onClick={(e) => toogle(e, index)} >
                    <Badge
                      size="sm"
                      color={
                        ord.status === "delivered"
                          ? "success"
                          : ord.status === "pending"
                            ? "error"
                            : ord.status === "shipped"
                              ? "info"
                              : "error"
                      }>
                      {ord.status}
                    </Badge>
                  </div>

                </TableCell>
                <div className={`${mainbg} absolute top-5 right-2 z-50 shadow-[0_0_5px_gray] p-2 rounded ${option === index ? "block" : "hidden"} `} onClick={(e) => e.stopPropagation()}>
                  <p className="text-center text-[12px] text-gray-600">Change Status</p>
                  <div className="flex flex-col gap-2 mt-3 ">
                    <p className={`text-[14px] cursor-pointer ${theme === "dark" ? " bg-gray-600 px-2 rounded hover:bg-gray-700 " : "bg-gray-200 px-2 rounded hover:bg-gray-300 "}`} onClick={(e) => (changestatus(e, index, "pending", ord.order_id))}>pending</p>
                    <p className={`text-[14px] cursor-pointer ${theme === "dark" ? " bg-gray-600 px-2 rounded hover:bg-gray-700 " : "bg-gray-200 px-2 rounded hover:bg-gray-300 "}`} onClick={(e) => (changestatus(e, index, "shipped", ord.order_id))}>shipped</p>
                    <p className={`text-[14px] cursor-pointer ${theme === "dark" ? " bg-gray-600 px-2 rounded hover:bg-gray-700 " : "bg-gray-200 px-2 rounded hover:bg-gray-300 "}`} onClick={(e) => (changestatus(e, index, "delivered", ord.order_id))}>delivered</p>
                  </div>
                  {/* <p className="text-blue-500 text-[13px] cursor-pointer hover:underline mt-3" >view</p> */}
                </div>

              </TableRow>

            )) : null}

          </TableBody>
        </Table>
      </div>
    </div>
  );
}
