'use client'
import React, { useState, useEffect } from 'react';
import styles from './style.module.scss';
import useSendRequest from '@/utils/useSendRequest';
import useFetch from '@/utils/fetch';
import cx from 'classnames'
import { MdOutlineDelete } from 'react-icons/md';
import { CiEdit } from 'react-icons/ci';

interface MeasurementCategory {
  id: number;
  name: {
    swahili: string;
    English: string;
  };
  examples: string[];
  createdAt: string;
  updatedAt: string;
}

export default function MeasurementCategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    nameSwahili: "",
    nameEnglish: "",
    examples: ""
  });

  const { sendRequest } = useSendRequest({
    url: `${process.env.NEXT_PUBLIC_HOST}/ms-cats/create_ms_cat`,
    method: "POST",
    body: {
      name: {
        swahili: formData.nameSwahili,
        English: formData.nameEnglish
      },
      examples: formData.examples.split(',').map(item => item.trim())
    }
  });

  const { data, loading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/ms-cats/get_ms_cats`, { page });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendRequest();
    setShowModal(false);
    // Reset form
    setFormData({
      nameSwahili: "",
      nameEnglish: "",
      examples: ""
    });
    // In a real app, you might want to refetch the data here
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className={styles.categories_page}>
      <div className={styles.header}>
        <h1>Measurement Categories</h1>
        <div className={styles.header_stats}>
          <span>Total Categories: {!loading && data?.totalItems}</span>
          <button className={styles.add_btn} onClick={() => setShowModal(true)}>
            + Add Category
          </button>
        </div>
      </div>

      <div className={styles.search_section}>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.search_input}
        />
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name (Swahili)</th>
                  <th>Name (English)</th>
                  <th>Examples</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((category:any, index:number) => (
                  <tr key={category.id}>
                    <td>{index + 1}</td>
                    <td>{category.name.swahili}</td>
                    <td>{category.name.English}</td>
                    <td>
                      <div className={styles.examples}>
                        {category.examples.map((example:any, i:number) => (
                          <span key={i} className={styles.example_tag}>
                            {example}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                    <td className={styles.actions}>
                      <button className={styles.action_btn}>
                        <CiEdit className={styles.icon} size={20} />
                      </button>
                      <button className={styles.action_btn}>
                        <MdOutlineDelete className={styles.icon} size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.pagination}>
              {!loading && Array.from({ length: data?.totalPages || 1 }).map((_, index) => (
                <button 
                  key={index + 1} 
                  onClick={() => handlePageChange(index + 1)} 
                  className={cx(index + 1 === page && styles.active)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modal_content}>
            <h2>Add New Measurement Category</h2>
            <form onSubmit={handleSubmit} className={styles.modal_form}>
              <div className={styles.input_group}>
                <label>
                  Name (Swahili)
                  <input
                    type="text"
                    name="nameSwahili"
                    value={formData.nameSwahili}
                    onChange={handleInputChange}
                    placeholder="e.g. Vimiminika"
                    required
                  />
                </label>
                <label>
                  Name (English)
                  <input
                    type="text"
                    name="nameEnglish"
                    value={formData.nameEnglish}
                    onChange={handleInputChange}
                    placeholder="e.g. Liquids"
                    required
                  />
                </label>
              </div>
              <label>
                Examples (comma separated)
                <input
                  type="text"
                  name="examples"
                  value={formData.examples}
                  onChange={handleInputChange}
                  placeholder="e.g. maji, mafuta, soda"
                  required
                />
              </label>
              <div className={styles.modal_actions}>
                <button type="button" className={styles.cancel_btn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.save_btn}>
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}