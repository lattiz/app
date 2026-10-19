import { mexicoCityMonthKey } from './admin-metrics.calendar';
import { groupRevenueByMonth } from './admin-metrics.revenue-series';

describe('groupRevenueByMonth', () => {
  it('puts 23:30 on the 31st in Mexico City into that month', () => {
    const lateJanuary = Date.parse('2026-02-01T05:30:00.000Z') / 1000;
    expect(mexicoCityMonthKey(new Date(lateJanuary * 1000))).toBe('2026-01');

    const february = Date.parse('2026-02-01T06:30:00.000Z') / 1000;
    const points = groupRevenueByMonth(
      [
        {
          type: 'charge',
          amount: 10_000,
          fee: 400,
          net: 9_600,
          currency: 'mxn',
          created: lateJanuary,
        },
        {
          type: 'payment',
          amount: 2_000,
          fee: 80,
          net: 1_920,
          currency: 'mxn',
          created: lateJanuary,
        },
        {
          type: 'refund',
          amount: -500,
          fee: 0,
          net: -500,
          currency: 'mxn',
          created: february,
        },
        {
          type: 'stripe_fee',
          amount: -10,
          fee: 0,
          net: -10,
          currency: 'mxn',
          created: lateJanuary,
        },
      ],
      ['2026-01', '2026-02'],
    );

    expect(points).toEqual([
      {
        month: '2026-01',
        currency: 'mxn',
        grossCents: 12_000,
        feeCents: 480,
        refundCents: 0,
        netCents: 11_520,
      },
      {
        month: '2026-02',
        currency: 'mxn',
        grossCents: 0,
        feeCents: 0,
        refundCents: -500,
        netCents: -500,
      },
    ]);
  });
});
