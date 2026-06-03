'use client'

import React, { useMemo, useState } from 'react'
import styles from './choose_business.module.scss'
import useLanguageStore from '@/store/atoms/language'
import useFetch from '@/utils/fetch'
import {
  Building2,
  Check,
  ChevronRight,
  Loader2,
  Store,
  Sparkles,
  BriefcaseBusiness,
} from 'lucide-react'
import cx from 'classnames'

function ChooseBusiness() {
  const { language } = useLanguageStore()

  const [selectedBusiness, setSelectedBusiness] =
    useState<any>(
      typeof window !== 'undefined'
        ? localStorage.getItem(
            'business_id'
          )
        : null
    )

  const {
    data: businesses,
    loading: bizLoading,
  } = useFetch(
    `${process.env.NEXT_PUBLIC_HOST}/business/get_user_businesses`,
    {
      Authorization: `Bearer ${
        typeof window !== 'undefined'
          ? localStorage.getItem(
              'mauzo_token'
            )
          : ''
      }`,
    }
  )

  const content = useMemo(() => {
    return language === 'Swahili'
      ? {
          title:
            'Chagua Biashara',
          subtitle:
            'Chagua biashara unayotaka kuendelea nayo kwenye mfumo.',
          loading:
            'Inapakia biashara...',
          empty:
            'Hakuna biashara zilizopatikana.',
          selected:
            'Imechaguliwa',
          continue:
            'Endelea',
          total:
            'Jumla ya biashara',
        }
      : {
          title:
            'Choose Business',
          subtitle:
            'Select the business you want to continue with in the platform.',
          loading:
            'Loading businesses...',
          empty:
            'No businesses found.',
          selected:
            'Selected',
          continue:
            'Continue',
          total:
            'Total businesses',
        }
  }, [language])

  const selectBusiness = (
    item: any
  ) => {
    setSelectedBusiness(item.id)

    localStorage.setItem(
      'mauzo_selected_business',
      item.name
    )

    localStorage.setItem(
      'business_id',
      item.id
    )

    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  return (
    <div className={styles.chooseBusiness}>
      <div className={styles.backgroundGlow}></div>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={16} />
            <span>Bazenga</span>
          </div>

          <h1>{content.title}</h1>

          <p>{content.subtitle}</p>

          {!bizLoading &&
            businesses?.length >
              0 && (
              <div
                className={
                  styles.statsCard
                }
              >
                <BriefcaseBusiness
                  size={18}
                />

                <span>
                  {
                    content.total
                  }
                  :{' '}
                  <strong>
                    {
                      businesses.length
                    }
                  </strong>
                </span>
              </div>
            )}
        </div>

        <div
          className={styles.content}
        >
          {bizLoading ? (
            <div
              className={
                styles.loadingState
              }
            >
              <Loader2
                size={40}
                className={
                  styles.loader
                }
              />

              <p>
                {
                  content.loading
                }
              </p>
            </div>
          ) : businesses
              ?.length < 1 ? (
            <div
              className={
                styles.emptyState
              }
            >
              <div
                className={
                  styles.emptyIcon
                }
              >
                <Store size={36} />
              </div>

              <h3>
                {
                  content.empty
                }
              </h3>
            </div>
          ) : (
            <div
              className={
                styles.businessGrid
              }
            >
              {businesses.map(
                (
                  item: any,
                  index: number
                ) => (
                  <button
                    key={index}
                    onClick={() =>
                      selectBusiness(
                        item
                      )
                    }
                    className={cx(
                      styles.businessCard,
                      selectedBusiness ==
                        item.id &&
                        styles.activeCard
                    )}
                  >
                    <div
                      className={
                        styles.cardTop
                      }
                    >
                      <div
                        className={
                          styles.businessIcon
                        }
                      >
                        <Building2
                          size={
                            24
                          }
                        />
                      </div>

                      <div
                        className={
                          styles.radioWrapper
                        }
                      >
                        <div
                          className={cx(
                            styles.radio,
                            selectedBusiness ==
                              item.id &&
                              styles.radioActive
                          )}
                        >
                          {selectedBusiness ==
                            item.id && (
                            <Check
                              size={
                                12
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={
                        styles.cardContent
                      }
                    >
                      <h2>
                        {
                          item.name
                        }
                      </h2>

                      <p>
                        {language ===
                        'Swahili'
                          ? 'Biashara yako ipo tayari kuendelea.'
                          : 'Your business is ready to continue.'}
                      </p>
                    </div>

                    <div
                      className={
                        styles.cardFooter
                      }
                    >
                      <span>
                        {selectedBusiness ==
                        item.id
                          ? content.selected
                          : content.continue}
                      </span>

                      <ChevronRight
                        size={18}
                      />
                    </div>

                    <div
                      className={
                        styles.cardGlow
                      }
                    ></div>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChooseBusiness