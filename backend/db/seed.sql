-- ============================================================
-- ONDO STATE — CONSTITUENCIES & LGAs (corrected)
-- ============================================================

INSERT INTO constituencies (name, code) VALUES
('Akure North/Akure South',           'ON01'),  -- 1
('Akoko North-East/Akoko North-West', 'ON02'),  -- 2
('Akoko South-East/Akoko South-West', 'ON03'),  -- 3
('Idanre/Ifedore',                    'ON04'),  -- 4
('Ile-Oluji/Okeigbo/Odigbo',         'ON05'),  -- 5
('Okitipupa/Irele',                   'ON06'),  -- 6
('Eseodo/Ilaje',                      'ON07'),  -- 7
('Ondo East/Ondo West',               'ON08'),  -- 8
('Owo/Ose',                           'ON09');  -- 9

INSERT INTO local_government_areas (name, constituency_id) VALUES
('Akure North',       1), ('Akure South',      1),
('Akoko North-East',  2), ('Akoko North-West', 2),
('Akoko South-East',  3), ('Akoko South-West', 3),
('Idanre',            4), ('Ifedore',          4),
('Ile-Oluji/Okeigbo', 5), ('Odigbo',           5),
('Okitipupa',         6), ('Irele',            6),
('Ese-Odo',           7), ('Ilaje',            7),
('Ondo East',         8), ('Ondo West',        8),
('Owo',               9), ('Ose',              9);

INSERT INTO election_officers (full_name, email, password_hash, role) VALUES
('INEC Demo Registration Officer', 'officer@inec.ondo.gov.ng', '$2b$10$KkG6lDg3kbmrtb4BU2YaruNSmi3SCmJtdl0soljhL1UangOvZBzAy', 'registration_officer');

INSERT INTO election_admins (full_name, email, password_hash, role) VALUES
('INEC Demo State Administrator', 'admin@inec.ondo.gov.ng', '$2b$12$WZAFoaJKOpDry5yQNMk7Ver68Vfug7TgE8cVUoPTVvPaY4vJZBglm', 'state_admin');

INSERT INTO elections (name, election_type, status) VALUES
('House of Representatives Elections 2027', 'house_of_representatives', 'draft');

INSERT INTO parties (name, code) VALUES
('All Progressives Congress', 'APC'),
('Peoples Democratic Party', 'PDP'),
('Zenith Labour Party', 'ZLP'),
('Social Democratic Party', 'SDP'),
('African Democratic Congress', 'ADC'),
('New Nigeria Peoples Party', 'NNPP'),
('Action Alliance', 'AA'),
('All Progressives Grand Alliance', 'APGA'),
('Young Progressives Party', 'YPP'),
('Action Peoples Party', 'APP'),
('African Action Congress', 'AAC');

-- ============================================================
-- VOTERS — 10 per constituency (90 total), realistic Ondo names
-- ============================================================

-- Constituency 1 (Akure North/Akure South) — LGAs 1 & 2
INSERT INTO voters (vin, full_name, constituency_id, lga_id) VALUES
('VIN001001', 'Adebayo Ogunleye',    1, 1),
('VIN001002', 'Folake Adekunle',     1, 1),
('VIN001003', 'Oluwaseun Akindele',  1, 2),
('VIN001004', 'Tokunbo Ajayi',       1, 2),
('VIN001005', 'Tunde Bakare',        1, 1),
('VIN001006', 'Blessing Ogunwale',   1, 2),
('VIN001007', 'Rotimi Adeyemi',      1, 1),
('VIN001008', 'Ngozi Eze',           1, 2),
('VIN001009', 'Segun Fasanya',       1, 1),
('VIN001010', 'Yetunde Oladele',     1, 2);

-- Constituency 2 (Akoko North-East/Akoko North-West) — LGAs 3 & 4
INSERT INTO voters (vin, full_name, constituency_id, lga_id) VALUES
('VIN002001', 'Olumide Adeleke',     2, 3),
('VIN002002', 'Taiwo Akinpelu',      2, 3),
('VIN002003', 'Lanre Ogundimu',      2, 4),
('VIN002004', 'Funmilola Aremu',     2, 4),
('VIN002005', 'Damilola Ogundipe',   2, 3),
('VIN002006', 'Emmanuel Oladipo',    2, 4),
('VIN002007', 'Adunola Adesanya',    2, 3),
('VIN002008', 'Kehinde Aborisade',   2, 4),
('VIN002009', 'Mariam Suleiman',     2, 3),
('VIN002010', 'Kunle Afolabi',       2, 4);

-- Constituency 3 (Akoko South-East/Akoko South-West) — LGAs 5 & 6
INSERT INTO voters (vin, full_name, constituency_id, lga_id) VALUES
('VIN003001', 'Abiodun Omowale',     3, 5),
('VIN003002', 'Patience Agboola',    3, 5),
('VIN003003', 'Sunday Olatunde',     3, 6),
('VIN003004', 'Zainab Ibrahim',      3, 6),
('VIN003005', 'Babatunde Ogunleye',  3, 5),
('VIN003006', 'Ada Nwankwo',         3, 6),
('VIN003007', 'Bola Adedoyin',       3, 5),
('VIN003008', 'Chioma Okeke',        3, 6),
('VIN003009', 'Yusuf Hassan',        3, 5),
('VIN003010', 'Funke Adeyemi',       3, 6);

-- Constituency 4 (Idanre/Ifedore) — LGAs 7 & 8
INSERT INTO voters (vin, full_name, constituency_id, lga_id) VALUES
('VIN004001', 'Victor Omosigho',     4, 7),
('VIN004002', 'Aisha Bello',         4, 7),
('VIN004003', 'Chinedu Eze',         4, 8),
('VIN004004', 'Olajumoke Ogunleye',  4, 8),
('VIN004005', 'Adedayo Olatunde',    4, 7),
('VIN004006', 'Patience Ojo',        4, 8),
('VIN004007', 'Musa Abdullahi',      4, 7),
('VIN004008', 'Temitope Olaniran',   4, 8),
('VIN004009', 'Gbenga Akintunde',    4, 7),
('VIN004010', 'Sola Adesanya',       4, 8);

-- Constituency 5 (Ile-Oluji/Okeigbo/Odigbo) — LGAs 9 & 10
INSERT INTO voters (vin, full_name, constituency_id, lga_id) VALUES
('VIN005001', 'Emeka Nwosu',         5, 9),
('VIN005002', 'Comfort Adeleke',     5, 9),
('VIN005003', 'Olawale Ogunmola',    5, 10),
('VIN005004', 'Fatima Lawal',        5, 10),
('VIN005005', 'Adewale Okafor',      5, 9),
('VIN005006', 'Grace Olawale',       5, 10),
('VIN005007', 'Babajide Fasanya',    5, 9),
('VIN005008', 'Olayinka Alabi',      5, 10),
('VIN005009', 'Tunde Okonkwo',       5, 9),
('VIN005010', 'Bukola Ayodele',      5, 10);

-- Constituency 6 (Okitipupa/Irele) — LGAs 11 & 12
INSERT INTO voters (vin, full_name, constituency_id, lga_id) VALUES
('VIN006001', 'Daniel Olatunde',     6, 11),
('VIN006002', 'Oyinlola Ogundele',   6, 11),
('VIN006003', 'Festus Olatunde',     6, 12),
('VIN006004', 'Abike Adeyemi',       6, 12),
('VIN006005', 'Oluwaseun Adeola',    6, 11),
('VIN006006', 'Olumuyiwa Onabanjo',  6, 12),
('VIN006007', 'Adenike Olawale',     6, 11),
('VIN006008', 'Chukwuemeka Obi',     6, 12),
('VIN006009', 'Kayode Arobieke',     6, 11),
('VIN006010', 'Shade Olawole',       6, 12);

-- Constituency 7 (Eseodo/Ilaje) — LGAs 13 & 14
INSERT INTO voters (vin, full_name, constituency_id, lga_id) VALUES
('VIN007001', 'Tobi Ogunkoya',       7, 13),
('VIN007002', 'Olayemi Ogunyemi',    7, 13),
('VIN007003', 'Efosa Omoruyi',       7, 14),
('VIN007004', 'Risi Olatunji',       7, 14),
('VIN007005', 'Bode Aremu',          7, 13),
('VIN007006', 'Olawunmi Fayemi',     7, 14),
('VIN007007', 'Amos Olatunde',       7, 13),
('VIN007008', 'Ngozi Okonkwo',       7, 14),
('VIN007009', 'Dayo Ogunmola',       7, 13),
('VIN007010', 'Folasade Agboola',    7, 14);

-- Constituency 8 (Ondo East/Ondo West) — LGAs 15 & 16
INSERT INTO voters (vin, full_name, constituency_id, lga_id) VALUES
('VIN008001', 'Olumide Adeyemi',     8, 15),
('VIN008002', 'Omowunmi Oladele',    8, 15),
('VIN008003', 'Rasaq Kolawole',      8, 16),
('VIN008004', 'Adenike Arogundade',  8, 16),
('VIN008005', 'Oluwasegun Ojo',      8, 15),
('VIN008006', 'Blessing Adekunle',   8, 16),
('VIN008007', 'Babatunde Fakorede',  8, 15),
('VIN008008', 'Shade Okonkwo',       8, 16),
('VIN008009', 'Olawale Ogunleye',    8, 15),
('VIN008010', 'Toyin Adeoye',        8, 16);

-- Constituency 9 (Owo/Ose) — LGAs 17 & 18
INSERT INTO voters (vin, full_name, constituency_id, lga_id) VALUES
('VIN009001', 'Oluwole Akinpelu',    9, 17),
('VIN009002', 'Omolola Ogunbayo',    9, 17),
('VIN009003', 'Adewale Aborishade',  9, 18),
('VIN009004', 'Abiola Olatunde',     9, 18),
('VIN009005', 'Oluseun Odeyemi',     9, 17),
('VIN009006', 'Christiana Okafor',   9, 18),
('VIN009007', 'Taiwo Ogunyemi',      9, 17),
('VIN009008', 'Olajide Ojo',         9, 18),
('VIN009009', 'Motunrayo Adeyemi',   9, 17),
('VIN009010', 'Seyi Okuneye',        9, 18);

-- ============================================================
-- CANDIDATES — All names and parties directly from Stears/INEC
-- ============================================================

-- Constituency 1: Akure North/Akure South
-- Winner: Adesida Abiodun Cornelius Aderin (APC) — 45,030 votes
INSERT INTO candidates (name, party, constituency_id) VALUES
('Adesida Abiodun Cornelius Aderin', 'APC',  1),  -- WINNER
('Adesanya Kemisola Adenike',        'PDP',  1),  -- 33,789
('Adejuwon Ayodeji',                 'ZLP',  1),  -- 2,097
('Falaiye Olugbenga Akinwale',       'SDP',  1),  -- 1,918
('Ojo Jumoke',                       'ADC',  1),  -- 1,591
('Niyi Seun Falade',                 'NNPP', 1);  -- 810

-- Constituency 2: Akoko North-East/Akoko North-West
-- Winner: Tunji-Ojo Olubunmi (APC) — 51,532 votes
-- (Tunji-Ojo later became Minister of Interior; Ehindero won the bye-election)
INSERT INTO candidates (name, party, constituency_id) VALUES
('Tunji-Ojo Olubunmi',               'APC',  2),  -- WINNER (general election)
('Kadri Stephen Olusegun',           'PDP',  2),  -- 9,014
('Adeosun Olabanji Williams',        'AA',   2),
('Razak Aladejana',                  'ADC',  2),
('Ogunleye Muritala Idowu',          'SDP',  2),
('Abiye Janet Ademoyegun',           'NNPP', 2);

-- Constituency 3: Akoko South-East/Akoko South-West
-- Winner: Adefarati Adegboyega Adeyemi (APC) — 25,872 votes
INSERT INTO candidates (name, party, constituency_id) VALUES
('Adefarati Adegboyega Adeyemi',     'APC',  3),  -- WINNER
('Kolawole Olugbenga',               'PDP',  3),  -- 18,403
('Ajongbolo Seun Oluwashina',        'SDP',  3),  -- 4,560
('Daudu Peter',                      'ADC',  3),  -- 446
('Eniola Nick Babatunde',            'NNPP', 3),  -- 197
('Ogunleye Emmanuel',                'ZLP',  3);  -- 192

-- Constituency 4: Idanre/Ifedore
-- Winner: Akingbaso Festus Olarewaju (PDP) — 24,263 votes ← only PDP win in Ondo
INSERT INTO candidates (name, party, constituency_id) VALUES
('Akingbaso Festus Olarewaju',       'PDP',  4),  -- WINNER
('Adefisoye Tajudeen Adeyemi',       'APC',  4),  -- 20,064
('Babalola Adegbola Adedeji',        'ADC',  4),  -- 4,180
('Ademusi Idowu',                    'ZLP',  4),  -- 288
('Saliu Ahmed Olaniyi',              'SDP',  4),  -- 270
('Akinkuowo Babatunde Joshua',       'NNPP', 4);  -- 132

-- Constituency 5: Ile-Oluji/Okeigbo/Odigbo
-- Winner: Adefiranye Ayodele Festus (APC) — 36,147 votes
INSERT INTO candidates (name, party, constituency_id) VALUES
('Adefiranye Ayodele Festus',        'APC',  5),  -- WINNER
('Olatunji Julius Adeoye',           'PDP',  5),  -- 19,168
('Akinwamide Ade Rotimi',            'APGA', 5),  -- 6,592
('Olubob Ade Ojo',                   'NNPP', 5),  -- 833
('Boniface Moses',                   'ADC',  5),  -- 822
('Akinyan Jimmy Stephen',            'SDP',  5);  -- 562

-- Constituency 6: Okitipupa/Irele
-- Winner: Odimayo Okunjimi John (APC) — 44,638 votes
INSERT INTO candidates (name, party, constituency_id) VALUES
('Odimayo Okunjimi John',            'APC',  6),  -- WINNER
('Ikengboju Gboluga Dele',           'PDP',  6),  -- 21,066
('Adefuwa Sake Ore',                 'SDP',  6),
('Adedeji Ajayi Okelola',            'NNPP', 6),
('Kuboye Ishola Ayodele',            'YPP',  6),
('Lebi Sunday',                      'APP',  6);

-- Constituency 7: Eseodo/Ilaje
-- Winner: Ojogo Donald Kimikanboh (APC)
INSERT INTO candidates (name, party, constituency_id) VALUES
('Ojogo Donald Kimikanboh',          'APC',  7),  -- WINNER
('Akinjo Kolade Victor',             'PDP',  7),
('Aruwayo Paul Olorunsola',          'AA',   7),
('Nejo Myson Adeyemi',               'ADC',  7),
('Awosika Jumoke',                   'SDP',  7),
('Odola Sunday Gabriel',             'NNPP', 7);

-- Constituency 8: Ondo East/Ondo West
-- Winner: Makinde Abiola Peter (APC)
INSERT INTO candidates (name, party, constituency_id) VALUES
('Makinde Abiola Peter',             'APC',  8),  -- WINNER
('Kehinde Felix Olaleye',            'PDP',  8),
('Adeniyi Alex Fabiyi',              'AAC',  8),
('Akinbuli Ebenezer Gbenga',         'SDP',  8),
('Olafisoye Olakunle Lateef',        'NNPP', 8);

-- Constituency 9: Owo/Ose
-- Winner: Adelegbe Oluwatimehin Emmanuel (APC) — 34,550 votes
INSERT INTO candidates (name, party, constituency_id) VALUES
('Adelegbe Oluwatimehin Emmanuel',   'APC',  9),  -- WINNER
('Arowele Samuel Ayo',               'PDP',  9),  -- 20,865
('Ogundare Oluwaseyi Gabriel',       'SDP',  9),  -- 4,345
('Olawolu Bolanle',                  'ADC',  9),  -- 577
('Qaudri Popoola Olafipo',           'NNPP', 9);  -- 311
