CREATE TABLE IF NOT EXISTS dearcare_web_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  metadata JSONB, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_created ON dearcare_web_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON dearcare_web_notifications(is_read) WHERE is_read = false;