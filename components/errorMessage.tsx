'use client'
import useErrorStore from '@/store/atoms/error'
import errorState from '@/store/atoms/error'
import React, { useState } from 'react'
import styles from './error.module.scss'
import cx from 'classnames'

function ErrorMessage() {
 const { error, setError, clearError } = useErrorStore()
  return (
    <div className={cx(styles.errorMessage,error.message !=="" && styles.active, error.type ==="error" && styles.error)}>
      {
        error.message !=="" && <p>{error.message}</p>
      }
    </div>
  )
}

export default ErrorMessage
