'use client';

import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import cx from 'classnames';
import useFetch from '@/utils/fetch';
import useSendRequest from '@/utils/useSendRequest';
import useErrorStore from '@/store/atoms/error';
import useLanguageStore from '@/store/atoms/language';
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa6';
import { MdDelete } from 'react-icons/md';
import useSelectedBusinessStore from '@/store/atoms/selected_business';

interface Expense {
  id: number;
  name: string;
  amount: number;
  category: string;
  createdAt: string;
}

interface ExpenseGroup {
  id: number;
  name: string;
  description?: string;
}

interface Totals {
  total_expenses: number;
  count_expenses: number;
}

const durations = [
  { swahili: 'Siku', english: 'Day', id: 1, value: 'day' },
  { swahili: 'Wiki', english: 'Week', id: 2, value: 'week' },
  { swahili: 'Mwezi', english: 'Month', id: 3, value: 'month' },
  { swahili: 'Mwaka', english: 'Year', id: 4, value: 'year' },
  { swahili: 'Muda Wote', english: 'All', id: 5, value: 'all' },
  { swahili: 'Maalumu', english: 'Custom', id: 6, value: 'custom' },
];

const Expenses: React.FC = () => {
  const [selectedFields, setSelectedFields] = useState({
    id: 0
  })
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('day');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [pageExpenses, setPageExpenses] = useState(1);
  const [pageGroups, setPageGroups] = useState(1);
  const pageSize = 6;

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const { selected, setSelected } = useSelectedBusinessStore();

  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');

  const { setError } = useErrorStore();
  const { language } = useLanguageStore();

  const fetchParams = {
    duration: selectedDuration,
    start: selectedDuration === 'custom' ? customStart : undefined,
    end: selectedDuration === 'custom' ? customEnd : undefined,
    page: tabIndex === 0 ? pageExpenses : pageGroups,
    pageSize,
    business_id: Number(selected?.id),
    name: ''
  };

  const { data: expensesData, loading: expLoading, } = useFetch<{
    rows: Expense[];
    count: number;
  }>(`${process.env.NEXT_PUBLIC_HOST}/expenses/get_expenses`, fetchParams);

  const { data: groupsData, loading: groupLoading,  } = useFetch<{
    data: ExpenseGroup[];
  }>(`${process.env.NEXT_PUBLIC_HOST}/expenses/get_expense_groups`, { page: pageGroups, pageSize,business_id: selected.id });

  const { sendRequest: createExpense, loading: creatingExp } = useSendRequest({
    url: `${process.env.NEXT_PUBLIC_HOST}/expenses/create_expense`,
    method: 'POST',
    body: { name: expenseName, amount: expenseAmount, category: selectedCategory,business_id: selected.id },
  });

  const { sendRequest: createGroup, loading: creatingGroup } = useSendRequest({
    url: `${process.env.NEXT_PUBLIC_HOST}/expenses/create_expense_group`,
    method: 'POST',
    body: { name: groupName, description: groupDesc, business_id: selected.id },
  });
  const { sendRequest: deleteGroup, loading: deleteLoading } = useSendRequest({
    url: `${process.env.NEXT_PUBLIC_HOST}/expenses/delete_expense_group`,
    method: 'POST',
    body: { id:  selectedFields.id},
  });
  const { sendRequest: deleteExpense, loading: delexpeLoading } = useSendRequest({
    url: `${process.env.NEXT_PUBLIC_HOST}/expenses/delete_expense`,
    method: 'POST',
    body: { id:  selectedFields.id},
  });

  const handleDurationChange = (value: string) => {
    if (value === 'custom') {
      if (!customStart || !customEnd) return;
    }
    setSelectedDuration(value);
    setPageExpenses(1);
    setPageGroups(1);
  };

  const handleCreateExpense = async () => {
    if (!expenseName || !expenseAmount || !selectedCategory) {
      setError({ message: 'Tafadhali jaza taarifa zote', title: 'Hitilafu' });
      return;
    }
    await createExpense();
    // setShowAddExpense(false);
    // setExpenseName('');
    // setExpenseAmount('');
    // setSelectedCategory(null);
  };

  const handleCreateGroup = async () => {
    if (!groupName) {
      setError({ message: 'Jaza jina la kundi', title: 'Hitilafu' });
      return;
    }
    await createGroup();
    // setShowAddGroup(false);
    // setGroupName('');
    // setGroupDesc('');
  };

  const handleDeleteExpense = async (id: number) => {
    setSelectedFields({...selectedFields,id: id})
    await deleteExpense();
    //refetchExpenses();
    setPageExpenses(1);
  };

  const handleDeleteGroup = async (id: number) => {
    setSelectedFields({...selectedFields,id: id})
    await deleteGroup();
    setPageGroups(1);
  };

  useEffect(() => {
    setPageExpenses(1);
    setPageGroups(1);
  }, [selectedDuration, customStart, customEnd]);

  const totalExpPages = expensesData?.count ? Math.ceil(expensesData.count / pageSize) : 0;
  const totalGroupPages = groupsData?.data ? Math.ceil(groupsData.data.length / pageSize) : 0;

  const formatNumber = (num: number) => num.toLocaleString();

  useEffect(()=> {

  },[selected,expensesData,groupsData])

  return (
    <div className={styles.expenses}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title_container}>
          <h1>{language === 'Swahili' ? 'Matumizi' : 'Expenses'}</h1>
          <p className={styles.subtitle}>
            {language === 'Swahili' ? 'Dhibiti na fuatilia matumizi yako' : 'Track and manage your expenses'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={cx(styles.tab, tabIndex === 0 && styles.active)}
          onClick={() => setTabIndex(0)}
        >
          {language === 'Swahili' ? 'Matumizi' : 'Expenses'}
        </button>
        <button
          className={cx(styles.tab, tabIndex === 1 && styles.active)}
          onClick={() => setTabIndex(1)}
        >
          {language === 'Swahili' ? 'Makundi' : 'Groups'}
        </button>
      </div>

      {/* Duration Chips */}
      <div className={styles.durations}>
        {durations.map((d) => (
          <div
            key={d.id}
            className={cx(styles.duration_chip, selectedDuration === d.value && styles.active_duration)}
            onClick={() => {
              if (d.value === 'custom') {
                // Trigger date input click
                document.getElementById('custom-start')?.focus();
              } else {
                handleDurationChange(d.value);
              }
            }}
          >
            {language === 'Swahili' ? d.swahili : d.english}
          </div>
        ))}
      </div>

      {/* Custom Date Inputs */}
      {selectedDuration === 'custom' && (
        <div className={styles.custom_dates}>
          <input
            id="custom-start"
            type="date"
            value={customStart}
            onChange={(e) => {
              setCustomStart(e.target.value);
              if (customEnd) handleDurationChange('custom');
            }}
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => {
              setCustomEnd(e.target.value);
              if (customStart) handleDurationChange('custom');
            }}
          />
        </div>
      )}

      {/* Summary Cards */}
      <div className={styles.analytics}>
        <div className={styles.card}>
          <div className={styles.card_icon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3z" />
              <path d="M7 7h10v10H7z" />
            </svg>
          </div>
          <h2>{language === 'Swahili' ? 'Jumla Matumizi' : 'Total Expenses'}</h2>
          <p>{!expLoading ? formatNumber(expensesData.summary.total_amount) : '0'}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.card_icon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <h2>{language === 'Swahili' ? 'Idadi' : 'Count'}</h2>
          <p>{!expLoading ? formatNumber(expensesData.summary.total_count) : '0'}</p>
        </div>
      </div>

      {/* Content */}
      <div className={styles.tableWrapper}>
        {tabIndex === 0 ? (
          expLoading ? (
            <div className={styles.loading_state}>
              <div className={styles.spinner}></div>
              <p>{language === 'Swahili' ? 'Inapakia...' : 'Loading...'}</p>
            </div>
          ) : expensesData.data.length < 1 ? (
            <div className={styles.empty_state}>
              <h3>{language === 'Swahili' ? 'Hakuna Matumizi' : 'No Expenses'}</h3>
              <p>{language === 'Swahili' ? 'Ongeza matumizi ili uanze' : 'Add an expense to get started'}</p>
            </div>
          ) : (
            <>
              <div className={styles.list}>
                {expensesData.data.map((e: { id: React.Key | null | undefined; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; category: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; createdAt: string | number | Date; amount: number; }, i: any) => (
                  <div key={e.id} className={styles.list_item}>
                    <div className={styles.leading}>
                      <div className={styles.avatar}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                      </div>
                    </div>
                    <div className={styles.content}>
                      <p className={styles.title}>{e.name}</p>
                      <p className={styles.subtitle}>Kundi: {e.category}</p>
                      <p className={styles.date}>
                        {new Date(e.createdAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <div className={styles.trailing}>
                      <span className={styles.amount}>{formatNumber(e.amount)}</span>
                      <button
                        className={styles.delete_btn}
                        onClick={() => handleDeleteExpense(Number(e.id))}
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalExpPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => setPageExpenses(p => Math.max(1, p - 1))}
                    disabled={pageExpenses === 1}
                  >
                    <FaChevronLeft />
                  </button>
                  <span>{pageExpenses} / {totalExpPages}</span>
                  <button
                    onClick={() => setPageExpenses(p => Math.min(totalExpPages, p + 1))}
                    disabled={pageExpenses === totalExpPages}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          )
        ) : (
          groupLoading ? (
            <div className={styles.loading_state}>
              <div className={styles.spinner}></div>
            </div>
          ) : !groupsData?.length ? (
            <div className={styles.empty_state}>
              <h3>{language === 'Swahili' ? 'Hakuna Makundi' : 'No Groups'}</h3>
            </div>
          ) : (
            <>
              <div className={styles.list}>
                {groupsData.map((g: { id: React.Key | null | undefined; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; description: any; }) => (
                  <div key={g.id} className={styles.list_item}>
                    <div className={styles.leading}>
                      <div className={styles.avatar}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                    </div>
                    <div className={styles.content}>
                      <p className={styles.title}>{g.name}</p>
                      <p className={styles.subtitle}>{g.description || 'Hakuna maelezo'}</p>
                    </div>
                    <div className={styles.trailing}>
                      <button
                        className={styles.delete_btn}
                        onClick={() => handleDeleteGroup(Number(g.id))}
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalGroupPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => setPageGroups(p => Math.max(1, p - 1))}
                    disabled={pageGroups === 1}
                  >
                    <FaChevronLeft />
                  </button>
                  <span>{pageGroups} / {totalGroupPages}</span>
                  <button
                    onClick={() => setPageGroups(p => Math.min(totalGroupPages, p + 1))}
                    disabled={pageGroups === totalGroupPages}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* FAB */}
      <button
        className={styles.fab}
        onClick={() => tabIndex === 0 ? setShowAddExpense(true) : setShowAddGroup(true)}
      >
        <FaPlus />
      </button>

      {/* Add Expense Modal */}
      <div className={cx(styles.modal, showAddExpense && styles.active)}>
        <div className={styles.modal_content}>
          <div className={styles.modal_header}>
            <h2>{language === 'Swahili' ? 'Ongeza Matumizi' : 'Add Expense'}</h2>
            <button className={styles.close_button} onClick={() => setShowAddExpense(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className={styles.modal_form}>
            <label>
              {language === 'Swahili' ? 'Jina la Matumizi' : 'Expense Name'}
              <input
                type="text"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder={language === 'Swahili' ? 'Ingiza jina' : 'Enter name'}
              />
            </label>
            <label>
              {language === 'Swahili' ? 'Kiasi' : 'Amount'}
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="0.00"
              />
            </label>
            <label>
              {language === 'Swahili' ? 'Kundi la Gharama' : 'Expense Group'}
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="" disabled>{language === 'Swahili' ? 'Chagua kundi' : 'Select group'}</option>
                {groupsData?.map((g:any) => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </label>
            <div className={styles.modal_actions}>
              <button className={styles.cancel_btn} onClick={() => setShowAddExpense(false)}>
                {language === 'Swahili' ? 'Ghairi' : 'Cancel'}
              </button>
              <button
                className={styles.submit_button}
                onClick={handleCreateExpense}
                disabled={creatingExp}
              >
                {creatingExp ? <div className={styles.spinner}></div> : (language === 'Swahili' ? 'Hifadhi' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Group Modal */}
      <div className={cx(styles.modal, showAddGroup && styles.active)}>
        <div className={styles.modal_content}>
          <div className={styles.modal_header}>
            <h2>{language === 'Swahili' ? 'Ongeza Kundi' : 'Add Group'}</h2>
            <button className={styles.close_button} onClick={() => setShowAddGroup(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className={styles.modal_form}>
            <label>
              {language === 'Swahili' ? 'Jina la Kundi' : 'Group Name'}
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={language === 'Swahili' ? 'Ingiza jina' : 'Enter name'}
              />
            </label>
            <label>
              {language === 'Swahili' ? 'Maelezo' : 'Description'} ({language === 'Swahili' ? 'Hiari' : 'Optional'})
              <input
                type="text"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                placeholder={language === 'Swahili' ? 'Maelezo ya ziada' : 'Additional details'}
              />
            </label>
            <div className={styles.modal_actions}>
              <button className={styles.cancel_btn} onClick={() => setShowAddGroup(false)}>
                {language === 'Swahili' ? 'Ghairi' : 'Cancel'}
              </button>
              <button
                className={styles.submit_button}
                onClick={handleCreateGroup}
                disabled={creatingGroup}
              >
                {creatingGroup ? <div className={styles.spinner}></div> : (language === 'Swahili' ? 'Hifadhi' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;