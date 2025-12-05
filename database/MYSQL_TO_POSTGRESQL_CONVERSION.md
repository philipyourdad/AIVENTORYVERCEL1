# MySQL to PostgreSQL/Supabase Conversion Guide

This document explains how to convert the MySQL dump file (`aiventory-1 (1).sql`) to PostgreSQL format for Supabase.

## Key Conversions Needed

1. **Remove MySQL-specific syntax:**
   - `ENGINE=InnoDB` → Remove
   - `DEFAULT CHARSET=latin1` → Remove
   - `COLLATE=latin1_swedish_ci` → Remove
   - Backticks `` ` `` → Double quotes `"` (for case-sensitive identifiers)

2. **Data Type Conversions:**
   - `INT(11)` → `INTEGER` or `SERIAL` (if AUTO_INCREMENT)
   - `DECIMAL(10,0)` → `DECIMAL(10,2)`
   - `ENUM('val1','val2')` → `VARCHAR(50)` (add CHECK constraint if needed)
   - `TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp()` → `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

3. **Primary Keys:**
   - Convert `ALTER TABLE ... ADD PRIMARY KEY` to inline `PRIMARY KEY` in CREATE TABLE
   - Or keep ALTER TABLE statements

4. **Foreign Keys:**
   - Should work as-is, but verify constraint names

5. **AUTO_INCREMENT:**
   - Convert to `SERIAL` or use sequences

## Quick Conversion Using Online Tools

1. Use **pgloader** (recommended):
   ```bash
   pgloader mysql://user:pass@host/dbname postgresql://user:pass@host/dbname
   ```

2. Use **AWS Database Migration Service** or similar tools

3. Manual conversion using the Python script provided

## Manual Steps for Supabase

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the converted SQL file section by section:
   - First create all tables
   - Then add primary keys and indexes
   - Then add foreign keys
   - Finally insert data

## Important Notes

- PostgreSQL is case-sensitive with quoted identifiers
- ENUMs are converted to VARCHAR - consider adding CHECK constraints
- Review all AUTO_INCREMENT columns and convert to SERIAL
- Test the conversion on a small subset first


