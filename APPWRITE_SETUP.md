# Appwrite Database Setup Guide
## EMURECCIMA - Cooperative Membership Platform

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
| `paymentType` | String | 50 | ✅ | "Savings" | ❌ |
| `amount` | Float | - | ✅ | - | ❌ |
| `bankAccount` | String | 50 | ✅ | - | ❌ |
| `accountName` | String | 100 | ✅ | - | ❌ |
| `transferType` | String | 50 | ✅ | "Bank Transfer" | ❌ |
| `paymentMade` | Boolean | - | ✅ | false | ❌ |
| `confirmed` | Boolean | - | ✅ | false | ❌ |
| `status` | Enum | - | ✅ | "Pending" | ❌ |
| `description` | String | 500 | ❌ | - | ❌ |
| `proofFileId` | String | 100 | ❌ | - | ❌ |
| `proofFileName` | String | 200 | ❌ | - | ❌ |

**Enum Values:**
- `status`: ["Pending", "Confirmed", "Rejected"]

**Indexes:**
- `memberId`
- `status`
- `$createdAt`

---

### 4. **Loans Collection (Loan Repayments)**
**Collection ID:** `loans` (create new)

| Attribute Name | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `memberId` | String | 50 | ✅ | - | ❌ |
| `memberName` | String | 100 | ✅ | - | ❌ |
| `paymentType` | String | 50 | ✅ | "Loan_Repayment" | ❌ |
| `amount` | Float | - | ✅ | - | ❌ |
| `bankAccount` | String | 50 | ✅ | - | ❌ |
| `accountName` | String | 100 | ✅ | - | ❌ |
| `transferType` | String | 50 | ✅ | "Bank Transfer" | ❌ |
| `paymentMade` | Boolean | - | ✅ | false | ❌ |
| `confirmed` | Boolean | - | ✅ | false | ❌ |
| `status` | Enum | - | ✅ | "Pending" | ❌ |
| `description` | String | 500 | ❌ | - | ❌ |
| `proofFileId` | String | 100 | ❌ | - | ❌ |
| `proofFileName` | String | 200 | ❌ | - | ❌ |
| `loanRequestId` | String | 50 | ❌ | - | ❌ |
| `principalAmount` | Float | - | ❌ | - | ❌ |
| `interestAmount` | Float | - | ❌ | - | ❌ |

**Enum Values:**
- `status`: ["Pending", "Confirmed", "Rejected"]

**Indexes:**
- `memberId`
- `status`
- `loanRequestId`
- `$createdAt`

---

### 5. **Loan Requests Collection**
**Collection ID:** `loan_requests` (create new)

| Attribute Name | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `memberId` | String | 50 | ✅ | - | ❌ |
| `memberName` | String | 100 | ✅ | - | ❌ |
| `requestedAmount` | Float | - | ✅ | - | ❌ |
| `purpose` | String | 1000 | ✅ | - | ❌ |
| `repaymentPeriod` | Integer | - | ✅ | - | ❌ |
| `monthlyIncome` | Float | - | ✅ | - | ❌ |
| `status` | Enum | - | ✅ | "Pending Review" | ❌ |
| `submittedAt` | DateTime | - | ✅ | - | ❌ |
| `currentBalance` | Float | - | ✅ | 0 | ❌ |
| `approvedAmount` | Float | - | ✅ | 0 | ❌ |
| `collateral` | String | 500 | ❌ | - | ❌ |
| `guarantor` | String | 100 | ❌ | - | ❌ |
| `guarantorContact` | String | 100 | ❌ | - | ❌ |
| `approvedAt` | DateTime | - | ❌ | - | ❌ |
| `rejectedAt` | DateTime | - | ❌ | - | ❌ |
| `adminNotes` | String | 1000 | ❌ | - | ❌ |
| `lastRepaymentDate` | DateTime | - | ❌ | - | ❌ |

**Enum Values:**
- `status`: ["Pending Review", "Approved", "Rejected", "Fully Repaid"]

**Indexes:**
- `memberId`
- `status`
- `submittedAt`
- `$createdAt`

---

### 6. **Payments Collection (Registration & General Payments)**
**Collection ID:** `688c6f87003a70de3e6c` (already created)

| Attribute Name | Type | Size | Required | Default | Array |
|---|---|---|---|---|---|
| `memberId` | String | 50 | ✅ | - | ❌ |
| `memberName` | String | 100 | ✅ | - | ❌ |
| `paymentType` | String | 50 | ✅ | "Registration" | ❌ |
| `amount` | Float | - | ✅ | - | ❌ |
| `bankAccount` | String | 50 | ✅ | - | ❌ |
| `accountName` | String | 100 | ✅ | - | ❌ |
| `transferType` | String | 50 | ✅ | "Bank Transfer" | ❌ |
| `paymentMade` | Boolean | - | ✅ | false | ❌ |
| `confirmed` | Boolean | - | ✅ | false | ❌ |
| `status` | Enum | - | ✅ | "Pending" | ❌ |
| `description` | String | 500 | ❌ | - | ❌ |
| `proofFileId` | String | 100 | ❌ | - | ❌ |
| `proofFileName` | String | 200 | ❌ | - | ❌ |
| `confirmedAt` | DateTime | - | ❌ | - | ❌ |
| `activatedAt` | DateTime | - | ❌ | - | ❌ |

**Enum Values:**
- `status`: ["Pending", "Confirmed", "Rejected"]

**Indexes:**
- `memberId`
- `status`
- `paymentType`
- `$createdAt`

---

### 6. **Gallery Collection**
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

### 7. **Notifications Collection**
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
NEXT_PUBLIC_APPWRITE_LOAN_REQUESTS_COLLECTION_ID=loan_requests
NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID=688c6f87003a70de3e6c
NEXT_PUBLIC_APPWRITE_GALLERY_COLLECTION_ID=gallery
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=notifications
NEXT_PUBLIC_APPWRITE_STORAGE_ID=688ce0f4003dc5cb8eb6
```

---

## ✅ **Setup Checklist**

- [ ] Create Events collection with all attributes
- [ ] Create Savings collection with all attributes (for savings payments)
- [ ] Create Loans collection with all attributes (for loan repayment payments)
- [ ] Create Loan Requests collection with all attributes (for loan applications)
- [ ] Create Gallery collection with all attributes
- [ ] Create Notifications collection with all attributes
- [ ] Set up proper permissions for each collection
- [ ] Configure storage bucket permissions
- [ ] Update environment variables with new collection IDs
- [ ] Test authentication and database operations
- [ ] Create first admin user account

---

## 💡 **Payment System Architecture**

The payment system uses **separate collections for different payment types** to avoid conflicts and provide better data organization:

### **Payment Routing:**
- **Registration Payments** → `payments` collection
- **Savings Payments** → `savings` collection  
- **Loan Repayments** → `loans` collection

### **Why Separate Collections?**
1. **Unique Constraints:** Each payment type may have different unique constraints
2. **Schema Flexibility:** Different payment types need different fields
3. **Performance:** Smaller, focused collections for better query performance
4. **Business Logic:** Each payment type has different approval workflows

### **Common Fields Across All Payment Collections:**
- `memberId`, `memberName`, `amount`, `bankAccount`, `accountName`
- `transferType`, `paymentMade`, `confirmed`, `status`, `description`
- `proofFileId`, `proofFileName` (for payment proof uploads)

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