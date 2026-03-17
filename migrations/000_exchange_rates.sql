-- Exchange Rates table for multi-currency support
-- Admin can update rates at any time via the admin panel

CREATE TABLE IF NOT EXISTS exchange_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  currencyCode VARCHAR(3) NOT NULL UNIQUE,
  currencyName VARCHAR(50) NOT NULL,
  currencyNameAr VARCHAR(50) NOT NULL DEFAULT '',
  currencySymbol VARCHAR(10) NOT NULL DEFAULT '',
  rateToUsd DECIMAL(12,6) NOT NULL,
  rateFromUsd DECIMAL(12,6) NOT NULL,
  isActive TINYINT DEFAULT 1,
  updatedBy INT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed with initial rates (March 2026 approximate)
INSERT INTO exchange_rates (currencyCode, currencyName, currencyNameAr, currencySymbol, rateToUsd, rateFromUsd) VALUES
('USD', 'US Dollar',        'دولار أمريكي',    '$',    1.000000, 1.000000),
('EGP', 'Egyptian Pound',   'جنيه مصري',       'ج.م',  0.032258, 31.000000),
('SAR', 'Saudi Riyal',      'ريال سعودي',      'ر.س',  0.266667, 3.750000),
('AED', 'UAE Dirham',       'درهم إماراتي',    'د.إ',  0.272294, 3.672500),
('KWD', 'Kuwaiti Dinar',    'دينار كويتي',     'د.ك',  3.250000, 0.307692),
('QAR', 'Qatari Riyal',     'ريال قطري',       'ر.ق',  0.274725, 3.640000)
ON DUPLICATE KEY UPDATE currencyCode = currencyCode;
