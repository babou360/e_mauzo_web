import React, { useState } from 'react'
import styles from './add.module.scss'
import { LuBriefcaseBusiness } from 'react-icons/lu'
import { FaLocationArrow, FaPersonPregnant } from 'react-icons/fa6'
import cx from 'classnames'
import Input from '../reusables/input/input'
import useErrorStore from '@/store/atoms/error'
import useSendRequest from '@/utils/useSendRequest'
import useIsAddBusinessStore from '@/store/atoms/isAddBusiness'

function AddBusiness() {
  const {isAddBusiness, addBusiness, closeBusiness} = useIsAddBusinessStore()
  const {setError} = useErrorStore()
  const [fields, setFields] = useState({
    name: "",
    category:"",
    country: "",
    city: "",
    district: "",
    ward: "",
    street: "",
    type: "",
    latlong: "",
    isBusiness: false,
    isLocation: false
  })
  const {sendRequest,loading} = useSendRequest({
    url: "http://62.169.30.105:5000/business/register",
    params: {},
    body: {
        name: fields.name,
        category: fields.category,
        type: fields.type,
        country: fields.country,
        city: fields.city,
        district: fields.district,
        ward: fields.ward,
        street: fields.street
    },
    method: "POST"
  })

  const handleNext = (e:React.FormEvent) => {
    e.preventDefault()
    if(fields.category.trim()===""){
        setError({type:"error",message:"Business Category cannot be empty"})
        setTimeout(()=> {
            setError({type:"",message:""})
        },2000)
    }else if(fields.name.trim()===""){
       setError({type:"error",message:"Business Name cannot be empty"}) 
       setTimeout(()=> {
            setError({type:"",message:""})
        },2000)
    }else if(fields.type.trim()===""){
       setError({type:"error",message:"Business Type cannot be empty"}) 
       setTimeout(()=> {
            setError({type:"",message:""})
        },2000)
    }else{
        setFields({...fields,isBusiness: true})
    }
  }

  const submit = (e:React.FormEvent) => {
    e.preventDefault()
    sendRequest()
  }
  return (
    <div className={styles.add_business}>
     <div className={styles.close} onClick={closeBusiness}>close</div>
      <div className={styles.business_top}>
        <div className={styles.top_item}>
            <div className={cx(styles.icon,(fields.isBusiness || (fields.name.trim()!=="" && fields.category.trim()!=="" && fields.type.trim()!=="")) && styles.active)}>
                <LuBriefcaseBusiness className={styles.icon__} size={25}/>
            </div>
            <p>Business Information</p>
        </div>
        <div className={styles.top_item}>
            <div className={cx(styles.icon,fields.isLocation && styles.active)}>
                <FaLocationArrow className={styles.icon__} size={25}/>
            </div>
            <p>Location Information</p>
        </div>
      </div>
      <div className={styles.business_body}>
        {
            !fields.isBusiness && (
                <form>
                    <div className={styles.input}>
                        <label>Business Name</label>
                        <input
                        placeholder='Name*'
                        value={fields.name}
                        onChange={e => setFields({...fields,name: e.target.value})}
                        type='text'
                        />
                    </div>
                    <div className={styles.input}>
                        <label>Business Category</label>
                        <select
                        value={fields.category}
                        onChange={e => setFields({...fields,category: e.target.value})}
                        >
                            <option value="" disabled selected>--select--</option>
                            <option value="duka">Duka la mangi</option>
                            <option value="mpesa">Duka la Mpesa</option>
                        </select>
                    </div>
                    <div className={styles.input}>
                        <label>Business Type</label>
                        <select
                        value={fields.type}
                        onChange={e => setFields({...fields,type: e.target.value})}
                        >
                            <option value="" disabled selected>--select--</option>
                            <option value="solepropriatorship">solepropriatorship</option>
                            <option value="partnership">Partnership</option>
                            <option value="company">Company</option>
                        </select>
                    </div>
                    <button onClick={handleNext}>Next</button>
                </form>
            )
        }
        {
            fields.isBusiness && (
                <form onSubmit={submit}>
                    <div className={styles.input}>
                        <label>Country</label>
                        <select
                        value={fields.country}
                        onChange={e => setFields({...fields,country: e.target.value})}
                        >
                            <option value="" disabled selected>--select--</option>
                            <option value="Tanzania">Tanzania</option>
                            <option value="Kenya">Kenya</option>
                        </select>
                    </div>
                    <div className={styles.input}>
                        <label>City</label>
                        <select
                        value={fields.city}
                        onChange={e => setFields({...fields,city: e.target.value})}
                        >
                            <option value="" disabled selected>--select--</option>
                            <option value="Arusha">Arusha</option>
                            <option value="Dar">Dar-es-salaam</option>
                        </select>
                    </div>
                    <div className={styles.input}>
                        <label>District(Optional)</label>
                        <input
                        placeholder='District*'
                        value={fields.district}
                        onChange={e => setFields({...fields,district: e.target.value})}
                        type='text'
                        />
                    </div>
                    <div className={styles.input}>
                        <label>Ward(Optional)</label>
                        <input
                        placeholder='Ward*'
                        value={fields.ward}
                        onChange={e => setFields({...fields,ward: e.target.value})}
                        type='text'
                        />
                    </div>
                    <div className={styles.input}>
                        <label>Street(Optional)</label>
                        <input
                        placeholder='Street*'
                        value={fields.street}
                        onChange={e => setFields({...fields,street: e.target.value})}
                        type='text'
                        />
                    </div>
                    <div className={styles.input}>
                        <label>Latlong(Optional)</label>
                        <input
                        placeholder='Latlong*'
                        value={fields.latlong}
                        onChange={e => setFields({...fields,latlong: e.target.value})}
                        type='text'
                        />
                    </div>
                    <button>Next</button>
                </form>
            )
        }
      </div>
    </div>
  )
}

export default AddBusiness
