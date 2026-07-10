package com.lazyinventor.forge_table.product.init;

import com.lazyinventor.forge_table.product.entity.Employee;
import com.lazyinventor.forge_table.product.entity.Product;
import com.lazyinventor.forge_table.product.entity.Order;
import com.lazyinventor.forge_table.product.entity.SystemLog;
import com.lazyinventor.forge_table.product.entity.Customer;
import com.lazyinventor.forge_table.product.repository.EmployeeRepository;
import com.lazyinventor.forge_table.product.repository.ProductRepository;
import com.lazyinventor.forge_table.product.repository.OrderRepository;
import com.lazyinventor.forge_table.product.repository.SystemLogRepository;
import com.lazyinventor.forge_table.product.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private SystemLogRepository systemLogRepository;
    
    @Autowired
    private CustomerRepository customerRepository;

    private static final String[] FIRST_NAMES = {
            "Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Theodore",
            "Jack", "Levi", "Alexander", "Jackson", "Mateo", "Daniel", "Michael", "Mason", "Sebastian", "Ethan",
            "Logan", "Owen", "Samuel", "Wyatt", "John", "David", "Carter", "Julian", "Hudson", "Grayson",
            "Olivia", "Emma", "Charlotte", "Amelia", "Sophia", "Isabella", "Ava", "Mia", "Evelyn", "Harper",
            "Luna", "Camila", "Gianna", "Elizabeth", "Eleanor", "Ella", "Abigail", "Sofia", "Avery", "Scarlett"
    };

    private static final String[] LAST_NAMES = {
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
            "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
            "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
            "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
            "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
    };

    private static final String[] DEPTS = {
            "Field Logistics Alpha",
            "Engineering Fleet",
            "DevOps Infrastructure",
            "Medical Health Fleet"
    };

    private static final Map<String, String[]> SHIFTS_BY_DEPT = new HashMap<>();
    static {
        SHIFTS_BY_DEPT.put("Field Logistics Alpha", new String[]{"Morning Shift Blueprint", "09:00 AM - 06:00 PM"});
        SHIFTS_BY_DEPT.put("Engineering Fleet", new String[]{"Technical Support On-Site", "10:00 AM - 07:00 PM"});
        SHIFTS_BY_DEPT.put("DevOps Infrastructure", new String[]{"Night Operations Network", "09:00 PM - 06:00 AM"});
        SHIFTS_BY_DEPT.put("Medical Health Fleet", new String[]{"Day Roster Template B", "08:00 AM - 05:00 PM"});
    }

    private static final Map<String, String[]> SKILLS_BY_DEPT = new HashMap<>();
    static {
        SKILLS_BY_DEPT.put("Field Logistics Alpha", new String[]{"Logistics", "Dispatch", "Routing", "Inventory Management", "Shipping"});
        SKILLS_BY_DEPT.put("Engineering Fleet", new String[]{"Field Maintenance", "Diagnostic", "Soldering", "Circuits", "CAD Drafting"});
        SKILLS_BY_DEPT.put("DevOps Infrastructure", new String[]{"Docker", "Kubernetes", "Linux", "AWS", "Shell Scripting", "CI/CD"});
        SKILLS_BY_DEPT.put("Medical Health Fleet", new String[]{"Triage", "Critical Care", "Nursing", "Occupational Safety", "First Aid"});
    }

    private static final String[] STATUSES = {"inside", "outside", "absent", "off-duty"};
    private static final String[] RISK_LEVELS = {"Low", "Medium", "High"};

    @Override
    public void run(String... args) throws Exception {
        Random random = new Random(42); // Deterministic seed for consistency

        // 1. Seed Employees
        if (employeeRepository.count() == 0) {
            List<Employee> employees = new ArrayList<>();
            String[] projects = { "Project Horizon", "Project Apex", "Project Gemini", "Project Sentinel", "Project Titan" };
            String[] locations = { "New York Office", "Chicago Depot", "San Francisco Lab", "Austin Hub", "Remote HQ" };
            String[] reports = {
                "Analyzed sales coverage reports and updated lead lists in Salesforce. Conducted client status check calls with 5 priority accounts.",
                "Completed on-site technician schedules for the upcoming dispatch cycle. Audited geofence compliance logs for field teams.",
                "Resolved billing reconciliation flags for customer invoices. Coordinated with account executives on credit limit approvals.",
                "Reviewed candidate staffing pipelines for active field placements. Managed interview availability slots for recruiters.",
                "Conducted training sessions on compliance guidelines for new contract personnel. Published updated shift rosters.",
                "Optimized database query performance for the generic table model framework. Resolved microservice memory leaks.",
                "Completed inventory stock audits for active electronics items. Organized warehouse logistics and delivery routing.",
                "Drafted next week's operational sprint objectives. Handled escalations on project timelines and client agreements."
            };

            for (int i = 0; i < 250; i++) {
                String fn = FIRST_NAMES[i % FIRST_NAMES.length];
                String ln = LAST_NAMES[(i * 7) % LAST_NAMES.length];
                String name = fn + " " + ln;
                String id = "MEMB-2026-" + (100 + (i * 13) % 900) + (char) ('A' + (i * 3) % 26);
                
                String project = projects[i % projects.length];
                String location = locations[(i * 3) % locations.length];
                
                // Mock times
                int inHour = 8 + (i % 3);
                int inMin = (i * 12) % 60;
                String checkInTime = String.format("%02d:%02d AM", inHour, inMin);
                
                int outHour = 4 + (i % 3);
                int outMin = (i * 18) % 60;
                String checkOutTime = String.format("%02d:%02d PM", outHour, outMin);
                
                double calculatedHours = 8.0 + (i % 4) * 0.5;
                String hours = String.format("%.1f hours", calculatedHours);
                
                boolean reportSubmitted = (i % 5) != 0; // 80% submission rate
                String report = reportSubmitted ? reports[i % reports.length] : "No report submitted for this shift.";
                
                String ssn = String.format("%03d-%02d-%04d", random.nextInt(1000), random.nextInt(100), random.nextInt(10000));
                double salary = 45000 + random.nextInt(105000) + (random.nextInt(100) / 100.0);

                Employee employee = new Employee();
                employee.setId(id);
                employee.setName(name);
                employee.setProject(project);
                employee.setLocation(location);
                employee.setCheckInTime(checkInTime);
                employee.setCheckOutTime(checkOutTime);
                employee.setHours(hours);
                employee.setReportSubmitted(reportSubmitted);
                employee.setReport(report);
                employee.setSsn(ssn);
                employee.setSalary(salary);

                employees.add(employee);
            }
            employeeRepository.saveAll(employees);
            System.out.println(">>> Successfully seeded " + employees.size() + " Employee records into H2 database!");
        }

        // 2. Seed Products
        if (productRepository.count() == 0) {
            String[] categories = {"Electronics", "Office Supplies", "Home & Living", "Fitness & Outdoors", "Apparel", "Books"};
            String[] activeStatuses = {"active", "discontinued"};
            String[][] itemTemplates = {
                {"Electronics", "Pro Laptop 15", "Mechanical Keyboard", "USB-C Hub", "Noise Cancelling Headphones", "UltraWide Monitor"},
                {"Office Supplies", "Ergonomic Chair", "Standing Desk", "Gel Pens Pack", "Wireless Presenter", "Dry Erase Board"},
                {"Home & Living", "Smart Thermostat", "Air Purifier", "LED Desk Lamp", "Coffee Maker", "Robot Vacuum"},
                {"Fitness & Outdoors", "Dumbbells Set", "Yoga Mat", "Water Bottle", "Running Backpack", "Resistance Bands"},
                {"Apparel", "Cotton Hoodie", "Running Shoes", "Wool Socks Pack", "Rain Jacket", "Sports Cap"},
                {"Books", "Clean Code Handbook", "System Design Volume 1", "Algorithm Design", "JPA Masterclass", "Spring In Action"}
            };
            
            List<Product> products = new ArrayList<>();
            for (int i = 0; i < 150; i++) {
                String cat = categories[i % categories.length];
                String[] templates = itemTemplates[i % categories.length];
                String name = templates[(i * 3) % templates.length] + " v" + (i % 3 + 1);
                String id = "SKU-" + (10000 + i * 47) + (char) ('A' + (i % 26));
                
                Product p = new Product();
                p.setId(id);
                p.setName(name);
                p.setSku(id);
                p.setPrice(15.99 + random.nextInt(1200) + random.nextInt(100)/100.0);
                p.setStock(random.nextInt(500));
                p.setCategory(cat);
                p.setStatus(activeStatuses[i % 5 == 0 ? 1 : 0]);
                p.setWeight(0.2 + random.nextInt(25) + random.nextInt(10)/10.0);
                products.add(p);
            }
            productRepository.saveAll(products);
            System.out.println(">>> Successfully seeded " + products.size() + " Product records into H2 database!");
        }

        // 3. Seed Orders
        if (orderRepository.count() == 0) {
            String[] paymentMethods = {"Credit Card", "PayPal", "Bank Transfer", "Apple Pay"};
            String[] orderStatuses = {"pending", "shipped", "delivered", "cancelled"};
            
            List<Order> orders = new ArrayList<>();
            for (int i = 0; i < 120; i++) {
                String id = "ORD-" + (8000 + i * 19);
                String customerName = FIRST_NAMES[i % FIRST_NAMES.length] + " " + LAST_NAMES[(i * 3) % LAST_NAMES.length];
                int day = 1 + (i % 28);
                String orderDate = String.format("2026-06-%02d", day);
                
                Order o = new Order();
                o.setId(id);
                o.setCustomerName(customerName);
                o.setOrderDate(orderDate);
                o.setTotalAmount(10.50 + random.nextInt(3200) + random.nextInt(100)/100.0);
                o.setStatus(orderStatuses[i % 7 == 0 ? 3 : i % 5 == 0 ? 2 : i % 3 == 0 ? 1 : 0]);
                o.setPaymentMethod(paymentMethods[i % paymentMethods.length]);
                orders.add(o);
            }
            orderRepository.saveAll(orders);
            System.out.println(">>> Successfully seeded " + orders.size() + " Order records into H2 database!");
        }

        // 4. Seed SystemLogs
        if (systemLogRepository.count() == 0) {
            String[] levels = {"INFO", "WARN", "ERROR", "DEBUG"};
            String[] services = {"AuthService", "OrderService", "InventoryService", "BillingService", "NotificationService", "TableModelEngine"};
            String[][] messages = {
                {"INFO", "User logged in successfully", "JWT token issued", "Session initialized"},
                {"WARN", "Database connection pool high usage", "Slow query detected (120ms)", "Disk usage exceeds 75%"},
                {"ERROR", "Failed to compile SQL script", "Payment gateway connection timeout", "NullPointerException in TableModelEngine"},
                {"DEBUG", "Dynamic Specification built in 2ms", "Repository lookup successful", "Un-proxied class type check completed"}
            };
            
            List<SystemLog> logs = new ArrayList<>();
            for (int i = 0; i < 200; i++) {
                String id = "LOG-" + (10000 + i * 37);
                String level = levels[i % levels.length];
                String service = services[(i * 2) % services.length];
                String[] msgs = messages[i % levels.length];
                String message = msgs[(i * 4) % msgs.length] + " [Thread ID: " + (i % 8 + 1) + "]";
                
                int hour = i % 24;
                int minute = (i * 7) % 60;
                int second = (i * 13) % 60;
                String timestamp = String.format("2026-06-27 %02d:%02d:%02d", hour, minute, second);
                
                SystemLog log = new SystemLog();
                log.setId(id);
                log.setTimestamp(timestamp);
                log.setLevel(level);
                log.setServiceName(service);
                log.setMessage(message);
                log.setDurationMs((long) (1 + random.nextInt(1500)));
                logs.add(log);
            }
            systemLogRepository.saveAll(logs);
            System.out.println(">>> Successfully seeded " + logs.size() + " SystemLog records into H2 database!");
        }

        // 5. Seed Customers
        if (customerRepository.count() == 0) {
            String[] companyNames = {"Apex Systems", "Global Tech", "Summit Group", "Titan Industries", "Nexus Ltd", "Alpha Beta Corp", "Blue Sky Ventures", "Horizon LLC", "Synergy Inc"};
            String[] countries = {"USA", "Canada", "UK", "Germany", "France", "Japan", "Australia", "India"};
            String[] statuses = {"active", "inactive"};
            
            List<Customer> customers = new ArrayList<>();
            for (int i = 0; i < 100; i++) {
                String id = "CUST-" + (900 + i);
                String company = companyNames[i % companyNames.length] + " " + (i % 2 == 0 ? "Corp" : "LLC");
                String email = "info@" + companyNames[i % companyNames.length].toLowerCase().replace(" ", "") + ".com";
                String phone = "+1 (555) " + (100 + (i * 23) % 900) + "-" + (1000 + (i * 41) % 9000);
                String country = countries[i % countries.length];
                
                Customer c = new Customer();
                c.setId(id);
                c.setCompanyName(company);
                c.setEmail(email);
                c.setPhone(phone);
                c.setCountry(country);
                c.setRating(1 + (i % 5)); // 1 to 5 stars
                c.setCreditLimit(5000.0 + random.nextInt(49) * 5000);
                c.setStatus(statuses[i % 10 == 0 ? 1 : 0]);
                customers.add(c);
            }
            customerRepository.saveAll(customers);
            System.out.println(">>> Successfully seeded " + customers.size() + " Customer records into H2 database!");
        }
    }
}
