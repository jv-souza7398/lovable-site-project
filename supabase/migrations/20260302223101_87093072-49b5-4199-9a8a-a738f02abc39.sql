
-- Analytics pageviews table
CREATE TABLE public.analytics_pageviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_fingerprint TEXT NOT NULL,
  user_agent TEXT,
  page_url TEXT NOT NULL,
  referrer TEXT,
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_fingerprint TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'add_to_cart', 'view_cart', 'checkout_start', 'quote_sent'
  event_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_pageviews_fingerprint ON public.analytics_pageviews (device_fingerprint);
CREATE INDEX idx_pageviews_created_at ON public.analytics_pageviews (created_at);
CREATE INDEX idx_pageviews_device_type ON public.analytics_pageviews (device_type);
CREATE INDEX idx_events_type ON public.analytics_events (event_type);
CREATE INDEX idx_events_created_at ON public.analytics_events (created_at);
CREATE INDEX idx_events_fingerprint ON public.analytics_events (device_fingerprint);

-- Enable RLS
ALTER TABLE public.analytics_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Public insert policies (anyone can track)
CREATE POLICY "Anyone can insert pageviews"
ON public.analytics_pageviews
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can insert events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- No public SELECT - only via service_role in edge functions
