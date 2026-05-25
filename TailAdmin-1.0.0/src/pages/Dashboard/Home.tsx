import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import { Authenticate } from "../../context/AuthenticContext";

import axios from "axios";
import { useEffect, useState, useContext } from "react";


type Props = {
  catagory: string[];
  total_sold: number[];
};
export default function Home() {
  const [catagory, setCatagory] = useState<any>([])
  const [total_sold, setTotalsold] = useState<any>([])
  const [month, setMonth] = useState<any>([])
  const [total_order, setTotalorder] = useState<any>([])
  const authcontext = useContext(Authenticate)

  const per_catagory_sale = async () => {
    try {
      const res = await axios.get(`${authcontext.url}order/month/data/`, { headers: { Authorization: `Bearer ${authcontext.access.current}` } })
      

      const ctg = res.data.catagory.map((item: any) => item.product__catagory__name)
      const sold = res.data.catagory.map((item: any) => item.total_sold)
      const mth = res.data.month_data.map((item: any) => item.month)
      const order = res.data.month_data.map((item: any) => item.total_orders)

      setCatagory(ctg)
      setTotalsold(sold)
      setMonth(mth)
      setTotalorder(order)
      
    }

    catch (error: any) {
      if (error.response?.status === 401) {
        const flag =await authcontext.runfunction(null, null, "checkuserauth")
        if (flag) {
          const res = await axios.get(`${authcontext.url}order/month/data/`, { headers: { Authorization: `Bearer ${authcontext.access.current}` } })

          const ctg = res.data.catagory.map((item: any) => item.product__catagory__name)
          const sold = res.data.catagory.map((item: any) => item.total_sold)
          const mth = res.data.month_data.map((item: any) => item.month)
          const order = res.data.month_data.map((item: any) => item.total_orders)

          setCatagory(ctg)
          setTotalsold(sold)
          setMonth(mth)
          setTotalorder(order)
         
        }

        console.error("Error fetching data:")
      }
    }
  }

  useEffect(() => {
    per_catagory_sale()
  }, [])



  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | Dashboard - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for Dashboard - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 ">
          <EcommerceMetrics />

          <MonthlySalesChart catagory={catagory} total_sold={total_sold} />
        </div>

        {/* <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div> */}

        <div className="col-span-12">
          <StatisticsChart month={month} total_order={total_order} />
        </div>


        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
