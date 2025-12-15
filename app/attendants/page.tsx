'use client';

import React, { useEffect, useState } from 'react';
import styles from './attendant.module.scss';
import cx from 'classnames';
import { MdOutlineDelete } from 'react-icons/md';
import { CiEdit } from 'react-icons/ci';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import useFetch from '@/utils/fetch';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import useSendRequest from '@/utils/useSendRequest';
import { AiOutlineLoading } from "react-icons/ai";

interface Attendant {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
  last_paid: string;
  status: string | null;
  business_id: number;
  createdAt: string;
  updatedAt: string;
}

export default function AttendantsPage() {
  const [name, setName] = useState('');
  const [formData, setFormData] = useState({ 
    page: 1, 
    pageSize: 10,
    name: "",
    phone: "",
    email: "",
    role: "",
    password: "",
    isAdd: false,
    isDelete: false,
    delete_id: 0
  });
  const { selected } = useSelectedBusinessStore();

  const { data, loading } = useFetch('http://62.169.30.105:5000/attendant/get_attendants', {
    page: formData.page,
    pageSize: formData.pageSize,
    name,
    business_id: selected?.id,
  });

  const handlePageChange = (namba: number) => {
    setFormData({ ...formData, page: namba });
  };

  const nambaComma = (number: number): string => {
    return number.toLocaleString('en-US');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = (id:number) => {
    setFormData({...formData,isDelete: true,delete_id: id})
  }

  const totalPages = data?.totalItems ? Math.ceil(data.totalItems / formData.pageSize) : 0;
  const {sendRequest, loading: createLoading} = useSendRequest({
    url: "http://62.169.30.105:5000/attendant/register_attendant",
    body: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        business_id: `${selected !== undefined && selected.id}`,
    },
    method: "POST"
  })
  const {sendRequest: deleteAttendant, loading: deleteLoading} = useSendRequest({
    url: "http://62.169.30.105:5000/attendant/deactivate_attendant",
    body: {
        id: formData.delete_id
    },
    method: "POST"
  })

  return (
    <div className={styles.attendants_page}>
      {
        formData.isAdd && (
            <div className={styles.overlay}>
                <div className={styles.content}>
                  <form>
                    <div className={styles.form_item}>
                      <label>Name</label>
                      <input 
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData,name: e.target.value})} 
                      placeholder='name'
                      />
                    </div>
                    <div className={styles.form_item}>
                      <label>Phone</label>
                      <input 
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({...formData,phone: e.target.value})} 
                      placeholder='phone'
                      />
                    </div>
                    <div className={styles.form_item}>
                      <label>Email</label>
                      <input 
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData,email: e.target.value})} 
                      placeholder='email'
                      />
                    </div>
                    <div className={styles.form_item}>
                      <label>Password</label>
                      <input 
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({...formData,password: e.target.value})} 
                      placeholder='password'
                      />
                    </div>
                    <div className={styles.form_item}>
                      <label>Role</label>
                      <select
                      value={formData.role}
                      onChange={e => setFormData({...formData,role: e.target.value})}
                      >
                        <option value="" disabled>--select--</option>
                        <option value="seller">Seller</option>
                        <option value="manager">Manager</option>
                        <option value="owner">Owner</option>
                      </select>
                    </div>
                </form>
                <div className={styles.actions}>
                  <div className={cx(styles.action,styles.close)} onClick={()=> setFormData({...formData,isAdd: false})}>Cancel</div>
                  <div className={cx(styles.action,createLoading && styles.loading)} onClick={sendRequest}>{createLoading? <div className={styles.loader}><AiOutlineLoading className={styles.icon} size={20}/></div>:"Submit" }</div>
                </div>
                </div>
            </div>
        )
      }
      {
        formData.isDelete && (
          <div className={styles.overlay}>
            <div className={styles.content}>
              <div className={styles.delete_content}>
                <div className={styles.title}>Are you sure?</div>
                <div className={styles.actions}>
                  <div className={styles.action} onClick={()=> setFormData({...formData,isDelete: false})}>Cancel</div>
                  <div className={cx(styles.action,deleteLoading && styles.loading,styles.delete)} onClick={deleteAttendant}>{deleteLoading? <div className={styles.loader}><AiOutlineLoading className={styles.icon} size={20}/></div>:"Delete" }</div>
                </div>
              </div>
            </div>
          </div>
        )
      }
      <div className={styles.header}>
        <div className={styles.title_container}>
          <h1>Attendant Management</h1>
          <p className={styles.subtitle}>Efficiently manage your team with elegance</p>
        </div>
        <div className={styles.right}>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Search attendants..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <svg
              className={styles.search_icon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <div className={styles.add_button} onClick={()=> setFormData({...formData,isAdd: true})}>Add Attendant</div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loading_state}>
            <div className={styles.spinner}></div>
            <p>Loading attendants...</p>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className={styles.empty_state}>
            <svg
              className={styles.empty_icon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
              <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"></path>
            </svg>
            <h3>No attendants found</h3>
            <p>Try adding some attendants or adjusting your search</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Last Paid</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((item: Attendant, index: number) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td className={styles.attendant_name}>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.phone}</td>
                    <td>{item.role}</td>
                    <td>{formatDate(item.last_paid)}</td>
                    <td>{item.status ?? <em className={styles.noDesc}>N/A</em>}</td>
                    <td className={styles.actions}>
                      <div className={styles.action} onClick={()=> handleDelete(item.id)}>
                        <MdOutlineDelete className={styles.icon} size={20} />
                      </div>
                      <div className={styles.action}>
                        <CiEdit className={styles.icon} size={20} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 0 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange(formData.page - 1)}
                  disabled={formData.page === 1}
                  className={styles.pagination_arrow}
                >
                  <FaChevronLeft />
                </button>
                {formData.page > 1 && (
                  <button onClick={() => handlePageChange(formData.page - 1)}>
                    {formData.page - 1}
                  </button>
                )}
                <button className={styles.active}>{formData.page}</button>
                {formData.page < totalPages && (
                  <button onClick={() => handlePageChange(formData.page + 1)}>
                    {formData.page + 1}
                  </button>
                )}
                <button
                  onClick={() => handlePageChange(formData.page + 1)}
                  disabled={formData.page === totalPages}
                  className={styles.pagination_arrow}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}