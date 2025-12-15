"use client"
import React, { useState } from 'react'
import styles from './sign_in.module.scss'
import useSendRequest from '@/utils/useSendRequest'
import cx from 'classnames'

function SignIn() {
  const [fields, setFields] = useState({
    phone: "",
    password: ""
  })
  const { sendRequest, loading } = useSendRequest({
    url: "http://62.169.30.105:5000/users/login",
    params: {},
    body: { phone: fields.phone, password: fields.password },
    method: "POST"
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    sendRequest()
  }

  return (
    <div className={styles.sign_in}>
      <div className={styles.logo}>
        <div className={styles.round_logo}></div>
        <div className={styles.round_name}>E-Mauzo</div>
      </div>

      <div className={styles.title}>
        <h1>Welcome Aboard</h1>
        <p>Please enter your details</p>
      </div>

      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Phone Number"
          value={fields.phone}
          onChange={e => setFields({ ...fields, phone: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={fields.password}
          onChange={e => setFields({ ...fields, password: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className={cx(loading && styles.disabled)}
        >
          {loading ? "Loading..." : "Sign In"}
        </button>
      </form>
    </div>
  )
}

export default SignIn
