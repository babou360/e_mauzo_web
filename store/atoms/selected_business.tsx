import { create } from 'zustand';

type OpeningHours = Record<
  string,
  {
    open: string;
    close: string;
  }
>;

interface type {
  id: number,
  slug: string,
  image: string,
  status: string,
  createdAt: string,
  updatedAt: string,
  english_name: string,
  swahili_name: string,
  english_description: string,
  swahili_description: string
}
interface category {
  id: number,
  slug: string,
  image: string,
  status: string,
  createdAt: string,
  updatedAt: string,
  english_name: string,
  swahili_name: string,
  english_description: string,
  swahili_description: string
}
interface salesCategory {
  value: string, 
  english: string, 
  swahili: string
}

type SelectedBusiness = {
  id: number;
  name: string;
  category: category;
  type: type;
  country: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  latlong: string;
  phone: string;
  email: string;
  status: string;
  pricingCategory: string;
  createdAt: string;
  lastPaid: string;
  description: string;
  currency: string;
  salesCategory: salesCategory;
  thumbnail: string;
  slug: string;
  referralCode: string;
  deliveryAvailable: boolean;
  sellsOnline: boolean;
  alwaysOpen: boolean;
  isVerified: boolean;
  openingHours: OpeningHours;
};

type SelectedBusinessState = {
  selected: SelectedBusiness;
  setSelected: (selected: SelectedBusiness) => void;
  clearBusiness: () => void;
};

const defaultBusiness: SelectedBusiness = {
  id: 0,
  name: '',
  category: {
    id: 0,
    slug: '',
    image: '',
    status: '',
    createdAt: '',
    updatedAt: '',
    english_name: '',
    swahili_name: '',
    english_description: '',
    swahili_description: ''
  },
  type: {
    id: 0,
    slug: '',
    image: '',
    status: '',
    createdAt: '',
    updatedAt: '',
    english_name: '',
    swahili_name: '',
    english_description: '',
    swahili_description: ''
  },
  country: '',
  city: '',
  district: '',
  ward: '',
  street: '',
  latlong: '',
  phone: '',
  email: '',
  status: '',
  pricingCategory: '',
  createdAt: '',
  lastPaid: '',
  description: '',
  currency: 'TZS',
  salesCategory: {
    value: '',
    english: '',
    swahili: ''
  },
  deliveryAvailable: false,
  sellsOnline: false,
  alwaysOpen: false,
  openingHours: {
    mon: { open: '', close: '' },
    tue: { open: '', close: '' },
    wed: { open: '', close: '' },
    thu: { open: '', close: '' },
    fri: { open: '', close: '' },
    sat: { open: '', close: '' },
    sun: { open: '', close: '' },
  },
  isVerified: false,
  thumbnail: '',
  slug: '',
  referralCode: ''
};

const useSelectedBusinessStore = create<SelectedBusinessState>((set) => ({
  selected: defaultBusiness,

  setSelected: (selected) =>
    set({
      selected,
    }),

  clearBusiness: () =>
    set({
      selected: defaultBusiness,
    }),
}));

export default useSelectedBusinessStore;