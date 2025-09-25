-- Vietnamese Laptop Repair Shop Seed Data

-- Insert sample customers
insert into customers (phone, full_name, address, notes) values
('0901234567', 'Nguyễn Văn An', '123 Đường ABC, Quận 1, TP.HCM', 'Khách hàng VIP'),
('0912345678', 'Trần Thị Bình', '456 Đường DEF, Quận 2, TP.HCM', 'Thường xuyên sửa laptop Dell'),
('0923456789', 'Lê Minh Cường', '789 Đường GHI, Quận 3, TP.HCM', null),
('0934567890', 'Phạm Thị Dung', '321 Đường JKL, Quận 4, TP.HCM', 'Có laptop gaming'),
('0945678901', 'Hoàng Văn Em', '654 Đường MNO, Quận 5, TP.HCM', null),
('0956789012', 'Võ Thị Lan', '987 Đường PQR, Quận 6, TP.HCM', 'Sinh viên IT'),
('0967890123', 'Đỗ Văn Hùng', '159 Đường STU, Quận 7, TP.HCM', 'Freelancer'),
('0978901234', 'Bùi Thị Mai', '753 Đường VWX, Quận 8, TP.HCM', 'Nhân viên văn phòng'),
('0989012345', 'Phan Văn Nam', '951 Đường YZ, Quận 9, TP.HCM', 'Game thủ chuyên nghiệp'),
('0990123456', 'Lưu Thị Oanh', '357 Đường ABC, Quận 10, TP.HCM', null),
('0901111222', 'Huỳnh Văn Phúc', '246 Đường DEF, Quận 11, TP.HCM', 'Kỹ sư phần mềm'),
('0902222333', 'Ngô Thị Quỳnh', '135 Đường GHI, Quận 12, TP.HCM', 'Thiết kế đồ họa'),
('0903333444', 'Trịnh Văn Sơn', '864 Đường JKL, Bình Thạnh, TP.HCM', 'Chủ shop online'),
('0904444555', 'Đinh Thị Trang', '579 Đường MNO, Gò Vấp, TP.HCM', null),
('0905555666', 'Lý Văn Ước', '321 Đường PQR, Phú Nhuận, TP.HCM', 'Blogger công nghệ'),
('0906666777', 'Cao Thị Vân', '468 Đường STU, Tân Bình, TP.HCM', 'Nhà báo'),
('0907777888', 'Dương Văn Xuân', '792 Đường VWX, Tân Phú, TP.HCM', 'Giáo viên'),
('0908888999', 'Hồ Thị Yến', '147 Đường YZ, Bình Tân, TP.HCM', 'Kế toán'),
('0909999000', 'Vũ Văn Zung', '963 Đường ABC, Thủ Đức, TP.HCM', 'Streamer'),
('0911111333', 'Tôn Thị Ánh', '258 Đường DEF, Quận 1, TP.HCM', 'Marketing');

-- Insert sample parts inventory
insert into parts (name, category, brand, model_compatibility, current_stock, unit_cost, unit_price, selling_price, supplier_info) values
('RAM DDR4 8GB', 'Memory', 'Samsung', '{"Dell Inspiron", "HP Pavilion", "Lenovo ThinkPad"}', 25, 800000, 1200000, 1200000, 'Nhà cung cấp A - 0901111111'),
('SSD 256GB', 'Storage', 'Samsung', '{"Universal"}', 15, 1500000, 2200000, 2200000, 'Nhà cung cấp B - 0902222222'),
('Màn hình laptop 15.6"', 'Display', 'BOE', '{"Dell Inspiron 15", "HP 15"}', 8, 2000000, 3500000, 3500000, 'Nhà cung cấp C - 0903333333'),
('Pin laptop Dell', 'Battery', 'Dell', '{"Dell Inspiron", "Dell Latitude"}', 12, 1200000, 1800000, 1800000, 'Nhà cung cấp D - 0904444444'),
('Bàn phím laptop HP', 'Input', 'HP', '{"HP Pavilion", "HP ProBook"}', 10, 500000, 800000, 800000, 'Nhà cung cấp E - 0905555555'),
('Quạt tản nhiệt', 'Cooling', 'Generic', '{"Universal"}', 20, 300000, 500000, 500000, 'Nhà cung cấp F - 0906666666'),
('Adapter 65W', 'Power', 'Generic', '{"Universal"}', 18, 400000, 600000, 600000, 'Nhà cung cấp G - 0907777777'),
('Hard Drive 1TB', 'Storage', 'Western Digital', '{"Universal"}', 6, 1800000, 2800000, 2800000, 'Nhà cung cấp H - 0908888888');

-- Insert sample repair tickets (25+ tickets with diverse Vietnamese scenarios)
insert into repair_tickets (
  customer_phone,
  device_info,
  issue_description,
  status,
  total_cost,
  deposit_amount,
  estimated_completion
) values
-- Week 1 tickets
(
  '0901234567',
  '{"brand": "Dell", "model": "Inspiron 15 3000", "serial_number": "DL123456", "initial_condition": "Laptop không khởi động được"}',
  'Laptop không bật được, đèn nguồn không sáng. Nghi ngờ adapter hoặc bo mạch chủ bị hỏng.',
  'in_diagnosis',
  1500000,
  500000,
  now() + interval '3 days'
),
(
  '0912345678',
  '{"brand": "HP", "model": "Pavilion 14", "serial_number": "HP789012", "initial_condition": "Màn hình bị vỡ"}',
  'Màn hình laptop bị vỡ do rơi, cần thay màn hình mới.',
  'waiting_parts',
  3500000,
  1000000,
  now() + interval '5 days'
),
(
  '0923456789',
  '{"brand": "Lenovo", "model": "ThinkPad E14", "serial_number": "LN345678", "initial_condition": "Chạy chậm"}',
  'Laptop chạy rất chậm, khởi động lâu. Cần nâng cấp RAM và SSD.',
  'approved_for_repair',
  3000000,
  1500000,
  now() + interval '2 days'
),
(
  '0934567890',
  '{"brand": "Asus", "model": "ROG Strix G15", "serial_number": "AS901234", "initial_condition": "Quá nóng"}',
  'Laptop bị quá nóng khi chơi game, quạt tản nhiệt kêu to.',
  'completed',
  800000,
  300000,
  now() - interval '1 day'
),
(
  '0945678901',
  '{"brand": "Acer", "model": "Aspire 5", "serial_number": "AC567890", "initial_condition": "Pin không sạc"}',
  'Pin laptop không sạc được, cắm adapter vẫn chạy bình thường.',
  'ready_for_pickup',
  1800000,
  600000,
  now()
),
-- Week 2 tickets
(
  '0956789012',
  '{"brand": "Dell", "model": "Vostro 3400", "serial_number": "DL789123", "initial_condition": "Bàn phím không hoạt động"}',
  'Một số phím bàn phím không hoạt động sau khi đổ nước lên laptop.',
  'device_received',
  1200000,
  400000,
  now() + interval '4 days'
),
(
  '0967890123',
  '{"brand": "HP", "model": "ProBook 450", "serial_number": "HP456789", "initial_condition": "Màn hình nhấp nháy"}',
  'Màn hình nhấp nháy liên tục, có thể do cable màn hình bị lỏng.',
  'in_diagnosis',
  2200000,
  700000,
  now() + interval '3 days'
),
(
  '0978901234',
  '{"brand": "Lenovo", "model": "IdeaPad Gaming 3", "serial_number": "LN654321", "initial_condition": "Không nhận USB"}',
  'Cổng USB không nhận thiết bị nào, có thể bị hỏng bo mạch chủ.',
  'waiting_parts',
  2800000,
  1000000,
  now() + interval '6 days'
),
(
  '0989012345',
  '{"brand": "Asus", "model": "TUF Gaming A15", "serial_number": "AS147258", "initial_condition": "Tự động tắt máy"}',
  'Laptop tự động tắt máy khi chơi game, nghi ngờ do quá nhiệt.',
  'approved_for_repair',
  1500000,
  500000,
  now() + interval '2 days'
),
(
  '0990123456',
  '{"brand": "Acer", "model": "Nitro 5", "serial_number": "AC369258", "initial_condition": "Âm thanh bị méo"}',
  'Loa phát âm thanh bị méo và nhỏ, có thể do loa bị hỏng.',
  'completed',
  600000,
  200000,
  now() - interval '2 days'
),
-- Week 3 tickets
(
  '0901111222',
  '{"brand": "Dell", "model": "XPS 13", "serial_number": "DL987654", "initial_condition": "Laptop chạy rất chậm"}',
  'Laptop chạy rất chậm, đôi khi bị đơ. Cần làm sạch và tối ưu hệ thống.',
  'ready_for_pickup',
  800000,
  300000,
  now()
),
(
  '0902222333',
  '{"brand": "HP", "model": "Envy x360", "serial_number": "HP753951", "initial_condition": "Touchpad không hoạt động"}',
  'Touchpad không phản hồi, chỉ có thể dùng chuột ngoài.',
  'device_received',
  1000000,
  300000,
  now() + interval '3 days'
),
(
  '0903333444',
  '{"brand": "Lenovo", "model": "Legion 5", "serial_number": "LN159753", "initial_condition": "Wifi không kết nối"}',
  'Không thể kết nối wifi, card mạng không được nhận diện.',
  'in_diagnosis',
  1400000,
  500000,
  now() + interval '4 days'
),
(
  '0904444555',
  '{"brand": "Asus", "model": "ZenBook 14", "serial_number": "AS852741", "initial_condition": "Màn hình bị sọc"}',
  'Màn hình xuất hiện các đường sọc dọc, có thể do LCD bị hỏng.',
  'waiting_parts',
  4200000,
  1500000,
  now() + interval '7 days'
),
(
  '0905555666',
  '{"brand": "Acer", "model": "Swift 3", "serial_number": "AC741963", "initial_condition": "Không sạc pin"}',
  'Laptop không sạc pin, chỉ chạy khi cắm điện trực tiếp.',
  'approved_for_repair',
  2100000,
  700000,
  now() + interval '3 days'
),
-- Week 4 tickets
(
  '0906666777',
  '{"brand": "Dell", "model": "Latitude 3420", "serial_number": "DL456123", "initial_condition": "Camera không hoạt động"}',
  'Camera tích hợp không hoạt động, không thể video call.',
  'completed',
  900000,
  300000,
  now() - interval '1 day'
),
(
  '0907777888',
  '{"brand": "HP", "model": "EliteBook 840", "serial_number": "HP321654", "initial_condition": "Quạt kêu to"}',
  'Quạt tản nhiệt kêu rất to, có thể do bụi bặm hoặc quạt bị hỏng.',
  'ready_for_pickup',
  700000,
  250000,
  now()
),
(
  '0908888999',
  '{"brand": "Lenovo", "model": "ThinkBook 14", "serial_number": "LN987321", "initial_condition": "Bị nghẹt máy"}',
  'Laptop thường xuyên bị nghẹt khi mở nhiều ứng dụng.',
  'device_received',
  1600000,
  600000,
  now() + interval '4 days'
),
(
  '0909999000',
  '{"brand": "Asus", "model": "VivoBook 15", "serial_number": "AS654789", "initial_condition": "Ổ cứng kêu lạ"}',
  'Ổ cứng phát ra tiếng kêu lạ, có thể sắp hỏng. Cần backup dữ liệu.',
  'in_diagnosis',
  2500000,
  800000,
  now() + interval '5 days'
),
(
  '0911111333',
  '{"brand": "Acer", "model": "Predator Helios 300", "serial_number": "AC159357", "initial_condition": "Màn hình không hiển thị"}',
  'Máy bật được nhưng màn hình không hiển thị gì, đèn bàn phím vẫn sáng.',
  'waiting_parts',
  3800000,
  1200000,
  now() + interval '8 days'
),
-- Additional tickets for variety
(
  '0901234567',
  '{"brand": "MSI", "model": "GF63 Thin", "serial_number": "MSI123789", "initial_condition": "Pin phồng"}',
  'Pin laptop bị phồng, cần thay pin mới ngay lập tức vì nguy hiểm.',
  'approved_for_repair',
  2200000,
  800000,
  now() + interval '3 days'
),
(
  '0912345678',
  '{"brand": "Samsung", "model": "Galaxy Book Pro", "serial_number": "SM789456", "initial_condition": "Bị virus"}',
  'Laptop bị nhiễm virus nghiêm trọng, cần format và cài lại hệ điều hành.',
  'completed',
  500000,
  200000,
  now() - interval '3 days'
),
(
  '0923456789',
  '{"brand": "LG", "model": "Gram 17", "serial_number": "LG456123", "initial_condition": "Bàn phím dính phím"}',
  'Một số phím bàn phím bị dính, gõ không được. Cần vệ sinh hoặc thay bàn phím.',
  'ready_for_pickup',
  1100000,
  400000,
  now()
),
(
  '0934567890',
  '{"brand": "Dell", "model": "Inspiron 16 Plus", "serial_number": "DL741852", "initial_condition": "Chạy game giật lag"}',
  'Laptop chạy game bị giật lag nghiêm trọng, có thể do card đồ họa hoặc RAM.',
  'device_received',
  2700000,
  1000000,
  now() + interval '5 days'
),
(
  '0945678901',
  '{"brand": "HP", "model": "Omen 15", "serial_number": "HP963852", "initial_condition": "Cháy adapter"}',
  'Adapter bị cháy tạo mùi khét, laptop không thể sạc pin.',
  'in_diagnosis',
  1300000,
  450000,
  now() + interval '2 days'
);