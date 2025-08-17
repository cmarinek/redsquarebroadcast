-- Add missing last_check column to admin_system_health if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='admin_system_health' 
                   AND column_name='last_check') THEN
        ALTER TABLE public.admin_system_health 
        ADD COLUMN last_check TIMESTAMP WITH TIME ZONE DEFAULT now();
        
        -- Update existing records to have a last_check value
        UPDATE public.admin_system_health 
        SET last_check = created_at 
        WHERE last_check IS NULL;
    END IF;
END $$;