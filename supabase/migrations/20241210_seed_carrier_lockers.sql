-- Migration: Seed carrier lockers with sample data
-- Date: 2024-12-10
-- Description: Populates carrier_lockers table with sample data for testing

-- Sample lockers for Estonia
INSERT INTO carrier_lockers (id, name, country, city, address, lat, lng, services, is_active) VALUES
-- Tallinn
('EE_TLN_001', 'Tallinn Central Station', 'EE', 'Tallinn', 'Estonia pst 9, 10143 Tallinn', 59.4370, 24.7536, ARRAY['LOCKER_LOCKER'], true),
('EE_TLN_002', 'Viru Keskus', 'EE', 'Tallinn', 'Viru väljak 4, 10111 Tallinn', 59.4361, 24.7536, ARRAY['LOCKER_LOCKER'], true),
('EE_TLN_003', 'Ülemiste Keskus', 'EE', 'Tallinn', 'Suur-Sõjamäe 4, 11415 Tallinn', 59.4208, 24.7994, ARRAY['LOCKER_LOCKER'], true),
('EE_TLN_004', 'Rocca al Mare', 'EE', 'Tallinn', 'Paldiski mnt 102, 10617 Tallinn', 59.4339, 24.6417, ARRAY['LOCKER_LOCKER'], true),

-- Tartu
('EE_TRT_001', 'Tartu Bus Station', 'EE', 'Tartu', 'Turu 2, 51007 Tartu', 58.3780, 26.7290, ARRAY['LOCKER_LOCKER'], true),
('EE_TRT_002', 'Lõunakeskus', 'EE', 'Tartu', 'Ringtee 75, 51007 Tartu', 58.3780, 26.7290, ARRAY['LOCKER_LOCKER'], true),

-- Pärnu
('EE_PRN_001', 'Pärnu Bus Station', 'EE', 'Pärnu', 'Rakvere 1, 80042 Pärnu', 58.3859, 24.4971, ARRAY['LOCKER_LOCKER'], true),

-- Sample lockers for Latvia
-- Riga
('LV_RGA_001', 'Riga Central Station', 'LV', 'Riga', 'Stacijas laukums 2, LV-1050 Riga', 56.9465, 24.1048, ARRAY['LOCKER_LOCKER'], true),
('LV_RGA_002', 'Origo Shopping Center', 'LV', 'Riga', 'Brīvības gatve 201, LV-1039 Riga', 56.9465, 24.1048, ARRAY['LOCKER_LOCKER'], true),
('LV_RGA_003', 'Akropole Riga', 'LV', 'Riga', 'Maskavas iela 257, LV-1013 Riga', 56.9465, 24.1048, ARRAY['LOCKER_LOCKER'], true),
('LV_RGA_004', 'Spice Home', 'LV', 'Riga', 'Mūkusalas iela 71, LV-1004 Riga', 56.9465, 24.1048, ARRAY['LOCKER_LOCKER'], true),

-- Daugavpils
('LV_DGV_001', 'Daugavpils Bus Station', 'LV', 'Daugavpils', 'Vienības iela 22, LV-5401 Daugavpils', 55.8747, 26.5362, ARRAY['LOCKER_LOCKER'], true),

-- Liepāja
('LV_LIE_001', 'Liepāja Bus Station', 'LV', 'Liepāja', 'Raiņa iela 1, LV-3401 Liepāja', 56.5085, 21.0132, ARRAY['LOCKER_LOCKER'], true),

-- Sample lockers for Lithuania
-- Vilnius
('LT_VLN_001', 'Vilnius Central Station', 'LT', 'Vilnius', 'Geležinkelio g. 16, 02007 Vilnius', 54.6872, 25.2797, ARRAY['LOCKER_LOCKER'], true),
('LT_VLN_002', 'Akropolis Vilnius', 'LT', 'Vilnius', 'Ozo g. 25, 08200 Vilnius', 54.6872, 25.2797, ARRAY['LOCKER_LOCKER'], true),
('LT_VLN_003', 'Europa Shopping Center', 'LT', 'Vilnius', 'Konstitucijos pr. 7a, 09308 Vilnius', 54.6872, 25.2797, ARRAY['LOCKER_LOCKER'], true),
('LT_VLN_004', 'Panorama', 'LT', 'Vilnius', 'Saltoniškių g. 9, 08105 Vilnius', 54.6872, 25.2797, ARRAY['LOCKER_LOCKER'], true),

-- Kaunas
('LT_KNS_001', 'Kaunas Bus Station', 'LT', 'Kaunas', 'Vytauto pr. 24, 44352 Kaunas', 54.8985, 23.9036, ARRAY['LOCKER_LOCKER'], true),
('LT_KNS_002', 'Mega Shopping Center', 'LT', 'Kaunas', 'Islandijos pl. 32, 50120 Kaunas', 54.8985, 23.9036, ARRAY['LOCKER_LOCKER'], true),

-- Klaipėda
('LT_KLG_001', 'Klaipėda Bus Station', 'LT', 'Klaipėda', 'Butkų Juzės g. 9, 91234 Klaipėda', 55.7033, 21.1443, ARRAY['LOCKER_LOCKER'], true),
('LT_KLG_002', 'Akropolis Klaipėda', 'LT', 'Klaipėda', 'Taikos pr. 61, 91143 Klaipėda', 55.7033, 21.1443, ARRAY['LOCKER_LOCKER'], true),

-- Šiauliai
('LT_SIA_001', 'Šiauliai Bus Station', 'LT', 'Šiauliai', 'Tilžės g. 109, 77156 Šiauliai', 55.9339, 23.3167, ARRAY['LOCKER_LOCKER'], true);

-- Update the PostGIS location column for all inserted lockers
UPDATE carrier_lockers 
SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
WHERE lat IS NOT NULL AND lng IS NOT NULL;
