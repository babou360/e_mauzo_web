'use client'

import React, { useEffect, useMemo, useState } from 'react'
import styles from './terms.module.scss'
import {
  ShieldCheck,
  FileText,
  Scale,
  Lock,
  Building2,
  ChevronRight,
  DollarSign,
} from 'lucide-react'

const termsContent = {
  English: {
    pageTitle: 'Terms & Conditions',
    pageDescription:
      'Please read these terms carefully before using Bazenga platform.',
    sections: {
      'Bazenga Terms & Conditions': [
        {
          title: '1. Acceptance of Terms',
          body:
            'By accessing or using the Bazenga application, you agree to be bound by these Terms and Conditions. If you do not agree, you must not use the application.',
        },
        {
          title: '2. Eligibility',
          body:
            'You must be at least 18 years old or have legal authority to operate a business to use Bazenga.',
        },
        {
          title: '3. Account Registration',
          body:
            'You are responsible for providing accurate information during registration and for maintaining the confidentiality of your login credentials.',
        },
        {
          title: '4. Account Security',
          body:
            'You are solely responsible for all activities conducted through your account. Bazenga is not liable for unauthorized access resulting from your negligence.',
        },
        {
          title: '5. Business Registration',
          body:
            'Users may register one or more businesses. You are fully responsible for the legality, ownership, pricing, and accuracy of business information entered.',
        },
        {
          title: '6. Employees and Roles',
          body:
            'Bazenga allows assignment of roles such as Admin, Manager, or Salesperson. You are responsible for managing permissions and employee actions.',
        },
        {
          title: '7. Use of the Application',
          body:
            'You agree to use Bazenga only for lawful purposes and in a manner that does not harm the platform or other users.',
        },
        {
          title: '8. Prohibited Activities',
          body:
            'You must not engage in fraud, illegal transactions, data manipulation, hacking attempts, or any misuse of the system.',
        },
        {
          title: '9. Payments and Subscriptions',
          body:
            'Some features may require payment. All fees are displayed before purchase and are non-refundable unless required by law.',
        },
        {
          title: '10. Data Ownership',
          body:
            'You retain ownership of your business data. Bazenga processes your data only to provide the service.',
        },
        {
          title: '11. Privacy',
          body:
            'Your use of Bazenga is also governed by our Privacy Policy, which explains how we collect and use personal data.',
        },
        {
          title: '12. Intellectual Property',
          body:
            'Bazenga, including its software, design, and branding, is protected by intellectual property laws and may not be copied or redistributed.',
        },
        {
          title: '13. Service Availability',
          body:
            'We do not guarantee uninterrupted service. Bazenga may be temporarily unavailable due to maintenance or technical issues.',
        },
        {
          title: '14. Termination',
          body:
            'We reserve the right to suspend or terminate your account if you violate these Terms.',
        },
        {
          title: '15. Limitation of Liability',
          body:
            "Bazenga is provided on an 'as-is' basis. We are not liable for indirect, incidental, or consequential damages.",
        },
        {
          title: '16. Indemnification',
          body:
            'You agree to indemnify Bazenga against any claims arising from misuse of the application or violation of these Terms.',
        },
        {
          title: '17. Changes to Terms',
          body:
            'We may update these Terms at any time. Continued use of Bazenga means you accept the updated Terms.',
        },
        {
          title: '18. Governing Law',
          body:
            'These Terms are governed by the laws of the United Republic of Tanzania.',
        },
        {
          title: '19. Contact Information',
          body:
            'For questions regarding these Terms, please contact Bazenga support.',
        },
      ],
      'Refund Policy': [
        {
          title: '1. General Refund Policy',
          body:
            'Bazenga offers subscription-based services. Unless otherwise stated, all subscription fees are non-refundable. However, we may consider refunds on a case-by-case basis for unused portions of a subscription term.',
        },
        {
          title: '2. 14-Day Money-Back Guarantee',
          body:
            'New subscribers may request a full refund within 14 days of their first payment if they are not satisfied with the service. This guarantee applies only to the initial subscription and not to renewals.',
        },
        {
          title: '3. Partial Refunds',
          body:
            'If you cancel your subscription mid-cycle, you will not receive a refund for the remaining days of the current billing period. Your access will continue until the end of the paid period.',
        },
        {
          title: '4. Service Downtime Refunds',
          body:
            'If Bazenga experiences a total service outage exceeding 48 consecutive hours due to our fault, you may be eligible for a pro-rated refund or service credit for the downtime period.',
        },
        {
          title: '5. Technical Issues',
          body:
            'If a critical feature is non-functional and we cannot resolve it within a reasonable timeframe (typically 7 business days), you may request a partial or full refund for the affected period.',
        },
        {
          title: '6. Duplicate Charges',
          body:
            'In the event of an accidental duplicate charge, we will refund the extra amount immediately upon verification. Please contact support within 30 days of the charge.',
        },
        {
          title: '7. Fraudulent or Unauthorized Charges',
          body:
            'If you believe a charge was made fraudulently or without your authorization, please notify us immediately. After verification, we will refund the full amount and secure your account.',
        },
        {
          title: '8. How to Request a Refund',
          body:
            'To request a refund, contact Bazenga support with your account email, transaction ID (if available), and a detailed reason for the request. Refund requests must be submitted within 60 days of the original charge.',
        },
        {
          title: '9. Processing Time',
          body:
            'Approved refunds will be processed within 7-14 business days to the original payment method. Depending on your bank, it may take additional time for the refund to appear in your account.',
        },
        {
          title: '10. Changes to Refund Policy',
          body:
            'Bazenga reserves the right to modify this Refund Policy at any time. Changes become effective immediately upon posting. Continued use of the service constitutes acceptance of the updated policy.',
        },
        {
          title: '11. Contact for Refund Questions',
          body:
            'For all refund-related inquiries, please email our support team. We aim to respond to all refund requests within 2 business days.',
        },
      ],
    },
  },

  Swahili: {
    pageTitle: 'Masharti na Vigezo',
    pageDescription:
      'Tafadhali soma masharti haya kwa umakini kabla ya kutumia mfumo wa Bazenga.',
    sections: {
      'Masharti na Vigezo vya Bazenga': [
        {
          title: '1. Kukubali Masharti',
          body:
            'Kwa kutumia au kufikia Bazenga, unakubali masharti na vigezo hivi. Kama hukubaliani, usitumie programu.',
        },
        {
          title: '2. Uhalali wa Mtumiaji',
          body:
            'Ni lazima uwe na umri wa miaka 18 au zaidi au uwe na mamlaka ya kisheria ya kuendesha biashara.',
        },
        {
          title: '3. Usajili wa Akaunti',
          body:
            'Unawajibika kutoa taarifa sahihi wakati wa usajili na kulinda taarifa zako za kuingia.',
        },
        {
          title: '4. Usalama wa Akaunti',
          body:
            'Shughuli zote zitakazofanywa kupitia akaunti yako ni jukumu lako. Bazenga haiwajibiki kwa matumizi yasiyoidhinishwa.',
        },
        {
          title: '5. Usajili wa Biashara',
          body:
            'Unaweza kusajili biashara moja au zaidi. Wewe unawajibika kwa uhalali, umiliki, bei, na usahihi wa taarifa.',
        },
        {
          title: '6. Wafanyakazi na Majukumu',
          body:
            'Bazenga inaruhusu kuweka majukumu kama Admin au Muuzaji. Wewe unawajibika kwa vitendo vya wafanyakazi wako.',
        },
        {
          title: '7. Matumizi ya Programu',
          body:
            'Unakubali kutumia Bazenga kwa madhumuni halali pekee bila kuharibu mfumo au watumiaji wengine.',
        },
        {
          title: '8. Matumizi Yasiyoruhusiwa',
          body:
            'Hairuhusiwi kufanya udanganyifu, uhalifu, kujaribu kudukua, au kutumia vibaya mfumo.',
        },
        {
          title: '9. Malipo na Usajili',
          body:
            'Baadhi ya huduma zinaweza kuhitaji malipo. Malipo hayarudishwi isipokuwa kama sheria inahitaji.',
        },
        {
          title: '10. Umiliki wa Taarifa',
          body:
            'Taarifa za biashara ni mali yako. Bazenga hutumia taarifa zako kutoa huduma tu.',
        },
        {
          title: '11. Faragha',
          body:
            'Matumizi yako ya Bazenga yanaongozwa pia na Sera ya Faragha.',
        },
        {
          title: '12. Haki Miliki',
          body:
            'Programu, nembo, na muundo wa Bazenga vinalindwa na sheria za haki miliki.',
        },
        {
          title: '13. Upatikanaji wa Huduma',
          body:
            'Hatuhakikishi upatikanaji wa huduma wakati wote kutokana na matengenezo au changamoto za kiufundi.',
        },
        {
          title: '14. Kusitisha Akaunti',
          body:
            'Tuna haki ya kusitisha au kufunga akaunti yako endapo utakiuka masharti haya.',
        },
        {
          title: '15. Kiwango cha Uwajibikaji',
          body:
            'Bazenga hutolewa kama ilivyo. Hatutawajibika kwa hasara zisizo za moja kwa moja.',
        },
        {
          title: '16. Fidia',
          body:
            'Unakubali kuilinda Bazenga dhidi ya madai yanayotokana na matumizi mabaya ya programu.',
        },
        {
          title: '17. Mabadiliko ya Masharti',
          body:
            'Masharti haya yanaweza kubadilishwa wakati wowote. Kuendelea kutumia Bazenga ni kukubali mabadiliko.',
        },
        {
          title: '18. Sheria Inayotumika',
          body:
            'Masharti haya yanasimamiwa na sheria za Jamhuri ya Muungano wa Tanzania.',
        },
        {
          title: '19. Mawasiliano',
          body:
            'Kwa maswali kuhusu masharti haya, wasiliana na timu ya Bazenga.',
        },
      ],
      'Sera ya Marejesho': [
        {
          title: '1. Sera Kuu ya Marejesho',
          body:
            'Bazenga inatoa huduma za usajili. Isipokuwa kama imeelezwa vinginevyo, ada zote za usajili hazirejeshwi. Hata hivyo, tunaweza kuzingatia marejesho kwa kila kesi kwa sehemu ambazo hazijatumika.',
        },
        {
          title: '2. Dhamana ya Marejesho ya Siku 14',
          body:
            'Wateja wapya wanaweza kuomba marejesho kamili ndani ya siku 14 tangu malipo yao ya kwanza kama hawaridhiki na huduma. Dhamana hii inatumika tu kwa usajili wa kwanza na si kwa usajili unaofuata.',
        },
        {
          title: '3. Marejesho ya Sehemu',
          body:
            'Ukighairi usajili wako katikati ya mzunguko, hutapata marejesho kwa siku zilizobaki za kipindi cha malipo cha sasa. Ufikiaji wako utaendelea hadi mwisho wa kipindi ulicholipa.',
        },
        {
          title: '4. Marejesho kwa Muda wa Huduma Ulikatika',
          body:
            'Ikiwa Bazenga itakuwa na usumbufu kamili wa huduma unaozidi saa 48 mfululizo kutokana na makosa yetu, unaweza kustahiki marejesho au mkopo wa huduma kwa kipindi hicho.',
        },
        {
          title: '5. Changamoto za Kiufundi',
          body:
            'Ikiwa kipengele muhimu hakifanyi kazi na hatuwezi kukitatua kwa muda unaokubalika (kawaida siku 7 za kazi), unaweza kuomba marejesho kamili au ya sehemu kwa kipindi kilichoathirika.',
        },
        {
          title: '6. Malipo Yanayorudiwa kwa Makosa',
          body:
            'Ikitokea malipo yanayorudiwa kwa makosa, tutarejesha kiasi cha ziada mara moja baada ya uthibitisho. Tafadhali wasiliana na msaada ndani ya siku 30 tangu malipo.',
        },
        {
          title: '7. Malipo ya Ulaghai au Bila Idhini',
          body:
            'Ikiwa unaamini malipo yalifanywa kwa ulaghai au bila idhini yako, tafadhali tujulishe mara moja. Baada ya uthibitisho, tutarejesha kiasi chote na kulinda akaunti yako.',
        },
        {
          title: '8. Jinsi ya Kuomba Marejesho',
          body:
            'Kuomba marejesho, wasiliana na msaada wa Bazenga kwa barua pepe yako ya akaunti, kitambulisho cha malipo (kikipatikana), na sababu ya kina ya ombi. Maombi ya marejesho lazima yawasilishwe ndani ya siku 60 tangu malipo ya awali.',
        },
        {
          title: '9. Muda wa Usindikaji',
          body:
            'Marejesho yaliyokubaliwa yatasindikwa ndani ya siku 7-14 za kazi kwa njia ya malipo ya awali. Kulingana na benki yako, inaweza kuchukua muda zaidi kwa marejesho kuonekana katika akaunti yako.',
        },
        {
          title: '10. Mabadiliko ya Sera ya Marejesho',
          body:
            'Bazenga inahaki ya kubadilisha Sera hii ya Marejesho wakati wowote. Mabadiliko yanaanza kutumika mara baada ya kuchapishwa. Kuendelea kutumia huduma kunamaanisha kukubali sera iliyobadilishwa.',
        },
        {
          title: '11. Mawasiliano kwa Maswali ya Marejesho',
          body:
            'Kwa maswali yote kuhusu marejesho, tafadhali wasiliana na timu yetu ya msaada. Tunajitahidi kujibu maombi yote ya marejesho ndani ya siku 2 za kazi.',
        },
      ],
    },
  },
}

function TermsAndConditionsPage() {
  const [language, setLanguage] =
    useState<'English' | 'Swahili'>('English')

  useEffect(() => {
    const storedLanguage =
      localStorage.getItem('mauzo_language')

    if (
      storedLanguage === 'English' ||
      storedLanguage === 'Swahili'
    ) {
      setLanguage(storedLanguage)
    }
  }, [])

  const content = useMemo(() => {
    return termsContent[language]
  }, [language])

  const topCards = [
    {
      icon: <ShieldCheck size={24} />,
      title:
        language === 'Swahili'
          ? 'Usalama'
          : 'Security',
      description:
        language === 'Swahili'
          ? 'Taarifa zako zinalindwa'
          : 'Your data is protected',
    },
    {
      icon: <Scale size={24} />,
      title:
        language === 'Swahili'
          ? 'Sheria'
          : 'Compliance',
      description:
        language === 'Swahili'
          ? 'Kwa mujibu wa sheria'
          : 'Legally compliant',
    },
    {
      icon: <Lock size={24} />,
      title:
        language === 'Swahili'
          ? 'Faragha'
          : 'Privacy',
      description:
        language === 'Swahili'
          ? 'Faragha yako ni muhimu'
          : 'Privacy comes first',
    },
    {
      icon: <DollarSign size={24} />,
      title:
        language === 'Swahili'
          ? 'Marejesho'
          : 'Refunds',
      description:
        language === 'Swahili'
          ? 'Sera ya marejesho ya fedha'
          : 'Money-back policy',
    },
  ]

  return (
    <div className={styles.termsPage}>
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>

        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <FileText size={18} />
            Bazenga Legal
          </div>

          <h1>{content.pageTitle}</h1>

          <p>{content.pageDescription}</p>

          <div className={styles.topCards}>
            {topCards.map((item, index) => (
              <div
                className={styles.topCard}
                key={index}
              >
                <div className={styles.topIcon}>
                  {item.icon}
                </div>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {Object.entries(content.sections).map(
          ([sectionTitle, items], index) => (
            <div
              className={styles.sectionCard}
              key={index}
            >
              <div className={styles.sectionHeader}>
                <div className={styles.sectionLine}></div>

                <h2>{sectionTitle}</h2>
              </div>

              <div className={styles.itemsContainer}>
                {items.map((item, itemIndex) => (
                  <div
                    className={styles.termItem}
                    key={itemIndex}
                  >
                    <div className={styles.termTitle}>
                      <ChevronRight size={18} />

                      <h3>{item.title}</h3>
                    </div>

                    <p>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default TermsAndConditionsPage