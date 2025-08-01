# Appwrite Database Setup Guide
## CoopSociety - Cooperative Membership Platform

This document contains all the collections and attributes you need to create in your Appwrite database.

---

## 📊 **Database Configuration**

**Database ID:** `688c6986000edea314a8` (already created)
**Project ID:** `688c6924002a8f88a2a1` (already created)
**Storage ID:** `688ce0f4003dc5cb8eb6` (already created)

---

## 🗃️ **Collections to Create**

### 1. **Members Collection**
**Collection ID:** `688c6c9e000a114ab654` (already created)

| Attribute Name | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `membershipNumber` | String | 50 | ✅ | - | ❌ |
| `fullName` | String | 100 | ✅ | - | ❌ |
| `email` | String | 150 | ✅ | - | ❌ |
| `phone` | String | 20 | ✅ | - | ❌ |
| `joinDate` | DateTime | - | ✅ | - | ❌ |
| `status` | Enum | - | ✅ | "Active" | ❌ |
| `role` | Enum | - | ✅ | "member" | ❌ |

**Enum Values:**
- `status`: ["Active", "Inactive", "Suspended"]
- `role`: ["member", "admin"]

**Indexes:**
- `email` (unique)
- `membershipNumber` (unique)
- `status`
- `role`

---

### 2. **Events Collection**
**Collection ID:** `events` (create new)

| Attribute Name | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `title` | String | 200 | ✅ | - | ❌ |
| `description` | String | 1000 | ✅ | - | ❌ |
| `date` | DateTime | - | ✅ | - | ❌ |
| `time` | String | 10 | ✅ | - | ❌ |
| `location` | String | 200 | ✅ | - | ❌ |
| `imageUrl` | String | 500 | ❌ | - | ❌ |
| `status` | Enum | - | ✅ | "Upcoming" | ❌ |
| `maxAttendees` | Integer | - | ❌ | - | ❌ |
| `registeredCount` | Integer | - | ❌ | 0 | ❌ |

**Enum Values:**
- `status`: ["Upcoming", "Ongoing", "Completed", "Cancelled"]

**Indexes:**
- `date`
- `status`

---

### 3. **Savings Collection**
**Collection ID:** `savings` (create new)

| Attribute Name | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `memberId` | String | 50 | ✅ | - | ❌ |
| `memberName` | String | 100 | ✅ | - | ❌ |
| `transactionType` | Enum | - | ✅ | - | ❌ |
| `amount` | Float | - | ✅ | - | ❌ |
| `balance` | Float | - | ✅ | - | ❌ |
| `description` | String | 500 | ❌ | - | ❌ |
| `transactionDate` | DateTime | - | ✅ | - | ❌ |
| `referenceNumber` | String | 100 | ❌ | - | ❌ |

**Enum Values:**
- `transactionType`: ["Deposit", "Withdrawal", "Interest", "Transfer"]

**Indexes:**
- `memberId`
- `transactionDate`
- `transactionType`

---

### 4. **Loans Collection**
**Collection ID:** `loans` (create new)

| Attribute Name | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `memberId` | String | 50 | ✅ | - | ❌ |
| `memberName` | String | 100 | ✅ | - | ❌ |
| `loanAmount` | Float | - | ✅ | - | ❌ |
| `interestRate` | Float | - | ✅ | - | ❌ |
| `duration` | Integer | - | ✅ | - | ❌ |
| `monthlyPayment` | Float | - | ✅ | - | ❌ |
| `totalRepayment` | Float | - | ✅ | - | ❌ |
| `remainingBalance` | Float | - | ✅ | - | ❌ |
| `status` | Enum | - | ✅ | "Pending" | ❌ |
| `startDate` | DateTime | - | ❌ | - | ❌ |
| `endDate` | DateTime | - | ❌ | - | ❌ |
| `purpose` | String | 500 | ❌ | - | ❌ |

**Enum Values:**
- `status`: ["Pending", "Approved", "Active", "Paid", "Overdue", "Defaulted"]

**Indexes:**
- `memberId`
- `status`
- `startDate`

---

### 5. **Payments Collection**
**Collection ID:** `688c6f87003a70de3e6c` (already created)

| Attribute Name | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `memberId` | String | 50 | ✅ | - | ❌ |
| `memberName` | String | 100 | ✅ | - | ❌ |
| `paymentType` | Enum | - | ✅ | - | ❌ |
| `amount` | Float | - | ✅ | - | ❌ |
| `bankAccountNumber` | String | 50 | ✅ | - | ❌ |
| `transferType` | Enum | - | ✅ | - | ❌ |
| `paymentMade` | Boolean | - | ✅ | false | ❌ |
| `confirmed` | Boolean | - | ✅ | false | ❌ |
| `status` | Enum | - | ✅ | "Pending" | ❌ |
| `paymentDate` | DateTime | - | ✅ | - | ❌ |
| `confirmationDate` | DateTime | - | ❌ | - | ❌ |
| `description` | String | 500 | ❌ | - | ❌ |
| `receiptUrl` | String | 500 | ❌ | - | ❌ |

**Enum Values:**
- `paymentType`: ["Registration", "Savings", "Loan_Repayment", "Annual_Fee", "Other"]
- `transferType`: ["Online", "Offline", "Cash", "Cheque"]
- `status`: ["Pending", "Confirmed", "Rejected", "Processing"]

**Indexes:**
- `memberId`
- `status`
- `paymentType`
- `paymentDate`

---

### 6. **Loan Repayments Collection**
**Collection ID:** `loan_repayments` (create new)

| Attribute Name | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `loanId` | String | 50 | ✅ | - | ❌ |
| `memberId` | String | 50 | ✅ | - | ❌ |
| `memberName` | String | 100 | ✅ | - | ❌ |
| `amount` | Float | - | ✅ | - | ❌ |
| `paymentDate` | DateTime | - | ✅ | - | ❌ |
| `principalAmount` | Float | - | ✅ | - | ❌ |
| `interestAmount` | Float | - | ✅ | - | ❌ |
| `remainingBalance` | Float | - | ✅ | - | ❌ |
| `paymentMethod` | Enum | - | ✅ | - | ❌ |
| `referenceNumber` | String | 100 | ❌ | - | ❌ |

**Enum Values:**
- `paymentMethod`: ["Cash", "Bank_Transfer", "Cheque", "Online"]

**Indexes:**
- `loanId`
- `memberId`
- `paymentDate`

---

### 7. **Gallery Collection**
**Collection ID:** `gallery` (create new)

| Attribute Name | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `title` | String | 200 | ✅ | - | ❌ |
| `description` | String | 500 | ❌ | - | ❌ |
| `imageUrl` | String | 500 | ✅ | - | ❌ |
| `thumbnailUrl` | String | 500 | ❌ | - | ❌ |
| `category` | Enum | - | ✅ | - | ❌ |
| `eventId` | String | 50 | ❌ | - | ❌ |
| `uploadedBy` | String | 50 | ✅ | - | ❌ |
| `uploadDate` | DateTime | - | ✅ | - | ❌ |
| `isPublic` | Boolean | - | ✅ | true | ❌ |

**Enum Values:**
- `category`: ["events", "community", "education", "meetings", "celebrations"]

**Indexes:**
- `category`
- `uploadDate`
- `eventId`

---

### 8. **Notifications Collection**
**Collection ID:** `notifications` (create new)

| Attribute Name | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `title` | String | 200 | ✅ | - | ❌ |
| `message` | String | 1000 | ✅ | - | ❌ |
| `type` | Enum | - | ✅ | - | ❌ |
| `recipientId` | String | 50 | ❌ | - | ❌ |
| `isGlobal` | Boolean | - | ✅ | false | ❌ |
| `isRead` | Boolean | - | ✅ | false | ❌ |
| `createdDate` | DateTime | - | ✅ | - | ❌ |
| `expiryDate` | DateTime | - | ❌ | - | ❌ |
| `actionUrl` | String | 500 | ❌ | - | ❌ |

**Enum Values:**
- `type`: ["Payment", "Event", "Account", "System", "General"]

**Indexes:**
- `recipientId`
- `type`
- `isRead`
- `createdDate`

---

## 🔐 **Permissions Setup**

### **Collection Permissions:**

**Members Collection:**
- **Read:** Users (authenticated members can read their own data, admins can read all)
- **Create:** Users (anyone can register)
- **Update:** Admins only
- **Delete:** Admins only

**Events Collection:**
- **Read:** Any (public access)
- **Create:** Admins only
- **Update:** Admins only
- **Delete:** Admins only

**Savings Collection:**
- **Read:** Users (members can read their own records, admins can read all)
- **Create:** Admins only
- **Update:** Admins only
- **Delete:** Admins only

**Loans Collection:**
- **Read:** Users (members can read their own records, admins can read all)
- **Create:** Users (members can apply), Admins can approve
- **Update:** Admins only
- **Delete:** Admins only

**Payments Collection:**
- **Read:** Users (members can read their own records, admins can read all)
- **Create:** Users (members can submit payments)
- **Update:** Admins only (for confirmation)
- **Delete:** Admins only

**Gallery Collection:**
- **Read:** Any (public access)
- **Create:** Admins only
- **Update:** Admins only
- **Delete:** Admins only

**Notifications Collection:**
- **Read:** Users (members can read their own notifications, admins can read all)
- **Create:** Admins only
- **Update:** Users (mark as read), Admins (all operations)
- **Delete:** Admins only

---

## 📦 **Storage Buckets**

### **Main Storage Bucket**
**Bucket ID:** `688ce0f4003dc5cb8eb6` (already created)

**File Types Allowed:**
- Images: jpg, jpeg, png, gif, webp
- Documents: pdf, doc, docx
- Maximum file size: 10MB

**Permissions:**
- **Read:** Any (public access for images)
- **Create:** Admins only
- **Update:** Admins only
- **Delete:** Admins only

---

## 🚀 **Environment Variables Update**

Update your `.env.local` file with the collection IDs once created:

```env
# Collections (update these after creating the collections)
NEXT_PUBLIC_APPWRITE_MEMBERS_COLLECTION_ID=688c6c9e000a114ab654
NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID=events
NEXT_PUBLIC_APPWRITE_SAVINGS_COLLECTION_ID=savings  
NEXT_PUBLIC_APPWRITE_LOANS_COLLECTION_ID=loans
NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID=688c6f87003a70de3e6c
NEXT_PUBLIC_APPWRITE_LOAN_REPAYMENTS_COLLECTION_ID=loan_repayments
NEXT_PUBLIC_APPWRITE_GALLERY_COLLECTION_ID=gallery
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=notifications
```

---

## ✅ **Setup Checklist**

- [ ] Create Events collection with all attributes
- [ ] Create Savings collection with all attributes  
- [ ] Create Loans collection with all attributes
- [ ] Create Loan Repayments collection with all attributes
- [ ] Create Gallery collection with all attributes
- [ ] Create Notifications collection with all attributes
- [ ] Set up proper permissions for each collection
- [ ] Configure storage bucket permissions
- [ ] Update environment variables with new collection IDs
- [ ] Test authentication and database operations
- [ ] Create first admin user account

---

## 📝 **Notes**

1. **Members Collection** is already created and configured
2. **Payments Collection** is already created and configured  
3. **Storage Bucket** is already created and configured
4. Make sure to set proper indexes for better query performance
5. Float type is used for monetary values (amount, balance, etc.)
6. DateTime fields store ISO 8601 format timestamps
7. All required fields must have values when creating documents
8. Enum fields must use exact values as specified above

---

**🔧 Need Help?**
- Appwrite Documentation: https://appwrite.io/docs
- Collection Setup Guide: https://appwrite.io/docs/databases
- Permissions Guide: https://appwrite.io/docs/permissions