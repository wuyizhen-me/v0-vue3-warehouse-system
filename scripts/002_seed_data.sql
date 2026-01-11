-- 插入示例商品数据
INSERT INTO products (name, sku, category, description, unit) VALUES
('iPhone 15 Pro', 'APPLE-IP15P-256', '电子产品', '256GB 钛金属', '台'),
('MacBook Pro 14', 'APPLE-MBP14-M3', '电子产品', 'M3芯片 16GB内存', '台'),
('AirPods Pro 2', 'APPLE-APP2', '电子产品', '主动降噪耳机', '副'),
('iPad Air', 'APPLE-IPAD-AIR', '电子产品', '10.9英寸 64GB', '台'),
('Apple Watch Series 9', 'APPLE-AW9', '电子产品', '41mm GPS版', '只'),
('罗技MX Master 3S', 'LOGI-MXM3S', '配件', '无线鼠标', '个'),
('戴尔27寸显示器', 'DELL-MON27', '配件', '2K分辨率', '台'),
('雷蛇键盘', 'RAZER-KB-PRO', '配件', '机械键盘 青轴', '个');

-- 插入示例库存数据
INSERT INTO inventory_stock (product_id, quantity, min_stock_alert) VALUES
(1, 50, 10),
(2, 30, 5),
(3, 100, 20),
(4, 45, 10),
(5, 60, 15),
(6, 80, 20),
(7, 25, 8),
(8, 40, 10);

-- 插入示例入库记录
INSERT INTO inventory_inbound (product_id, quantity, unit_price, total_price, batch_number, supplier, warehouse_location, status, inbound_date) VALUES
(1, 20, 7999.00, 159980.00, 'BATCH-20240101-001', '苹果供应商', 'A区-01', 'completed', '2024-01-15'),
(2, 10, 14999.00, 149990.00, 'BATCH-20240101-002', '苹果供应商', 'A区-02', 'completed', '2024-01-16'),
(3, 50, 1899.00, 94950.00, 'BATCH-20240102-001', '苹果供应商', 'B区-01', 'completed', '2024-01-20'),
(6, 30, 599.00, 17970.00, 'BATCH-20240103-001', '罗技代理商', 'C区-01', 'completed', '2024-01-22'),
(7, 15, 2199.00, 32985.00, 'BATCH-20240104-001', '戴尔直销', 'C区-02', 'completed', '2024-01-25');
