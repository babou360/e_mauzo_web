// store/useErrorStore.js
import { create } from 'zustand'

type SelectedBusinessState = {
  selected: {
    id: number,
    name: string,
    category: string,
    type: string,
    country: string,
    city: string,
    district: string,
    ward: string,
    street: string,
    latlong: string,
    phone: string,
    email: string,
    status: string,
    pricingCategory: string,
    createdAt: string
  }
  setSelected: (selected: any) => void
  clearBusiness: () => void
}

const useSelectedBusinessStore = create<SelectedBusinessState>((set) => ({
  selected: {id:0,name: "",category: '',type: '',country: '',city: '',district: '',ward: '',street: '',latlong: '',phone: '',email: '',status:'',pricingCategory:'',createdAt:''},
  setSelected: (message) => set({ selected: message }),
  clearBusiness: () => set({ selected: {id:0,name: "",category: '',type: '',country: '',city: '',district: '',ward: '',street: '',latlong: '',phone: '',email: '',status:'',pricingCategory:'',createdAt:''}}),
}))

export default useSelectedBusinessStore
