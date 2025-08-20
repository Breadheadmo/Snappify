@echo off
echo Initializing Snappy database...

REM Seed the database with initial data
cd server && node scripts/import-with-logging.js

echo Database initialization complete!
echo Check server/data-import-log.txt for details
pause
