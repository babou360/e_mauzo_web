'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ChangeEvent,
} from 'react';
import { format } from 'date-fns';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Send,
  Users,
  Loader2,
  Check,
} from 'lucide-react';
import styles from './styles.module.scss';
import useFetch from '@/utils/fetch';
import useSelectedBusinessStore from '@/store/atoms/selected_business';

export const metadata = {
  title: "Clients",
  description: "Browse all available clients information.",
};

interface Client {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
}

interface ApiResponse {
  data: Client[];
  all: Client[];
  totalPages: number;
  currentPage: number;
}

const fetchClients = async (
  page: number,
  search: string
): Promise<ApiResponse> => {
  await new Promise((r) => setTimeout(r, 600));

  const allClients: Client[] = Array.from({ length: 52 }, (_, i) => ({
    id: i + 1,
    name: ['Amina Mohamed', 'Juma Ali', 'Fatma Hassan', 'Omary Said', 'Zainab Juma'][
      i % 5
    ] + ` ${i + 1}`,
    phone: `+255${Math.floor(700000000 + Math.random() * 99999999)}`,
    createdAt: new Date(
      Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));

  const filtered = allClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);
  const data = filtered.slice((page - 1) * perPage, page * perPage);

  return { data, all: allClients, totalPages, currentPage: page };
};

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState('');
  const { selected: business } = useSelectedBusinessStore();

  const t = useCallback((en: string, sw: string) => sw, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchClients(page, search);
      setClients(res.data);
      setAllClients(res.all);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectAll) {
      setSelected(new Set(allClients.map((c) => c.id)));
    } else {
      setSelected(new Set());
    }
  }, [selectAll, allClients]);

  const toggle = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
    setSelectAll(next.size === allClients.length && allClients.length > 0);
  };

  const phones = useMemo(
    () => allClients.filter((c) => selected.has(c.id)).map((c) => c.phone),
    [selected, allClients]
  );

  const openSMS = () => {
    if (!phones.length) return;
    const body = encodeURIComponent(message.trim() || 'Habari!');
    window.open(`sms:${phones.join(',')}?body=${body}`, '_blank');
    setShowDialog(false);
    setMessage('');
  };

   const { data: clientsData, loading: clientsLoading } = useFetch<{
    data: Client[];
    totalItems: number;
  }>(`${process.env.NEXT_PUBLIC_HOST}/buyers/get_buyers`, {page,pageSize:10,business_id: business?.id,search});

  return (
    <div className={styles.clients}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.title_container}>
          <h1>{t('Clients', 'Wateja')}</h1>
          <p className={styles.subtitle}>
            {t('Manage and message your clients with ease', 'Dhibiti na tuma ujumbe kwa wateja wako kwa urahisi')}
          </p>
        </div>
        <div className={styles.right}>
          <div className={styles.search}>
            <input
              type="text"
              placeholder={t('Search by name or phone...', 'Tafuta jina au namba...')}
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Search className={styles.search_icon} size={20} />
          </div>

          {/* SMS Button in Header */}
          {selected.size > 0 && (
            <button
              onClick={() => setShowDialog(true)}
              className={styles.sms_btn}
            >
              <Send size={20} />
              <span>{t('Send SMS', 'Tuma Ujumbe')} ({selected.size})</span>
              <span className={styles.pulse}></span>
            </button>
          )}
        </div>
      </header>

      {/* Stats + Select All */}
      <div className={styles.toolbar}>
        <div className={styles.stats}>
          <div className={styles.card}>
            <div className={styles.card_icon}>
              {clientsLoading ? (
                <Loader2 className={styles.spin} size={24} />
              ) : (
                <Users size={24} />
              )}
            </div>
            <h2>{t('Total Clients', 'Jumla ya Wateja')}</h2>
            <p>{clientsLoading ? '—' : clientsData.all.length}</p>
          </div>
        </div>

        {!clientsLoading && clientsData.data.length > 0 && (
          <label className={styles.selectAll}>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => setSelectAll(e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkmark}>
              {selectAll && <Check size={14} />}
            </span>
            <span className={styles.selectAllText}>
              {t('Select All', 'Chagua Wote')} ({selected.size})
            </span>
          </label>
        )}
      </div>

      {/* Client List */}
      <div className={styles.tableWrapper}>
        {clientsLoading ? (
          <div className={styles.loading_state}>
            <div className={styles.spinner}></div>
            <p>{t('Loading clients...', 'Inapakia wateja...')}</p>
          </div>
        ) : clientsData.data.length === 0 ? (
          <div className={styles.empty_state}>
            <div className={styles.empty_icon}>
              <Search size={48} />
            </div>
            <h3>{t('No Clients Found', 'Hakuna Wateja')}</h3>
            <p>{t('Try adjusting your search', 'Jaribu kurekebisha utafutaji wako')}</p>
          </div>
        ) : (
          <>
            <div className={styles.table}>
              {clientsData.data.map((c: Client, i:number) => {
                const date = format(new Date(c.createdAt), 'dd MMM yyyy');
                const isSelected = selected.has(c.id);

                return (
                  <div
                    key={c.id}
                    className={`${styles.row} ${isSelected ? styles.selected : ''}`}
                    onClick={() => toggle(c.id)}
                  >
                    <div className={styles.cell}>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                        />
                        <span className={styles.checkmark}>
                          {isSelected && <Check size={16} />}
                        </span>
                      </div>
                    </div>
                    <div className={styles.cell}>{i + 1 + (page - 1) * 10}</div>
                    <div className={styles.cell}>
                      <strong>{c.name}</strong>
                    </div>
                    <div className={styles.cell}>{c.phone}</div>
                    <div className={styles.cell}>{date}</div>
                  </div>
                );
              })}
            </div>

            {!clientsLoading && clientsData.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft />
                </button>
                <span>
                  {t('Page', 'Ukurasa')} {page} {t('of', 'ya')} {clientsData.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(clientsData.totalPages, p + 1))}
                  disabled={page >= clientsData.totalPages}
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* SMS Modal */}
      {showDialog && (
        <div className={styles.modal} onClick={() => setShowDialog(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2>{t('Send Message', 'Tuma Ujumbe')}</h2>
              <button
                className={styles.close_button}
                onClick={() => setShowDialog(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className={styles.modal_body}>
              <p className={styles.modal_subtitle}>
                {t('To', 'Kwa')} {selected.size} {t('selected clients', 'wateja waliochaguliwa')}
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('Write your message here...', 'Andika ujumbe wako hapa...')}
                rows={5}
              />
              <div className={styles.modal_actions}>
                <button
                  className={styles.cancel_btn}
                  onClick={() => setShowDialog(false)}
                >
                  {t('Cancel', 'Ghairi')}
                </button>
                <button onClick={openSMS} className={styles.submit_button}>
                  {t('Send', 'Tuma')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;