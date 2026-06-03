'use client'
import useFetch from '@/utils/fetch';
import React, { useState } from 'react'
import styles from './login.module.scss'
import useSendRequest from '@/utils/useSendRequest';
import axios from 'axios';
import Input from '@/components/reusables/input/input';
import { SiNamecheap } from 'react-icons/si';
import { FaCriticalRole, FaLock, FaPhone } from 'react-icons/fa';
import { MdOutlineMailOutline } from 'react-icons/md';

function Login() {
 const [fields, setFields] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    password: "",
    language: "Swahili"
 })
 const { data, loading, error,sendRequest } = useSendRequest({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_HOST}/users/register`,
    body: {name:fields.name,phone:fields.phone,email:fields.email,role: fields.role,password:fields.password,language: fields.language},
    params: {}
 });

 const submit = (e:React.FormEvent) => {
    e.preventDefault()
    sendRequest()
 }
  return (
    <div className={styles.login}>
      <div className={styles.title}>
        <h1>Sign Up</h1>
        <p>Please Enter Your Credentials</p>
      </div>
      <form onSubmit={submit}>
        <Input
        icon={SiNamecheap}
        type="text"
        value={fields.name}
        onChange={e => setFields({...fields,name:e.target.value})}
        placeholder='name*'
        />
        <Input
        icon={FaPhone}
        type="text"
        value={fields.phone}
        onChange={e => setFields({...fields,phone:e.target.value})}
        placeholder='phone*'
        />
        <Input
        icon={MdOutlineMailOutline}
        type="text"
        value={fields.email}
        onChange={e => setFields({...fields,email:e.target.value})}
        placeholder='email*'
        />
        <Input
        icon={FaCriticalRole}
        type="text"
        value={fields.role}
        onChange={e => setFields({...fields,role:e.target.value})}
        placeholder='role*'
        />
        <Input
        icon={FaLock}
        type="password"
        value={fields.password}
        onChange={e => setFields({...fields,password:e.target.value})}
        placeholder='password*'
        />
        <button type='submit'>Submit</button>
      </form>
    </div>
  )
}

export default Login
