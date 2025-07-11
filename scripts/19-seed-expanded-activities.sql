-- Seed data for expanded activities and related tables
-- This script populates the database with diverse activity types and supporting data

-- Insert base certifications
INSERT INTO certifications (id, name, issuing_authority, description, validity_period, category) VALUES
('cert-001', 'US Coast Guard Captain License', 'US Coast Guard', 'Commercial vessel operation license', 60, 'navigation'),
('cert-002', 'PADI Open Water Diver', 'PADI', 'Basic scuba diving certification', 0, 'safety'),
('cert-003', 'PADI Advanced Open Water', 'PADI', 'Advanced scuba diving skills', 0, 'safety'),
('cert-004', 'ASA Sailing Certification', 'American Sailing Association', 'Basic sailing skills', 0, 'navigation'),
('cert-005', 'First Aid & CPR', 'Red Cross', 'Emergency medical response', 24, 'safety'),
('cert-006', 'Surfing Instructor Certification', 'International Surfing Association', 'Professional surfing instruction', 24, 'instruction'),
('cert-007', 'Fishing Guide License', 'State Department of Fish & Wildlife', 'Commercial fishing guide permit', 12, 'specialized'),
('cert-008', 'Jet Ski Safety Certification', 'Personal Watercraft Industry Association', 'Jet ski operation and safety', 24, 'safety'),
('cert-009', 'Kayaking Instructor', 'American Canoe Association', 'Professional kayaking instruction', 24, 'instruction'),
('cert-010', 'Whale Watching Guide', 'NOAA', 'Marine mammal observation certification', 12, 'specialized');

-- Insert equipment categories
INSERT INTO equipment (id, business_id, name, category, description, quantity, condition) VALUES
-- Safety Equipment
('equip-001', 'business-001', 'Life Jackets', 'safety', 'USCG approved life jackets', 20, 'excellent'),
('equip-002', 'business-001', 'First Aid Kit', 'safety', 'Comprehensive marine first aid kit', 5, 'good'),
('equip-003', 'business-001', 'Emergency Flares', 'safety', 'Coast Guard approved emergency flares', 10, 'excellent'),
('equip-004', 'business-001', 'VHF Radio', 'navigation', 'Marine VHF communication radio', 3, 'good'),
('equip-005', 'business-001', 'GPS Navigation', 'navigation', 'Marine GPS navigation system', 2, 'excellent'),

-- Sailing Equipment
('equip-006', 'business-001', 'Sailing Harnesses', 'safety', 'Safety harnesses for sailing', 8, 'good'),
('equip-007', 'business-001', 'Sailing Gloves', 'activity', 'Professional sailing gloves', 15, 'excellent'),
('equip-008', 'business-001', 'Winch Handles', 'activity', 'Manual winch operation tools', 6, 'good'),

-- Diving Equipment
('equip-009', 'business-001', 'Scuba Tanks', 'activity', 'Aluminum 80 cu ft tanks', 12, 'excellent'),
('equip-010', 'business-001', 'BCD Vests', 'activity', 'Buoyancy control devices', 10, 'good'),
('equip-011', 'business-001', 'Regulators', 'activity', 'Scuba regulators with octopus', 10, 'excellent'),
('equip-012', 'business-001', 'Dive Computers', 'navigation', 'Digital dive computers', 8, 'excellent'),
('equip-013', 'business-001', 'Wetsuits', 'comfort', '3mm neoprene wetsuits', 15, 'good'),

-- Surfing Equipment
('equip-014', 'business-001', 'Surfboards', 'activity', 'Various surfboard sizes', 25, 'good'),
('equip-015', 'business-001', 'Surf Leashes', 'safety', 'Surfboard safety leashes', 30, 'excellent'),
('equip-016', 'business-001', 'Rash Guards', 'comfort', 'UV protection rash guards', 20, 'excellent'),

-- Fishing Equipment
('equip-017', 'business-001', 'Fishing Rods', 'activity', 'Professional fishing rods', 15, 'good'),
('equip-018', 'business-001', 'Fishing Reels', 'activity', 'High-quality fishing reels', 15, 'good'),
('equip-019', 'business-001', 'Tackle Boxes', 'activity', 'Organized fishing tackle', 8, 'excellent'),

-- Kayaking Equipment
('equip-020', 'business-001', 'Kayaks', 'activity', 'Touring and recreational kayaks', 12, 'good'),
('equip-021', 'business-001', 'Kayak Paddles', 'activity', 'Lightweight carbon fiber paddles', 15, 'excellent'),
('equip-022', 'business-001', 'Dry Bags', 'comfort', 'Waterproof storage bags', 20, 'excellent'),

-- Jet Ski Equipment
('equip-023', 'business-001', 'Jet Skis', 'activity', 'Yamaha WaveRunner jet skis', 4, 'excellent'),
('equip-024', 'business-001', 'Jet Ski Trailers', 'activity', 'Transport trailers for jet skis', 2, 'good'),

-- Comfort Equipment
('equip-025', 'business-001', 'Beach Umbrellas', 'comfort', 'Large beach umbrellas', 10, 'excellent'),
('equip-026', 'business-001', 'Coolers', 'comfort', 'Insulated coolers for trips', 8, 'good'),
('equip-027', 'business-001', 'Towels', 'comfort', 'Quick-dry beach towels', 50, 'excellent');

-- Insert host profiles with diverse specializations
INSERT INTO host_profiles (id, business_id, name, role, specializations, certifications, years_experience, languages, bio, contact_email, phone_number) VALUES
-- Sailing Specialists
('host-001', 'business-001', 'Captain Sarah Johnson', 'captain', ARRAY['sailing', 'navigation', 'safety'], ARRAY['US Coast Guard Captain License', 'ASA Sailing Certification'], 15, ARRAY['English', 'Spanish'], 'Experienced sailing captain with 15 years navigating the Pacific coast. Specializes in luxury yacht charters and sailing instruction.', 'sarah@seafable.com', '+1-555-0101'),
('host-002', 'business-001', 'Captain Mike Rodriguez', 'captain', ARRAY['sailing', 'racing', 'navigation'], ARRAY['US Coast Guard Captain License', 'ASA Advanced Sailing'], 12, ARRAY['English', 'Portuguese'], 'Former competitive sailor turned charter captain. Expert in racing techniques and coastal navigation.', 'mike@seafable.com', '+1-555-0102'),

-- Diving Specialists
('host-003', 'business-001', 'Dive Master Alex Chen', 'instructor', ARRAY['scuba diving', 'underwater photography', 'marine biology'], ARRAY['PADI Master Instructor', 'First Aid & CPR'], 8, ARRAY['English', 'Mandarin'], 'Marine biologist and PADI Master Instructor. Specializes in coral reef conservation and underwater photography.', 'alex@seafable.com', '+1-555-0103'),
('host-004', 'business-001', 'Instructor Maria Santos', 'instructor', ARRAY['scuba diving', 'freediving', 'safety'], ARRAY['PADI Advanced Open Water', 'Freediving Instructor'], 6, ARRAY['English', 'Spanish'], 'Certified freediving instructor with expertise in breath-hold techniques and safety protocols.', 'maria@seafable.com', '+1-555-0104'),

-- Surfing Specialists
('host-005', 'business-001', 'Surf Coach Jake Wilson', 'instructor', ARRAY['surfing', 'wave reading', 'safety'], ARRAY['Surfing Instructor Certification', 'First Aid & CPR'], 10, ARRAY['English'], 'Professional surfer and certified instructor. Specializes in beginner instruction and advanced technique coaching.', 'jake@seafable.com', '+1-555-0105'),
('host-006', 'business-001', 'Surf Guide Emma Davis', 'guide', ARRAY['surfing', 'local spots', 'safety'], ARRAY['Surfing Instructor Certification'], 7, ARRAY['English', 'French'], 'Local surf expert with intimate knowledge of the best breaks and conditions throughout the region.', 'emma@seafable.com', '+1-555-0106'),

-- Fishing Specialists
('host-007', 'business-001', 'Fishing Guide Tom Anderson', 'guide', ARRAY['deep sea fishing', 'inshore fishing', 'local knowledge'], ARRAY['Fishing Guide License', 'First Aid & CPR'], 20, ARRAY['English'], 'Veteran fishing guide with 20 years experience. Knows all the best spots and techniques for catching local species.', 'tom@seafable.com', '+1-555-0107'),
('host-008', 'business-001', 'Captain Lisa Park', 'captain', ARRAY['fishing', 'navigation', 'safety'], ARRAY['US Coast Guard Captain License', 'Fishing Guide License'], 18, ARRAY['English', 'Korean'], 'Experienced fishing captain specializing in deep sea expeditions and big game fishing.', 'lisa@seafable.com', '+1-555-0108'),

-- Kayaking Specialists
('host-009', 'business-001', 'Kayak Guide David Brown', 'guide', ARRAY['kayaking', 'wildlife', 'safety'], ARRAY['Kayaking Instructor', 'First Aid & CPR'], 9, ARRAY['English'], 'Certified kayaking instructor with expertise in sea kayaking and wildlife observation tours.', 'david@seafable.com', '+1-555-0109'),
('host-010', 'business-001', 'Adventure Guide Rachel Green', 'guide', ARRAY['kayaking', 'paddleboarding', 'eco-tourism'], ARRAY['Kayaking Instructor', 'Paddleboarding Instructor'], 5, ARRAY['English', 'German'], 'Eco-tourism specialist focusing on sustainable water sports and environmental education.', 'rachel@seafable.com', '+1-555-0110'),

-- Jet Ski Specialists
('host-011', 'business-001', 'Jet Ski Operator Chris Lee', 'operator', ARRAY['jet skiing', 'safety', 'maintenance'], ARRAY['Jet Ski Safety Certification', 'First Aid & CPR'], 4, ARRAY['English'], 'Certified jet ski operator with expertise in safety protocols and equipment maintenance.', 'chris@seafable.com', '+1-555-0111'),

-- Whale Watching Specialists
('host-012', 'business-001', 'Marine Biologist Dr. Sarah Kim', 'guide', ARRAY['whale watching', 'marine biology', 'conservation'], ARRAY['Whale Watching Guide', 'PhD Marine Biology'], 12, ARRAY['English', 'Korean'], 'Marine biologist and whale watching expert with deep knowledge of marine mammal behavior and conservation.', 'sarah.kim@seafable.com', '+1-555-0112');

-- Insert diverse experiences with activity-specific details
INSERT INTO experiences (id, host_id, business_id, title, description, location, price, duration, activity_type, activity_specific_details, difficulty_level, max_participants, min_age, equipment_provided, what_to_bring, weather_dependency, instant_booking, tags, highlights, included_services, excluded_services) VALUES
-- Sailing Experiences
('exp-001', 'host-001', 'business-001', 'Sunset Sailing Cruise', 'Experience the magic of sailing during golden hour with our experienced captain. Perfect for romantic getaways or peaceful family outings.', 'Marina Bay, San Diego', 150, 180, 'sailing', '{"boatType": "sailboat", "boatLength": 32, "maxWindSpeed": 15, "sailingArea": "San Diego Bay", "licenseRequired": false}', 'beginner', 6, 8, ARRAY['Life Jackets', 'Sailing Harnesses', 'Safety Equipment'], ARRAY['Sunscreen', 'Hat', 'Light Jacket'], true, true, ARRAY['romantic', 'sunset', 'family-friendly'], ARRAY['Breathtaking sunset views', 'Professional captain', 'Comfortable seating'], ARRAY['Professional captain', 'Safety equipment', 'Refreshments'], ARRAY['Transportation to marina', 'Gratuities']),

('exp-002', 'host-002', 'business-001', 'Adventure Sailing Race', 'Feel the thrill of competitive sailing with our racing experience. Learn advanced techniques while competing in a friendly race.', 'Point Loma, San Diego', 200, 240, 'sailing', '{"boatType": "sailboat", "boatLength": 28, "maxWindSpeed": 20, "sailingArea": "Point Loma Race Course", "licenseRequired": false}', 'intermediate', 4, 12, ARRAY['Racing Equipment', 'Safety Gear', 'Performance Sails'], ARRAY['Athletic wear', 'Grippy shoes', 'Water bottle'], true, false, ARRAY['adventure', 'racing', 'thrilling'], ARRAY['Competitive racing experience', 'Advanced sailing techniques', 'Adrenaline rush'], ARRAY['Racing equipment', 'Professional instruction', 'Safety gear'], ARRAY['Transportation', 'Personal gear']),

-- Diving Experiences
('exp-003', 'host-003', 'business-001', 'Coral Reef Discovery Dive', 'Explore vibrant coral reefs teeming with marine life. Perfect for certified divers looking to discover underwater wonders.', 'La Jolla Cove, San Diego', 120, 240, 'diving', '{"diveType": "scuba", "maxDepth": 60, "certificationRequired": true, "equipmentIncluded": true, "diveSites": ["La Jolla Canyon", "Point Loma Kelp Forest"]}', 'intermediate', 4, 12, ARRAY['Scuba Tanks', 'BCD Vests', 'Regulators', 'Dive Computers', 'Wetsuits'], ARRAY['Swimsuit', 'Towel', 'Certification card'], true, true, ARRAY['underwater', 'marine life', 'coral reefs'], ARRAY['Vibrant coral reefs', 'Diverse marine life', 'Professional dive master'], ARRAY['Full diving equipment', 'Dive master', 'Safety briefing'], ARRAY['Transportation', 'Certification courses']),

('exp-004', 'host-004', 'business-001', 'Beginner Scuba Discovery', 'Experience the underwater world for the first time with our beginner-friendly scuba discovery program.', 'Mission Bay, San Diego', 80, 180, 'diving', '{"diveType": "scuba", "maxDepth": 20, "certificationRequired": false, "equipmentIncluded": true, "diveSites": ["Mission Bay Shallow Reef"]}', 'beginner', 2, 10, ARRAY['Complete Scuba Gear', 'Safety Equipment', 'Training Materials'], ARRAY['Swimsuit', 'Towel', 'Comfortable clothes'], true, true, ARRAY['beginner-friendly', 'discovery', 'safe'], ARRAY['No certification required', 'Professional instruction', 'Safe shallow water'], ARRAY['Complete equipment', 'Professional instructor', 'Safety training'], ARRAY['Transportation', 'Certification']),

-- Surfing Experiences
('exp-005', 'host-005', 'business-001', 'Learn to Surf', 'Master the basics of surfing with our expert instructors. Perfect for complete beginners looking to catch their first wave.', 'Pacific Beach, San Diego', 75, 120, 'surfing', '{"surfType": "beginner", "boardType": "foam", "waveHeight": "2-4 feet", "lessonIncluded": true}', 'beginner', 4, 8, ARRAY['Surfboards', 'Surf Leashes', 'Rash Guards', 'Safety Equipment'], ARRAY['Swimsuit', 'Sunscreen', 'Water bottle'], true, true, ARRAY['beginner-friendly', 'learning', 'fun'], ARRAY['Professional instruction', 'Safe beginner waves', 'All equipment included'], ARRAY['Surfboard and leash', 'Rash guard', 'Professional instruction'], ARRAY['Transportation', 'Personal gear']),

('exp-006', 'host-006', 'business-001', 'Advanced Surf Coaching', 'Take your surfing to the next level with personalized coaching for intermediate to advanced surfers.', 'Black''s Beach, San Diego', 100, 150, 'surfing', '{"surfType": "advanced", "boardType": "provided", "waveHeight": "4-8 feet", "lessonIncluded": true}', 'advanced', 2, 16, ARRAY['Performance Surfboards', 'Video Analysis', 'Safety Equipment'], ARRAY['Wetsuit', 'Personal gear', 'Water bottle'], true, false, ARRAY['advanced', 'coaching', 'performance'], ARRAY['Video analysis', 'Advanced techniques', 'Performance boards'], ARRAY['Professional coaching', 'Video analysis', 'Performance equipment'], ARRAY['Transportation', 'Personal gear']),

-- Fishing Experiences
('exp-007', 'host-007', 'business-001', 'Deep Sea Fishing Adventure', 'Venture into the deep blue for an exciting fishing adventure targeting tuna, dorado, and other big game fish.', 'Point Loma, San Diego', 180, 480, 'fishing', '{"fishingType": "deep_sea", "targetSpecies": ["Yellowfin Tuna", "Dorado", "Yellowtail"], "equipmentProvided": true, "licenseIncluded": true, "catchAndRelease": false}', 'intermediate', 6, 12, ARRAY['Fishing Rods', 'Fishing Reels', 'Tackle', 'Safety Equipment'], ARRAY['Layered clothing', 'Hat', 'Sunscreen', 'Motion sickness medication'], true, false, ARRAY['deep sea', 'big game', 'adventure'], ARRAY['Big game fishing', 'Professional guide', 'All equipment included'], ARRAY['Fishing license', 'All equipment', 'Professional guide', 'Fish cleaning'], ARRAY['Transportation', 'Personal gear']),

('exp-008', 'host-008', 'business-001', 'Inshore Fishing Trip', 'Enjoy a relaxing day of inshore fishing targeting bass, halibut, and other local species in calm waters.', 'Mission Bay, San Diego', 120, 240, 'fishing', '{"fishingType": "inshore", "targetSpecies": ["Bass", "Halibut", "Croaker"], "equipmentProvided": true, "licenseIncluded": true, "catchAndRelease": true}', 'beginner', 4, 8, ARRAY['Fishing Equipment', 'Bait', 'Safety Gear'], ARRAY['Comfortable clothes', 'Hat', 'Sunscreen'], true, true, ARRAY['relaxing', 'family-friendly', 'local'], ARRAY['Calm waters', 'Family-friendly', 'Local species'], ARRAY['Fishing license', 'Equipment', 'Bait', 'Professional guide'], ARRAY['Transportation', 'Personal gear']),

-- Kayaking Experiences
('exp-009', 'host-009', 'business-001', 'Sea Kayak Wildlife Tour', 'Paddle through pristine waters while observing seals, sea lions, and coastal birds in their natural habitat.', 'La Jolla Cove, San Diego', 65, 180, 'kayaking', '{"kayakType": "sea", "wildlifeFocus": true, "safetyLevel": "beginner"}', 'beginner', 8, 8, ARRAY['Kayaks', 'Kayak Paddles', 'Life Jackets', 'Dry Bags'], ARRAY['Swimsuit', 'Sunscreen', 'Hat', 'Water bottle'], true, true, ARRAY['wildlife', 'nature', 'peaceful'], ARRAY['Wildlife observation', 'Scenic coastline', 'Professional guide'], ARRAY['Kayak and paddle', 'Life jacket', 'Professional guide'], ARRAY['Transportation', 'Personal gear']),

('exp-010', 'host-010', 'business-001', 'Sunset Paddleboarding', 'Glide across calm waters during the magical golden hour on our stand-up paddleboarding experience.', 'Mission Bay, San Diego', 55, 120, 'paddleboarding', '{"boardType": "inflatable", "difficulty": "beginner", "scenic": true}', 'beginner', 6, 10, ARRAY['Paddleboards', 'Paddles', 'Life Jackets'], ARRAY['Swimsuit', 'Sunscreen', 'Hat'], true, true, ARRAY['sunset', 'peaceful', 'scenic'], ARRAY['Breathtaking sunset views', 'Calm waters', 'Easy learning curve'], ARRAY['Paddleboard and paddle', 'Life jacket', 'Basic instruction'], ARRAY['Transportation', 'Personal gear']),

-- Jet Ski Experiences
('exp-011', 'host-011', 'business-001', 'Jet Ski Adventure', 'Experience the thrill of high-speed jet skiing along the beautiful San Diego coastline.', 'Mission Bay, San Diego', 95, 90, 'jet-skiing', '{"jetSkiType": "recreational", "speedLevel": "moderate", "safetyFocus": true}', 'beginner', 2, 16, ARRAY['Jet Skis', 'Safety Equipment', 'Life Jackets'], ARRAY['Swimsuit', 'Sunscreen', 'Grippy shoes'], true, true, ARRAY['thrilling', 'high-speed', 'adventure'], ARRAY['High-speed excitement', 'Scenic coastline', 'Professional instruction'], ARRAY['Jet ski rental', 'Safety equipment', 'Basic instruction'], ARRAY['Transportation', 'Personal gear']),

-- Whale Watching Experience
('exp-012', 'host-012', 'business-001', 'Whale Watching Expedition', 'Witness majestic gray whales during their annual migration along the California coast.', 'Point Loma, San Diego', 85, 240, 'whale-watching', '{"whaleSpecies": ["Gray Whale", "Humpback Whale"], "season": "winter", "educational": true}', 'beginner', 12, 6, ARRAY['Binoculars', 'Educational Materials', 'Safety Equipment'], ARRAY['Layered clothing', 'Hat', 'Sunscreen', 'Motion sickness medication'], true, true, ARRAY['educational', 'wildlife', 'seasonal'], ARRAY['Marine biologist guide', 'Educational experience', 'Guaranteed sightings'], ARRAY['Professional guide', 'Educational materials', 'Binoculars'], ARRAY['Transportation', 'Personal gear']);

-- Link experiences to equipment
INSERT INTO experience_equipment (experience_id, equipment_id, quantity_required) VALUES
-- Sailing experiences
('exp-001', 'equip-001', 6), -- Life Jackets
('exp-001', 'equip-006', 6), -- Sailing Harnesses
('exp-001', 'equip-004', 1), -- VHF Radio
('exp-002', 'equip-001', 4), -- Life Jackets
('exp-002', 'equip-006', 4), -- Sailing Harnesses
('exp-002', 'equip-007', 4), -- Sailing Gloves

-- Diving experiences
('exp-003', 'equip-009', 4), -- Scuba Tanks
('exp-003', 'equip-010', 4), -- BCD Vests
('exp-003', 'equip-011', 4), -- Regulators
('exp-003', 'equip-012', 4), -- Dive Computers
('exp-003', 'equip-013', 4), -- Wetsuits
('exp-004', 'equip-009', 2), -- Scuba Tanks
('exp-004', 'equip-010', 2), -- BCD Vests
('exp-004', 'equip-011', 2), -- Regulators

-- Surfing experiences
('exp-005', 'equip-014', 4), -- Surfboards
('exp-005', 'equip-015', 4), -- Surf Leashes
('exp-005', 'equip-016', 4), -- Rash Guards
('exp-006', 'equip-014', 2), -- Surfboards
('exp-006', 'equip-015', 2), -- Surf Leashes

-- Fishing experiences
('exp-007', 'equip-017', 6), -- Fishing Rods
('exp-007', 'equip-018', 6), -- Fishing Reels
('exp-007', 'equip-019', 2), -- Tackle Boxes
('exp-008', 'equip-017', 4), -- Fishing Rods
('exp-008', 'equip-018', 4), -- Fishing Reels

-- Kayaking experiences
('exp-009', 'equip-020', 8), -- Kayaks
('exp-009', 'equip-021', 8), -- Kayak Paddles
('exp-009', 'equip-022', 8), -- Dry Bags

-- Jet Ski experience
('exp-011', 'equip-023', 2), -- Jet Skis
('exp-011', 'equip-024', 1), -- Jet Ski Trailers

-- Whale Watching experience
('exp-012', 'equip-025', 3), -- Beach Umbrellas
('exp-012', 'equip-026', 2); -- Coolers

-- Link hosts to certifications
INSERT INTO host_certifications (host_id, certification_id, issued_date, expiry_date, certification_number) VALUES
('host-001', 'cert-001', '2010-03-15', '2030-03-15', 'CG-12345'),
('host-001', 'cert-004', '2012-06-20', NULL, 'ASA-78901'),
('host-002', 'cert-001', '2012-08-10', '2032-08-10', 'CG-23456'),
('host-003', 'cert-002', '2016-04-12', NULL, 'PADI-34567'),
('host-003', 'cert-003', '2018-09-25', NULL, 'PADI-45678'),
('host-003', 'cert-005', '2020-01-15', '2022-01-15', 'RC-56789'),
('host-004', 'cert-003', '2018-11-08', NULL, 'PADI-67890'),
('host-005', 'cert-006', '2014-07-22', '2024-07-22', 'ISA-78901'),
('host-005', 'cert-005', '2019-03-10', '2021-03-10', 'RC-89012'),
('host-006', 'cert-006', '2017-05-18', '2027-05-18', 'ISA-90123'),
('host-007', 'cert-007', '2004-12-03', '2024-12-03', 'FGL-01234'),
('host-007', 'cert-005', '2018-06-14', '2020-06-14', 'RC-12345'),
('host-008', 'cert-001', '2006-09-20', '2026-09-20', 'CG-34567'),
('host-008', 'cert-007', '2006-10-15', '2026-10-15', 'FGL-45678'),
('host-009', 'cert-009', '2015-02-28', '2025-02-28', 'ACA-56789'),
('host-009', 'cert-005', '2017-11-05', '2019-11-05', 'RC-67890'),
('host-010', 'cert-009', '2019-08-12', '2029-08-12', 'ACA-78901'),
('host-011', 'cert-008', '2020-04-30', '2022-04-30', 'PWIA-89012'),
('host-011', 'cert-005', '2020-05-15', '2022-05-15', 'RC-90123'),
('host-012', 'cert-010', '2012-01-20', '2024-01-20', 'NOAA-01234'); 