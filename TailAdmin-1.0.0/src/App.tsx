import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProductaddForm from "./pages/Forms/Productadd";
import Editproduct from "./pages/editproduct";
import Home from "./pages/Dashboard/Home";
import Manageproducts from "./pages/Manageproducts"
import Manageorder from "./pages/Manageorder"
import Orderpage from "./pages/orderpage"
import Createsale from "./pages/Managesales/createsale"
import Showsales from "./pages/Managesales/showsales"
import Singlesale from "./pages/Managesales/singlesale"
import { FullSiteContext } from "./context/fullsitecontext";
import { useTheme } from "./context/ThemeContext";

import Authcontext from "./context/AuthenticContext";
import { useContext } from "react";

export default function App() {
  const context: any = useContext(FullSiteContext)
  const { theme } = useTheme()
  const trueclass = " right-[20px]"
  const falseclass = " right-[-250px]"


  const bg = theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
  const confirmationshow = context.deleteconfirm ? "top-[30%] opacity-100 block" : "top-[20%] opacity-0 hidden"


  return (
    <>
      {/* bottom not code  */}

      <div className={`fixed z-50 top-[90vh] bg-white shadow-[0px_0px_10px_gray] border-1 rounded-lg p-2  min-w-[150px] w-full max-w-[200px] transition-all duration-1000 ${context.check ? trueclass : falseclass}`}>{context.checknote}</div>
      <Router>
        <Authcontext>
          <ScrollToTop />
          {/* product delete confirmation */}
          <div className={`fixed ${bg} ${confirmationshow} h-[150px] w-[200px] px-4 rounded-lg shadow-[0_0_5px_gray] transition-all duration-1000 z-50 left-[50%] translate-x-[-50%] `}>
            <p className="mt-3 text-center">Your sure you want to delete this product?</p>
            <div className="flex gap-2 mt-4 flex justify-center items-center mt-[40px]">
              <button className="bg-green-600 text-white px-3 py-2 h-[33px] flex justify-center items-center rounded-lg hover" onClick={() => context.confirmdelete()}>Confirm</button>
              <button className="bg-red-600 text-white px-3 py-2 h-[33px] flex justify-center items-center rounded-lg" onClick={() => context.cancledelete()}>Cancle</button>
            </div>
          </div>

          <Routes>
            {/* TailAdmin */}
            {/* Dashboard Layout */}
            <Route path="/Dashboard/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="productadd" element={<ProductaddForm />} />
              {/* <div className="absolute bg-white h-[150px] w-[200px] px-4 rounded-lg shadow-[0_0_5px_gray]  transition-all duration-1000">asdfsd</div> */}

              <Route path="productedit/:id" element={<Editproduct />} />
              <Route path="manage/product" element={<Manageproducts />} />
              <Route path="manage/order" element={<Manageorder />} />
              <Route path="order/:id" element={<Orderpage />} />
              <Route path="create/sale" element={<Createsale />} />
              <Route path="show/sales" element={<Showsales />} />
              <Route path="view/sale/:id" element={<Singlesale />} />


              {/* Others Page */}
              <Route path="profile" element={<UserProfiles />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="blank" element={<Blank />} />

              {/* Forms */}
              <Route path="form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="alerts" element={<Alerts />} />
              <Route path="avatars" element={<Avatars />} />
              <Route path="badge" element={<Badges />} />
              <Route path="buttons" element={<Buttons />} />
              <Route path="images" element={<Images />} />
              <Route path="videos" element={<Videos />} />

              {/* Charts */}
              <Route path="line-chart" element={<LineChart />} />
              <Route path="bar-chart" element={<BarChart />} />
            </Route>

            {/* Auth Layout */}
            <Route path="/Dashboard/signin" element={<SignIn />} />
            <Route path="/Dashboard/signup" element={<SignUp />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Authcontext>
      </Router>

    </>
  );
}
