"use client";

import { useState } from "react";
import styles from "./style.module.scss";
import useLanguageStore from "@/store/atoms/language";
import useSelectedBusinessStore from "@/store/atoms/selected_business";
import useSendRequest from "@/utils/useSendRequest";

export const metadata = {
  title: "Subscription",
  description: "Browse all about subscription information",
};

type Plan = {
  id: string;
  name: string;
  months: number;
  basePrice: number; // per month
  discountPercent: number; // 0,5,10,20
  badge?: string;
  ctaLabel: string;
  highlight?: boolean;
};

const BASE_PRICE = 10000;

const plans: Plan[] = [
  { id: "1m", name: "Mwezi 1", months: 1, basePrice: BASE_PRICE, discountPercent: 0, ctaLabel: "Chagua Mwezi 1" },
  { id: "3m", name: "Miezi 3", months: 3, basePrice: BASE_PRICE, discountPercent: 5, badge: "Most Popular", ctaLabel: "Chagua Miezi 3", highlight: true },
  { id: "6m", name: "Miezi 6", months: 6, basePrice: BASE_PRICE, discountPercent: 10, ctaLabel: "Chagua Miezi 6" },
  { id: "12m", name: "Miezi 12", months: 12, basePrice: BASE_PRICE, discountPercent: 20, ctaLabel: "Chagua Mwaka 1" },
];

const paymentInstructions: Record<string, { title: string; steps: string[] }[]> = {
  "M-Pesa": [
    {
      title: "Pay using M-Pesa",
      steps: [
        "Dial *150*00#",
        "Select 'Pay Bill' option",
        "Enter business number Mauzo: 123456",
        "Enter account number (your name or phone number)",
        "Enter amount (based on plan selected)",
        "Enter your M-Pesa PIN and confirm",
      ],
    },
  ],
  "Airtel Money": [
    {
      title: "Pay using Airtel Money",
      steps: [
        "Dial *150*60#",
        "Select 'Payments'",
        "Select 'Business Payment'",
        "Enter Mauzo business number 123456",
        "Enter account number or phone",
        "Enter amount and confirm with PIN",
      ],
    },
  ],
  Mixx: [
    {
      title: "Pay using Mixx by Yas",
      steps: [
        "Open Mixx app on your phone",
        "Go to 'Pay Bill' section",
        "Enter Mauzo business number 123456",
        "Enter amount based on plan",
        "Confirm and note your transaction code",
      ],
    },
  ],
  Halopesa: [
    {
      title: "Pay using Halopesa",
      steps: [
        "Dial *123# to access Halopesa menu",
        "Select 'Payments' -> 'Business Payments'",
        "Enter Mauzo business number 123456",
        "Enter amount to pay",
        "Confirm payment with PIN",
      ],
    },
  ],
};

function getOriginalTotal(plan: Plan) {
  return plan.basePrice * plan.months;
}

function getDiscountedTotal(plan: Plan) {
  const original = getOriginalTotal(plan);
  return original - (original * plan.discountPercent) / 100;
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [activeMethod, setActiveMethod] = useState("M-Pesa");
  const { language } = useLanguageStore();
  const {selected} = useSelectedBusinessStore()
  const [fields, setFields] = useState({
    amount: 0,
    code: 0
  })
   const { sendRequest, loading: createLoading } = useSendRequest({
    url: `${process.env.NEXT_PUBLIC_HOST}/subcodes/confirm_payment`,
    method: "POST",
    body: {
      business_id: selected?.id,
      amount: fields.amount, 
      code:fields.code,
    },
  });

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
    if(plan.months==1){
        setFields({...fields,amount: plan.basePrice})
    }else{
        const price = ((plan.basePrice * plan.months)-(plan.basePrice * (plan.discountPercent/100)) * plan.months)
        setFields({...fields,amount: price})
    }
  };

  const handleConfirmPayment = () => {
    if (!selectedPlan) return;
    sendRequest()
  };

  const methods = Object.keys(paymentInstructions);

  return (
    <main className={styles.subscriptionPage}>
      <section className={styles.pricingSection}>
        <div className={styles.inner}>
          {/* EXPIRED NOTICE */}
          <div className={styles.expiredNotice}>
            <h2>Your Mauzo Subscription Has Ended</h2>
            <p>
              Your subscription has expired. Choose a plan below to continue managing your business. Longer plans come with discounts to save you more!
            </p>
            <button className={styles.paymentButton} onClick={() => setShowPaymentMethods(true)}>
              How to Pay
            </button>
          </div>

          {/* PLAN CARDS */}
          <div className={styles.cardsGrid}>
            {plans.map((plan) => {
              const original = getOriginalTotal(plan);
              const discounted = getDiscountedTotal(plan);
              const hasDiscount = plan.discountPercent > 0;

              return (
                <article key={plan.id} className={`${styles.card} ${plan.highlight ? styles.cardHighlight : ""}`}>
                  {plan.badge && <div className={styles.badge}>{plan.badge}</div>}
                  <div className={styles.cardHeader}>
                    <h3>{plan.name}</h3>
                    <p className={styles.description}>
                      {plan.months} {plan.months === 1 ? "mwezi" : "miezi"} • Punguzo {plan.discountPercent}%
                    </p>
                  </div>

                  <div className={styles.priceRow}>
                    {hasDiscount && <span className={styles.originalAmount}>TZS {original.toLocaleString()}</span>}
                    <span className={styles.amount}>TZS {discounted.toLocaleString()}</span>
                    <span className={styles.period}>/{plan.months} {plan.months === 1 ? "mwezi" : "miezi"}</span>
                  </div>

                  <div className={styles.planHighlight}>
                    <p>
                      Pay {plan.months} {plan.months === 1 ? "month" : "months"} upfront and {hasDiscount ? `save TZS ${(original - discounted).toLocaleString()}!` : "no discount for this plan."}
                    </p>
                  </div>

                  <button className={styles.ctaButton} type="button" onClick={() => handleSelectPlan(plan)}>
                    {plan.ctaLabel}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PAYMENT METHODS MODAL */}
      {showPaymentMethods && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Select Payment Method</h2>
            <div className={styles.methodTabs}>
              {methods.map((method) => (
                <button
                  key={method}
                  className={`${styles.methodTab} ${activeMethod === method ? styles.activeTab : ""}`}
                  onClick={() => setActiveMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>
            <div className={styles.methodSteps}>
              {paymentInstructions[activeMethod].map((item, idx) => (
                <div key={idx}>
                  <h3>{item.title}</h3>
                  <ol>
                    {item.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <button className={styles.closeButton} onClick={() => setShowPaymentMethods(false)}>Close</button>
          </div>
        </div>
      )}

      {/* PLAN PAYMENT MODAL */}
      {showPlanModal && selectedPlan && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Pay for {selectedPlan.name}</h2>

            <p>Duration: <strong>{selectedPlan.months} {selectedPlan.months === 1 ? "mwezi" : "miezi"}</strong></p>
            <p>Original Total: <span className={styles.originalAmount}>TZS {getOriginalTotal(selectedPlan).toLocaleString()}</span></p>
            <p>
              Discount: {selectedPlan.discountPercent}% {selectedPlan.discountPercent > 0 && `(TZS ${(getOriginalTotal(selectedPlan) - getDiscountedTotal(selectedPlan)).toLocaleString()})`}
            </p>
            <p>Total to Pay: <strong>TZS {getDiscountedTotal(selectedPlan).toLocaleString()}</strong></p>

            <label>
              Verification Code:
              <input 
              type="text" 
              value={fields.code} 
              onChange={(e) => setFields({...fields,code: Number(e.target.value)})} 
              placeholder="Enter verification code" 
              />
            </label>

            <button className={styles.confirmButton} onClick={handleConfirmPayment}>{createLoading?"loading..":"Submit Payment"}</button>
            <button className={styles.closeButton} onClick={() => setShowPlanModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}
