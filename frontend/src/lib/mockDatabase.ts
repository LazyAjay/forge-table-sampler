export interface EmployeeData {
  id: string;
  name: string;
  project: string;
  location: string;
  checkInTime: string;
  checkOutTime: string;
  hours: string;
  reportSubmitted: boolean;
  report: string;
  ssn: string | null;
  salary: number | null;
}

export interface ProductData {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "discontinued";
  weight: number;
}

export interface CustomerData {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  rating: number;
  creditLimit: number;
  status: "active" | "inactive";
}

export interface OrderData {
  id: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
}

export interface LogData {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  serviceName: string;
  message: string;
  durationMs: number;
}

const projects = ["Project Horizon", "Project Apex", "Project Gemini", "Project Sentinel", "Project Titan"];
const locations = ["New York Office", "Chicago Depot", "San Francisco Lab", "Austin Hub", "Remote HQ"];
const reports = [
  "Completed field logistics route mapping for sector 7. Fleet is currently active.",
  "Investigated diagnostic signals on critical node 42. Resolved routing loops.",
  "Created telemetry scripts for Docker cluster. CPU usage stabilized below 45%.",
  "Triage patient data logs checked. Compliance logs up to date.",
  "Updated routing algorithms for heavy transport cargo. Delivery confirmed.",
  "Conducted network sweep of main servers. Minor hardware adjustments made.",
  "Completed server migration to AWS us-east-1. CI/CD pipelines verified.",
  "Safety inspections finalized at Chicago depot. No compliance violations found.",
  "Weekend roster configured for upcoming deployment cycle.",
  "Analyzed circuit diagram specifications for the next prototype board."
];

const firstNames = [
  "Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Theodore",
  "Jack", "Levi", "Alexander", "Jackson", "Mateo", "Daniel", "Michael", "Mason", "Sebastian", "Ethan",
  "Logan", "Owen", "Samuel", "Wyatt", "John", "David", "Carter", "Julian", "Hudson", "Grayson",
  "Olivia", "Emma", "Charlotte", "Amelia", "Sophia", "Isabella", "Ava", "Mia", "Evelyn", "Harper",
  "Luna", "Camila", "Gianna", "Elizabeth", "Eleanor", "Ella", "Abigail", "Sofia", "Avery", "Scarlett"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
];

const productNamesByCategory: Record<string, string[]> = {
  "Electronics": ["Ergonomic Mechanical Keyboard", "Ultra-Wide Gaming Monitor 34\"", "Noise-Cancelling Wireless Headphones", "USB-C Multi-Port Adapter Hub", "Smart Fitness Tracker Watch", "4K Portable Projector", "Wireless Charging Pad Duo"],
  "Office Supplies": ["Premium Leather Journal", "Dual-Motor Electric Standing Desk", "Mesh Back Ergonomic Task Chair", "Gel Ink Pens Assorted Pack", "Self-Healing Cutting Mat", "Heavy Duty Document Shredder", "Magnetic Dry Erase Whiteboard"],
  "Home & Living": ["Stoneware Coffee Mug Set", "Ultrasonic Cool Mist Humidifier", "Handwoven Throw Pillow Cover", "Stainless Steel Compost Bin", "Dimmable Smart LED Desk Lamp", "Soy Wax Scented Candle", "Minimalist Wall Clock"],
  "Fitness & Outdoors": ["High-Density Yoga Mat", "Insulated Stainless Water Bottle", "Adjustable Dumbbells Set", "Resistance Bands Loop Set", "Camping Hammock with Straps", "Waterproof Running Waist Pack", "Trekking Pole Pair"],
  "Apparel": ["Merino Wool Hiking Socks", "Waterproof Windbreaker Jacket", "Organic Cotton Crewneck Tee", "Athletic Fleece Joggers", "Polarized Sport Sunglasses", "Canvas Roll-Top Backpack", "Breathable Mesh Running Shoes"],
  "Books": ["Clean Code: Handbook of Software Craft", "Designing Data-Intensive Applications", "The Pragmatic Programmer", "Refactoring: Improving Code Design", "Introduction to Algorithms", "Domain-Driven Design", "TypeScript Deep Dive"]
};

const companyPrefixes = ["Quantum", "Apex", "Global", "Nova", "Stellar", "Vector", "Matrix", "Helix", "Zenith", "Summit"];
const companySuffixes = ["Logistics", "Technologies", "Solutions", "Industries", "Group", "Enterprises", "Systems", "Networks", "Labs", "Partners"];
const countries = ["USA", "Canada", "UK", "Germany", "France", "Japan", "Australia", "India"];

const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer", "Apple Pay"];
const orderStatuses = ["pending", "shipped", "delivered", "cancelled"];

const serviceNames = ["AuthService", "OrderService", "InventoryService", "BillingService", "NotificationService", "TableModelEngine"];
const logLevels = ["INFO", "WARN", "ERROR", "DEBUG"];
const logMessages: Record<string, string[]> = {
  "AuthService": [
    "JWT token issued successfully for user uid=MEMB-2026-94X.",
    "Failed login attempt from IP 192.168.1.104.",
    "Role hierarchy re-evaluation completed.",
    "SSO connection pool initialized successfully.",
    "Expired session cleanup thread executed. Cleared 14 sessions."
  ],
  "OrderService": [
    "Order ORD-2026-8005 submitted for validation.",
    "Inventory lock acquired for order items.",
    "Order status updated to SHIPPED.",
    "Unable to locate order record for cancellation.",
    "Fulfillment queue length exceeded warning thresholds."
  ],
  "InventoryService": [
    "SKU stock check completed for category Electronics.",
    "Auto-replenishment threshold triggered for SKU TS-DE-441.",
    "Discontinued product lookup warning.",
    "Warehouse unit database transaction committed.",
    "SKU weight check exceeded package standards for parcel sorting."
  ],
  "BillingService": [
    "Invoice PDF generated successfully for account Zenith.",
    "Payment Gateway response delay: Credit Card authorization took 1500ms.",
    "Refund transaction failed: insufficient balance.",
    "Credit limit checking thread processed 45 company entities.",
    "Billing statement schedule dispatched to notification queue."
  ],
  "NotificationService": [
    "Email delivery succeeded to contact@quantumlog.com.",
    "SMS gateway returned status code 202 accepted.",
    "Failed to send push notification: connection reset by endpoint peer.",
    "Notification dispatch worker thread pool scaled to 10 instances.",
    "Newsletter batch delivery completed. Sent 1420 messages."
  ],
  "TableModelEngine": [
    "Table query parser successfully loaded target entity context Employee.",
    "Dynamic sort specs evaluated for Employee database index.",
    "PII data mask applied for role STANDARD_USER: SSN and Salary fields redacted.",
    "Large dataset paging chunk size warning: requested 1000 rows.",
    "Data table rendering thread completed layout calculation in 12ms."
  ]
};

// Generates 150 static employees
function generateEmployees(): EmployeeData[] {
  const employees: EmployeeData[] = [];
  for (let i = 0; i < 150; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 7) % lastNames.length];
    const name = `${fn} ${ln}`;
    const id = `MEMB-2026-${100 + i * 3}X`;
    const project = projects[i % projects.length];
    const location = locations[(i * 2) % locations.length];
    const reportSubmitted = i % 3 !== 0;
    
    let checkIn = "--";
    let checkOut = "--";
    let hoursStr = "0.0 hrs";
    
    if (reportSubmitted || i % 4 !== 0) {
      const hour = 8 + (i % 3);
      const min = (i * 4) % 45 + 10;
      checkIn = `${hour < 10 ? '0' + hour : hour}:${min} AM`;
      checkOut = `${(hour - 12 + 8) < 10 ? '0' + (hour - 12 + 8) : (hour - 12 + 8)}:${min} PM`;
      hoursStr = `${8 + (i % 2)}.0 hrs`;
    }

    const report = reportSubmitted ? reports[i % reports.length] : "";
    const ssnVal = `987-65-${4000 + i * 13}`;
    const salaryVal = 55000 + (i % 15) * 5000 + (i % 3) * 1200;

    employees.push({
      id,
      name,
      project,
      location,
      checkInTime: checkIn,
      checkOutTime: checkOut,
      hours: hoursStr,
      reportSubmitted,
      report,
      ssn: ssnVal,
      salary: salaryVal
    });
  }
  return employees;
}

// Generates 100 static products
function generateProducts(): ProductData[] {
  const products: ProductData[] = [];
  const categories = Object.keys(productNamesByCategory);
  let count = 0;
  for (let c = 0; c < categories.length; c++) {
    const category = categories[c];
    const names = productNamesByCategory[category];
    for (let n = 0; n < names.length; n++) {
      const name = names[n];
      const id = `PROD-${2000 + count}`;
      const sku = `${category.substring(0,2).toUpperCase()}-${name.substring(0,3).toUpperCase()}-${300 + count}`;
      const price = 12.99 + (count * 7.5) % 450;
      const stock = (count * 13) % 250;
      const status = count % 8 === 0 ? "discontinued" : "active";
      const weight = 0.1 + ((count * 3) % 150) / 10;
      products.push({
        id,
        sku,
        name,
        category,
        price,
        stock,
        status,
        weight
      });
      count++;
    }
  }

  while (count < 100) {
    const category = categories[count % categories.length];
    const baseNames = productNamesByCategory[category];
    const baseName = baseNames[count % baseNames.length];
    const name = `${baseName} (Batch ${Math.floor(count / baseNames.length) + 1})`;
    const id = `PROD-${2000 + count}`;
    const sku = `${category.substring(0,2).toUpperCase()}-${baseName.substring(0,3).toUpperCase()}-${300 + count}`;
    const price = 15.99 + (count * 9.2) % 350;
    const stock = (count * 17) % 300;
    const status = count % 9 === 0 ? "discontinued" : "active";
    const weight = 0.2 + ((count * 4) % 120) / 10;
    products.push({
      id,
      sku,
      name,
      category,
      price,
      stock,
      status,
      weight
    });
    count++;
  }

  return products;
}

// Generates 100 static customers
function generateCustomers(): CustomerData[] {
  const customers: CustomerData[] = [];
  for (let i = 0; i < 100; i++) {
    const pref = companyPrefixes[i % companyPrefixes.length];
    const suff = companySuffixes[(i * 3) % companySuffixes.length];
    const companyName = `${pref} ${suff}`;
    const id = `CUST-${5000 + i}`;
    const email = `contact@${pref.toLowerCase()}${suff.toLowerCase().substring(0, 4)}.com`;
    const phone = `+1 (555) ${200 + (i * 7) % 800}-${1000 + (i * 13) % 9000}`;
    const country = countries[(i * 2) % countries.length];
    const rating = 1 + (i % 5);
    const creditLimit = 50000 + (i % 10) * 15000 + (i % 3) * 5000;
    const status = i % 10 === 0 ? "inactive" : "active";

    customers.push({
      id,
      companyName,
      email,
      phone,
      country,
      rating,
      creditLimit,
      status
    });
  }
  return customers;
}

// Generates 120 static orders
function generateOrders(): OrderData[] {
  const orders: OrderData[] = [];
  const custs = generateCustomers();
  for (let i = 0; i < 120; i++) {
    const id = `ORD-2026-${8000 + i}`;
    const customer = custs[(i * 3) % custs.length];
    const customerName = customer.companyName;
    const year = 2026;
    const month = 1 + (i % 6);
    const day = 1 + (i * 7) % 28;
    const monthStr = month < 10 ? `0${month}` : month;
    const dayStr = day < 10 ? `0${day}` : day;
    const orderDate = `${year}-${monthStr}-${dayStr}`;
    const totalAmount = 150.5 + (i % 20) * 350 + (i % 3) * 45;
    const status = orderStatuses[i % orderStatuses.length] as any;
    const paymentMethod = paymentMethods[(i * 2) % paymentMethods.length];

    orders.push({
      id,
      customerName,
      orderDate,
      totalAmount,
      status,
      paymentMethod
    });
  }
  return orders;
}

// Generates 200 static system logs
function generateLogs(): LogData[] {
  const logs: LogData[] = [];
  for (let i = 0; i < 200; i++) {
    const id = `LOG-2026-${1000 + i}`;
    const level = logLevels[i % logLevels.length] as any;
    const serviceName = serviceNames[(i * 3) % serviceNames.length];
    const messages = logMessages[serviceName];
    const message = messages[i % messages.length];

    const year = 2026;
    const month = 7;
    const day = 11;
    const hour = 10 + (i % 4);
    const min = (i * 7) % 60;
    const sec = (i * 11) % 60;
    const hourStr = hour < 10 ? `0${hour}` : hour;
    const minStr = min < 10 ? `0${min}` : min;
    const secStr = sec < 10 ? `0${sec}` : sec;
    const timestamp = `${year}-0${month}-${day} ${hourStr}:${minStr}:${secStr}`;

    const durationMs = 5 + (i * 19) % 1500;

    logs.push({
      id,
      timestamp,
      level,
      serviceName,
      message,
      durationMs
    });
  }
  return logs;
}

// In-memory mock database cache
const mockDatabases: Record<string, any[]> = {
  Employee: generateEmployees(),
  Product: generateProducts(),
  Customer: generateCustomers(),
  Order: generateOrders(),
  SystemLog: generateLogs()
};

export function handleMockRequest(body: any, activeRole: string): { data: any[]; totalCount: number } {
  const { targetEntity, page, pageSize, searchQuery, filters, sortFields } = body;
  
  let rawData = mockDatabases[targetEntity];
  if (!rawData) {
    console.error(`Mock database not found for targetEntity: ${targetEntity}`);
    return { data: [], totalCount: 0 };
  }

  let data = [...rawData];

  // 1. Process Global Search Query
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    data = data.filter((row: any) => {
      return Object.entries(row).some(([key, val]) => {
        // Don't search PII fields if they will be masked
        if (targetEntity === "Employee" && activeRole !== "ADMIN" && (key === "ssn" || key === "salary")) {
          return false;
        }
        if (typeof val === "string" || typeof val === "number") {
          return String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }

  // 2. Process Sibling Multi-select and custom filters
  if (Array.isArray(filters)) {
    filters.forEach((filter: any) => {
      const { key, operator, value } = filter;
      if (value === undefined || value === null) {
        if (operator !== "IS_NULL" && operator !== "IS_NOT_NULL") return;
      }

      data = data.filter((row: any) => {
        const rowValue = row[key];

        if (operator === "IS_NULL") {
          return rowValue === null || rowValue === undefined || rowValue === "";
        }
        if (operator === "IS_NOT_NULL") {
          return rowValue !== null && rowValue !== undefined && rowValue !== "";
        }
        if (operator === "BETWEEN") {
          if (!Array.isArray(value) || value.length < 2) return true;
          const [min, max] = value;
          if (min === null || min === "" || max === null || max === "") return true;

          if (typeof rowValue === "number") {
            return rowValue >= Number(min) && rowValue <= Number(max);
          }
          if (typeof rowValue === "string") {
            const num = Number(rowValue);
            if (!isNaN(num)) {
              return num >= Number(min) && num <= Number(max);
            }
            // Date comparison
            const rowDate = new Date(rowValue).getTime();
            const minDate = new Date(min).getTime();
            const maxDate = new Date(max).getTime();
            if (!isNaN(rowDate) && !isNaN(minDate) && !isNaN(maxDate)) {
              return rowDate >= minDate && rowDate <= maxDate;
            }
            return rowValue >= min && rowValue <= max;
          }
          return true;
        }

        // Standard matches
        if (Array.isArray(value)) {
          if (value.length === 0) return true;
          if (typeof rowValue === "string") {
            const rowValues = rowValue.includes(",")
              ? rowValue.split(",").map((s) => s.trim().toLowerCase())
              : [rowValue.toLowerCase()];
            return value.some((v) => rowValues.includes(String(v).toLowerCase()));
          }
          return value.includes(rowValue);
        } else {
          if (typeof rowValue === "string") {
            return rowValue.toLowerCase() === String(value).toLowerCase();
          }
          if (typeof rowValue === "boolean") {
            const boolVal = typeof value === "string" ? value === "true" : Boolean(value);
            return rowValue === boolVal;
          }
          return rowValue == value;
        }
      });
    });
  }

  // 3. Process Sorting
  if (Array.isArray(sortFields) && sortFields.length > 0) {
    const { sortBy, sortOrder } = sortFields[0];
    const isDesc = sortOrder === "DESC";
    
    data.sort((a: any, b: any) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle specific mappings
      if (targetEntity === "Employee" && sortBy === "timecard") {
        aVal = a.hours;
        bVal = b.hours;
      }

      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";

      if (typeof aVal === "string" && typeof bVal === "string") {
        return isDesc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      return isDesc
        ? (bVal > aVal ? 1 : -1)
        : (aVal > bVal ? 1 : -1);
    });
  }

  const totalCount = data.length;

  // 4. Process Pagination slicing
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  let sliced = data.slice(start, end);

  // 5. Apply role-based PII masking if not Admin
  if (targetEntity === "Employee" && activeRole !== "ADMIN") {
    sliced = sliced.map((emp: any) => ({
      ...emp,
      ssn: "***-**-****",
      salary: null
    }));
  }

  return { data: sliced, totalCount };
}
