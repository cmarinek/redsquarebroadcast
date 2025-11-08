export const testUsers = {
  admin: {
    email: `admin-${Date.now()}@test.com`,
    password: 'TestPassword123!',
  },
  advertiser: {
    email: `advertiser-${Date.now()}@test.com`,
    password: 'TestPassword123!',
  },
  screenOwner: {
    email: `owner-${Date.now()}@test.com`,
    password: 'TestPassword123!',
  },
};

export const testScreen = {
  name: 'Test Digital Screen',
  location: 'Times Square, New York',
  pricePerSlot: 50,
};

export const testBooking = {
  duration: 30,
  contentTitle: 'Test Advertisement',
};

export const testPayment = {
  cardNumber: '4242424242424242',
  expiry: '12/25',
  cvc: '123',
  zip: '10001',
};
