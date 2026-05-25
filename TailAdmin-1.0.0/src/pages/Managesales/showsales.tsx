import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Search, Filter, MoreVertical, Power, Calendar, Tag, LayoutGrid } from 'lucide-react';
import { FullSiteContext } from '../../context/fullsitecontext';
import { useNavigate } from 'react-router';
import Badge from '../../components/ui/badge/Badge'
import { Authenticate } from '../../context/AuthenticContext';
// ==========================================
// 1. TYPES
// ==========================================

type SaleStatus = 'ACTIVE' | 'EXPIRED' | 'UPCOMING' | 'STOPPED';
// type ApplyOnType = 'all' | 'category' | 'all_products';

interface Sale {
  id: number;
  name: string;
  title: string;
  discount_percent: number;
  apply_on: any;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  category_id?: number | null;
}

interface Filters {
  status: 'all' | SaleStatus;
  applyOn: 'all' | any;
  search: string;
}

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

const SalesManagementPage: React.FC = () => {
  // -- State --
  const Navigation = useNavigate()
  const context: any = useContext(FullSiteContext)
  const authcontext: any = useContext(Authenticate)
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    applyOn: 'all',
    search: ''
  });

  // Modal State
  const [modalState, setModalState] = useState<{ isOpen: boolean; saleId: number | null }>({
    isOpen: false,
    saleId: null
  });

  // -- Effects --

  useEffect(() => {
    loadSales();
  }, []);

  // -- API & Handlers --

  const loadSales = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<Sale[]>(`${context.url}sales/get/`, { headers: { Authorization: `Bearer ${authcontext.access.current}` } });
      setSales(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        const flag = await authcontext.runfunction(null, null, "checkuserauth")
        if (flag) {
          const { data } = await axios.get<Sale[]>(`${context.url}sales/get/`, { headers: { Authorization: `Bearer ${authcontext.access.current}` } });
          setSales(data);
        }
      }
      context.setchecknote("Failed to load sales data")
    } finally {
      setLoading(false);
    }
  };

  const handleStopClick = (id: number) => {
    setModalState({ isOpen: true, saleId: id });
  };

  const confirmStop = async () => {
    if (!modalState.saleId) return;

    try {
      const res = await axios.put(`${context.url}sales/put/`, modalState, { headers: { Authorization: `Bearer ${authcontext.access.current}` } });
      context.setchecknote(res.data.message)
      // await loadSales();
    } catch (error: any) {
      if (error.response?.status === 401) {

        const flag = await authcontext.runfunction(null, null, "checkuserauth")

        if (flag) {
          const res = await axios.put(`${context.url}sales/put/`, modalState, { headers: { Authorization: `Bearer ${authcontext.access.current}` } });
          context.setchecknote(res.data.message)
        }
        else {
          context.setchecknote("error in stoping sale")
        }
      }

    } finally {
      setModalState({ isOpen: false, saleId: null });
    }
  };

  const handleCreateSale = () => {
    // Simplified duplicate check
    const hasActiveGlobal = sales.some(s => getSaleStatus(s) === 'ACTIVE' && s.apply_on === 'all');
    if (hasActiveGlobal) {
      context.setchecknote('Cannot create: An active "All Products" sale already exists.');
      return;
    }
    Navigation('/Dashboard/create/sale')
    context.setchecknote('Create Sale Modal would open here');
  };

  // -- Filtering Logic (Simplified - No useMemo) --

  const filteredSales = sales.filter(sale => {
    const status = getSaleStatus(sale);

    if (filters.status !== 'all' && status !== filters.status) return false;
    if (filters.applyOn !== 'all' && sale.apply_on !== filters.applyOn) return false;

    if (filters.search) {
      const term = filters.search.toLowerCase();
      return sale.name.toLowerCase().includes(term) || sale.title.toLowerCase().includes(term);
    }

    return true;
  });

  // -- Render Helpers --

  // const StatusBadge = ({ status }: { status: SaleStatus }) => {
  //   const styles = {
  //     ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  //     EXPIRED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  //     UPCOMING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  //     STOPPED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
  //   };

  //   const icons = {
  //     ACTIVE: <CheckCircle className="w-3 h-3 mr-1" />,
  //     EXPIRED: <XCircle className="w-3 h-3 mr-1" />,
  //     UPCOMING: <Clock className="w-3 h-3 mr-1" />,
  //     STOPPED: <Power className="w-3 h-3 mr-1" />,
  //   };

  //   return (
  //     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${styles[status]}`}>
  //       {icons[status]}
  //       {status.charAt(0) + status.slice(1).toLowerCase()}
  //     </span>
  //   );
  // };

  const ConfirmModal = () => {
    if (!modalState.isOpen || !modalState.saleId) return null;
    const sale = sales.find(s => s.id === modalState.saleId);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Stop Sale?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to stop <span className="font-semibold text-gray-900 dark:text-white">"{sale?.name}"</span>?
            This will immediately disable the discount.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalState({ isOpen: false, saleId: null })}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmStop}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-colors"
            >
              Yes, Stop Sale
            </button>
          </div>
        </div>
      </div>
    );
  };


  // -- Main Render --

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 p-2 md:p-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage discounts, campaigns, and scheduling.</p>
        </div>
        <button
          onClick={handleCreateSale}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all transform hover:scale-105 active:scale-95"
        >
          <Tag className="w-4 h-4 mr-2" />
          Create Sale
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">

          {/* Search */}
          <div className="relative flex-grow md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>


          <div className='flex justify-between w-full max-w-[500px]'>
            {/* Filter Status */}
            <div className="">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-8 py-2 appearance-none rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="UPCOMING">Upcoming</option>
              </select>
              {/* <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div> */}
            </div>

            {/* Reset */}
            <button
              onClick={() => setFilters({ status: 'all', applyOn: 'all', search: '' })}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className=" px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sale Info</th>
                <th className=" px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredSales.length > 0 ? (
                filteredSales.map(sale => {
                  const status = getSaleStatus(sale);
                  const isActiveRow = status === 'ACTIVE' ? "bg-blue-50/30 dark:bg-blue-900/10" : "";

                  return (
                    <tr key={sale.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group ${isActiveRow}`}>
                      <td className="ps-2 px-1 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white hover:underline cursor-pointer" onClick={() => Navigation(`/Dashboard/view/sale/${sale.id}`)}>{sale.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{sale.title}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                            <Tag className="w-3 h-3 mr-1" /> {sale.apply_on === 'all' ? 'All Products' : 'Category'}
                          </span>
                        </div>
                      </td>
                      <td className=" text-xs px-1 py-4">
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{sale.discount_percent}%</span>
                      </td>
                      <td className="px-1 py-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center"><Calendar className="w-3 h-3 mr-2 text-gray-400" /> {formatDate(sale.start_date)}</div>
                          <div className="flex items-center"><Calendar className="w-3 h-3 mr-2 text-gray-400" /> {formatDate(sale.end_date)}</div>
                        </div>
                      </td>
                      <td className="   px-1 py-4">
                        <Badge color={status === 'ACTIVE' ? 'success' :
                          status === 'EXPIRED' ? 'error' :
                            status === 'STOPPED' ? 'warning' :
                              status === 'UPCOMING' ? 'info' : 'error'} >

                          {`${getSaleStatus(sale)}`}
                        </Badge>
                      </td>
                      <td className="  px-1 py-4 text-right">
                        {status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleStopClick(sale.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Stop Sale"
                          >
                            <Power className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="p-2 opacity-30 cursor-not-allowed" title="Action unavailable">
                            <MoreVertical className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <LayoutGrid className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">No sales found</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">
                        We couldn't find any sales matching your filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredSales.length} of {sales.length} sales
      </div>

      {/* Modals */}
      <ConfirmModal />
    </div>
  );
};

// ==========================================
// 3. UTILITY FUNCTIONS (Kept outside component)
// ==========================================

const getSaleStatus = (sale: Sale): SaleStatus => {
  const now = new Date();
  const start = new Date(sale.start_date);
  const end = new Date(sale.end_date);

  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (!sale.is_active) return 'STOPPED';

  if (now >= start && now <= end) return 'ACTIVE';
  if (now > end) return 'EXPIRED';
  if (now < start) return 'UPCOMING';

  return 'STOPPED';
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default SalesManagementPage;