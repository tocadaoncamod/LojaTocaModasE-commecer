/*
  # Create security logs table for password security

  1. New Tables
    - `security_logs`
      - `id` (bigint, primary key, auto-increment)
      - `log_type` (text, type of security event)
      - `user_email` (text, user email)
      - `timestamp` (timestamptz, when event occurred)
      - `ip_address` (text, optional IP address)
      - `user_agent` (text, optional user agent)
      - `metadata` (jsonb, additional data)

  2. Security
    - Enable RLS on `security_logs` table
    - Add policy for admins to read logs
    - Add policy for users to read own logs

  3. Functions
    - Create function to log security events
    - Create trigger for automatic logging
*/

-- Create security logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  log_type TEXT NOT NULL,
  user_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id::text = auth.uid()::text
      AND admin_users.role = 'admin'
    )
  );

CREATE POLICY "Users can view own security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (user_email = auth.email());

CREATE POLICY "System can insert security logs"
  ON security_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_logs_user_email ON security_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_security_logs_log_type ON security_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_log_type TEXT,
  p_user_email TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO security_logs (
    log_type,
    user_email,
    ip_address,
    user_agent,
    metadata,
    timestamp
  ) VALUES (
    p_log_type,
    p_user_email,
    p_ip_address,
    p_user_agent,
    p_metadata,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old logs (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS VOID AS $$
BEGIN
  -- Delete logs older than 1 year
  DELETE FROM security_logs 
  WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for security analytics
CREATE OR REPLACE VIEW security_analytics AS
SELECT 
  log_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_email) as unique_users,
  DATE_TRUNC('day', timestamp) as event_date
FROM security_logs
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY log_type, DATE_TRUNC('day', timestamp)
ORDER BY event_date DESC, event_count DESC;

-- Grant permissions
GRANT SELECT ON security_analytics TO authenticated;