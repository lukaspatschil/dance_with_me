export const StripeMock = {
  paymentIntents: {
    create: jest.fn((params) => {
      if (params.payment_method === 'pm_card_visa') {
        return {
          status: 'succeeded',
        };
      } else if (params.payment_method === 'pm_card_mastercard') {
        return {
          status: 'requires_action',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          requires_action: {
            type: 'use_stripe_sdk',
          },
        };
      } else if (params.payment_method === 'declined_card') {
        throw {
          type: 'StripeCardError',
          code: 'card_declined',
          message: 'There are insufficient funds on your card.',
        } as any;
      } else {
        throw Error('Unexpected payment method');
      }
    }),
  },
};
