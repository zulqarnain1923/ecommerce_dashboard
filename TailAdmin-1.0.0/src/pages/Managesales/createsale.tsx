import React, { useState, ChangeEvent,useEffect, FormEvent,useContext } from 'react';
import axios from 'axios';
// import { useTheme } from "../../context/ThemeContext";
import { FullSiteContext } from '../../context/fullsitecontext';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Authenticate } from '../../context/AuthenticContext';

// --- Types & Interfaces ---
type ApplyOnType = 'all' | 'category';

interface SaleFormData {
  name: string;
  title: string;
  description: string;
  banner_image: File | null;
  discount_percent: number;
  apply_on: ApplyOnType;
  category: string[]; // Array of Category IDs
  start_date: string; // ISO string for datetime-local input
  end_date: string;   // ISO string for datetime-local input
  
}

// interface CategoryOption {
//   id: string;
//   name: string;
// }

// --- Helper Components ---

const Spinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- Main Wizard Component ---

const SaleWizardForm: React.FC = () => {
  // const { theme } = useTheme();
  const Navigation = useNavigate()
  const context:any= useContext(FullSiteContext)
  const authcontext:any= useContext(Authenticate)
  // State
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [catagory,setcatagory]= useState<any>([])

  const [formData, setFormData] = useState<SaleFormData>({
    name: '',
    title: '',
    description: '',
    banner_image: null,
    discount_percent: 0,
    apply_on: 'all',
    category: [],
    start_date: '',
    end_date: '',
  });



  useEffect(() => {
        // Fetch Categories with ID
        axios.get(`${context.url}catagory/`)
            .then((res) => {
                // Assuming API returns list of objects with id and name
                setcatagory(res.data); 
            })
            .catch(err => console.log(err));
    }, []);
    
  // Derived State for Progress Bar
  const progress = ((step - 1) / 2) * 100;

  // --- Handlers ---

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' || type === 'checkbox' 
        ? (type === 'checkbox' ? (e.target as HTMLInputElement).checked : Number(value))
        : value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, banner_image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const current = prev.category;
      if (current.includes(categoryId)) {
        return { ...prev, category: current.filter(id => id !== categoryId) };
      } else {
        return { ...prev, category: [...current, categoryId] };
      }
    });
  };

  // --- Validation ---

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError("Name is required.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.discount_percent || formData.discount_percent < 1 || formData.discount_percent > 100) {
        setError("Discount percent must be between 1 and 100.");
        return false;
      }
      if (formData.apply_on === 'category' && formData.category.length === 0) {
        setError("Please select at least one category.");
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.start_date || !formData.end_date) {
        setError("Start date and End date are required.");
        return false;
      }
      if (new Date(formData.start_date) >= new Date(formData.end_date) ) {
        setError("End date must be after Start date.");
        return false;
      }
      if (new Date > new Date(formData.end_date)){
        setError("the end date must be after the current date");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setError(null);
  };

  // --- Submission ---

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
   
    setLoading(true);
    setError(null);
    console.log(formData)
    try {
      const dataPayload = new FormData();
      
      // Append all fields
      dataPayload.append('name', formData.name);
      dataPayload.append('title', formData.title);
      dataPayload.append('description', formData.description);
      if (formData.banner_image) {
        dataPayload.append('banner_image', formData.banner_image);
      }
      dataPayload.append('discount_percent', formData.discount_percent.toString());
      dataPayload.append('apply_on', formData.apply_on);
      dataPayload.append('start_date', new Date(formData.start_date).toISOString());
      dataPayload.append('end_date', new Date(formData.end_date).toISOString());
      // dataPayload.append('is_active', formData.is_active.toString());

      // Append category array (common backend convention for FormData arrays)
      // dataPayload.append('category', JSON.stringify(formData.category))
      formData.category.forEach(id => {
  dataPayload.append('category', id);
});

    //   Simulate API call
    try{
      const res= await axios.post(`${context.url}sales/create/`, dataPayload ,{headers:{Authorization:`Bearer ${authcontext.access}`}});
      context.setchecknote(res.data.message);
      setSuccess(true);
    }catch(error:any){
      if (error.respose?.status=== 401){
        const flag= authcontext.runfunction(null ,null , "checkuserauth")
        if (flag){
          const res= await axios.post(`${context.url}sales/create/`, dataPayload ,{headers:{Authorization:`Bearer ${authcontext.access}`}});
          context.setchecknote(res.data.message);
          setSuccess(true);
        }
      }
    }
      // await axios.post(`${context.url}sales/create/`, dataPayload )
      // .then(res=>{context.setchecknote(res.data.message), setSuccess(true);})
      // .catch((err)=>{console.log(err.data.error),context.setchecknote("error "), setSuccess(false);})
     
      // Mocking delay for UX demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    //   console.log("Payload prepared for backend:", Object.fromEntries(dataPayload));
     
    } catch (err) {
      setError("Failed to create sale. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSuccess(false);
    setFormData({
      name: '', title: '', description: '', banner_image: null, discount_percent: 0,
      apply_on: 'all', category: [], start_date: '', end_date: '',
    });
    setPreviewUrl(null);
  };

  // --- Styles Helper ---
  const inputClass = "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-colors bg-transparent text-sm";
  const labelClass = "block text-sm font-medium mb-1";
  const cardClass = "bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-200">
      
      <div className={`w-full max-w-2xl ${cardClass}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Sale</h2>
          <button className="text-gray-500 hover:text-indigo-500 transition-colors" onClick={()=> Navigation('/Dashboard/show/sales/')}>
            <X ></X>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5">
          <div 
            className="bg-indigo-600 h-1.5 transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Step Indicator */}
        <div className="px-6 py-4 flex justify-between text-xs font-semibold tracking-wide text-gray-500 uppercase">
          <span className={step >= 1 ? "text-indigo-600" : ""}>1. Basic Info</span>
          <span className={step >= 2 ? "text-indigo-600" : ""}>2. Rules</span>
          <span className={step >= 3 ? "text-indigo-600" : ""}>3. Schedule</span>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-10">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Sale Created Successfully!</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">The sale has been added to your dashboard.</p>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex justify-center w-full px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className={labelClass + " text-gray-700 dark:text-gray-300"}>Sale Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`${inputClass} border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700`}
                      placeholder="e.g. Summer Sale 2024"
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass + " text-gray-700 dark:text-gray-300"}>Title (Optional)</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`${inputClass} border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700`}
                      placeholder="Short catchy title"
                    />
                  </div>

                  <div>
                    <label className={labelClass + " text-gray-700 dark:text-gray-300"}>Description</label>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`${inputClass} border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700`}
                      placeholder="Details about the sale..."
                    ></textarea>
                  </div>

                  <div>
                    <label className={labelClass + " text-gray-700 dark:text-gray-300"}>Banner Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors relative">
                      <input
                        type="file"
                        name="banner_image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-1 text-center">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-cover rounded" />
                        ) : (
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                          <span className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none">
                            {previewUrl ? 'Change Image' : 'Upload a file'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Discount Rules */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <label className={labelClass + " text-gray-700 dark:text-gray-300"}>
                      Discount Percentage <span className="text-red-500">*</span> (1-100)
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        type="number"
                        name="discount_percent"
                        min="1"
                        max="100"
                        value={formData.discount_percent}
                        onChange={handleInputChange}
                        className={`${inputClass} border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700`}
                        placeholder="10"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass + " text-gray-700 dark:text-gray-300"}>Apply On <span className="text-red-500">*</span></label>
                    <select
                      name="apply_on"
                      value={formData.apply_on}
                      onChange={handleInputChange}
                      className={`${inputClass} border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700`}
                    >
                      <option value="all">All Products</option>
                      <option value="category">Specific Category</option>
                    </select>
                  </div>

                  {formData.apply_on === 'category' && (
                    <div className="mt-4">
                      <label className={labelClass + " text-gray-700 dark:text-gray-300"}>Select Categories</label>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        {catagory.map((cat:any) => (
                          <div key={cat.id} className="flex items-center">
                            <input
                              id={`cat-${cat.id}`}
                              type="checkbox"
                              checked={formData.category.includes(cat.id)}
                              onChange={() => handleCategoryToggle(cat.id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor={`cat-${cat.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer">
                              {cat.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Schedule & Settings */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass + " text-gray-700 dark:text-gray-300"}>Start Date <span className="text-red-500">*</span></label>
                      <input
                        type="datetime-local"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className={`${inputClass} border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700`}
                      />
                    </div>
                    <div>
                      <label className={labelClass + " text-gray-700 dark:text-gray-300"}>End Date <span className="text-red-500">*</span></label>
                      <input
                        type="datetime-local"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className={`${inputClass} border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Active Status</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Immediately visible to customers</p>
                    </div>
                    {/* <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${formData.is_active ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${formData.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button> */}
                  </div>
                  
                  {/* Preview Summary (Bonus) */}
                   <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                     <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Summary</h4>
                     <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                       <p><span className="font-medium">Name:</span> {formData.name}</p>
                       <p><span className="font-medium">Discount:</span> {formData.discount_percent}% off {formData.apply_on === 'all' ? 'All Products' : 'Selected Categories'}</p>
                       {/* <p><span className="font-medium">Status:</span> {formData.is_active ? 'Active' : 'Inactive'}</p> */}
                     </div>
                   </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === 1 ? 'invisible' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  Back
                </button>
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50"
                  >
                    {loading ? <Spinner /> : 'Create Sale'}
                  </button>
                )}
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Wrapper App Component ---

const App: React.FC = () => {
  return (
    
      <SaleWizardForm />
    
  );
};

export default App;