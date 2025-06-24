-- Insert test business settings
INSERT INTO host_business_settings (
  host_profile_id,
  business_email,
  business_phone,
  website_url,
  operating_license,
  insurance_policy_number,
  notification_preferences,
  subscription_tier,
  onboarding_completed,
  marketplace_enabled
) 
SELECT 
  hp.id,
  'business@' || lower(replace(hp.name, ' ', '')) || '.com',
  '+33 1 23 45 67 89',
  'https://' || lower(replace(hp.name, ' ', '')) || '.com',
  'LICENSE-' || substr(hp.id::text, 1, 8),
  'INS-' || substr(hp.id::text, 1, 8),
  '{"emailBookings": true, "smsReminders": true, "weatherAlerts": true, "marketingEmails": false}',
  'free',
  true,
  true
FROM host_profiles hp
WHERE NOT EXISTS (
  SELECT 1 FROM host_business_settings hbs WHERE hbs.host_profile_id = hp.id
);

-- Insert test earnings data for existing bookings
INSERT INTO host_earnings (
  host_profile_id,
  booking_id,
  gross_amount,
  platform_fee,
  payment_processing_fee,
  net_amount,
  currency,
  payout_status,
  fee_percentage
)
SELECT 
  b.host_id,
  b.id,
  b.total_price,
  ROUND(b.total_price * 0.15, 2), -- 15% platform fee
  ROUND(b.total_price * 0.029 + 0.30, 2), -- 2.9% + €0.30 processing fee
  ROUND(b.total_price * 0.821 - 0.30, 2), -- Net amount after fees
  'EUR',
  CASE 
    WHEN b.booking_status = 'completed' THEN 'completed'
    WHEN b.booking_status = 'confirmed' THEN 'pending'
    ELSE 'pending'
  END,
  15.0
FROM bookings b
WHERE NOT EXISTS (
  SELECT 1 FROM host_earnings he WHERE he.booking_id = b.id
)
AND b.total_price > 0;

-- Insert test availability data for the next 30 days
INSERT INTO host_availability (
  host_profile_id,
  date,
  start_time,
  end_time,
  available_capacity,
  weather_dependent
)
SELECT 
  hp.id,
  CURRENT_DATE + (generate_series(1, 30) || ' days')::interval,
  '09:00'::time,
  '17:00'::time,
  CASE WHEN random() > 0.7 THEN 2 ELSE 1 END, -- Some days have higher capacity
  true
FROM host_profiles hp
WHERE NOT EXISTS (
  SELECT 1 FROM host_availability ha 
  WHERE ha.host_profile_id = hp.id 
  AND ha.date >= CURRENT_DATE
);

-- Insert test analytics data for the last 30 days
INSERT INTO host_analytics (
  host_profile_id,
  date,
  total_bookings,
  total_revenue,
  total_guests,
  average_rating,
  cancellation_rate,
  repeat_customer_rate,
  marketplace_bookings,
  direct_bookings
)
SELECT 
  hp.id,
  date_series.date,
  FLOOR(random() * 5)::int, -- 0-4 bookings per day
  ROUND((random() * 500 + 100)::numeric, 2), -- €100-600 revenue
  FLOOR(random() * 12 + 1)::int, -- 1-12 guests
  ROUND((random() * 1.5 + 3.5)::numeric, 2), -- 3.5-5.0 rating
  ROUND((random() * 10)::numeric, 2), -- 0-10% cancellation rate
  ROUND((random() * 40 + 20)::numeric, 2), -- 20-60% repeat rate
  FLOOR(random() * 3)::int, -- Marketplace bookings
  FLOOR(random() * 2)::int -- Direct bookings
FROM host_profiles hp
CROSS JOIN (
  SELECT CURRENT_DATE - (generate_series(1, 30) || ' days')::interval AS date
) date_series
WHERE NOT EXISTS (
  SELECT 1 FROM host_analytics ha 
  WHERE ha.host_profile_id = hp.id 
  AND ha.date = date_series.date
);

-- Update existing experiences with better ratings if needed
UPDATE experiences 
SET rating = CASE 
  WHEN rating = 0 OR rating IS NULL THEN ROUND((random() * 1.5 + 3.5)::numeric, 1)
  ELSE rating
END
WHERE host_id IN (SELECT id FROM host_profiles);
