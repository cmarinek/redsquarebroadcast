// Resumable upload script for large files using Supabase TUS protocol
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Get command line arguments
const [,, filePath, bucket, fileName, supabaseUrl, serviceKey] = process.argv;

if (!filePath || !bucket || !fileName || !supabaseUrl || !serviceKey) {
  console.error('Usage: node resumable-upload.js <filePath> <bucket> <fileName> <supabaseUrl> <serviceKey>');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceKey);

async function uploadWithResumable() {
  try {
    console.log(`Starting resumable upload: ${fileName}`);
    console.log(`File path: ${filePath}`);
    console.log(`Bucket: ${bucket}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSizeMB = Math.round(stats.size / (1024 * 1024) * 100) / 100;
    console.log(`File size: ${fileSizeMB} MB`);
    
    // Read file as buffer
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create File object for upload
    const file = new File([fileBuffer], fileName, { 
      type: 'application/zip',
      lastModified: stats.mtime.getTime()
    });
    
    console.log('Starting resumable upload...');
    
    // Use resumable upload for files > 6MB
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Overwrite if exists
        resumable: true // Enable resumable uploads
      });
    
    if (error) {
      console.error('Upload error:', error);
      process.exit(1);
    }
    
    console.log('Upload successful!');
    console.log('Upload result:', data);
    
    // Return the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
    console.log(`Public URL: ${publicUrl}`);
    
    // Write the URL to a file for the workflow to pick up
    fs.writeFileSync('upload-result.txt', publicUrl);
    
  } catch (error) {
    console.error('Upload failed:', error);
    
    // Write error result for the workflow to handle gracefully
    fs.writeFileSync('upload-result.txt', 'UPLOAD_FAILED');
    process.exit(1);
  }
}

uploadWithResumable();