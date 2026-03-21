-- ─── Service Book — Demo Data ─────────────────────────────────────────────────
-- 20 sample clients with realistic Irish names, addresses, and service history.
-- Run in Supabase → SQL Editor AFTER running schema_v2_migration.sql.
-- Safe to re-run — uses DO block with individual inserts.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  admin_id uuid;
  c01 uuid; c02 uuid; c03 uuid; c04 uuid; c05 uuid;
  c06 uuid; c07 uuid; c08 uuid; c09 uuid; c10 uuid;
  c11 uuid; c12 uuid; c13 uuid; c14 uuid; c15 uuid;
  c16 uuid; c17 uuid; c18 uuid; c19 uuid; c20 uuid;
BEGIN

  -- Get admin profile ID (must be logged in as admin first)
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No admin profile found. Log in as admin at least once before running this script.';
  END IF;

  -- ── 20 Clients ───────────────────────────────────────────────────────────

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Sean Murphy', 'sean.murphy@email.ie', '+353 87 234 5678', '14 Maple Avenue, Rathfarnham', 'Dublin', 'heat_pump', 'Semi-detached. HP outdoor unit in back garden. Access via side gate.', admin_id)
  RETURNING id INTO c01;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Aoife O''Brien', 'aoife.obrien@gmail.com', '+353 86 345 6789', '7 Harbour View, Monkstown', 'Dublin', 'oil_boiler', 'Detached. Oil tank at right side of house, 1,000L capacity.', admin_id)
  RETURNING id INTO c02;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Patrick Kelly', 'pat.kelly@eircom.net', '+353 85 456 7890', '22 Westside Road, Knocknacarra', 'Galway', 'gas_boiler', 'Gas combi boiler in kitchen utility. No cylinder.', admin_id)
  RETURNING id INTO c03;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Mary Walsh', 'mary.walsh@hotmail.com', '+353 87 567 8901', '8 Clancy Park, Corbally', 'Limerick', 'heat_pump', 'Bungalow. Air-to-water HP installed 2022. Underfloor heating throughout.', admin_id)
  RETURNING id INTO c04;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('John O''Connor', 'johnoc@gmail.com', '+353 86 678 9012', '15 Manor Court, Dunmore Road', 'Waterford', 'oil_boiler', 'Semi-d. Oil tank at rear, 800L. Key left with neighbour at No.17.', admin_id)
  RETURNING id INTO c05;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Siobhan Ryan', 'siobhan.ryan@email.ie', '+353 83 789 0123', '3 Elgin Road, Ballsbridge', 'Dublin', 'gas_boiler', 'Top floor apartment. Boiler in hot press off main hallway.', admin_id)
  RETURNING id INTO c06;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Declan Byrne', 'declan.byrne@yahoo.ie', '+353 87 890 1234', '41 Freshford Road', 'Kilkenny', 'heat_pump', 'New build 2023. Daikin Altherma with UFH. Spare key in lockbox, code: 4821.', admin_id)
  RETURNING id INTO c07;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Niamh Fitzgerald', 'niamhfitz@gmail.com', '+353 86 901 2345', '9 Redmond Road, Wexford Town', 'Wexford', 'oil_boiler', 'Oil tank at rear, access via side gate (code: 0912).', admin_id)
  RETURNING id INTO c08;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Brendan McCarthy', 'brendan.mccarthy@eircom.net', '+353 85 012 3456', '67 Churchview Drive, Terenure', 'Dublin', 'heat_pump', 'Detached. Samsung Monobloc. Outdoor unit on north gable wall.', admin_id)
  RETURNING id INTO c09;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Ciara O''Sullivan', 'ciara.osullivan@email.ie', '+353 87 123 4567', '5 Blarney Street Upper', 'Cork', 'gas_boiler', 'Victorian terrace. Boiler under stairs. Tight space, bring extension lead.', admin_id)
  RETURNING id INTO c10;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Michael Doyle', 'michael.doyle@gmail.com', '+353 86 234 5678', '30 Newcastle Road, Galway', 'Galway', 'oil_boiler', NULL, admin_id)
  RETURNING id INTO c11;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Aisling O''Neill', 'aisling.oneill@hotmail.ie', '+353 83 345 6789', '12 Moneymore Park', 'Drogheda', 'heat_pump', 'New build 2023. ASHP + underfloor heating. LG Therma V R32.', admin_id)
  RETURNING id INTO c12;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Conor Quinn', 'conor.quinn@email.ie', '+353 87 456 7890', '18 Carroll Village', 'Dundalk', 'gas_boiler', NULL, admin_id)
  RETURNING id INTO c13;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Fiona Brennan', 'fiona.brennan@gmail.com', '+353 86 567 8901', '2 Wine Street', 'Sligo', 'oil_boiler', 'Town house. Tight access to boiler room through kitchen. Boiler is Firebird Enviromax.', admin_id)
  RETURNING id INTO c14;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Liam Farrell', 'liam.farrell@eircom.net', '+353 85 678 9012', '88 Whitehall Road, Drumcondra', 'Dublin', 'heat_pump', 'Mitsubishi Ecodan. Outdoor unit on flat roof at rear.', admin_id)
  RETURNING id INTO c15;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Orla Connolly', 'orla.connolly@email.ie', '+353 83 789 0123', '14 Claughaun Road', 'Limerick', 'gas_boiler', 'Vaillant ecoTEC combi. No hot water cylinder.', admin_id)
  RETURNING id INTO c16;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Eoin Dunne', 'eoin.dunne@yahoo.ie', '+353 87 890 1234', '55 Douglas Street', 'Cork', 'oil_boiler', NULL, admin_id)
  RETURNING id INTO c17;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Roisin Nolan', 'roisin.nolan@gmail.com', '+353 86 901 2345', '23 Beaumont Avenue, Beaumont', 'Dublin', 'heat_pump', 'Detached. HP outdoor unit on west gable. Underfloor heating ground floor, rads upstairs.', admin_id)
  RETURNING id INTO c18;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Cathal Burke', 'cathal.burke@email.ie', '+353 85 012 3456', '6 Dangan Park, Salthill', 'Galway', 'gas_boiler', 'Remeha Avanta. Boiler in utility room off kitchen.', admin_id)
  RETURNING id INTO c19;

  INSERT INTO public.clients (full_name, email, phone, property_address, city, equipment_type, property_notes, created_by)
  VALUES ('Sinead Power', 'sinead.power@eircom.net', '+353 87 123 4568', '31 Manor Hill, Ferrybank', 'Waterford', 'oil_boiler', 'Semi-d. Oil tank in rear garden. Riello oil boiler in garage.', admin_id)
  RETURNING id INTO c20;

  -- ── Jobs ─────────────────────────────────────────────────────────────────

  -- Sean Murphy (c01) — Heat Pump — 2 jobs
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Heat Pump Service',
    c01,
    'Routine annual maintenance as per service agreement.',
    'Cleaned and inspected air filters, washed outdoor unit coils, checked refrigerant pressures and temperatures, tested defrost cycle, verified flow temps on all zones, checked all electrical connections and terminals.',
    'Air filters x2',
    'completed', '2025-03-15', '2026-03-15', 185.00, 'EUR', admin_id
  );

  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, total_amount, currency, created_by, is_archived)
  VALUES (
    'Heat Pump — Low Efficiency / Low Refrigerant',
    c01,
    'Client reported heat pump not reaching set temperature. COP appearing low on monitoring app.',
    'Diagnosed low refrigerant charge (R32). Located small leak at service port valve. Repaired, pressure-tested with nitrogen, re-gassed to manufacturer spec. Verified all temperatures and pressures correct post-fill.',
    'R32 refrigerant 1.2 kg, service port valve cap',
    'completed', '2024-11-20', 325.00, 'EUR', admin_id, true
  );

  -- Aoife O'Brien (c02) — Oil Boiler — 2 jobs
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Oil Boiler Service',
    c02,
    'Routine annual service.',
    'Replaced nozzle and oil line filter, cleaned combustion head and heat exchanger, cleaned flue ways, flue gas analysis passed (CO/CO2 within limits). Checked and set pump pressure. Tested all controls and safety devices.',
    'Burner nozzle 0.65 GPH, oil line filter, fibre gaskets',
    'completed', '2025-02-10', '2026-02-10', 145.00, 'EUR', admin_id
  );

  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, total_amount, currency, created_by, is_archived)
  VALUES (
    'Oil Boiler — No Ignition / Lockout Fault',
    c02,
    'Boiler locking out on ignition. No flame established. Client getting fault light every few hours.',
    'Found photocell glazed and dirty — not sensing flame. Replaced photocell and nozzle as precaution, cleaned combustion head. Tested 5 ignition cycles — all successful.',
    'Photocell, nozzle 0.65 GPH',
    'completed', '2024-09-05', 210.00, 'EUR', admin_id, true
  );

  -- Patrick Kelly (c03) — Gas Boiler — 2 jobs
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Gas Boiler Service — Viessmann Vitodens 100',
    c03,
    'Annual service.',
    'Cleaned burner assembly and heat exchanger, replaced condensate siphon, cleaned condensate trap. Flue gas analysis within limits. Tested expansion vessel, PRV and all safety controls. Cleared fault history on controller.',
    'Boiler service kit (gaskets, O-rings, condensate siphon)',
    'completed', '2025-01-22', '2026-01-22', 120.00, 'EUR', admin_id
  );

  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, total_amount, currency, created_by)
  VALUES (
    'Gas Boiler — System Pressure Loss',
    c03,
    'System pressure dropping every few days. Client re-pressurising manually from filling loop.',
    'Found weeping TRV valve on upstairs bathroom radiator. Replaced TRV head and valve body. Re-pressurised system to 1.2 bar, bled all radiators. Tested over 2-hour call — no pressure loss.',
    'Thermostatic radiator valve (TRV) x1',
    'completed', '2024-12-03', 165.00, 'EUR', admin_id
  );

  -- Mary Walsh (c04) — Heat Pump — 1 job
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Heat Pump Service — LG Therma V R32',
    c04,
    'Annual service.',
    'Full annual inspection: cleaned air filters and outdoor coil, checked refrigerant charge and temperatures, tested underfloor heating manifold and actuators on all 6 zones, verified flow temperatures. System performing well — COP averaging 3.9.',
    'Air filters x2',
    'completed', '2025-03-01', '2026-03-01', 185.00, 'EUR', admin_id
  );

  -- John O'Connor (c05) — Oil Boiler — 1 job
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Oil Boiler Service — Grant Vortex Pro',
    c05,
    'Annual service.',
    'Full combustion service. Replaced nozzle and filter, cleaned combustion chamber and heat exchanger, flue gas analysis passed. Tested programmer, room thermostat and zone valves. Advised client oil tank at approx. 30% — recommended refill.',
    'Nozzle 0.50 GPH, oil filter',
    'completed', '2025-02-18', '2026-02-18', 145.00, 'EUR', admin_id
  );

  -- Siobhan Ryan (c06) — Gas Boiler — 1 job
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Gas Boiler Service — Worcester Bosch Greenstar',
    c06,
    'Annual service.',
    'Annual service completed. Cleaned heat exchanger and burner, replaced service parts, flue gas analysis within limits, tested all controls. Minor scale build-up noted on DHW heat exchanger — advised descaling at next service.',
    'Service kit (gaskets, diverter valve O-ring)',
    'completed', '2025-01-15', '2026-01-15', 120.00, 'EUR', admin_id
  );

  -- Declan Byrne (c07) — Heat Pump — 2 jobs
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, total_amount, currency, created_by, is_archived)
  VALUES (
    'Heat Pump Commissioning — New Install',
    c07,
    'New Daikin Altherma 3 installed by builder. Requires full commissioning and handover to client.',
    'Full commissioning completed: set flow temperatures for UFH zones, programmed heating curves, verified refrigerant charge, tested defrost cycle, balanced manifold, demonstrated all controls to client.',
    'N/A — commissioning only',
    'completed', '2023-10-12', 250.00, 'EUR', admin_id, true
  );

  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Heat Pump Service — Daikin Altherma 3',
    c07,
    'First annual service post-installation.',
    'Cleaned filters and outdoor coil, verified all control settings still correct, checked refrigerant charge, tested all UFH zones and thermostats. System in excellent condition.',
    'Air filters x2',
    'completed', '2025-02-14', '2026-02-14', 185.00, 'EUR', admin_id
  );

  -- Niamh Fitzgerald (c08) — Oil Boiler — 1 job
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Oil Boiler Service — Firebird Enviromax',
    c08,
    'Annual service.',
    'Full service. Replaced nozzle and filter, cleaned combustion chamber, flue gas analysis good. Tested programmer and all zone valves. Checked electrode gap and reset to spec.',
    'Nozzle 0.60 GPH, oil filter, electrode gaskets',
    'completed', '2025-02-25', '2026-02-25', 145.00, 'EUR', admin_id
  );

  -- Brendan McCarthy (c09) — Heat Pump — 2 jobs
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, total_amount, currency, created_by, is_archived)
  VALUES (
    'Heat Pump — Defrost Fault / E3 Code',
    c09,
    'Unit showing E3 fault and going into defrost repeatedly during mild weather (10°C). Not reaching target temperature.',
    'Found outdoor unit partially blocked by overgrown hedge restricting airflow. Cleared vegetation, cleaned coil with foaming coil cleaner, reset fault memory. Monitored for 1 hour — no further faults. Advised client to trim hedge.',
    'None — labour only',
    'completed', '2024-10-08', 95.00, 'EUR', admin_id, true
  );

  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Heat Pump Service — Samsung Monobloc',
    c09,
    'Annual service.',
    'Full annual service and inspection. Cleaned outdoor coil and filters, checked refrigerant parameters, tested all zones. All parameters within specification.',
    'Air filters x2',
    'completed', '2025-03-10', '2026-03-10', 185.00, 'EUR', admin_id
  );

  -- Ciara O'Sullivan (c10) — Gas Boiler — 1 job
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Gas Boiler Service — Ideal Logic',
    c10,
    'Annual service.',
    'Service completed. Cleaned burner and heat exchanger, tested flue, checked all safety controls. Expansion vessel pressure found low at 0.3 bar — re-charged to 1.0 bar. All readings within limits.',
    'Service gaskets, expansion vessel Schrader valve',
    'completed', '2024-12-18', '2025-12-18', 120.00, 'EUR', admin_id
  );

  -- Michael Doyle (c11) — Oil Boiler — 1 job
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Oil Boiler Service — Warmflow Agentis',
    c11,
    'Annual service.',
    'Service completed. Good combustion readings (CO2 12.8%). Replaced standard service parts, tested all controls. Heat exchanger in good condition.',
    'Nozzle 0.75 GPH, oil filter',
    'completed', '2025-01-30', '2026-01-30', 145.00, 'EUR', admin_id
  );

  -- Aisling O'Neill (c12) — Heat Pump — 1 job
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Heat Pump Service — LG Therma V',
    c12,
    'First annual service on new install.',
    'Cleaned filters and outdoor coil, checked refrigerant charge, verified all zone control and UFH manifold actuators. System performing very well — COP averaging 3.8 across the season.',
    'Air filters x2',
    'completed', '2025-02-05', '2026-02-05', 185.00, 'EUR', admin_id
  );

  -- Conor Quinn (c13) — Gas Boiler — 1 job
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Gas Boiler Service — Baxi Duo-tec',
    c13,
    'Annual service.',
    'Full service. Cleaned heat exchanger and burner, flue gas analysis passed. Ignition electrode found worn — replaced. Tested all controls and safety devices.',
    'Service gaskets, ignition electrode',
    'completed', '2025-01-28', '2026-01-28', 135.00, 'EUR', admin_id
  );

  -- Fiona Brennan (c14) — Oil Boiler — 2 jobs
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, total_amount, currency, created_by, is_archived)
  VALUES (
    'Oil Boiler — Solenoid Valve Fault',
    c14,
    'Boiler firing but cutting out after 2-3 minutes. Client has no heating or hot water.',
    'Diagnosed faulty oil solenoid valve — sticking and causing over-fire protection to trip. Replaced solenoid valve and reset all safety controls. Tested over 10 ignition cycles — all successful.',
    'Oil solenoid valve',
    'completed', '2023-11-14', 275.00, 'EUR', admin_id, true
  );

  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Oil Boiler Service — Firebird Enviromax',
    c14,
    'Annual service.',
    'Full combustion service. All readings excellent following solenoid repair last year. Replaced standard service items.',
    'Nozzle 0.65 GPH, oil filter',
    'completed', '2025-03-05', '2026-03-05', 145.00, 'EUR', admin_id
  );

  -- Liam Farrell (c15) — Heat Pump — 1 job
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Heat Pump Service — Mitsubishi Ecodan',
    c15,
    'Annual service.',
    'Annual inspection and service. Cleaned outdoor coil and air filters, verified all refrigerant parameters and flow temperatures. System in good condition.',
    'Air filters x2',
    'completed', '2025-02-28', '2026-02-28', 185.00, 'EUR', admin_id
  );

  -- Orla Connolly (c16) — Gas Boiler — 2 jobs
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, total_amount, currency, created_by)
  VALUES (
    'Gas Boiler — No Hot Water (Diverter Valve)',
    c16,
    'Combi boiler producing heating fine but no hot water. DHW mode not activating when tap opened.',
    'Diagnosed faulty diverter valve — not switching from heating to DHW mode. Replaced diverter valve cartridge. Tested both heating and hot water modes extensively.',
    'Diverter valve cartridge',
    'completed', '2025-01-19', 220.00, 'EUR', admin_id
  );

  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Gas Boiler Service — Vaillant ecoTEC',
    c16,
    'Annual service following diverter valve repair.',
    'Full annual service completed. Good combustion readings. Cleaned heat exchanger and burner, replaced service parts. System in good condition.',
    'Service kit',
    'in_progress', '2025-03-20', '2026-03-20', 120.00, 'EUR', admin_id
  );

  -- Eoin Dunne (c17) — Oil Boiler — 1 job
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Oil Boiler Service',
    c17,
    'Annual service.',
    'Service completed. Good combustion readings. All controls tested and working correctly.',
    'Nozzle 0.65 GPH, oil filter, gaskets',
    'completed', '2025-02-12', '2026-02-12', 145.00, 'EUR', admin_id
  );

  -- Roisin Nolan (c18) — Heat Pump — 2 jobs
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, total_amount, currency, created_by)
  VALUES (
    'Heat Pump — Noisy Outdoor Unit',
    c18,
    'Client reporting loud rattling noise from outdoor unit, especially at night. Keeping neighbours awake.',
    'Found loose fan blade mounting nut vibrating against housing. Tightened all fan assembly fixings, applied anti-vibration pad set under unit feet. Test run — noise fully resolved.',
    'Anti-vibration pad set x4',
    'completed', '2025-01-25', 110.00, 'EUR', admin_id
  );

  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Heat Pump Service',
    c18,
    'Annual service.',
    'Full annual service completed. Cleaned outdoor coil and filters, verified all refrigerant and temperature parameters. All within spec.',
    'Air filters x2',
    'in_progress', '2025-03-18', '2026-03-18', 185.00, 'EUR', admin_id
  );

  -- Cathal Burke (c19) — Gas Boiler — 1 job
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Gas Boiler Service — Remeha Avanta',
    c19,
    'Annual service.',
    'Service completed. Cleaned heat exchanger, burner and condensate trap. Flue gas analysis good. Condensate trap seal found leaking slightly — replaced.',
    'Service gaskets, condensate trap seal',
    'completed', '2025-02-20', '2026-02-20', 120.00, 'EUR', admin_id
  );

  -- Sinead Power (c20) — Oil Boiler — 2 jobs
  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, next_service_date, total_amount, currency, created_by)
  VALUES (
    'Annual Oil Boiler Service — Riello',
    c20,
    'Annual service.',
    'Full combustion service completed. All readings within specification. Heat exchanger clean. Tested all controls.',
    'Nozzle 0.60 GPH, oil filter, gaskets',
    'completed', '2025-03-08', '2026-03-08', 145.00, 'EUR', admin_id
  );

  INSERT INTO public.jobs (title, client_id, issue_description, work_done, parts_replaced, status, service_date, total_amount, currency, created_by)
  VALUES (
    'Oil Boiler — Fuel Pump Failure',
    c20,
    'Boiler intermittently failing to ignite. Suspected fuel delivery issue. Client has been without heating for 2 days.',
    'Confirmed faulty Riello fuel pump — pressure reading only 6 bar instead of 10 bar spec. Replaced pump unit, set pressure to 10 bar, replaced nozzle while accessible. Tested 10 ignition cycles — all successful.',
    'Riello fuel pump, nozzle 0.60 GPH',
    'in_progress', '2025-03-21', 385.00, 'EUR', admin_id
  );

  RAISE NOTICE 'Demo data inserted: 20 clients, 35 jobs. All done.';
END $$;
