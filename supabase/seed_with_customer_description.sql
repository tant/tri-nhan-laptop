-- Vietnamese Laptop Repair Shop Seed Data with customer_description

-- Insert sample customers
insert into customers (phone, full_name, address, notes) values
('0901234567', 'Nguyễn Văn An', '123 Đường ABC, Quận 1, TP.HCM', 'Khách hàng VIP'),
('0912345678', 'Trần Thị Bình', '456 Đường DEF, Quận 2, TP.HCM', 'Thường xuyên sửa laptop Dell'),
('0923456789', 'Lê Minh Cường', '789 Đường GHI, Quận 3, TP.HCM', null),
('0934567890', 'Phạm Thị Dung', '321 Đường JKL, Quận 4, TP.HCM', 'Có laptop gaming'),
('0945678901', 'Hoàng Văn Em', '654 Đường MNO, Quận 5, TP.HCM', null);

-- Insert sample parts inventory
insert into parts (name, category, brand, model_compatibility, current_stock, unit_cost, unit_price, selling_price, supplier_info) values
('RAM DDR4 8GB', 'Memory', 'Samsung', '{"Dell Inspiron", "HP Pavilion", "Lenovo ThinkPad"}', 25, 800000, 1200000, 1200000, 'Nhà cung cấp A - 0901111111'),
('SSD 256GB', 'Storage', 'Samsung', '{"Universal"}', 15, 1500000, 2200000, 2200000, 'Nhà cung cấp B - 0902222222'),
('Màn hình laptop 15.6"', 'Display', 'BOE', '{"Dell Inspiron 15", "HP 15"}', 8, 2000000, 3500000, 3500000, 'Nhà cung cấp C - 0903333333'),
('Pin laptop Dell', 'Battery', 'Dell', '{"Dell Inspiron", "Dell Latitude"}', 12, 1200000, 1800000, 1800000, 'Nhà cung cấp D - 0904444444');

-- Insert sample repair tickets with customer_description
insert into repair_tickets (
  customer_phone,
  device_info,
  issue_description,
  customer_description,
  status,
  total_cost,
  deposit_amount,
  estimated_completion
) values
(
  '0901234567',
  '{"brand": "Dell", "model": "Inspiron 15 3000", "serial_number": "DL123456", "initial_condition": "Laptop không khởi động được"}',
  'Laptop không bật được, đèn nguồn không sáng. Nghi ngờ adapter hoặc bo mạch chủ bị hỏng.',
  'Máy tôi không khởi động được từ hôm qua, bấm nút nguồn không có phản ứng gì.',
  'in_diagnosis',
  1500000,
  500000,
  now() + interval '3 days'
),
(
  '0912345678',
  '{"brand": "HP", "model": "Pavilion 14", "serial_number": "HP789012", "initial_condition": "Màn hình bị vỡ"}',
  'Màn hình laptop bị vỡ do rơi, cần thay màn hình mới.',
  'Tôi làm rơi laptop, màn hình nứt toàn tập không nhìn thấy gì.',
  'waiting_parts',
  3500000,
  1000000,
  now() + interval '5 days'
),
(
  '0923456789',
  '{"brand": "Lenovo", "model": "ThinkPad E14", "serial_number": "LN345678", "initial_condition": "Chạy chậm"}',
  'Laptop chạy rất chậm, khởi động lâu. Cần nâng cấp RAM và SSD.',
  'Máy chạy rất chậm, mở một ứng dụng cũng phải đợi lâu lắm.',
  'approved_for_repair',
  3000000,
  1500000,
  now() + interval '2 days'
),
(
  '0934567890',
  '{"brand": "Asus", "model": "ROG Strix G15", "serial_number": "AS901234", "initial_condition": "Quá nóng"}',
  'Laptop bị quá nóng khi chơi game, quạt tản nhiệt kêu to.',
  'Khi chơi game máy nóng lắm, quạt kêu to như máy bay cất cánh.',
  'completed',
  800000,
  300000,
  now() - interval '1 day'
),
(
  '0945678901',
  '{"brand": "Acer", "model": "Aspire 5", "serial_number": "AC567890", "initial_condition": "Pin không sạc"}',
  'Pin laptop không sạc được, cắm adapter vẫn chạy bình thường.',
  'Pin không sạc được, chỉ chạy khi cắm điện.',
  'ready_for_pickup',
  1800000,
  600000,
  now()
);