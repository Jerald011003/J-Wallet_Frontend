# Juanbytes - E-Wallet Application

**Overview**  
Juanbytes is a kiosk-based e-wallet application designed to streamline transactions in canteens using student and employee IDs. Developed as part of my thesis project, this application features an APK for production testing and utilizes a kiosk built on Raspberry Pi 4 for user interaction.

**Role**: Full-Stack Developer  
**Technologies**:  
- **Frontend**: React Native  
- **Backend**: Django  
- **Mobile Development**: Android Studio, Android SDK  
- **Hardware**: NFC Card, Raspberry Pi 4  

**Key Features**:  
- Fast and efficient transaction processing  
- User-friendly interface for canteen transactions  
- Integration with NFC technology for quick ID verification  

## Setup Instructions

### Frontend (React Native)
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/jerald011003/J-Wallet_Frontend.git
   cd J-Wallet_Frontend
2. Install Dependencies: Make sure you have Node.js and Expo CLI installed.
   ```bash
   npm install
3. Run the Application:
   ```bash
   npm start

### Backend (Django)
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/jerald011003/J-Wallet_Backend.git
   cd J-Wallet_Backend
2. **Create a Virtual Environment (optional but recommended)**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
3. **Install Dependencies**:
   **pip install -r requirements.txt**
   ```bash
   pip install -r requirements.txt
4. **Run Migrations**:
   ```bash
   python manage.py migrate
5. **Start the Development Server**:
   ```bash
   python manage.py runserver

Feel free to check out the repository for more details!
