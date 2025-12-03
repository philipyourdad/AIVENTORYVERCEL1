#!/usr/bin/env python3
"""Convert MySQL dump to PostgreSQL for Supabase"""
import re
import os

input_file = r"aiventory-1 (1).sql"
output_file = r"aiventory_supabase.sql"

print(f"Starting conversion...")
print(f"Input: {input_file}")
print(f"Output: {output_file}")

# Read input
with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
    sql = f.read()

print(f"Read {len(sql)} characters")

# Key conversions
sql = re.sub(r'SET SQL_MODE[^;]*;', '', sql)
sql = re.sub(r'START TRANSACTION;', '', sql)
sql = re.sub(r'SET time_zone[^;]*;', '', sql)
sql = re.sub(r'/\*!.*?\*/', '', sql, flags=re.DOTALL)

# Backticks to quotes
sql = sql.replace('`', '"')

# Data types
sql = re.sub(r'\bint\(11\)\b', 'INTEGER', sql, flags=re.IGNORECASE)
sql = re.sub(r'\bint\(10\)\b', 'INTEGER', sql, flags=re.IGNORECASE)
sql = re.sub(r'\bdecimal\(10,0\)\b', 'DECIMAL(10,2)', sql, flags=re.IGNORECASE)

# Remove MySQL-specific
sql = re.sub(r'\s+ENGINE=\w+[^;)]*', '', sql, flags=re.IGNORECASE)
sql = re.sub(r'\s+DEFAULT CHARSET=\w+[^;)]*', '', sql, flags=re.IGNORECASE)
sql = re.sub(r'\s+COLLATE=[^;)]*', '', sql, flags=re.IGNORECASE)

# ENUM conversion
def enum_to_varchar(m):
    return 'VARCHAR(50)'
sql = re.sub(r"enum\([^)]+\)", enum_to_varchar, sql, flags=re.IGNORECASE)

# Timestamp
sql = sql.replace('current_timestamp()', 'CURRENT_TIMESTAMP')
sql = re.sub(r'ON UPDATE CURRENT_TIMESTAMP', '', sql, flags=re.IGNORECASE)

# Remove AUTO_INCREMENT values
sql = re.sub(r'AUTO_INCREMENT=\d+', '', sql, flags=re.IGNORECASE)

# Add header
header = """-- PostgreSQL/Supabase SQL
-- Converted from MySQL dump
-- IMPORTANT: Review PRIMARY KEY and FOREIGN KEY constraints
-- Some AUTO_INCREMENT columns may need SERIAL type

"""

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(header + sql)

print(f"✓ Conversion complete!")
print(f"  Output file: {output_file}")
print(f"  Size: {os.path.getsize(output_file):,} bytes")
print("\nNext steps:")
print("1. Review the converted file")
print("2. Add PRIMARY KEY constraints if missing")
print("3. Verify SERIAL types for auto-increment columns")
print("4. Test in Supabase SQL Editor")

