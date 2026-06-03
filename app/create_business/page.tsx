'use client';

import React, { useEffect, useState } from 'react';
import styles from './add_business.module.scss';

import {
  FaStore,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaImage,
  FaTimes,
  FaMapMarkerAlt,
  FaPhone,
  FaBuilding,
} from 'react-icons/fa';

import {
  MdContactPhone,
  MdCheckCircle,
  MdLocationOn,
} from 'react-icons/md';

import { motion, AnimatePresence } from 'framer-motion';

import useFetch from '@/utils/fetch';
import useSendRequest from '@/utils/useSendRequest';
import useSendMultipartRequest from '@/utils/useSendMultipartRequest';

interface LocationPosition {
  latitude: number;
  longitude: number;
}

interface BusinessFields {
  name: string;
  category: string;
  type: string;
  sales_category: string;
  description: string;
  country: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  latlong: string;
  phone: string;
  email: string;
  isTheSameContact: boolean;
  urls: File[];
}
const CountryList = {
  getCountries: () => [
    'Tanzania',
    'Kenya',
    'Uganda',
    'Rwanda',
    'Burundi',
  ],
};

const TanzaniaRegionList = {
  getRegions: () => [
    'Arusha',
    'Dar es Salaam',
    'Dodoma',
    'Geita',
    'Iringa',
    'Kagera',
    'Katavi',
    'Kigoma',
    'Kilimanjaro',
    'Lindi',
    'Manyara',
    'Mara',
    'Mbeya',
    'Morogoro',
    'Mtwara',
    'Mwanza',
    'Njombe',
    'Pwani',
    'Rukwa',
    'Ruvuma',
    'Shinyanga',
    'Simiyu',
    'Singida',
    'Tabora',
    'Tanga',
  ],
};

const SearchableDropdown: React.FC<{
  items: string[];
  hintText: string;
  value?: string;
  onChanged: (value: string) => void;
}> = ({ items, hintText, value, onChanged }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.dropdown}>
      <div
        className={styles.dropdownTrigger}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? styles.selected : styles.placeholder}>
          {value || hintText}
        </span>

        <svg className={styles.dropdownArrow} viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>

      {isOpen && (
        <>
          <div
            className={styles.dropdownOverlay}
            onClick={() => setIsOpen(false)}
          />

          <div className={styles.dropdownMenu}>
            <input
              type="text"
              className={styles.dropdownSearch}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className={styles.dropdownItems}>
              {filteredItems.map((item) => (
                <div
                  key={item}
                  className={styles.dropdownItem}
                  onClick={() => {
                    onChanged(item);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {item}
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className={styles.dropdownNoResults}>
                  No results found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const TextFormFieldOne: React.FC<{
  labelText: string;
  hintText: string;
  value: string;
  onChange: (value: string) => void;
  lines?: number;
  type?: string;
}> = ({
  labelText,
  hintText,
  value,
  onChange,
  lines = 1,
  type = 'text',
}) => {
  return (
    <div className={styles.formField}>
      <label className={styles.formLabel}>{labelText}</label>

      {lines > 1 ? (
        <textarea
          className={styles.formInput}
          rows={lines}
          placeholder={hintText}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={styles.formInput}
          type={type}
          placeholder={hintText}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

const AddBusinessComp = () => {
  const [step, setStep] = useState(1);

  const [showError, setShowError] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const [previewImage, setPreviewImage] = useState<string | null>(
    null
  );

  const [image, setImage] = useState<File | null>(null);

  const [isLargeScreen, setIsLargeScreen] = useState(true);

  const [fields, setFields] = useState<BusinessFields>({
    name: '',
    category: '',
    type: '',
    sales_category: '',
    description: '',
    country: '',
    city: '',
    district: '',
    ward: '',
    street: '',
    latlong: '',
    phone: '',
    email: '',
    isTheSameContact: false,
    urls: []
  });

  const {
    data: categories = [],
    loading: catLoading,
  } = useFetch(
    `${process.env.NEXT_PUBLIC_HOST}/business-categories/get_business_categories`
  );

  const {
    data: types = [],
    loading: typeLoading,
  } = useFetch(
    `${process.env.NEXT_PUBLIC_HOST}/business-types/get_business_types`
  );

  const salesCategories = [
    {
      value: 'retail',
      english: 'Retail',
      swahili: 'Rejareja',
    },
    {
      value: 'wholesale',
      english: 'Wholesale',
      swahili: 'Jumla',
    },
    {
      value: 'both',
      english: 'Both',
      swahili: 'Vyote',
    },
  ];

  const { data: user, loading: userLoading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/users/get_current_user`, {
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : ''}`
  });

  const { sendRequest: addBusiness, loading: addLoading } =
    useSendMultipartRequest({
      url: `${process.env.NEXT_PUBLIC_HOST}/business/register`,
      method: 'POST',
      body: {
        name: fields.name,
        category: !catLoading && categories.data.find((item:any) => item.slug===fields.category),
        type: !typeLoading && types.data.find((item:any) => item.slug===fields.type),
        sales_category: salesCategories.find((item) => item.value===fields.sales_category),
        description: fields.description,
        country: fields.country,
        city: fields.city,
        district: fields.district,
        ward: fields.ward,
        street: fields.street,
        latlong: fields.latlong,
        phone: fields.isTheSameContact?user?.user?.phone:fields.phone,
        email: fields.isTheSameContact?user?.user?.email:fields.email,
        images: fields.urls,
        language: 'Swahili',
      },
    });

  const t = (en: string, sw: string) => {
    if (typeof window === 'undefined') return en;

    const language = localStorage.getItem(
      'mauzo_language'
    );

    return language === 'Swahili' ? sw : en;
  };

  const updateField = (key: string, value: any) => {
    setFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 900);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () =>
      window.removeEventListener(
        'resize',
        handleResize
      );
  }, []);

  const validateStep = () => {
    if (step === 1) {
      if (!fields.name.trim()) {
        setErrorMessage(
          t(
            'Business name is required',
            'Jina la biashara linahitajika'
          )
        );

        return false;
      }

      if (!fields.category.trim()) {
        setErrorMessage(
          t(
            'Business category is required',
            'Kipengele cha biashara kinahitajika'
          )
        );

        return false;
      }

      if (!fields.type.trim()) {
        setErrorMessage(
          t(
            'Business type is required',
            'Aina ya biashara inahitajika'
          )
        );

        return false;
      }

      if (!fields.sales_category.trim()) {
        setErrorMessage(
          t(
            'Sales category is required',
            'Aina ya mauzo inahitajika'
          )
        );

        return false;
      }
    }

    if (step === 2) {
      if (!fields.country.trim()) {
        setErrorMessage(
          t('Country is required', 'Nchi inahitajika')
        );

        return false;
      }

      if (!fields.city.trim()) {
        setErrorMessage(
          t(
            'City/Region is required',
            'Mkoa/Mji unahitajika'
          )
        );

        return false;
      }
    }

    return true;
  };

  const next = () => {
    if (!validateStep()) {
      setShowError(true);

      setTimeout(() => {
        setShowError(false);
      }, 3000);

      return;
    }

    if (step < 3) {
      setStep((prev) => prev + 1);
    } else {
      addBusiness();
    }
  };

  const back = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      setImage(file);

      const imageUrl = URL.createObjectURL(file);

      setPreviewImage(imageUrl);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
  
      const files = Array.from(e.target.files);
      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewImage(previewUrls[0])
      setFields({...fields,urls: files})
  
      e.target.value = ""; // allow re-uploading same file
    };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField(
          'latlong',
          `${position.coords.latitude},${position.coords.longitude}`
        );
      }
    );
  };

  const stepVariants = {
    initial: {
      opacity: 0,
      x: 20,
    },

    animate: {
      opacity: 1,
      x: 0,
    },

    exit: {
      opacity: 0,
      x: -20,
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.gradientBackground} />

      <div className={styles.wrapper}>
        <div
          className={styles.card}
          style={{
            maxWidth: isLargeScreen ? 800 : '95%',
          }}
        >
          {/* HEADER */}

          <div className={styles.header}>
            <h1 className={styles.title}>
              {t(
                'Register Business',
                'Sajili Biashara'
              )}
            </h1>

            <p className={styles.subtitle}>
              {t(
                'Complete all 3 steps to register your business',
                'Kamilisha hatua zote 3 kusajili biashara yako'
              )}
            </p>

            <div className={styles.steps}>
              {[1, 2, 3].map((index) => (
                <React.Fragment key={index}>
                  <div className={styles.stepItem}>
                    <div
                      className={`${styles.stepCircle} ${
                        step >= index
                          ? styles.active
                          : ''
                      } ${
                        step === index
                          ? styles.current
                          : ''
                      }`}
                    >
                      {step > index ? (
                        <FaCheck />
                      ) : (
                        index
                      )}
                    </div>

                    <span
                      className={`${styles.stepLabel} ${
                        step === index
                          ? styles.currentLabel
                          : ''
                      }`}
                    >
                      {index === 1
                        ? t(
                            'Business',
                            'Biashara'
                          )
                        : index === 2
                        ? t(
                            'Location',
                            'Mahali'
                          )
                        : t(
                            'Contact',
                            'Mawasiliano'
                          )}
                    </span>
                  </div>

                  {index < 3 && (
                    <div
                      className={`${styles.stepLine} ${
                        step > index
                          ? styles.active
                          : ''
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          {/* ERROR */}

          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                }}
                className={styles.errorToast}
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* BODY */}

          <div className={styles.body}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  duration: 0.3,
                }}
              >
                {/* STEP 1 */}

                {step === 1 && (
                  <div className={styles.stepContent}>
                    <div className={styles.sectionHeader}>
                      <FaBuilding
                        className={styles.sectionIcon}
                      />

                      <div>
                        <h3>
                          {t(
                            'Business Information',
                            'Taarifa za Biashara'
                          )}
                        </h3>

                        <p>
                          {t(
                            'Tell us about your business identity',
                            'Tuambie kuhusu biashara yako'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <TextFormFieldOne
                        labelText={t(
                          'Business Name',
                          'Jina la Biashara'
                        )}
                        hintText={t(
                          'Enter business name',
                          'Ingiza jina la biashara'
                        )}
                        value={fields.name}
                        onChange={(value) =>
                          updateField(
                            'name',
                            value
                          )
                        }
                      />

                      {/* CATEGORY */}

                      <div className={styles.fieldWrapper}>
                        {catLoading ? (
                          <div
                            className={
                              styles.loadingPlaceholder
                            }
                          >
                            {t(
                              'Loading categories...',
                              'Inapakia vipengele...'
                            )}
                          </div>
                        ) : (
                          <SearchableDropdown
                            items={Array.isArray(
                              categories.data
                            )
                              ? categories.data.map(
                                  (item: any) =>
                                    t(
                                      item.english_name,
                                      item.swahili_name
                                    )
                                )
                              : []}
                            hintText={t(
                              'Business Category',
                              'Kipengele cha biashara'
                            )}
                            value={
                              fields.category
                                ? t(
                                    categories.data.find(
                                      (c: any) =>
                                        c.slug ===
                                        fields.category
                                    )
                                      ?.english_name ||
                                      '',
                                    categories.data.find(
                                      (c: any) =>
                                        c.slug ===
                                        fields.category
                                    )
                                      ?.swahili_name ||
                                      ''
                                  )
                                : ''
                            }
                            onChanged={(
                              value
                            ) => {
                              const selected =
                                categories.data.find(
                                  (item: any) =>
                                    t(
                                      item.english_name,
                                      item.swahili_name
                                    ) === value
                                );

                              if (selected) {
                                updateField(
                                  'category',
                                  selected.slug
                                );
                              }
                            }}
                          />
                        )}

                        <span
                          className={
                            styles.requiredStar
                          }
                        >
                          *
                        </span>
                      </div>

                      {/* TYPE */}

                      <div className={styles.fieldWrapper}>
                        {typeLoading ? (
                          <div
                            className={
                              styles.loadingPlaceholder
                            }
                          >
                            {t(
                              'Loading business types...',
                              'Inapakia aina za biashara...'
                            )}
                          </div>
                        ) : (
                          <SearchableDropdown
                            items={Array.isArray(
                              types.data
                            )
                              ? types.data.map(
                                  (item: any) =>
                                    t(
                                      item.english_name,
                                      item.swahili_name
                                    )
                                )
                              : []}
                            hintText={t(
                              'Business Type',
                              'Aina ya biashara'
                            )}
                            value={
                              fields.type
                                ? t(
                                    types.data.find(
                                      (c: any) =>
                                        c.slug ===
                                        fields.type
                                    )
                                      ?.english_name ||
                                      '',
                                    types.data.find(
                                      (c: any) =>
                                        c.slug ===
                                        fields.type
                                    )
                                      ?.swahili_name ||
                                      ''
                                  )
                                : ''
                            }
                            onChanged={(
                              value
                            ) => {
                              const selected =
                                types.data.find(
                                  (item: any) =>
                                    t(
                                      item.english_name,
                                      item.swahili_name
                                    ) === value
                                );

                              if (selected) {
                                updateField(
                                  'type',
                                  selected.slug
                                );
                              }
                            }}
                          />
                        )}

                        <span
                          className={
                            styles.requiredStar
                          }
                        >
                          *
                        </span>
                      </div>

                      {/* SALES CATEGORY */}

                      <SearchableDropdown
                        items={salesCategories.map(
                          (item) =>
                            t(
                              item.english,
                              item.swahili
                            )
                        )}
                        hintText={t(
                          'Sales Category',
                          'Aina ya Mauzo'
                        )}
                        value={
                          fields.sales_category
                            ? t(
                                salesCategories.find(
                                  (s) =>
                                    s.value ===
                                    fields.sales_category
                                )?.english || '',
                                salesCategories.find(
                                  (s) =>
                                    s.value ===
                                    fields.sales_category
                                )?.swahili || ''
                              )
                            : ''
                        }
                        onChanged={(value) => {
                          const selected =
                            salesCategories.find(
                              (item) =>
                                t(
                                  item.english,
                                  item.swahili
                                ) === value
                            );

                          if (selected) {
                            updateField(
                              'sales_category',
                              selected.value
                            );
                          }
                        }}
                      />

                      <TextFormFieldOne
                        labelText={t(
                          'Business Description',
                          'Maelezo ya biashara'
                        )}
                        hintText={t(
                          'Write business description',
                          'Andika maelezo ya biashara'
                        )}
                        value={fields.description}
                        onChange={(value) =>
                          updateField(
                            'description',
                            value
                          )
                        }
                        lines={3}
                      />

                      {/* IMAGE */}

                      <div
                        className={
                          styles.imageUploadSection
                        }
                      >
                        <label
                          className={
                            styles.formLabel
                          }
                        >
                          {t(
                            'Business Thumbnail',
                            'Picha ya Biashara'
                          )}
                        </label>

                        <div
                          className={
                            styles.imageUploadArea
                          }
                          onClick={() =>
                            document
                              .getElementById(
                                'imageInput'
                              )
                              ?.click()
                          }
                        >
                          <input
                            type="file"
                            id="imageInput"
                            accept="image/*"
                            hidden
                            onChange={
                              handleImageUpload
                            }
                          />

                          {previewImage ? (
                            <>
                              <img
                                src={previewImage}
                                alt="preview"
                                className={
                                  styles.uploadedImage
                                }
                              />

                              <button
                                type="button"
                                className={
                                  styles.removeImageBtn
                                }
                                onClick={(e) => {
                                  e.stopPropagation();

                                  removeImage();
                                }}
                              >
                                <FaTimes />
                              </button>
                            </>
                          ) : (
                            <div
                              className={
                                styles.uploadPlaceholder
                              }
                            >
                              <FaImage />

                              <p>
                                {t(
                                  'Add Business Thumbnail',
                                  'Ongeza picha ya biashara'
                                )}
                              </p>

                              <span>
                                {t(
                                  'Tap to upload',
                                  'Gusa kupakia'
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}

                {step === 2 && (
                  <div className={styles.stepContent}>
                    <div className={styles.sectionHeader}>
                      <FaMapMarkerAlt
                        className={styles.sectionIcon}
                      />

                      <div>
                        <h3>
                          {t(
                            'Business Location',
                            'Sehemu ya biashara'
                          )}
                        </h3>

                        <p>
                          {t(
                            'Where your business operates',
                            'Biashara yako ipo wapi'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <SearchableDropdown
                        items={CountryList.getCountries()}
                        hintText={t(
                          'Country',
                          'Nchi'
                        )}
                        value={fields.country}
                        onChanged={(value) =>
                          updateField(
                            'country',
                            value
                          )
                        }
                      />

                      {fields.country ===
                      'Tanzania' ? (
                        <SearchableDropdown
                          items={TanzaniaRegionList.getRegions()}
                          hintText={t(
                            'Region',
                            'Mkoa'
                          )}
                          value={fields.city}
                          onChanged={(value) =>
                            updateField(
                              'city',
                              value
                            )
                          }
                        />
                      ) : (
                        <TextFormFieldOne
                          labelText={t(
                            'City',
                            'Mji'
                          )}
                          hintText={t(
                            'Enter your city',
                            'Ingiza mji wako'
                          )}
                          value={fields.city}
                          onChange={(value) =>
                            updateField(
                              'city',
                              value
                            )
                          }
                        />
                      )}

                      <TextFormFieldOne
                        labelText={t(
                          'District',
                          'Wilaya'
                        )}
                        hintText={t(
                          'Enter district',
                          'Ingiza wilaya'
                        )}
                        value={fields.district}
                        onChange={(value) =>
                          updateField(
                            'district',
                            value
                          )
                        }
                      />

                      <TextFormFieldOne
                        labelText={t(
                          'Ward',
                          'Kata'
                        )}
                        hintText={t(
                          'Enter ward',
                          'Ingiza kata'
                        )}
                        value={fields.ward}
                        onChange={(value) =>
                          updateField(
                            'ward',
                            value
                          )
                        }
                      />

                      <TextFormFieldOne
                        labelText={t(
                          'Street',
                          'Mtaa'
                        )}
                        hintText={t(
                          'Enter street',
                          'Ingiza mtaa'
                        )}
                        value={fields.street}
                        onChange={(value) =>
                          updateField(
                            'street',
                            value
                          )
                        }
                      />

                      <div
                        className={
                          styles.gpsSection
                        }
                      >
                        <label
                          className={
                            styles.formLabel
                          }
                        >
                          {t(
                            'GPS Location',
                            'GPS ya biashara'
                          )}
                        </label>

                        <button
                          type="button"
                          className={
                            styles.locationPicker
                          }
                          onClick={
                            handleGetLocation
                          }
                        >
                          <MdLocationOn />

                          <span>
                            {fields.latlong ||
                              t(
                                'Tap to select location',
                                'Gusa kuchagua eneo'
                              )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}

                {step === 3 && (
                  <div className={styles.stepContent}>
                    <div className={styles.sectionHeader}>
                      <FaPhone
                        className={styles.sectionIcon}
                      />

                      <div>
                        <h3>
                          {t(
                            'Contact Details',
                            'Taarifa za Mawasiliano'
                          )}
                        </h3>

                        <p>
                          {t(
                            'How customers can reach you',
                            'Jinsi wateja watakavyokufikia'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <div
                        className={
                          styles.contactToggle
                        }
                      >
                        <div
                          className={
                            styles.toggleInfo
                          }
                        >
                          <div
                            className={
                              styles.toggleIcon
                            }
                          >
                            <MdContactPhone />
                          </div>

                          <div>
                            <p
                              className={
                                styles.toggleTitle
                              }
                            >
                              {t(
                                'Use account contact?',
                                'Tumia mawasiliano ya akaunti?'
                              )}
                            </p>

                            <p
                              className={
                                styles.toggleSubtitle
                              }
                            >
                              {t(
                                'Phone & email from profile',
                                'Simu na email kutoka kwenye akaunti'
                              )}
                            </p>
                          </div>
                        </div>

                        <label
                          className={styles.switch}
                        >
                          <input
                            type="checkbox"
                            checked={
                              fields.isTheSameContact
                            }
                            onChange={(e) =>
                              updateField(
                                'isTheSameContact',
                                e.target.checked
                              )
                            }
                          />

                          <span
                            className={
                              styles.slider
                            }
                          ></span>
                        </label>
                      </div>

                      {!fields.isTheSameContact && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: 'auto',
                          }}
                          className={
                            styles.contactFields
                          }
                        >
                          <TextFormFieldOne
                            labelText={t(
                              'Phone Number',
                              'Namba ya Simu'
                            )}
                            hintText={t(
                              'Enter phone number',
                              'Ingiza namba ya simu'
                            )}
                            value={fields.phone}
                            onChange={(value) =>
                              updateField(
                                'phone',
                                value
                              )
                            }
                            type="tel"
                          />

                          <TextFormFieldOne
                            labelText={t(
                              'Email Address',
                              'Barua Pepe'
                            )}
                            hintText={t(
                              'Enter email address',
                              'Ingiza barua pepe'
                            )}
                            value={fields.email}
                            onChange={(value) =>
                              updateField(
                                'email',
                                value
                              )
                            }
                            type="email"
                          />
                        </motion.div>
                      )}

                      {fields.isTheSameContact && (
                        <motion.div
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          className={
                            styles.infoCard
                          }
                        >
                          <MdCheckCircle />

                          <span>
                            {t(
                              'Using account contact details',
                              'Inatumia mawasiliano ya akaunti'
                            )}
                          </span>
                        </motion.div>
                      )}

                      <div
                        className={
                          styles.summaryCard
                        }
                      >
                        <div
                          className={
                            styles.summaryIcon
                          }
                        >
                          <FaStore />
                        </div>

                        <div>
                          <p
                            className={
                              styles.summaryTitle
                            }
                          >
                            {t(
                              'Almost done!',
                              'Karibu kumaliza!'
                            )}
                          </p>

                          <p
                            className={
                              styles.summaryText
                            }
                          >
                            {t(
                              'Review information before submitting.',
                              'Angalia taarifa kabla ya kusajili.'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ACTIONS */}

          <div className={styles.actions}>
            {step > 1 && (
              <button
                className={styles.backButton}
                onClick={back}
              >
                <FaArrowLeft />

                <span>{t('Back', 'Rudi')}</span>
              </button>
            )}

            <div className={styles.spacer} />

            <motion.button
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className={styles.nextButton}
              onClick={next}
              disabled={addLoading}
            >
              <span>
                {addLoading
                  ? t(
                      'Please wait...',
                      'Tafadhali subiri...'
                    )
                  : step === 3
                  ? t(
                      'Submit',
                      'Wasilisha'
                    )
                  : t(
                      'Continue',
                      'Endelea'
                    )}
              </span>

              {step === 3 ? (
                <FaCheck />
              ) : (
                <FaArrowRight />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBusinessComp;