@echo off
REM Change to your project directory
cd /d "C:\Users\Abdulazeez Teslim O\Documents\ABUAD_Farms_Project"

REM Initialize git repository if not already done
if not exist ".git" (
    git init
)

REM Add all files to staging
git add .

REM Commit changes with a timestamped message
set hour=%time:~0,2%
if "%hour:~0,1%"==" " set hour=0%hour:~1,1%
set commitmsg=Auto commit %date% %hour%:%time:~3,2%:%time:~6,2%
git commit -m "%commitmsg%"

REM Set remote origin if not set
git remote get-url origin 2>NUL
if errorlevel 1 (
    git remote add origin https://github.com/teslimazeez97-art/ABUAD_Farms_Project.git
)

REM Push to main branch
git push -u origin main
pause