@echo off
echo Running database import script...
cd server
node scripts/import-with-logging.js
echo.
echo Check data-import-log.txt for detailed logs
pause
