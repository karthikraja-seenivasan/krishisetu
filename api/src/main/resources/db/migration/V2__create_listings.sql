CREATE TABLE listings (
    id UUID PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    crop_id VARCHAR(255) NOT NULL,
    quantity_q DECIMAL(10, 2) NOT NULL,
    harvest_date DATE NOT NULL,
    photo_url VARCHAR(2048),
    expected_price_per_q DECIMAL(10, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_listings_farmer_id ON listings(farmer_id);
CREATE INDEX idx_listings_status_created ON listings(status, created_at DESC);
