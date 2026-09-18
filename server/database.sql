-- =========================================================
-- FARMVERSE DATABASE
-- =========================================================

-- Optional: reset tables during development
-- DROP TABLE IF EXISTS predictions CASCADE;
-- DROP TABLE IF EXISTS produce_listings CASCADE;
-- DROP TABLE IF EXISTS crops CASCADE;
-- DROP TABLE IF EXISTS farms CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'user')),

  farm_name VARCHAR(150),
  location VARCHAR(255),
  farm_size VARCHAR(100),
  farming_type VARCHAR(100),
  address TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- FARMS
-- =========================================================

CREATE TABLE IF NOT EXISTS farms (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  farm_name VARCHAR(150) NOT NULL,
  location VARCHAR(255) NOT NULL,
  land_size DECIMAL(12, 2) NOT NULL,
  land_unit VARCHAR(30) DEFAULT 'acres',

  soil_type VARCHAR(100),
  irrigation_type VARCHAR(100),
  farming_type VARCHAR(100),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- CROPS
-- =========================================================

CREATE TABLE IF NOT EXISTS crops (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,

  crop_name VARCHAR(120) NOT NULL,
  variety VARCHAR(120),
  season VARCHAR(80),

  planting_date DATE,
  expected_harvest_date DATE,
  field_area DECIMAL(12, 2),

  soil_ph DECIMAL(5, 2),
  nitrogen DECIMAL(12, 2),
  phosphorus DECIMAL(12, 2),
  potassium DECIMAL(12, 2),

  growth_stage VARCHAR(80) DEFAULT 'Seedling',
  crop_status VARCHAR(80) DEFAULT 'Planted',

  estimated_yield DECIMAL(12, 2) DEFAULT 0,
  actual_yield DECIMAL(12, 2) DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- PRODUCE LISTINGS
-- =========================================================

CREATE TABLE IF NOT EXISTS produce_listings (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_id INTEGER REFERENCES crops(id) ON DELETE SET NULL,

  crop_name VARCHAR(120) NOT NULL,
  quantity DECIMAL(12, 2) NOT NULL,
  unit VARCHAR(30) DEFAULT 'kg',
  price DECIMAL(12, 2) NOT NULL,

  listing_status VARCHAR(30) DEFAULT 'Active',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- PREDICTION HISTORY
-- =========================================================

CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  prediction_type VARCHAR(120) NOT NULL,
  result VARCHAR(255) NOT NULL,

  input_data JSONB,
  recommendations JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- INDEXES FOR BETTER QUERY PERFORMANCE
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_farms_farmer_id
ON farms(farmer_id);

CREATE INDEX IF NOT EXISTS idx_crops_farmer_id
ON crops(farmer_id);

CREATE INDEX IF NOT EXISTS idx_crops_farm_id
ON crops(farm_id);

CREATE INDEX IF NOT EXISTS idx_listings_farmer_id
ON produce_listings(farmer_id);

CREATE INDEX IF NOT EXISTS idx_predictions_farmer_id
ON predictions(farmer_id);



-- =====================================================
-- CHATBOT MESSAGE HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS chatbot_messages (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  farm_id INTEGER
    REFERENCES farms(id)
    ON DELETE SET NULL,

  crop_id INTEGER
    REFERENCES crops(id)
    ON DELETE SET NULL,

  sender VARCHAR(20) NOT NULL
    CHECK (sender IN ('user', 'assistant')),

  message TEXT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chatbot_messages_user_id
ON chatbot_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_messages_created_at
ON chatbot_messages(created_at DESC);


-- =====================================================
-- OPTIONAL FARM COORDINATES FOR LIVE WEATHER
-- =====================================================

ALTER TABLE farms
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7);

ALTER TABLE farms
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);


-- =====================================================
-- FARMVERSE EXTRA FEATURES DATABASE
-- Fertilizer Recommendation
-- Crop Recommendation
-- Plant Disease Detection
-- Smart Notifications
-- Government Schemes
-- =====================================================


-- =====================================================
-- FERTILIZER RECOMMENDATION HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS fertilizer_recommendations (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  farm_id INTEGER
    REFERENCES farms(id)
    ON DELETE SET NULL,

  crop_id INTEGER
    REFERENCES crops(id)
    ON DELETE SET NULL,

  crop_name VARCHAR(120) NOT NULL,
  growth_stage VARCHAR(80),

  soil_type VARCHAR(100),
  soil_ph DECIMAL(5, 2),
  nitrogen DECIMAL(12, 2),
  phosphorus DECIMAL(12, 2),
  potassium DECIMAL(12, 2),
  irrigation_type VARCHAR(100),

  input_data JSONB,
  result JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fertilizer_recommendations_user_id
ON fertilizer_recommendations(user_id);

CREATE INDEX IF NOT EXISTS idx_fertilizer_recommendations_crop_id
ON fertilizer_recommendations(crop_id);

CREATE INDEX IF NOT EXISTS idx_fertilizer_recommendations_created_at
ON fertilizer_recommendations(created_at DESC);


-- =====================================================
-- CROP RECOMMENDATION HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS crop_recommendations (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  farm_id INTEGER
    REFERENCES farms(id)
    ON DELETE SET NULL,

  location VARCHAR(255),
  season VARCHAR(80),
  soil_type VARCHAR(100),
  water_availability VARCHAR(50),
  irrigation_type VARCHAR(100),
  farming_type VARCHAR(100),

  input_data JSONB,
  recommended_crops JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crop_recommendations_user_id
ON crop_recommendations(user_id);

CREATE INDEX IF NOT EXISTS idx_crop_recommendations_farm_id
ON crop_recommendations(farm_id);

CREATE INDEX IF NOT EXISTS idx_crop_recommendations_created_at
ON crop_recommendations(created_at DESC);


-- =====================================================
-- PLANT DISEASE / LEAF IMAGE SCAN HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS disease_scans (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  farm_id INTEGER
    REFERENCES farms(id)
    ON DELETE SET NULL,

  crop_id INTEGER
    REFERENCES crops(id)
    ON DELETE SET NULL,

  crop_name VARCHAR(120),
  growth_stage VARCHAR(80),

  image_name VARCHAR(255),
  image_mime_type VARCHAR(100),
  image_url TEXT,

  symptoms TEXT,

  possible_issue VARCHAR(255),
  severity VARCHAR(50),

  ai_result TEXT NOT NULL,
  recommendations JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_disease_scans_user_id
ON disease_scans(user_id);

CREATE INDEX IF NOT EXISTS idx_disease_scans_crop_id
ON disease_scans(crop_id);

CREATE INDEX IF NOT EXISTS idx_disease_scans_created_at
ON disease_scans(created_at DESC);


-- =====================================================
-- NOTIFICATION PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  in_app_enabled BOOLEAN DEFAULT true,

  weather_alerts BOOLEAN DEFAULT true,
  scheme_alerts BOOLEAN DEFAULT true,
  harvest_reminders BOOLEAN DEFAULT true,
  crop_stage_alerts BOOLEAN DEFAULT true,
  fertilizer_alerts BOOLEAN DEFAULT true,
  disease_alerts BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id
ON notification_preferences(user_id);


-- =====================================================
-- SMART IN-APP NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  notification_key VARCHAR(255),

  type VARCHAR(80) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,

  priority VARCHAR(30) DEFAULT 'medium',
  source VARCHAR(80) DEFAULT 'system',

  action_url TEXT,

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  metadata JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_type
ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read
ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
ON notifications(created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_unique_user_key
ON notifications(user_id, notification_key)
WHERE notification_key IS NOT NULL;


-- =====================================================
-- GOVERNMENT SCHEMES
-- =====================================================

CREATE TABLE IF NOT EXISTS government_schemes (
  id SERIAL PRIMARY KEY,

  scheme_code VARCHAR(100) UNIQUE NOT NULL,
  scheme_name VARCHAR(200) NOT NULL,

  description TEXT NOT NULL,
  category VARCHAR(100),

  state VARCHAR(100) DEFAULT 'All India',
  target_role VARCHAR(30) DEFAULT 'farmer',

  eligibility TEXT,
  benefits TEXT,

  start_date DATE,
  deadline DATE,

  official_link TEXT,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_government_schemes_state
ON government_schemes(state);

CREATE INDEX IF NOT EXISTS idx_government_schemes_active
ON government_schemes(is_active);

CREATE INDEX IF NOT EXISTS idx_government_schemes_category
ON government_schemes(category);


-- =====================================================
-- SEED BASIC GOVERNMENT SCHEMES
-- =====================================================

INSERT INTO government_schemes
(
  scheme_code,
  scheme_name,
  description,
  category,
  state,
  target_role,
  eligibility,
  benefits,
  official_link,
  is_active
)
VALUES
(
  'PM_KISAN',
  'PM-Kisan Samman Nidhi',
  'Income support scheme for eligible farmer families.',
  'Income Support',
  'All India',
  'farmer',
  'Eligible farmer families as per government rules.',
  'Financial assistance is provided directly to eligible farmers.',
  'https://pmkisan.gov.in/',
  true
),
(
  'PMFBY',
  'Pradhan Mantri Fasal Bima Yojana',
  'Crop insurance scheme for farmers against crop loss due to notified risks.',
  'Crop Insurance',
  'All India',
  'farmer',
  'Farmers growing notified crops in notified areas may be eligible.',
  'Crop loss protection based on scheme rules and enrollment.',
  'https://pmfby.gov.in/',
  true
),
(
  'SOIL_HEALTH_CARD',
  'Soil Health Card Scheme',
  'Soil testing support to help farmers understand soil nutrients and improve fertilizer planning.',
  'Soil Health',
  'All India',
  'farmer',
  'Farmers can check with local agriculture department or KVK.',
  'Helps farmers plan fertilizer usage based on soil condition.',
  'https://soilhealth.dac.gov.in/',
  true
),
(
  'MICRO_IRRIGATION',
  'Micro Irrigation / Drip Irrigation Subsidy',
  'Support for drip and sprinkler irrigation through government subsidy programs.',
  'Irrigation',
  'All India',
  'farmer',
  'Eligibility depends on state rules and scheme availability.',
  'Can help reduce water usage and improve irrigation efficiency.',
  'https://pmksy.gov.in/',
  true
),
(
  'KCC',
  'Kisan Credit Card',
  'Credit support for farmers for agricultural and allied activities.',
  'Credit',
  'All India',
  'farmer',
  'Eligible farmers can apply through banks as per KCC guidelines.',
  'Provides access to agricultural credit.',
  'https://www.myscheme.gov.in/',
  true
)
ON CONFLICT (scheme_code) DO NOTHING;