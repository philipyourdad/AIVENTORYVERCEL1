#!/usr/bin/env python3
"""
Convert MySQL dump file to PostgreSQL/Supabase compatible SQL
"""
import re
import sys

def convert_mysql_to_postgresql(input_file, output_file):
    import os
    # Get absolute path
    if not os.path.isabs(input_file):
        input_file = os.path.join(os.path.dirname(__file__), input_file)
    if not os.path.isabs(output_file):
        output_file = os.path.join(os.path.dirname(__file__), output_file)
    
    print(f"Reading from: {input_file}")
    print(f"Will write to: {output_file}")
    
    if not os.path.exists(input_file):
        print(f"ERROR: Input file not found: {input_file}")
        return
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"Read {len(content)} characters from input file")
    
    # Remove MySQL-specific comments and settings
    content = re.sub(r'SET SQL_MODE[^;]*;', '', content)
    content = re.sub(r'START TRANSACTION;', '', content)
    content = re.sub(r'SET time_zone[^;]*;', '', content)
    content = re.sub(r'/\*!40101 SET[^;]*;\*/', '', content)
    content = re.sub(r'/\*!40101 SET[^;]*;\*/', '', content)
    
    # Remove backticks (PostgreSQL uses double quotes for identifiers)
    # But keep them if they contain special characters or for case sensitivity
    content = re.sub(r'`([^`]+)`', r'"\1"', content)
    
    # Convert AUTO_INCREMENT to SERIAL
    content = re.sub(r'(\w+)\s+int\(11\)\s+NOT NULL\s+AUTO_INCREMENT', r'\1 SERIAL', content, flags=re.IGNORECASE)
    
    # Convert INT(11) to INTEGER
    content = re.sub(r'int\(11\)', 'INTEGER', content, flags=re.IGNORECASE)
    content = re.sub(r'int\(10\)', 'INTEGER', content, flags=re.IGNORECASE)
    
    # Convert DECIMAL(10,0) to DECIMAL(10,2) or INTEGER (better use DECIMAL)
    content = re.sub(r'decimal\(10,0\)', 'DECIMAL(10,2)', content, flags=re.IGNORECASE)
    content = re.sub(r'decimal\(10,2\)', 'DECIMAL(10,2)', content, flags=re.IGNORECASE)
    
    # Remove ENGINE and CHARSET clauses
    content = re.sub(r'\s*ENGINE=InnoDB[^;]*', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*DEFAULT CHARSET=[^;]*', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\s*COLLATE=[^;]*', '', content, flags=re.IGNORECASE)
    
    # Convert ENUM to VARCHAR with CHECK constraint
    enum_pattern = r"enum\(([^)]+)\)"
    def replace_enum(match):
        values = match.group(1).replace("'", "")
        max_len = max(len(v.strip()) for v in values.split(','))
        return f"VARCHAR({max(50, max_len + 10)})"
    
    content = re.sub(enum_pattern, replace_enum, content, flags=re.IGNORECASE)
    
    # Convert TIMESTAMP defaults
    content = re.sub(r"DEFAULT current_timestamp\(\)\s+ON UPDATE current_timestamp\(\)", "DEFAULT CURRENT_TIMESTAMP", content, flags=re.IGNORECASE)
    content = re.sub(r"DEFAULT current_timestamp\(\)", "DEFAULT CURRENT_TIMESTAMP", content, flags=re.IGNORECASE)
    
    # Convert ALTER TABLE ADD PRIMARY KEY to inline PRIMARY KEY
    # This is complex, so we'll handle it separately
    
    # Remove AUTO_INCREMENT from ALTER TABLE statements
    content = re.sub(r'AUTO_INCREMENT=\d+', '', content, flags=re.IGNORECASE)
    
    # Convert ALTER TABLE ADD PRIMARY KEY to CREATE TABLE modifications
    # Note: This might require manual review
    
    # Remove COMMIT and other MySQL-specific statements
    content = re.sub(r'COMMIT;', '', content)
    
    # Add PostgreSQL-specific header
    header = """-- PostgreSQL/Supabase compatible SQL
-- Converted from MySQL dump
-- Note: Review and adjust column names for case sensitivity
-- Some ENUM constraints may need manual adjustment

"""
    
    output = header + content
    
    print(f"Writing {len(output)} characters to output file...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output)
    
    print(f"✓ Conversion complete! Output saved to {output_file}")
    print(f"  File size: {os.path.getsize(output_file)} bytes")
    print("Please review the file and manually adjust:")
    print("1. PRIMARY KEY constraints (may need to be added inline)")
    print("2. FOREIGN KEY constraints")
    print("3. ENUM constraints (converted to VARCHAR, add CHECK if needed)")
    print("4. Column name case sensitivity")

if __name__ == "__main__":
    input_file = "aiventory-1 (1).sql"
    output_file = "aiventory_postgresql.sql"
    
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    convert_mysql_to_postgresql(input_file, output_file)

