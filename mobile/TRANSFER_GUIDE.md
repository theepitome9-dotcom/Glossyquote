# GLOSSY App - Manual Setup Instructions

## If you cannot download files directly, follow these steps:

### 1. Create a new folder on Windows
```
C:\Users\YourName\Documents\glossy-app
```

### 2. Download/Clone the project using Git

On Windows PowerShell:
```powershell
# Install Git first if you don't have it: https://git-scm.com/download/win

# Then clone the project
git clone [YOUR-REPO-URL] glossy-app
cd glossy-app
```

### 3. Or manually copy files via USB/Cloud

If you have access to the development environment:
- Copy the entire `/home/user/workspace` folder
- Transfer via USB drive, Google Drive, Dropbox, OneDrive, etc.
- Extract on your Windows computer

### 4. Once files are on Windows:

```powershell
# Navigate to project
cd C:\Users\YourName\Documents\glossy-app

# Install dependencies
bun install

# Login and build
bunx eas-cli login
bunx eas-cli build:configure
bunx eas-cli build --profile development --platform ios
```

## Alternative: Use Expo Snack (Web-based)

You can also use Expo Snack to build without downloading:
1. Go to: https://snack.expo.dev
2. Create new snack
3. Upload your files
4. Connect your Expo account
5. Build from the web interface

However, this is less reliable for a full app like GLOSSY.
