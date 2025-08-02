# EMURECCIMA - Cooperative Membership Platform

A modern, full-featured cooperative society management platform built with Next.js, Tailwind CSS, and Appwrite. This application enables cooperative societies to manage member registration, financial services (savings & loans), community events, and administrative operations.

## ✨ Features

### 🏠 **Homepage & Public Pages**
- Modern, premium e-commerce-inspired design
- Responsive layout with mobile-first approach
- Community-focused branding and messaging
- Events gallery and contact information

### 👥 **Member Management**
- **Registration System**: Online member registration with admin approval
- **Authentication**: Secure login/logout with Appwrite
- **Profile Management**: Member profiles with membership numbers
- **Role-based Access**: Member vs Admin permissions

### 💰 **Financial Services**
- **Payment System**: 
  - Registration fees
  - Savings deposits
  - Loan repayments
  - Online/Offline transfer options
  - Bank account integration
  - Payment confirmation workflow
- **Savings Ledger**: Track member savings and transactions
- **Loan Management**: Loan applications and repayment tracking

### 📅 **Events & Community**
- **Events Management**: Create and manage community events
- **Photo Gallery**: Share event photos and community moments
- **Member Dashboard**: Personalized member portal

### 🔧 **Admin Dashboard**
- **Member Approval**: Review and approve new registrations
- **Payment Confirmations**: Verify and process payments
- **Financial Reports**: Track cooperative finances
- **Event Management**: Create and manage events
- **System Settings**: Configure bank details and notifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom design system
- **Backend**: Appwrite (Authentication, Database, Storage)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Appwrite account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coperative
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env.local` file and update with your Appwrite credentials:
   ```env
   # Appwrite Configuration
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here
   
   # Collections
   NEXT_PUBLIC_APPWRITE_MEMBERS_COLLECTION_ID=members
   NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID=events
   NEXT_PUBLIC_APPWRITE_SAVINGS_COLLECTION_ID=savings
   NEXT_PUBLIC_APPWRITE_LOANS_COLLECTION_ID=loans
   NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID=payments
   
   # Storage
   NEXT_PUBLIC_APPWRITE_STORAGE_ID=your_storage_id_here
   
   # Bank Account Details
   NEXT_PUBLIC_BANK_ACCOUNT_NAME=Cooperative Society Account
   NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=your_account_number
   NEXT_PUBLIC_BANK_NAME=your_bank_name
   
   # Admin Configuration
   ADMIN_EMAIL=admin@cooperative.com
   ```

4. **Set up Appwrite Database**
   
   Create the following collections in your Appwrite database:
   
   **Members Collection:**
   - membershipNumber (string)
   - fullName (string)
   - email (string)
   - phone (string)
   - joinDate (datetime)
   - status (enum: Active, Inactive)
   - role (enum: Member, Admin)
   
   **Events Collection:**
   - title (string)
   - description (string)
   - date (datetime)
   - time (string)
   - location (string)
   - imageUrl (string, optional)
   - status (enum: Upcoming, Ongoing, Completed)
   
   **Payments Collection:**
   - memberId (string)
   - memberName (string)
   - paymentType (enum: Registration, Savings, Loan_Repayment)
   - amount (integer)
   - bankAccountNumber (string)
   - transferType (enum: Online, Offline)
   - paymentMade (boolean)
   - confirmed (boolean)
   - status (enum: Pending, Confirmed, Rejected)
   - date (datetime)
   - description (string, optional)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Features Overview

### For Members:
- ✅ Register online with secure authentication
- ✅ Make payments (registration, savings, loan repayments)
- ✅ View personal financial ledger
- ✅ Browse community events and gallery
- ✅ Access member dashboard

### For Admins:
- ✅ Approve new member registrations
- ✅ Confirm payment transactions
- ✅ Manage community events
- ✅ Upload photos to gallery
- ✅ Generate financial reports
- ✅ System configuration

## 🎨 Design System

The application follows a modern e-commerce design pattern with:

- **Color Palette**: Black/white primary, orange accent (#FF6B35)
- **Typography**: Inter (sans-serif) + Playfair Display (serif)
- **Spacing**: 4px base unit system
- **Components**: Card-based layout with subtle shadows
- **Responsive**: Mobile-first approach with 4 breakpoints

## 🔐 Security Features

- ✅ Secure authentication with Appwrite
- ✅ Role-based access control
- ✅ Environment variable protection
- ✅ Payment confirmation workflow
- ✅ Admin approval system

## 📦 Project Structure

```
coperative/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Member dashboard
│   ├── events/            # Events page
│   ├── gallery/           # Photo gallery
│   └── contact/           # Contact page
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   ├── forms/            # Form components
│   └── dashboard/        # Dashboard components
├── contexts/             # React contexts
├── lib/                  # Utilities and config
├── types/                # TypeScript definitions
└── hooks/                # Custom hooks
```

## 🚀 Deployment

The application is ready for deployment on Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

## 🛠️ Development

- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Dev**: `npm run dev`

## 📝 TODO / Future Enhancements

- [ ] Email notifications for events and payments
- [ ] Advanced financial reporting
- [ ] Mobile app (React Native)
- [ ] PDF report generation
- [ ] Bulk payment processing
- [ ] Member directory
- [ ] SMS notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For questions or support, please contact the admin team or create an issue in this repository.

---

**Built with ❤️ for cooperative societies worldwide**