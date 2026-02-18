-- Bulk test data: 20 dummy players for ФК Вихър Войводиново
-- Run this in the Supabase SQL Editor
-- Uses the existing club_id from the initial seed migration

INSERT INTO public.players (club_id, full_name, nfc_tag_id, status, jersey_number, birth_date, team_group, last_payment_date)
VALUES
  -- U8 (born 2018)
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Иван Иванов',       'test_01', 'paid',    '№7',  '2018-03-12', 'U8', now()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Георги Петров',      'test_02', 'warning', '№3',  '2018-07-25', 'U8', now() - interval '25 days'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Димитър Стоянов',    'test_03', 'overdue', '№11', '2018-01-08', 'U8', now() - interval '50 days'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Александър Николов',  'test_04', 'paid',    '№1',  '2018-11-30', 'U8', now()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Стефан Тодоров',     'test_05', 'warning', '№9',  '2018-05-14', 'U8', now() - interval '20 days'),

  -- U10 (born 2016)
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Николай Георгиев',   'test_06', 'paid',    '№10', '2016-02-19', 'U10', now()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Красимир Димитров',  'test_07', 'overdue', '№5',  '2016-09-03', 'U10', now() - interval '45 days'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Петър Василев',      'test_08', 'paid',    '№22', '2016-06-11', 'U10', now()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Мартин Колев',       'test_09', 'warning', '№8',  '2016-12-28', 'U10', now() - interval '18 days'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Христо Марков',      'test_10', 'paid',    '№4',  '2016-04-07', 'U10', now()),

  -- U12 (born 2014)
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Борис Атанасов',     'test_11', 'overdue', '№17', '2014-08-22', 'U12', now() - interval '60 days'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Тодор Костов',       'test_12', 'paid',    '№6',  '2014-01-15', 'U12', now()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Васил Христов',      'test_13', 'warning', '№23', '2014-10-09', 'U12', now() - interval '22 days'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Емил Борисов',       'test_14', 'paid',    '№2',  '2014-05-31', 'U12', now()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Калоян Методиев',    'test_15', 'overdue', '№19', '2014-03-17', 'U12', now() - interval '40 days'),

  -- U14 (born 2012)
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Радослав Павлов',    'test_16', 'paid',    '№13', '2012-07-04', 'U14', now()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Даниел Кирилов',     'test_17', 'warning', '№33', '2012-11-21', 'U14', now() - interval '28 days'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Момчил Стефанов',    'test_18', 'paid',    '№77', '2012-02-14', 'U14', now()),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Пламен Захариев',    'test_19', 'overdue', '№15', '2012-09-08', 'U14', now() - interval '55 days'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Светослав Младенов', 'test_20', 'paid',    '№99', '2012-06-26', 'U14', now());
