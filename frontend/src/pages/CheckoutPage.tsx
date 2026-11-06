import React, { useState } from 'react';
import { CheckoutForm, CheckoutFormData } from '../components/CheckoutForm.js';
import { useCart } from '../context/CartContext.js';
import { apiFetch } from '../api/client.js';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderCreated: (orderToken: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBack,
  onOrderCreated,
}) => {
  const { items, fulfillmentDate } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        customer: {
          name: formData.name,
          whatsapp: formData.whatsapp,
          address: formData.address,
          notes: formData.notes,
        },
        fulfillment: {
          type: formData.fulfillmentType,
          date: fulfillmentDate,
        },
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        source: 'web',
      };

      const result = await apiFetch<{ orderToken: string }>('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onOrderCreated(result.orderToken);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 safe-bottom">
      <CheckoutForm
        onBack={onBack}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
