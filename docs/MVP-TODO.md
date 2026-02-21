# MVP To-Do List - Cashi Finance App

## 📊 MVP Definition

Aplikasi dianggap MVP-ready ketika user dapat:

- ✅ Register & Login
- ✅ Memiliki default categories
- ❌ **Menambahkan transaksi**
- ❌ **Melihat total income & expense**
- ❌ **Set budget per kategori**

---

## 🎯 Completion Status Dashboard

| Feature                            | Status         | Progress | Priority     |
| ---------------------------------- | -------------- | -------- | ------------ |
| **Authentication**                 | ✅ Complete    | 100%     | -            |
| **Users**                          | ✅ Complete    | 100%     | -            |
| **Categories**                     | ✅ Complete    | 100%     | -            |
| **Budgets**                        | 🟡 Partial     | 70%      | MEDIUM       |
| **Transactions**                   | ❌ Not Started | 0%       | **CRITICAL** |
| **Budget-Transaction Integration** | ❌ Not Started | 0%       | **CRITICAL** |

---

## 🚨 CRITICAL: Transaction Feature (0% Complete)

> **BLOCKER MVP** - Feature ini sepenuhnya belum ada dan merupakan core dari
> aplikasi finance.

### 📁 File Structure - Perlu Dibuat

- [ ] `src/api/transactions/` folder
- [ ] `src/api/transactions/index.js` - Route definitions
- [ ] `src/api/transactions/transactions.controller.js` - Controller layer
- [ ] `src/api/transactions/transactions.validation.js` - Joi validation schemas
- [ ] `src/services/postgres/TransactionsService.js` - Business logic layer
- [ ] `src/repository/TransactionsRepository.js` - Database access layer

### 🛣️ Required Endpoints

#### 1. Create Transaction

- [ ] **POST** `/transactions`
  - **Protected**: Yes (JWT required)
  - **Payload**:
    ```json
    {
      "transaction_name": "string",
      "type": "Income|Expenses",
      "amount": "number",
      "transaction_date": "ISO8601 DateTime",
      "note": "string (optional)",
      "category_id": "string (required)",
      "budget_id": "string (optional)"
    }
    ```
  - **Validations**:
    - [ ] User owns the category
    - [ ] If budget_id provided, user owns the budget
    - [ ] If budget_id provided, budget contains the category
    - [ ] Type matches category type
    - [ ] Amount > 0
  - **Side Effects**:
    - [ ] Update user balance (+ for Income, - for Expenses)
    - [ ] If budget_id exists, increment BudgetUsage.used_amount
    - [ ] Return created transaction with relations

#### 2. Get All Transactions

- [ ] **GET**
      `/transactions?type=Income|Expenses&category_id=xxx&start_date=xxx&end_date=xxx&page=1&limit=20`
  - **Protected**: Yes
  - **Query Params**:
    - [ ] `type` (optional) - Filter by Income/Expenses
    - [ ] `category_id` (optional) - Filter by category
    - [ ] `start_date` (optional) - Filter from date
    - [ ] `end_date` (optional) - Filter to date
    - [ ] `page` (default: 1)
    - [ ] `limit` (default: 20, max: 100)
  - **Response**:
    ```json
    {
      "transactions": [...],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "totalPages": 8
      },
      "summary": {
        "total_income": 5000000,
        "total_expense": 3500000,
        "balance": 1500000
      }
    }
    ```
  - **Include Relations**:
    - [ ] Category (name, type)
    - [ ] Budget (name, if exists)

#### 3. Get Transaction by ID

- [ ] **GET** `/transactions/:id`
  - **Protected**: Yes
  - **Validations**:
    - [ ] Verify user owns transaction
    - [ ] Return 404 if not found
  - **Include Relations**: Category, Budget (if exists)

#### 4. Update Transaction

- [ ] **PUT** `/transactions/:id`
  - **Protected**: Yes
  - **Payload**: Same as create (all fields optional)
  - **Complex Logic**:
    - [ ] If amount changed, recalculate user balance
    - [ ] If budget_id changed, update old BudgetUsage (decrement) and new
          BudgetUsage (increment)
    - [ ] If category changed, validate new category ownership
    - [ ] If type changed, validate against category type
  - **Validations**:
    - [ ] User owns transaction
    - [ ] User owns new category/budget if changed

#### 5. Delete Transaction

- [ ] **DELETE** `/transactions/:id`
  - **Protected**: Yes
  - **Side Effects**:
    - [ ] Revert user balance (opposite of creation)
    - [ ] If budget_id exists, decrement BudgetUsage.used_amount
    - [ ] Database CASCADE will handle relation cleanup
  - **Validations**:
    - [ ] User owns transaction

### 🗄️ Repository Layer (TransactionsRepository.js)

- [ ] `createTransaction(userId, payload)` - Insert with Prisma
- [ ] `getUserTransactions(userId, filters)` - Query with pagination & filters
- [ ] `getTransactionById(transactionId)` - Find unique with relations
- [ ] `updateTransaction(transactionId, payload)` - Update transaction
- [ ] `deleteTransaction(transactionId)` - Delete transaction
- [ ] `verifyUserOwnTransaction(userId, transactionId)` - Ownership check
- [ ] `calculateTotalIncomeExpense(userId, filters)` - Aggregation query
- [ ] `getTransactionsByBudget(budgetId)` - For budget details

### 🎯 Service Layer (TransactionsService.js)

- [ ] `createTransaction(userId, payload)`
  - [ ] Validate category ownership via CategoryService
  - [ ] If budget_id: validate budget ownership & category inclusion
  - [ ] Create transaction
  - [ ] Update user balance
  - [ ] If budget_id: increment BudgetUsage via BudgetsService
  - [ ] Use Prisma transaction for atomicity
- [ ] `getAllTransactions(userId, filters)`
  - [ ] Call repository with filters
  - [ ] Calculate summary (total income/expense)
  - [ ] Return paginated response
- [ ] `getTransactionById(userId, transactionId)`
  - [ ] Verify ownership
  - [ ] Return with relations
- [ ] `updateTransaction(userId, transactionId, payload)`
  - [ ] Verify ownership
  - [ ] Validate new category/budget if changed
  - [ ] Calculate balance difference
  - [ ] Update BudgetUsage if budget changed
  - [ ] Use Prisma transaction
- [ ] `deleteTransaction(userId, transactionId)`
  - [ ] Verify ownership
  - [ ] Get transaction details
  - [ ] Revert user balance
  - [ ] Decrement BudgetUsage if exists
  - [ ] Delete transaction

### ✅ Validation Schemas (transactions.validation.js)

- [ ] `createTransactionSchema`
  - [ ] transaction_name: required, string, max 255
  - [ ] type: required, enum ["Income", "Expenses"]
  - [ ] amount: required, number, positive
  - [ ] transaction_date: required, ISO date
  - [ ] note: optional, string
  - [ ] category_id: required, string
  - [ ] budget_id: optional, string

- [ ] `updateTransactionSchema`
  - [ ] All fields optional
  - [ ] Same validation rules

- [ ] `getTransactionsQuerySchema`
  - [ ] type: optional, enum
  - [ ] category_id: optional, string
  - [ ] start_date: optional, ISO date
  - [ ] end_date: optional, ISO date
  - [ ] page: optional, number, min 1
  - [ ] limit: optional, number, min 1, max 100

---

## 🟡 Budget Feature (70% Complete)

> **Status**: CRUD endpoints sudah complete! Tinggal validation schemas dan
> integrasi dengan transactions.

### 🛣️ Endpoints to Uncomment & Implement

#### 1. Get All Budgets

- [ ] Uncomment route: **GET** `/budgets` in `src/api/budgets/index.js`
- [x] Uncomment route: **GET** `/budgets` in `src/api/budgets/index.js`
- [x] Implement `getAllBudgetPerUser()` in `BudgetsService.js`n:
  ```json
  {
    "budgets": [
      {
        "id": "xxx",
        "budget_name": "Groceries Budget",
        "type": "Monthly",
        "amount_limit": 2000000,
        "current_amount": 1500000,
        "period_start": "2026-02-01",
        "period_end": "2026-02-28",
        "categories": [...],
        "current_usage": {
          "used_amount": 1500000,
          "percentage": 75,
          "remaining": 500000,
          "status": "on_track|warning|over_budget"
        }
      }
    ]
  }
  ```
- [ ] Include relations: categories, current BudgetUsage

#### 2. Get Budget by ID

- [ ] Uncomment route: **GET** `/budgets/:id` in `src/api/budgets/index.js`
- [x] Uncomment route: **GET** `/budgets/:id` in `src/api/budgets/index.js`
- [x] Implement `getBudgetById(userId, budgetId)` in BudgetsService (as
      `getOneBudgetByIdPerUser`)
- [x] Include:
  - [ ] Categories
  - [ ] Current BudgetUsage
  - [ ] Recent transactions (last 10)
  - [ ] Usage history (all periods)
  - [ ] Status calculation

#### 3. Update Budget

- [ ] Uncomment route: **PUT** `/budgets/:id` in `src/api/budgets/index.js`
- [x] Uncomment route: **PUT** `/budgets/:id` in `src/api/budgets/index.js`
- [x] Implement `updateBudget(userId, budgetId, payload)` in BudgetsService (as
      `updateBudgetById`)
- [x[ ] budget_name
  - [x] budget_name
  - [x] amount_limit (as `amount`)
  - [x] type
  - [ ] categories (array of category_ids - sync BudgetCategory)
- [x] Validations:
  - [x] User owns budget
  - [ ] User owns all categories
  - [ ] Cannot change from Monthly to OpenEnded if has multiple periods
- [x] Use BudgetsRepository methods: `updateBudget()`, `updateBudgetLimit

#### 4. Delete Budget

- [ ] Uncomment route: **DELETE** `/budgets/:id` in `src/api/budgets/index.js`
- [x] Uncomment route: **DELETE** `/budgets/:id` in `src/api/budgets/index.js`
- [x] Implement `deleteBudget(userId, budgetId)` in BudgetsService (as
      `deleteBudgetById`)
- [x] Verify ownership
- [x] Use `BudgetsRepository.deleteBudget()`
- [x

### ✅ Validation Schemas (budget.validation.js)

> **Status**: File exists but completely empty!

- [ ] `createBudgetSchema` (move from inline to file)
  - [ ] budget_name: required, string, max 255
  - [ ] type: required, enum ["Monthly", "OpenEnded"]
  - [ ] amount_limit: required, number, positive
  - [ ] period_start: required, ISO date
  - [ ] period_end: optional (auto-calculated for Monthly)
  - [ ] category_ids: required, array, min 1

- [ ] `updateBudgetSchema`
  - [ ] All fields optional
  - [ ] Same validation rules

- [ ] `getBudgetsQuerySchema`
  - [ ] type: optional, enum
  - [ ] status: optional, enum ["active", "expired", "over_budget"]

### 🎯 Service Methods to Implement

- [ ] `getAllBudgetPerUser(userId, filters)` - Currently empty stub -x]
      `getAllBudgetPerUser(userId, filters)` - ✅ Implemented
  - [x] Get all user budgets from repository
  - [ ] Calculate current usage for each
  - [ ] Determine status (on_track/warning/over_budget)
  - [ ] Filter by type/status if provided

- [x] `getBudgetById(userId, budgetId)` - ✅ Implemented (as
      `getOneBudgetByIdPerUser`)
  - [x] Verify ownership
  - [x] Get budget with all relations
  - [ ] Calculate detailed analytics
  - [ ] Get recent transactions
  - [ ] Get usage history

- [x] `updateBudget(userId, budgetId, payload)` - ✅ Implemented (as
      `updateBudgetById`)
  - [x] Verify ownership
  - [ ] Validate new categories ownership
  - [x] Update budget fields
  - [ ] Sync BudgetCategory table
  - [x] Return updated budget

- [x] `deleteBudget(userId, budgetId)` - ✅ Implemented (as `deleteBudgetById`)
  - [x] Verify ownership
  - [x] Delete via repository
  - [x
- [ ] `getBudgetStatus(budgetId)` - Helper method
  - [ ] Calculate percentage used
  - [ ] Return status: "on_track" (<80%), "warning" (80-100%), "over_budget"
        (>100%)

- [ ] `checkBudgetLimitExceeded(budgetId, additionalAmount)` - Helper for
      transaction creation
  - [ ] Check if adding amount would exceed limit
  - [ ] Return warning/error

---

## 🔗 Budget-Transaction Integration (0% Complete)

> **CRITICAL**: Budget tidak bisa track spending tanpa integration ini!

### Implementation Checklist

#### 1. Transaction Creation → Update Budget

- [ ] In `TransactionsService.createTransaction()`:

  ```javascript
  if (payload.budget_id && payload.type === "Expenses") {
    // Check if budget would be exceeded
    const wouldExceed = await this.budgetsService.checkBudgetLimitExceeded(
      payload.budget_id,
      payload.amount,
    );

    if (wouldExceed) {
      // Return warning or error based on business rules
    }

    // Increment BudgetUsage
    await this.budgetsRepository.incrementUsedAmount(
      payload.budget_id,
      payload.transaction_date,
      payload.amount,
    );
  }
  ```

#### 2. Transaction Deletion → Revert Budget

- [ ] In `TransactionsService.deleteTransaction()`:
  ```javascript
  if (transaction.budget_id && transaction.type === "Expenses") {
    // Decrement BudgetUsage
    await this.budgetsRepository.decrementUsedAmount(
      transaction.budget_id,
      transaction.transaction_date,
      transaction.amount,
    );
  }
  ```

#### 3. Transaction Update → Recalculate Budget

- [ ] Handle amount change
  - [ ] Decrement old amount from old budget
  - [ ] Increment new amount to new budget (if budget changed)
- [ ] Handle budget_id change
  - [ ] Remove from old budget
  - [ ] Add to new budget
- [ ] Handle type change (Income ↔ Expenses)
  - [ ] Recalculate budget impact

#### 4. Budget Period Reset (Monthly Budgets)

- [ ] Implement cron job or manual trigger
- [ ] Create new BudgetUsage for next period
- [ ] Reset current_amount to 0
- [ ] Update period_start and period_end
- [ ] Update last_reset_at

#### 5. Repository Methods Already Available

✅ These methods already exist in `BudgetsRepository.js`:

- `incrementUsedAmount(budgetId, periodStart, amount)`
- `decrementUsedAmount(budgetId, periodStart, amount)`
- `findBudgetUsage(budgetId, periodStart)`
- `createBudgetUsage(budgetId, periodStart, periodEnd)`

**Just need to call them from TransactionsService!**

---

## 📝 Additional MVP Tasks

### Testing

- [ ] Update Postman collection with all Transaction endpoints
- [ ] Add Budget GET/PUT/DELETE to Postman
- [ ] Test budget limit exceeded scenarios
- [ ] Test transaction cascade deletes
- [ ] Test pagination and filters

### Error Handling

- [ ] Transaction not found → NotFoundError
- [ ] Budget limit exceeded → ValidationError with warning flag
- [ ] Category not owned → AuthenticationError
- [ ] Invalid date range → ValidationError

### Data Validation

- [ ] Cannot create expense transaction with Income category (and vice versa)
- [ ] Cannot link transaction to budget if category not in budget
- [ ] Cannot delete category if transactions exist (Prisma will handle with
      CASCADE)

### Documentation

- [ ] Update TUTORIAL.md with Transaction usage examples
- [ ] Update TUTORIAL.md with Budget usage examples
- [ ] Document API response formats
- [ ] Add JSDoc comments to service methods

---

## ⏭️ Post-MVP Features (DEFERRED)

- [ ] Reporting & Analytics
  - [ ] Monthly income/expense reports
  - [ ] Category-wise spending breakdown
  - [ ] Budget vs actual comparison charts
  - [ ] Spending trends

- [ ] Advanced Features
  - [ ] Recurring transactions
  - [ ] Budget templates
  - [ ] Multi-currency support
  - [ ] Transaction attachments (receipts)
  - [ ] Notifications for budget limits

---

## 📊 Progress Tracking

**Last Updated**: February 22, 2026

### Current Sprint Priority

1. **Transaction Feature** - Complete foundation (1-2 weeks)
2. **Budget Completion** - Finish CRUD operations (3-5 days)
3. **Integration** - Link transactions to budgets (2-3 days)
4. **Testing** - End-to-end testing (2-3 days)

### Definition of Done

- [ ] All endpoints working and tested in Postman
- [ ] Database operations use Prisma transactions for atomicity
- [ ] Error handling consistent with existing patterns
- [ ] JWT authentication on all protected routes
- [ ] Budget tracks spending accurately from transactions
- [ ] User balance updates correctly
- [ ] No console errors or unhandled promise rejections

---

## 🎯 Success Criteria (MVP Launch)

The app is MVP-ready when:

1. ✅ User can register and login
2. ✅ Default categories are auto-assigned
3. ✅ User can create custom categories
4. ❌ **User can add income/expense transactions**
5. ❌ **User can view transaction history with filters**
6. ❌ **User can see total income and expense summary**
7. ❌ **User can create budget for categories**
8. ✅ **User can create budget for categories**
9. 🟡 **User can see budget usage and remaining amount** (partial - need
   enhancement)
10. ❌ **Budget auto-tracks spending when transactions are added**
11. ❌ **User gets warning when approaching budget limit**

## \*\*Current Progress: 4.5/10 ✅ (45

## 📚 References

- **Schema**: [prisma/schema.prisma](../prisma/schema.prisma)
- **Roadmap**: [docs/ROADMAP.md](ROADMAP.md)
- **Tutorial**: [docs/TUTORIAL.md](TUTORIAL.md)
- **Existing Budget Repo**:
  [src/repository/BudgetsRepository.js](../src/repository/BudgetsRepository.js)
  (comprehensive, underutilized)
- **Architecture Pattern**: Route → Controller → Service → Repository → Prisma
