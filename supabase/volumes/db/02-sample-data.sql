-- Sample Data for Vietnamese Laptop Repair Shop
-- This script creates the business schema and inserts sample data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parts table
CREATE TABLE IF NOT EXISTS public.parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 5,
    supplier VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create repair tickets table
CREATE TABLE IF NOT EXISTS public.repair_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    device_type VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    issue_description TEXT NOT NULL,
    diagnosis TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'received',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    received_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    promised_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create repair_parts junction table
CREATE TABLE IF NOT EXISTS public.repair_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_ticket_id UUID NOT NULL REFERENCES public.repair_tickets(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_parts_part_number ON public.parts(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_category ON public.parts(category);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_customer_id ON public.repair_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_status ON public.repair_tickets(status);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_ticket_number ON public.repair_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_repair_parts_repair_ticket_id ON public.repair_parts(repair_ticket_id);
CREATE INDEX IF NOT EXISTS idx_repair_parts_part_id ON public.repair_parts(part_id);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_parts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users on customers"
    ON public.customers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on parts"
    ON public.parts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on repair_tickets"
    ON public.repair_tickets FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on repair_parts"
    ON public.repair_parts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert sample customers
INSERT INTO public.customers (name, phone, email, address) VALUES
('Nguyễn Văn An', '0901234567', 'nguyenvanan@gmail.com', '123 Đường Lê Lợi, Quận 1, TP.HCM'),
('Trần Thị Bình', '0912345678', 'tranthibibh@yahoo.com', '456 Đường Nguyễn Huệ, Quận 3, TP.HCM'),
('Lê Minh Cường', '0923456789', 'leminhcuong@outlook.com', '789 Đường Võ Văn Tần, Quận 10, TP.HCM'),
('Phạm Thị Dung', '0934567890', 'phamthidung@gmail.com', '321 Đường Hai Bà Trưng, Quận 1, TP.HCM'),
('Hoàng Văn Em', '0945678901', 'hoangvanem@hotmail.com', '654 Đường Cách Mạng Tháng 8, Quận Tân Bình, TP.HCM')
ON CONFLICT (phone) DO NOTHING;

-- Insert sample parts
INSERT INTO public.parts (name, part_number, category, price, stock_quantity, min_stock_level, supplier, description) VALUES
('RAM DDR4 8GB', 'RAM-DDR4-8GB-001', 'Memory', 1500000, 25, 5, 'Kingston Technology', 'RAM DDR4 8GB 2666MHz cho laptop'),
('SSD 256GB SATA', 'SSD-256GB-002', 'Storage', 1200000, 15, 3, 'Samsung Electronics', 'Ổ cứng SSD 256GB SATA III'),
('Màn hình LCD 15.6 inch', 'LCD-156-003', 'Display', 2500000, 8, 2, 'LG Display', 'Màn hình LCD 15.6 inch Full HD'),
('Bàn phím Laptop Dell', 'KBD-DELL-004', 'Input', 450000, 12, 3, 'Dell Inc', 'Bàn phím thay thế cho Dell Latitude'),
('Pin Laptop HP', 'BAT-HP-005', 'Battery', 800000, 10, 2, 'HP Inc', 'Pin Li-ion 6 cell cho HP Pavilion'),
('Quạt tản nhiệt CPU', 'FAN-CPU-006', 'Cooling', 350000, 20, 5, 'Cooler Master', 'Quạt tản nhiệt CPU cho laptop'),
('Adapter 90W', 'ADP-90W-007', 'Power', 600000, 18, 4, 'Delta Electronics', 'Adapter nguồn 90W đa năng'),
('Ổ cứng HDD 1TB', 'HDD-1TB-008', 'Storage', 1000000, 12, 3, 'Western Digital', 'Ổ cứng HDD 1TB 5400RPM'),
('RAM DDR3 4GB', 'RAM-DDR3-4GB-009', 'Memory', 800000, 30, 8, 'Corsair', 'RAM DDR3 4GB 1600MHz'),
('Webcam HD', 'CAM-HD-010', 'Camera', 250000, 15, 3, 'Logitech', 'Webcam HD tích hợp micro')
ON CONFLICT (part_number) DO NOTHING;

-- Insert sample repair tickets
INSERT INTO public.repair_tickets (
    ticket_number, customer_id, device_type, brand, model, serial_number,
    issue_description, diagnosis, status, priority, estimated_cost, received_date, promised_date
) VALUES
(
    'TK001',
    (SELECT id FROM public.customers WHERE phone = '0901234567' LIMIT 1),
    'Laptop', 'Dell', 'Latitude 5520', 'DL001234567',
    'Máy không khởi động được, đèn nguồn không sáng',
    'Adapter nguồn bị hỏng, cần thay thế',
    'in_progress', 'high', 650000,
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '1 day'
),
(
    'TK002',
    (SELECT id FROM public.customers WHERE phone = '0912345678' LIMIT 1),
    'Laptop', 'HP', 'Pavilion 15', 'HP987654321',
    'Màn hình bị vỡ, hiển thị không rõ',
    'Màn hình LCD bị hỏng, cần thay mới',
    'waiting_parts', 'medium', 2800000,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '3 days'
),
(
    'TK003',
    (SELECT id FROM public.customers WHERE phone = '0923456789' LIMIT 1),
    'Laptop', 'Lenovo', 'ThinkPad X1', 'LN456789123',
    'Máy chạy chậm, thường xuyên bị đơ',
    'RAM không đủ, SSD gần đầy, cần nâng cấp',
    'completed', 'low', 2800000,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
),
(
    'TK004',
    (SELECT id FROM public.customers WHERE phone = '0934567890' LIMIT 1),
    'Laptop', 'Asus', 'VivoBook 15', 'AS789123456',
    'Bàn phím một số phím không hoạt động',
    'Bàn phím bị hỏng, cần thay thế',
    'received', 'medium', 500000,
    NOW(),
    NOW() + INTERVAL '2 days'
),
(
    'TK005',
    (SELECT id FROM public.customers WHERE phone = '0945678901' LIMIT 1),
    'Laptop', 'Acer', 'Aspire 5', 'AC321654987',
    'Pin không sạc được, máy chỉ chạy khi cắm điện',
    'Pin hỏng, cần thay pin mới',
    'waiting_customer', 'medium', 850000,
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '1 day'
)
ON CONFLICT (ticket_number) DO NOTHING;

-- Insert sample repair parts (linking tickets with parts used)
INSERT INTO public.repair_parts (repair_ticket_id, part_id, quantity, unit_price) VALUES
(
    (SELECT id FROM public.repair_tickets WHERE ticket_number = 'TK001' LIMIT 1),
    (SELECT id FROM public.parts WHERE part_number = 'ADP-90W-007' LIMIT 1),
    1, 600000
),
(
    (SELECT id FROM public.repair_tickets WHERE ticket_number = 'TK002' LIMIT 1),
    (SELECT id FROM public.parts WHERE part_number = 'LCD-156-003' LIMIT 1),
    1, 2500000
),
(
    (SELECT id FROM public.repair_tickets WHERE ticket_number = 'TK003' LIMIT 1),
    (SELECT id FROM public.parts WHERE part_number = 'RAM-DDR4-8GB-001' LIMIT 1),
    1, 1500000
),
(
    (SELECT id FROM public.repair_tickets WHERE ticket_number = 'TK003' LIMIT 1),
    (SELECT id FROM public.parts WHERE part_number = 'SSD-256GB-002' LIMIT 1),
    1, 1200000
),
(
    (SELECT id FROM public.repair_tickets WHERE ticket_number = 'TK004' LIMIT 1),
    (SELECT id FROM public.parts WHERE part_number = 'KBD-DELL-004' LIMIT 1),
    1, 450000
),
(
    (SELECT id FROM public.repair_tickets WHERE ticket_number = 'TK005' LIMIT 1),
    (SELECT id FROM public.parts WHERE part_number = 'BAT-HP-005' LIMIT 1),
    1, 800000
);

-- Update parts stock quantities after usage
UPDATE public.parts SET stock_quantity = stock_quantity - 1 WHERE part_number = 'ADP-90W-007';
UPDATE public.parts SET stock_quantity = stock_quantity - 1 WHERE part_number = 'LCD-156-003';
UPDATE public.parts SET stock_quantity = stock_quantity - 1 WHERE part_number = 'RAM-DDR4-8GB-001';
UPDATE public.parts SET stock_quantity = stock_quantity - 1 WHERE part_number = 'SSD-256GB-002';
UPDATE public.parts SET stock_quantity = stock_quantity - 1 WHERE part_number = 'KBD-DELL-004';
UPDATE public.parts SET stock_quantity = stock_quantity - 1 WHERE part_number = 'BAT-HP-005';

-- Update completed ticket final cost
UPDATE public.repair_tickets SET final_cost = estimated_cost WHERE status = 'completed';
UPDATE public.repair_tickets SET completed_date = NOW() - INTERVAL '1 day' WHERE status = 'completed';