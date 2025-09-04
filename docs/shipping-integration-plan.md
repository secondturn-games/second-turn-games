# Parcel Locker Integration Plan

## Unisend/LP Express Integration for Second Turn Games

### 🎯 **Phase 1: Foundation (Week 1-2)**

#### 1.1 Database Schema Implementation

```sql
-- Carrier lockers cache
CREATE TABLE carrier_lockers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country CHAR(2) NOT NULL, -- LV/LT/EE
  city TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  services TEXT[], -- ["LOCKER_LOCKER", "COURIER_LOCKER"]
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shipment tracking
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  carrier TEXT NOT NULL, -- 'UNISEND' | 'LP_EXPRESS'
  service_code TEXT NOT NULL, -- 'LOCKER_LOCKER'
  size_code TEXT NOT NULL, -- 'S' | 'M' | 'L'
  from_locker_id TEXT REFERENCES carrier_lockers(id),
  to_locker_id TEXT NOT NULL REFERENCES carrier_lockers(id),

  -- Sender details
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_email TEXT,

  -- Recipient details
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_email TEXT,

  -- Shipment data
  label_url TEXT,
  label_format TEXT, -- 'PDF' | 'ZPL'
  tracking_number TEXT UNIQUE,
  tracking_status TEXT,
  tracking_payload JSONB,

  -- Metadata
  created_via TEXT NOT NULL DEFAULT 'API',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_carrier_lockers_country_city ON carrier_lockers(country, city);
CREATE INDEX idx_carrier_lockers_location ON carrier_lockers USING GIST (ll_to_earth(lat, lng));
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX idx_shipments_order ON shipments(order_id);
```

#### 1.2 Environment Configuration

```env
# Unisend API
UNISEND_API_BASE=https://api.unisend.lv
UNISEND_API_KEY=your_api_key
UNISEND_WEBHOOK_SECRET=your_webhook_secret

# LP Express API (backup)
LP_EXPRESS_API_BASE=https://api-manosiuntostst.post.lt/api/v2
LP_EXPRESS_USERNAME=your_username
LP_EXPRESS_PASSWORD=your_password
LP_EXPRESS_WEBHOOK_SECRET=your_webhook_secret

# Shipping configuration
SHIPPING_DEFAULT_CARRIER=UNISEND
SHIPPING_RETRY_ATTEMPTS=3
SHIPPING_RETRY_DELAY_MS=1000
```

### 🚀 **Phase 2: Core Services (Week 3-4)**

#### 2.1 Locker Directory Service

```typescript
// src/lib/shipping/locker-service.ts
export class LockerService {
  async syncLockers(country: "EE" | "LV" | "LT"): Promise<void> {
    // Fetch from Unisend API
    const lockers = await this.fetchUnisendLockers(country);

    // Upsert to database
    await this.upsertLockers(lockers);
  }

  async searchLockers(query: string, country?: string): Promise<Locker[]> {
    // Full-text search with geolocation
    return await this.searchLockersInDB(query, country);
  }

  async getNearbyLockers(
    lat: number,
    lng: number,
    radiusKm: number = 10
  ): Promise<Locker[]> {
    // Geographic search using PostGIS
    return await this.findNearbyLockers(lat, lng, radiusKm);
  }
}
```

#### 2.2 Shipment Creation Service

```typescript
// src/lib/shipping/shipment-service.ts
export class ShipmentService {
  async createShipment(data: CreateShipmentRequest): Promise<Shipment> {
    // Validate input
    await this.validateShipmentData(data);

    // Create shipment via API
    const response = await this.callCarrierAPI(data);

    // Store in database
    const shipment = await this.saveShipment(response);

    // Send notifications
    await this.notifyStakeholders(shipment);

    return shipment;
  }

  async generateLabel(shipmentId: string): Promise<Label> {
    // Generate shipping label
    const label = await this.createLabel(shipmentId);

    // Store in cloud storage
    const url = await this.uploadLabel(label);

    return { url, format: "PDF" };
  }
}
```

### 📱 **Phase 3: User Interface (Week 5-6)**

#### 3.1 Locker Selection Component

```typescript
// src/components/shipping/locker-selector.tsx
export function LockerSelector({
  country,
  onSelect,
  selectedLocker,
}: LockerSelectorProps) {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-4">
      {/* Search input */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for parcel lockers..."
        className="w-full px-3 py-2 border rounded-lg"
      />

      {/* Map view */}
      <LockerMap
        lockers={lockers}
        onSelect={onSelect}
        selectedLocker={selectedLocker}
      />

      {/* List view */}
      <LockerList
        lockers={lockers}
        onSelect={onSelect}
        selectedLocker={selectedLocker}
      />
    </div>
  );
}
```

#### 3.2 Shipping Method Selection

```typescript
// src/components/shipping/shipping-methods.tsx
export function ShippingMethods({
  game,
  sellerLocation,
  buyerLocation,
}: ShippingMethodsProps) {
  const methods = [
    {
      id: "parcel_locker",
      name: "Parcel Locker",
      description: "Pick up from nearest locker",
      icon: <Package className="w-5 h-5" />,
      price: calculateLockerPrice(game),
      estimatedDays: "1-2 days",
    },
    {
      id: "courier",
      name: "Courier Delivery",
      description: "Direct to your address",
      icon: <Truck className="w-5 h-5" />,
      price: calculateCourierPrice(game),
      estimatedDays: "2-3 days",
    },
  ];

  return (
    <div className="space-y-3">
      {methods.map((method) => (
        <ShippingMethodCard
          key={method.id}
          method={method}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
```

### 🔄 **Phase 4: Tracking & Notifications (Week 7-8)**

#### 4.1 Webhook Handler

```typescript
// src/app/api/webhooks/shipping/route.ts
export async function POST(req: Request) {
  const signature = req.headers.get("x-unisend-signature");
  const payload = await req.json();

  // Verify webhook signature
  if (!verifyWebhookSignature(signature, payload)) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Process tracking update
  await processTrackingUpdate(payload);

  // Send notifications
  await sendStatusNotifications(payload);

  return new Response("OK", { status: 200 });
}
```

#### 4.2 Tracking Component

```typescript
// src/components/shipping/tracking-timeline.tsx
export function TrackingTimeline({ shipment }: { shipment: Shipment }) {
  const statuses = [
    { key: "created", label: "Shipment Created", icon: <Package /> },
    { key: "accepted", label: "Accepted at Locker", icon: <CheckCircle /> },
    { key: "in_transit", label: "In Transit", icon: <Truck /> },
    { key: "arrived", label: "Arrived at Destination", icon: <MapPin /> },
    { key: "ready", label: "Ready for Pickup", icon: <Bell /> },
    { key: "delivered", label: "Picked Up", icon: <CheckCircle /> },
  ];

  return (
    <div className="space-y-4">
      {statuses.map((status, index) => (
        <StatusStep
          key={status.key}
          status={status}
          isActive={isStatusActive(shipment, status.key)}
          isCompleted={isStatusCompleted(shipment, status.key)}
        />
      ))}
    </div>
  );
}
```

### 🛡️ **Phase 5: Error Handling & Monitoring (Week 9)**

#### 5.1 Retry Logic with Idempotency

```typescript
// src/lib/shipping/retry-handler.ts
export class RetryHandler {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const { maxRetries = 3, baseDelay = 1000 } = options;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries || !isRetryableError(error)) {
          throw error;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
```

#### 5.2 Monitoring & Alerts

```typescript
// src/lib/shipping/monitoring.ts
export class ShippingMonitor {
  async trackShipmentMetrics() {
    const metrics = {
      totalShipments: await this.getTotalShipments(),
      successRate: await this.getSuccessRate(),
      averagePickupTime: await this.getAveragePickupTime(),
      errorRate: await this.getErrorRate(),
    };

    // Send to monitoring service
    await this.sendMetrics(metrics);
  }

  async checkForStalledShipments() {
    const stalled = await this.findStalledShipments(72); // 72 hours
    if (stalled.length > 0) {
      await this.sendAlert("Stalled shipments detected", stalled);
    }
  }
}
```

### 🌍 **Phase 6: Internationalization (Week 10)**

#### 6.1 Multi-language Support

```typescript
// src/lib/i18n/shipping.ts
export const shippingTranslations = {
  en: {
    "shipping.parcel_locker": "Parcel Locker",
    "shipping.courier": "Courier Delivery",
    "shipping.tracking.created": "Shipment Created",
    "shipping.tracking.delivered": "Picked Up",
  },
  lv: {
    "shipping.parcel_locker": "Pakomātu tīkls",
    "shipping.courier": "Kurjera piegāde",
    "shipping.tracking.created": "Sūtījums izveidots",
    "shipping.tracking.delivered": "Saņemts",
  },
  lt: {
    "shipping.parcel_locker": "Pašaptarnavimo spintos",
    "shipping.courier": "Kurjerio pristatymas",
    "shipping.tracking.created": "Siunta sukurta",
    "shipping.tracking.delivered": "Paimta",
  },
};
```

### 📊 **Success Metrics**

1. **Technical Metrics:**

   - API response time < 2s
   - Label generation success rate > 99%
   - Webhook delivery success rate > 95%

2. **Business Metrics:**

   - Parcel locker adoption rate
   - Average delivery time
   - Customer satisfaction scores

3. **Operational Metrics:**
   - Error rate < 1%
   - Support ticket volume
   - System uptime > 99.9%

### 🚨 **Risk Mitigation**

1. **API Failures:** Implement circuit breaker pattern
2. **Data Loss:** Regular database backups
3. **Security:** API key rotation, webhook signature verification
4. **Compliance:** GDPR compliance for PII handling
5. **Scalability:** Rate limiting and caching strategies

### 📅 **Timeline Summary**

- **Week 1-2:** Database schema, environment setup
- **Week 3-4:** Core services, API integration
- **Week 5-6:** User interface components
- **Week 7-8:** Tracking, notifications, webhooks
- **Week 9:** Error handling, monitoring
- **Week 10:** Internationalization, testing

### 🔧 **Technical Questions for Clarification**

1. **API Access:** Do you have production API credentials for Unisend/LP Express?
2. **Rate Limits:** What are the API rate limits for your account?
3. **Webhook Support:** Does your account support webhooks for real-time updates?
4. **Label Formats:** Do you prefer PDF or ZPL label formats?
5. **Pricing Model:** Will you use flat rates or dynamic pricing from the carrier?
6. **Geographic Coverage:** Which countries should be prioritized first?

This plan provides a solid foundation for implementing parcel locker shipping while maintaining scalability and reliability. Would you like me to elaborate on any specific phase or start implementing the database schema?
