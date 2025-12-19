# Network Automation & Programmability - Speaker Notes

**Prepared by:** Hexworth Academy
**Subject:** Network Essentials - Sprint 28: Automation & Programmability
**Presentation File:** automation-presentation.html
**Target Audience:** CCNA candidates, network engineering students
**Presentation Duration:** 75-90 minutes (with interactive demos)
**Difficulty Level:** Intermediate
**CCNA Objectives:** 6.1-6.7

---

## Table of Contents

1. [Slide 1: Title Slide](#slide-1-title-slide)
2. [Slide 2: Why Automation?](#slide-2-why-automation)
3. [Slide 3: REST APIs](#slide-3-rest-apis)
4. [Slide 4: HTTP Methods (CRUD)](#slide-4-http-methods-crud)
5. [Slide 5: HTTP Status Codes](#slide-5-http-status-codes)
6. [Slide 6: JSON vs XML](#slide-6-json-vs-xml)
7. [Slide 7: JSON Syntax](#slide-7-json-syntax)
8. [Slide 8: REST API Example](#slide-8-rest-api-example)
9. [Slide 9: Cisco DNA Center](#slide-9-cisco-dna-center)
10. [Slide 10: Configuration Management Tools](#slide-10-configuration-management-tools)
11. [Slide 11: Ansible Deep Dive](#slide-11-ansible-deep-dive)
12. [Slide 12: Infrastructure as Code](#slide-12-infrastructure-as-code)
13. [Slide 13: Python for Networking](#slide-13-python-for-networking)
14. [Slide 14: NETCONF](#slide-14-netconf)
15. [Slide 15: RESTCONF](#slide-15-restconf)
16. [Slide 16: YANG Data Models](#slide-16-yang-data-models)
17. [Slide 17: Comparison Summary](#slide-17-comparison-summary)
18. [Slide 18: Automation Workflow](#slide-18-automation-workflow)
19. [Slide 19: Best Practices](#slide-19-best-practices)
20. [Slide 20: Summary](#slide-20-summary)

---

## Introduction to This Presentation

### Instructor Preparation Notes

**CRITICAL CONTEXT:** Network automation is THE future of networking, and the CCNA exam has significantly increased coverage of this topic. This is no longer a "nice to have" - it's a core requirement for modern network engineers. Many students struggle because they've only learned CLI, and APIs/automation feel foreign.

**Common Student Misconceptions:**

- "Automation will replace network engineers" - FALSE! It elevates us from repetitive tasks to strategic work
- "I need to be a programmer" - FALSE! You need to understand concepts and use tools, not write complex code
- "REST APIs are complicated" - They're actually simpler than parsing CLI output once you understand them
- "This isn't tested on CCNA" - WRONG! Domain 6 (6.1-6.7) is dedicated to automation

**Prerequisites (Students Should Know):**

- Basic networking fundamentals (IP addressing, VLANs, routing)
- Command-line interface (CLI) configuration
- Basic understanding of HTTP/HTTPS (web browsing)
- Willingness to learn new paradigms (API vs CLI mindset)

**Why Automation Matters:**

In the real world:
- Cloud providers automate EVERYTHING (AWS, Azure, GCP)
- DevOps culture requires infrastructure as code
- Enterprise networks are too large for manual configuration
- Network as a Service (NaaS) relies entirely on APIs
- SDN controllers (DNA Center, NSO, ACI) are API-driven

Every network job posting now includes "automation" or "scripting" requirements.

**Materials Needed:**

- Access to the Automation Visualizer tool
- Postman or curl for live API demonstrations (optional)
- Python 3.x installed (for optional live coding demos)
- Cisco DevNet sandbox account (free) for DNA Center access
- Whiteboard for HTTP method diagrams
- Ansible playbook examples

**Timing Recommendations:**

- Slides 1-2: Introduction and motivation (10 minutes)
- Slides 3-8: REST APIs and data formats (25 minutes) - KEY SECTION
- Slides 9-13: Configuration management and IaC (20 minutes)
- Slides 14-17: NETCONF, RESTCONF, YANG (15 minutes)
- Slides 18-20: Workflow and best practices (10 minutes)
- Interactive tool demo and Q&A (15 minutes)

---

## Slide 1: Title Slide

### Visual Description
Orange gradient background (matching theme) with title "Network Automation & Programmability" and subtitle about APIs and Infrastructure as Code. CCNA objectives 6.1-6.7 highlighted.

### Speaker Notes

**Opening (3 minutes):**

Welcome to Sprint 28 on Network Automation and Programmability. This is arguably the MOST important topic for your future career, even though it might feel unfamiliar right now.

**Set the Expectations:**

Let me be clear about what we're covering today:
- You will NOT become a programmer
- You will NOT write complex code
- You WILL understand how modern networks are managed
- You WILL know the difference between APIs, CLI scraping, and modern tools

**The Paradigm Shift:**

For the past few weeks, you've been learning:
```
Router(config)# interface GigabitEthernet0/1
Router(config-if)# ip address 10.1.1.1 255.255.255.0
```

Today you'll learn how to do the same thing with an API:
```python
PUT /api/v1/interfaces/GigabitEthernet0/1
{
  "ip_address": "10.1.1.1",
  "subnet_mask": "255.255.255.0"
}
```

Which approach scales better? If you need to configure 1,000 routers?

**Learning Objectives:**

By the end of this session, you will:
1. Understand REST APIs and how they differ from CLI
2. Know the four HTTP methods (GET, POST, PUT, DELETE) and what they do
3. Understand JSON and XML data formats
4. Explain what Ansible, Puppet, and Chef do (and why Ansible dominates networking)
5. Describe NETCONF, RESTCONF, and YANG
6. Understand Infrastructure as Code (IaC) principles

**Real-World Context:**

I want to share a story. A network engineer once spent 3 weeks manually updating firewall rules on 500 routers. Three weeks of copying, pasting, checking. One small typo broke an entire data center.

With automation, that same task: 30 minutes to write the playbook, 5 minutes to deploy to 500 devices, zero typos.

That's why we're here.

---

## Slide 2: Why Automation?

### Visual Description
Two contrasting boxes: "Problems with Manual Configuration" (red danger box) listing human error, slow deployment, etc., and "Benefits of Automation" (green success box) listing consistency, speed, reliability.

### Speaker Notes

**The Manual Configuration Problem (5 minutes):**

Let's talk about reality. How many of you have:
- Made a typo in a router config?
- Forgotten to save a config and lost it on reboot?
- Configured 50 switches slightly differently by accident?

(Wait for hands - everyone has done this)

**The Five Problems:**

**1. Human Error:**
You're configuring VLAN 30. You type "vlan 3" instead. Oops. Now traffic goes to the wrong VLAN. In a manual process, this happens constantly.

**2. Doesn't Scale:**
You can configure 1 router in 10 minutes. Can you configure 1,000 routers in 10,000 minutes? That's 167 hours, or over 4 work weeks. And by the time you finish, the first router's config is outdated.

**3. Slow Deployment:**
Business needs a new VLAN across 200 switches. Manual deployment: 2-3 days. Automated: 15 minutes.

**4. Inconsistency:**
You configure switch 1 with "description Link-to-Core". On switch 50, you type "description link to core" (different spacing, capitalization). Now searching and documentation is harder.

**5. No Version Control:**
You made a change last week that broke something. What did you change? On which devices? When? Why? Without automation and Git, you're guessing.

**The Automation Solution:**

All five problems disappear:
- **No typos** - copy-paste from templates
- **Scales infinitely** - 1 device or 10,000, same effort
- **Fast deployment** - minutes instead of days
- **Perfect consistency** - same template, same result
- **Full audit trail** - Git tracks every change with who/what/when/why

**Discussion Prompt:**

"Can anyone think of a task you do repeatedly that could be automated?"

Common answers:
- Adding VLANs to multiple switches
- Updating ACLs across routers
- Backing up configurations nightly
- Checking interface status on all devices

These are perfect automation candidates!

**The Mindset Shift:**

Old thinking: "I'm a network engineer, I configure routers."
New thinking: "I'm a network engineer, I build systems that configure routers."

You're moving from operator to architect.

---

## Slide 3: REST APIs

### Visual Description
Definition of REST API with key characteristics (stateless, client-server, HTTP-based, resource-based). Example URI showing resource addressing.

### Speaker Notes

**What is an API? (7 minutes):**

Before we talk about REST, let's define API:

**API = Application Programming Interface**

It's a way for programs to talk to each other. When you use a website, YOU interact with the web interface. When a program needs data, IT uses an API.

**Why REST?**

REST stands for **Representational State Transfer**. Don't memorize that. What matters is:
- It uses standard HTTP (same protocol as web browsing)
- It's stateless (each request is independent)
- It's resource-based (everything has a URL)

**The Restaurant Analogy:**

Think of REST like a restaurant:
- **Menu (API documentation):** Shows what you can order
- **Waiter (HTTP):** Takes your order and brings food
- **Kitchen (Device):** Prepares what you ordered
- **Dish (Resource):** The thing you wanted (interface config, VLAN info, etc.)

You don't go into the kitchen (CLI). You use the waiter (API).

**Key Characteristics:**

**1. Stateless:**
Each API request contains ALL information needed. The server doesn't remember previous requests.

Example:
```
Request 1: GET /interfaces/Gi0/1 (includes auth token)
Request 2: GET /interfaces/Gi0/2 (includes auth token again)
```

The server doesn't remember Request 1 when processing Request 2.

**2. Client-Server:**
Clear separation. Your script (client) makes requests. The router (server) responds. Neither cares what the other is built with.

**3. Uses HTTP/HTTPS:**
Same protocols as web browsing. GET, POST, PUT, DELETE - you already know these concepts from using websites.

**4. Resource-Based:**
Everything is a resource with a unique URI:

```
https://router.example.com/api/v1/interfaces/GigabitEthernet0/1
|                        |      |  |                       |
Hostname                 API    Version  Resource path
```

**5. Returns Data:**
Not human-readable text like CLI. Structured data (JSON/XML) that programs can parse.

**REST vs CLI:**

| CLI | REST API |
|-----|----------|
| Human-friendly output | Machine-readable data |
| Text parsing required | Structured JSON/XML |
| SSH connection | HTTP(S) request |
| Sequential commands | Single request per resource |
| Hard to automate reliably | Designed for automation |

**Example:**

CLI approach to get interface status:
```
Router# show ip interface brief
GigabitEthernet0/1  10.1.1.1  YES manual up  up
```

You have to parse this text. What if the output format changes between IOS versions? Your script breaks.

REST API approach:
```
GET https://router/api/v1/interfaces/GigabitEthernet0/1
Response:
{
  "name": "GigabitEthernet0/1",
  "ip": "10.1.1.1",
  "status": "up",
  "protocol": "up"
}
```

Structured data. Easy to parse. Version-agnostic if API is well-designed.

**CCNA Exam Focus:**

Know that REST APIs:
- Use HTTP/HTTPS
- Are stateless
- Return JSON or XML
- Use standard HTTP methods (next slide)

---

## Slide 4: HTTP Methods (CRUD)

### Visual Description
Four colorful cards showing GET (blue, Read), POST (green, Create), PUT (yellow, Update), DELETE (red, Delete), each with descriptions and examples.

### Speaker Notes

**CRUD Operations (8 minutes):**

REST APIs use standard HTTP methods to perform CRUD operations:
- **C**reate
- **R**ead
- **U**pdate
- **D**elete

Think of it like database operations, but for network devices.

**GET - Read Data:**

**Purpose:** Retrieve information without changing anything

**Example Use Cases:**
- Get list of all interfaces
- Check interface status
- Read current VLAN configuration
- Retrieve routing table

**Example Request:**
```
GET /api/v1/interfaces
GET /api/v1/vlans/10
GET /api/v1/routes
```

**Key Point:** GET is **safe** - it never modifies anything. You can call it 1,000 times and the device state remains unchanged. This is called **idempotent**.

**POST - Create New Resource:**

**Purpose:** Create something new that didn't exist before

**Example Use Cases:**
- Create new VLAN
- Add new user account
- Create new routing policy
- Add ACL entry

**Example Request:**
```
POST /api/v1/vlans
Body:
{
  "vlan_id": 30,
  "name": "Engineering",
  "state": "active"
}
```

**Key Point:** POST is NOT idempotent. If you call it twice, you might create two VLANs (or get an error that it already exists).

**PUT - Update Existing Resource:**

**Purpose:** Modify something that already exists

**Example Use Cases:**
- Change interface IP address
- Update VLAN name
- Modify interface description
- Change routing protocol settings

**Example Request:**
```
PUT /api/v1/interfaces/GigabitEthernet0/1
Body:
{
  "ip_address": "10.1.1.10",
  "subnet_mask": "255.255.255.0",
  "description": "Updated Link"
}
```

**Key Point:** PUT is idempotent. Calling it 10 times produces the same result as calling it once.

**DELETE - Remove Resource:**

**Purpose:** Delete something

**Example Use Cases:**
- Remove VLAN
- Delete ACL entry
- Remove user account
- Delete static route

**Example Request:**
```
DELETE /api/v1/vlans/99
DELETE /api/v1/acl/entries/42
```

**Key Point:** DELETE is idempotent. Deleting the same resource twice: first time it's deleted, second time you get "404 Not Found" (which is fine, the end state is the same - resource doesn't exist).

**Memory Trick:**

Think of HTTP methods like file operations:
- **GET** = Open and read a file
- **POST** = Create a new file
- **PUT** = Edit existing file
- **DELETE** = Delete a file

**Common Student Question:**

"Why not just use GET for everything?"

Answer: REST is based on HTTP semantics. GET means "don't change anything." If your operation modifies state, using GET violates the standard and confuses other developers. Use the right method for the operation.

**Interactive Demo:**

Open the Automation Visualizer tool. Let students see GET, POST, PUT, DELETE in action. Show how:
- GET returns data
- POST creates something new (201 Created)
- PUT modifies existing (200 OK)
- DELETE removes (200 OK)

---

## Slide 5: HTTP Status Codes

### Visual Description
Table showing common HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error, with meanings and contexts.

### Speaker Notes

**Understanding Responses (6 minutes):**

When you make an API request, you get back:
1. **Status Code** - 3-digit number indicating success/failure
2. **Headers** - Metadata about the response
3. **Body** - Actual data (JSON/XML)

Let's focus on status codes.

**The Status Code Categories:**

**2xx - Success** (Everything worked)
**3xx - Redirection** (Resource moved, not common in network APIs)
**4xx - Client Error** (You messed up)
**5xx - Server Error** (Device messed up)

**Rule of Thumb:**
- 2xx = Happy
- 4xx = Your fault
- 5xx = Their fault

**Common Success Codes:**

**200 OK** - Most common success
- Your GET request worked, here's the data
- Your PUT request worked, resource updated
- Your DELETE request worked, resource deleted

Example:
```
GET /api/v1/interfaces/Gi0/1
Response: 200 OK
{
  "name": "GigabitEthernet0/1",
  "status": "up"
}
```

**201 Created** - Resource created successfully
- Your POST request worked, new resource exists
- Often includes a "Location" header with the new resource's URI

Example:
```
POST /api/v1/vlans
Response: 201 Created
Location: /api/v1/vlans/30
{
  "vlan_id": 30,
  "name": "Engineering"
}
```

**Common Client Error Codes (Your Fault):**

**400 Bad Request** - Malformed request
- Your JSON syntax is wrong (missing comma, quote, etc.)
- Required field is missing
- Invalid data type (sent string instead of number)

Example:
```
POST /api/v1/vlans
Body: { vlan_id: "not-a-number" }  # Should be integer!
Response: 400 Bad Request
{
  "error": "vlan_id must be an integer"
}
```

**401 Unauthorized** - Authentication failed
- Wrong username/password
- Missing authentication token
- Expired token

Example:
```
GET /api/v1/interfaces
Header: Authorization: Bearer expired_token
Response: 401 Unauthorized
{
  "error": "Token expired"
}
```

**404 Not Found** - Resource doesn't exist
- Typo in URI
- Resource was deleted
- Wrong endpoint

Example:
```
GET /api/v1/interfaces/Gi0/99  # Doesn't exist
Response: 404 Not Found
{
  "error": "Interface not found"
}
```

**Common Server Error Codes (Their Fault):**

**500 Internal Server Error** - Something broke on the device
- Bug in the API code
- Database connection failed
- Unexpected condition

Example:
```
GET /api/v1/interfaces
Response: 500 Internal Server Error
{
  "error": "Database connection timeout"
}
```

**Troubleshooting with Status Codes:**

When automation fails, check the status code:

- **401?** Check your credentials
- **404?** Verify the URI is correct
- **400?** Validate your JSON syntax
- **500?** Not your fault, contact support or check device logs

**Interactive Exercise:**

Use the REST API Explorer in the visualizer. Have students:
1. Send a GET request - see 200 OK
2. Discuss what would cause 404 (wrong interface name)
3. Discuss what would cause 401 (no auth token)

**CCNA Exam Focus:**

Memorize these:
- **200** = Success (OK)
- **201** = Resource Created
- **400** = Bad Request (your JSON is wrong)
- **401** = Unauthorized (auth failed)
- **404** = Not Found (resource doesn't exist)
- **500** = Server Error (device problem)

---

## Slide 6: JSON vs XML

### Visual Description
Side-by-side comparison of the same data in JSON and XML format, with advantages listed for each.

### Speaker Notes

**Data Format War (6 minutes):**

REST APIs return data. Two common formats: JSON and XML.

**The Same Data, Two Formats:**

Imagine we want to represent an interface configuration:

**JSON Version:**
```json
{
  "interface": "GigabitEthernet0/1",
  "ip_address": "10.1.1.1",
  "subnet_mask": "255.255.255.0",
  "status": "up"
}
```

**XML Version:**
```xml
<interface>
  <name>GigabitEthernet0/1</name>
  <ip_address>10.1.1.1</ip_address>
  <subnet_mask>255.255.255.0</subnet_mask>
  <status>up</status>
</interface>
```

Both contain the exact same information. Let's compare them.

**JSON (JavaScript Object Notation):**

**Advantages:**
- **Lightweight** - Less characters, smaller file size
- **Easy to read** - Humans can parse it quickly
- **Native to JavaScript** - Web browsers understand it natively
- **Faster to parse** - Less overhead than XML
- **More popular** - Most modern APIs use JSON

**Syntax Rules:**
- Curly braces `{}` for objects
- Square brackets `[]` for arrays
- Key-value pairs: `"key": "value"`
- Strings in double quotes
- Numbers, booleans, null without quotes

**When to Use:** Almost always the default choice for modern APIs

**XML (eXtensible Markup Language):**

**Advantages:**
- **More expressive** - Supports attributes and namespaces
- **Better for complex hierarchies** - Deeply nested structures
- **Schema validation** - XSD can enforce structure
- **Legacy compatibility** - Older systems use XML

**Syntax Rules:**
- Opening tags: `<tag>`
- Closing tags: `</tag>`
- Attributes in opening tags: `<interface type="physical">`
- All tags must be properly closed

**When to Use:**
- NETCONF requires XML
- SOAP web services use XML
- When working with legacy systems

**The Trend:**

JSON is winning. Here's why:

**Comparison:**

| Feature | JSON | XML |
|---------|------|-----|
| Readability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Compactness | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Parse Speed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Expressiveness | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Popularity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Real-World Example:**

Same VLAN list in both formats:

**JSON (Compact):**
```json
{
  "vlans": [
    {"id": 10, "name": "Management"},
    {"id": 20, "name": "Sales"},
    {"id": 30, "name": "Engineering"}
  ]
}
```

**XML (Verbose):**
```xml
<vlans>
  <vlan>
    <id>10</id>
    <name>Management</name>
  </vlan>
  <vlan>
    <id>20</id>
    <name>Sales</name>
  </vlan>
  <vlan>
    <id>30</id>
    <name>Engineering</name>
  </vlan>
</vlans>
```

JSON: 115 characters
XML: 185 characters

For 1,000 VLANs, that's a significant difference in bandwidth and parsing time.

**Interactive Demo:**

Open the JSON/XML Converter in the visualizer:
1. Show students how to convert JSON to XML
2. Point out how much longer XML becomes
3. Convert back to JSON
4. Discuss which format is easier to read

**CCNA Exam Focus:**

- Know that JSON is more popular and compact
- Know that XML is more verbose but supports attributes
- Understand that both represent the same data
- NETCONF uses XML, RESTCONF can use either

---

## Slide 7: JSON Syntax

### Visual Description
Breakdown of JSON syntax rules with examples: objects, arrays, key-value pairs, data types. Complete example showing nested structure.

### Speaker Notes

**Understanding JSON Structure (5 minutes):**

Let's master JSON syntax because you'll see it everywhere in network automation.

**Rule 1: Objects = Curly Braces**

An object is a collection of key-value pairs:

```json
{
  "hostname": "Router1",
  "ip_address": "10.1.1.1"
}
```

Think of objects like a dictionary: keys on the left, values on the right.

**Rule 2: Arrays = Square Brackets**

An array is an ordered list of items:

```json
[
  "GigabitEthernet0/1",
  "GigabitEthernet0/2",
  "GigabitEthernet0/3"
]
```

Arrays can contain strings, numbers, objects, or even other arrays.

**Rule 3: Key-Value Pairs**

Format: `"key": value`

- Keys MUST be strings (in double quotes)
- Values can be: strings, numbers, booleans, null, objects, or arrays

Examples:
```json
{
  "interface": "Gi0/1",           // String
  "vlan_id": 10,                   // Number
  "enabled": true,                 // Boolean
  "description": null,             // Null (no value)
  "vlans": [10, 20, 30]           // Array
}
```

**Rule 4: Data Types**

**String:** Text in double quotes
```json
"name": "Engineering"
```

**Number:** Integer or decimal, no quotes
```json
"vlan_id": 30,
"bandwidth": 1000.5
```

**Boolean:** true or false (lowercase, no quotes)
```json
"enabled": true,
"shutdown": false
```

**Null:** Represents no value (lowercase, no quotes)
```json
"description": null
```

**Object:** Nested key-value pairs
```json
"interface": {
  "name": "Gi0/1",
  "status": "up"
}
```

**Array:** Ordered list
```json
"vlans": [10, 20, 30]
```

**Complete Example:**

Let's build a complex JSON structure:

```json
{
  "device": {
    "hostname": "CoreSwitch1",
    "type": "Cisco Catalyst 9300",
    "management_ip": "10.0.0.1"
  },
  "vlans": [
    {
      "vlan_id": 10,
      "name": "Management",
      "enabled": true
    },
    {
      "vlan_id": 20,
      "name": "Sales",
      "enabled": true
    },
    {
      "vlan_id": 99,
      "name": "Unused",
      "enabled": false
    }
  ],
  "interfaces": [
    {
      "name": "GigabitEthernet1/0/1",
      "description": "Uplink to Core",
      "ip_address": "10.1.1.1",
      "subnet_mask": "255.255.255.252",
      "status": "up"
    },
    {
      "name": "GigabitEthernet1/0/2",
      "description": "Access Port",
      "vlan": 20,
      "status": "up"
    }
  ]
}
```

**Breaking It Down:**

- Root level: One object `{}`
- Three top-level keys: `device`, `vlans`, `interfaces`
- `device`: Object with 3 properties
- `vlans`: Array of 3 VLAN objects
- `interfaces`: Array of 2 interface objects

**Common Syntax Errors:**

**1. Missing Comma:**
```json
{
  "vlan_id": 10
  "name": "Sales"  // ERROR! Need comma after 10
}
```

**2. Trailing Comma:**
```json
{
  "vlan_id": 10,
  "name": "Sales",  // ERROR! Last item can't have trailing comma
}
```

**3. Single Quotes:**
```json
{
  'vlan_id': 10  // ERROR! Must use double quotes
}
```

**4. Unquoted Keys:**
```json
{
  vlan_id: 10  // ERROR! Keys must be quoted strings
}
```

**5. Comments (Not Allowed):**
```json
{
  "vlan_id": 10,  // This is VLAN 10  ERROR! No comments in JSON
  "name": "Sales"
}
```

**Validating JSON:**

Use online tools:
- jsonlint.com
- jsonformatter.org

Or Python:
```python
import json
json.loads('{"vlan_id": 10}')  # Valid
json.loads('{vlan_id: 10}')     # Raises error
```

**CCNA Exam Focus:**

- Know that `{}` = object, `[]` = array
- Keys must be strings in double quotes
- Values can be various types
- No trailing commas allowed
- Commas separate items

You won't need to write perfect JSON on the exam, but you should be able to identify valid vs invalid JSON.

---

## Slide 8: REST API Example

### Visual Description
Complete example showing a GET request with headers and the JSON response with 200 OK status.

### Speaker Notes

**Putting It All Together (5 minutes):**

Let's walk through a complete REST API interaction from start to finish.

**Scenario:**
You want to check the configuration of interface GigabitEthernet0/1 on a router.

**The Request:**

```
GET https://router.example.com/api/v1/interfaces/GigabitEthernet0/1
Headers:
  Authorization: Bearer abc123token456
  Accept: application/json
  Content-Type: application/json
```

**Breaking Down the Request:**

**Method:** GET (we're reading, not changing anything)

**URL:** `https://router.example.com/api/v1/interfaces/GigabitEthernet0/1`
- Hostname: `router.example.com`
- API base: `/api/v1`
- Resource: `/interfaces/GigabitEthernet0/1`

**Headers:**
- `Authorization`: Contains your access token (like a password)
- `Accept`: Tells server you want JSON response
- `Content-Type`: Format of request body (not needed for GET, but good practice)

**The Response:**

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 234

{
  "interface": "GigabitEthernet0/1",
  "description": "Link to Core Switch",
  "ip_address": "10.1.1.1",
  "subnet_mask": "255.255.255.0",
  "status": "up",
  "bandwidth": "1000000",
  "duplex": "full",
  "mtu": 1500
}
```

**Breaking Down the Response:**

**Status Line:** `HTTP/1.1 200 OK` - Success!

**Response Headers:**
- `Content-Type`: Response is JSON
- `Content-Length`: Size in bytes

**Response Body:** JSON object with interface details

**How to Use This Data:**

In Python:
```python
import requests

url = "https://router.example.com/api/v1/interfaces/GigabitEthernet0/1"
headers = {"Authorization": "Bearer abc123token456"}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()  # Parse JSON
    print(f"Interface: {data['interface']}")
    print(f"IP: {data['ip_address']}")
    print(f"Status: {data['status']}")
else:
    print(f"Error: {response.status_code}")
```

**Example 2: Creating a VLAN (POST):**

**Request:**
```
POST https://router.example.com/api/v1/vlans
Headers:
  Authorization: Bearer abc123token456
  Content-Type: application/json

Body:
{
  "vlan_id": 30,
  "name": "Engineering",
  "state": "active"
}
```

**Response:**
```
HTTP/1.1 201 Created
Location: /api/v1/vlans/30
Content-Type: application/json

{
  "message": "VLAN created successfully",
  "vlan_id": 30,
  "name": "Engineering",
  "state": "active"
}
```

**Notice:**
- Status 201 (Created, not 200)
- Location header points to new resource
- Response confirms what was created

**Example 3: Updating Interface (PUT):**

**Request:**
```
PUT https://router.example.com/api/v1/interfaces/GigabitEthernet0/1
Headers:
  Authorization: Bearer abc123token456
  Content-Type: application/json

Body:
{
  "description": "Updated Link to Core",
  "ip_address": "10.1.1.10",
  "subnet_mask": "255.255.255.0"
}
```

**Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Interface updated successfully",
  "interface": "GigabitEthernet0/1",
  "description": "Updated Link to Core",
  "ip_address": "10.1.1.10"
}
```

**Example 4: Deleting a VLAN (DELETE):**

**Request:**
```
DELETE https://router.example.com/api/v1/vlans/99
Headers:
  Authorization: Bearer abc123token456
```

**Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "VLAN 99 deleted successfully"
}
```

**Interactive Demo:**

Open the REST API Explorer in the visualizer:
1. Show GET request for interfaces - discuss the response
2. Show POST request creating a VLAN - point out 201 status
3. Show PUT request updating interface - discuss idempotency
4. Show DELETE request - discuss what happens if you delete twice

**Common Student Questions:**

**Q: "Where does the token come from?"**
A: You typically get a token by authenticating first (login endpoint). The token proves you're authorized. Tokens expire after some time.

**Q: "Can I just use username/password instead of token?"**
A: Some APIs support that (Basic Auth), but tokens are more secure because they expire and can be revoked.

**Q: "What if I send invalid JSON?"**
A: You get 400 Bad Request with an error message explaining the problem.

---

## Slide 9: Cisco DNA Center

### Visual Description
Description of Cisco DNA Center with green success box listing capabilities: device inventory, config deployment, path trace, client health, templates.

### Speaker Notes

**Cisco's SDN Controller (5 minutes):**

Let's talk about Cisco DNA Center - their flagship automation and management platform.

**What is DNA Center?**

DNA Center is Cisco's:
- SDN (Software-Defined Networking) controller
- Centralized management platform
- Automation and orchestration system
- Intent-Based Networking (IBN) solution

Think of it as a central brain that manages your entire network.

**Traditional Management vs DNA Center:**

**Traditional:**
- SSH into each device individually
- Configure VLANs on switch 1, switch 2, switch 3...
- Check logs on each router to troubleshoot
- Update IOS on each device manually

**DNA Center:**
- Single pane of glass for entire network
- Define intent: "I want VLAN 30 on all campus switches"
- DNA Center figures out how and deploys it
- Centralized troubleshooting and analytics

**Key Capabilities:**

**1. Device Inventory:**
- Automatic discovery of all network devices
- Hardware models, IOS versions, serial numbers
- Topology visualization
- Health monitoring

**2. Configuration Management:**
- Template-based configuration
- Deploy configs to hundreds of devices at once
- Configuration compliance checking
- Automatic drift detection (alert when device config changes)

**3. Path Trace:**
- Visualize traffic path from source to destination
- Identify where packets are dropped or delayed
- Like `traceroute` but with full network context

**4. Client Health:**
- See all connected clients (wired and wireless)
- Application performance metrics
- User experience scores
- Identify problematic clients

**5. Assurance:**
- Proactive issue detection
- AI-driven insights
- Predictive analytics
- Remediation suggestions

**Intent-Based Networking (IBN):**

This is the big idea behind DNA Center:

**Old Way (Imperative):**
"Configure VLAN 30 on Gi0/1, set it to trunk, allow VLANs 10,20,30"

**New Way (Declarative/Intent):**
"I want Engineering team to have secure, high-priority network access"

DNA Center translates your intent into specific configurations across the network.

**The REST API:**

DNA Center exposes a comprehensive REST API for automation.

**Example Use Cases:**

**Get Device List:**
```
GET https://dna-center/dna/intent/api/v1/network-device
```

Returns JSON with all devices, their status, IOS version, etc.

**Deploy Configuration Template:**
```
POST https://dna-center/dna/intent/api/v1/template-programmer/template/deploy
Body: {
  "templateId": "abc-123",
  "targetDevices": ["switch1", "switch2", "switch3"]
}
```

**Path Trace:**
```
POST https://dna-center/dna/intent/api/v1/flow-analysis
Body: {
  "sourceIP": "10.1.1.100",
  "destIP": "10.2.2.200"
}
```

Returns the complete path with hop-by-hop details.

**Real-World Example:**

A university wants to add VLAN 40 for a new IoT network across 500 switches.

**Without DNA Center:**
- 500 SSH sessions
- Days of work
- High risk of typos
- Manual verification

**With DNA Center:**
1. Create VLAN template
2. Select target switches
3. Click deploy
4. 15 minutes later: done, verified, documented

**CCNA Focus:**

You don't need to know specific DNA Center API calls, but you should know:
- DNA Center is Cisco's SDN controller
- It provides centralized network management
- It has a comprehensive REST API
- It supports Intent-Based Networking
- It's used for automation at scale

**DevNet Sandbox:**

Mention that Cisco provides free DNA Center sandboxes at developer.cisco.com for hands-on practice.

---

## Slide 10: Configuration Management Tools

### Visual Description
Three columns comparing Ansible (red), Puppet (orange), and Chef (blue), each showing architecture (agentless vs agent-based), model (push vs pull), and language.

### Speaker Notes

**The Big Three Tools (8 minutes):**

Configuration management tools automate deployment and management of infrastructure. Three major players: Ansible, Puppet, Chef.

**What Problem Do They Solve?**

Imagine you need to:
- Configure 1,000 servers with the same settings
- Ensure all devices have the latest security policy
- Deploy a new application to 500 nodes
- Maintain consistent configuration across fleet

Doing this manually: impossible. These tools: easy.

**Ansible (Most Popular for Networking):**

**Architecture: Agentless**
- No software to install on managed devices
- Uses standard SSH (port 22)
- Control node connects to targets
- Perfect for network devices (routers/switches don't run agents well)

**Model: Push**
- Central server pushes configurations to devices
- You control when changes happen
- Run playbook → configs deploy immediately

**Language: YAML (Playbooks)**
- YAML: "Yet Another Markup Language" (human-readable)
- Playbooks describe desired state
- Easy to read and write

**Example Playbook:**
```yaml
---
- name: Configure VLANs on switches
  hosts: campus_switches
  tasks:
    - name: Create VLAN 10
      ios_vlan:
        vlan_id: 10
        name: Management
        state: present

    - name: Create VLAN 20
      ios_vlan:
        vlan_id: 20
        name: Sales
        state: present
```

Even non-programmers can read this!

**Why Ansible Dominates Networking:**
1. Network devices don't support agents easily
2. SSH is universal on network gear
3. YAML is simpler than Ruby or Puppet DSL
4. Huge library of network modules (Cisco, Juniper, Arista, etc.)
5. RedHat-backed (enterprise support)

**Puppet (Common in Enterprise):**

**Architecture: Agent-Based**
- Requires Puppet agent software on each device
- Agent runs as background service
- Reports to Puppet Master server

**Model: Pull**
- Agents periodically check Puppet Master (default: every 30 minutes)
- Pull down latest configuration
- Apply changes automatically
- Devices control timing, not you

**Language: Puppet DSL (Manifests)**
- Domain-Specific Language (DSL) for configuration
- More complex than YAML
- Steep learning curve

**Example Manifest:**
```puppet
class network::vlan {
  cisco_vlan { '10':
    ensure    => present,
    vlan_name => 'Management',
  }

  cisco_vlan { '20':
    ensure    => present,
    vlan_name => 'Sales',
  }
}
```

**Why Use Puppet:**
- Mature product (been around longer)
- Strong enterprise support
- Good for server infrastructure
- Less popular for pure networking

**Chef (Rare in Networking):**

**Architecture: Agent-Based**
- Requires Chef client on each node
- Similar to Puppet's architecture

**Model: Pull**
- Nodes pull configurations from Chef Server
- Same concept as Puppet

**Language: Ruby DSL (Recipes/Cookbooks)**
- Recipes: Individual config tasks
- Cookbooks: Collections of recipes
- Requires Ruby knowledge
- Hardest learning curve

**Example Recipe:**
```ruby
cisco_vlan '10' do
  vlan_name 'Management'
  action :create
end

cisco_vlan '20' do
  vlan_name 'Sales'
  action :create
end
```

**Why Rarely Used for Networking:**
- Too complex for network teams
- Requires Ruby knowledge
- Agent installation is challenging on network devices
- Better alternatives exist (Ansible)

**Push vs Pull Explained:**

**Push Model (Ansible):**
```
You: "Ansible, deploy config NOW!"
Ansible: *immediately connects to all devices*
Ansible: *pushes configuration*
Devices: *apply changes*
Result: Changes happen when YOU want them
```

**Pull Model (Puppet/Chef):**
```
You: "Update Puppet manifest"
Devices: *check Puppet server every 30 min*
Devices: "Oh, new config available"
Devices: *pull and apply changes*
Result: Changes happen when DEVICES check (might be delayed)
```

**Comparison Table:**

| Feature | Ansible | Puppet | Chef |
|---------|---------|--------|------|
| Architecture | Agentless | Agent-based | Agent-based |
| Transport | SSH | Custom | Custom |
| Model | Push | Pull | Pull |
| Language | YAML | Puppet DSL | Ruby |
| Learning Curve | Easy | Medium | Hard |
| Network Popularity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |

**Real-World Example:**

**Scenario:** Deploy new SNMP configuration to 200 routers

**Ansible Approach:**
1. Write playbook with SNMP settings
2. Run: `ansible-playbook snmp-config.yml`
3. 5 minutes later: all 200 routers configured
4. You controlled exactly when it happened

**Puppet Approach:**
1. Update Puppet manifest with SNMP settings
2. Wait for agents to check in (could be up to 30 min)
3. Agents pull config and apply
4. Changes roll out over time as agents check in

**Which to Choose:**

For networking: **Ansible**, hands down.
- Agentless is critical (network devices resist agents)
- Push model gives you control
- YAML is network-engineer friendly
- Massive community and module support

For server infrastructure: All three are viable, depends on existing investment.

**CCNA Exam Focus:**

Know:
- **Ansible:** Agentless, SSH, push, YAML, most popular for networking
- **Puppet:** Agent-based, pull, Puppet DSL
- **Chef:** Agent-based, pull, Ruby DSL
- Push vs pull model difference

---

## Slide 11: Ansible Deep Dive

### Visual Description
Green success box listing Ansible advantages, followed by example playbook with syntax highlighting showing VLAN configuration tasks.

### Speaker Notes

**Mastering Ansible Concepts (7 minutes):**

Let's go deeper into Ansible since it's the #1 tool for network automation.

**Core Concepts:**

**1. Control Node:**
- The machine where Ansible is installed
- Where you run commands
- Can be your laptop, a server, Jenkins, etc.

**2. Managed Nodes:**
- The devices being configured (routers, switches, servers)
- No Ansible software required
- Just need SSH access

**3. Inventory:**
- List of managed nodes
- Can be static file or dynamic (from database/API)

Example inventory (`hosts.ini`):
```ini
[core_switches]
core-sw-1 ansible_host=10.0.1.1
core-sw-2 ansible_host=10.0.1.2

[access_switches]
access-sw-1 ansible_host=10.0.2.1
access-sw-2 ansible_host=10.0.2.2

[campus_switches:children]
core_switches
access_switches
```

**4. Playbook:**
- YAML file describing desired state
- Contains one or more "plays"
- Each play contains "tasks"

**5. Tasks:**
- Individual actions to perform
- Use modules to do the work

**6. Modules:**
- Pre-built code that does specific things
- Examples: `ios_vlan`, `ios_config`, `ios_interface`

**Ansible Playbook Structure:**

```yaml
---                           # YAML file starts with ---
- name: Configure Switches    # Play name (description)
  hosts: campus_switches      # Which devices (from inventory)
  gather_facts: no            # Don't gather system info (speeds up)

  tasks:                      # List of tasks
    - name: Create VLAN 10    # Task 1 name
      ios_vlan:               # Module name
        vlan_id: 10           # Module parameters
        name: Management
        state: present

    - name: Create VLAN 20    # Task 2 name
      ios_vlan:
        vlan_id: 20
        name: Sales
        state: present

    - name: Configure interface
      ios_interface:
        name: GigabitEthernet0/1
        description: "Uplink to Core"
        enabled: true
```

**Idempotency (Critical Concept):**

**Definition:** Running the same playbook multiple times produces the same result, even if already configured.

**Example:**
```yaml
- name: Create VLAN 10
  ios_vlan:
    vlan_id: 10
    name: Management
    state: present
```

**First run:**
- VLAN 10 doesn't exist
- Ansible creates it
- Status: **CHANGED**

**Second run:**
- VLAN 10 already exists with name "Management"
- Ansible sees it matches desired state
- Does nothing
- Status: **OK** (not changed)

This is HUGE! You can run playbooks repeatedly without fear of breaking things.

**Real-World Playbook:**

Let's create a playbook to standardize switch configurations:

```yaml
---
- name: Standard Switch Configuration
  hosts: all_switches
  gather_facts: no

  vars:
    mgmt_vlan: 10
    ntp_server: "10.0.0.100"
    syslog_server: "10.0.0.200"

  tasks:
    - name: Set hostname
      ios_config:
        lines:
          - hostname {{ inventory_hostname }}

    - name: Configure NTP
      ios_config:
        lines:
          - ntp server {{ ntp_server }}

    - name: Configure syslog
      ios_config:
        lines:
          - logging host {{ syslog_server }}

    - name: Create management VLAN
      ios_vlan:
        vlan_id: "{{ mgmt_vlan }}"
        name: Management
        state: present

    - name: Save configuration
      ios_config:
        save_when: modified
```

**What This Does:**
1. Sets hostname based on inventory name
2. Configures NTP server (uses variable)
3. Configures syslog server (uses variable)
4. Creates management VLAN
5. Saves config if anything changed

**Running the Playbook:**

```bash
ansible-playbook -i hosts.ini switch-config.yml
```

**Output:**
```
PLAY [Standard Switch Configuration] **************************

TASK [Set hostname] *******************************************
changed: [core-sw-1]
changed: [core-sw-2]

TASK [Configure NTP] ******************************************
changed: [core-sw-1]
ok: [core-sw-2]

TASK [Configure syslog] ***************************************
changed: [core-sw-1]
changed: [core-sw-2]

TASK [Create management VLAN] *********************************
changed: [core-sw-1]
ok: [core-sw-2]

TASK [Save configuration] *************************************
changed: [core-sw-1]
ok: [core-sw-2]

PLAY RECAP ****************************************************
core-sw-1    : ok=5  changed=4  unreachable=0  failed=0
core-sw-2    : ok=5  changed=2  unreachable=0  failed=0
```

**Key Ansible Modules for Networking:**

**ios_config:** Raw IOS commands
```yaml
- ios_config:
    lines:
      - interface GigabitEthernet0/1
      - description Uplink
      - ip address 10.1.1.1 255.255.255.0
```

**ios_vlan:** VLAN management
```yaml
- ios_vlan:
    vlan_id: 30
    name: Engineering
    state: present
```

**ios_interface:** Interface configuration
```yaml
- ios_interface:
    name: GigabitEthernet0/1
    description: "Link to Core"
    enabled: true
```

**ios_static_route:** Static routes
```yaml
- ios_static_route:
    prefix: 192.168.100.0
    mask: 255.255.255.0
    next_hop: 10.1.1.2
```

**ios_facts:** Gather device information
```yaml
- ios_facts:
    gather_subset: all
```

**Advantages Recap:**

1. **Agentless** - No software on devices
2. **Simple** - YAML is human-readable
3. **Idempotent** - Safe to run repeatedly
4. **Extensive modules** - Pre-built for Cisco, Juniper, etc.
5. **Open source** - Free to use
6. **Large community** - Lots of examples online

**Common Use Cases:**

- Deploy VLANs across campus
- Update ACLs on all edge routers
- Backup configurations nightly
- Ensure compliance (check all devices have NTP, syslog, etc.)
- Provision new sites with standard configs

**CCNA Exam Focus:**

- Ansible is agentless and uses SSH
- Uses YAML playbooks
- Push model (you control timing)
- Idempotent (safe to rerun)
- Most popular for network automation

---

## Slide 12: Infrastructure as Code

### Visual Description
Key point box defining IaC, followed by benefits list: version control, reproducibility, testing, documentation, collaboration, rollback.

### Speaker Notes

**The IaC Philosophy (6 minutes):**

Infrastructure as Code (IaC) is a paradigm shift in how we manage infrastructure.

**Traditional Approach:**

```
Engineer logs into router:
Router# configure terminal
Router(config)# interface gi0/1
Router(config-if)# ip address 10.1.1.1 255.255.255.0
Router(config-if)# no shutdown
Router(config-if)# exit
Router(config)# exit
Router# write memory
```

**Problems:**
- No record of who made the change
- No record of when or why
- Can't easily replicate on other routers
- If you mess up, hard to undo
- No testing before production

**Infrastructure as Code Approach:**

**1. Write Configuration as Code:**

`router-config.yml`:
```yaml
---
- name: Configure Router Interface
  hosts: core-routers
  tasks:
    - name: Configure Gi0/1
      ios_interface:
        name: GigabitEthernet0/1
        description: "Uplink to ISP"
        ipv4:
          - address: 10.1.1.1/30
        enabled: true
```

**2. Store in Version Control (Git):**

```bash
git add router-config.yml
git commit -m "Add ISP uplink configuration to core routers"
git push origin main
```

Now you have:
- **Who:** Git author (john.doe@example.com)
- **What:** The exact config change (in the diff)
- **When:** Timestamp in commit
- **Why:** Commit message explains

**3. Test in Development:**

```bash
ansible-playbook -i dev-hosts.ini router-config.yml
# Test passes? Good!
```

**4. Deploy to Production:**

```bash
ansible-playbook -i prod-hosts.ini router-config.yml
# Same code that worked in dev
```

**5. If Something Breaks, Rollback:**

```bash
git revert HEAD
ansible-playbook -i prod-hosts.ini router-config.yml
# Back to previous working state
```

**The Six Pillars of IaC:**

**1. Version Control:**

Every change is tracked in Git:
```bash
git log --oneline
abc123 Add VLAN 30 for Engineering team
def456 Update ACL to allow HTTPS
789abc Initial router configuration
```

You can see the entire history of your infrastructure!

**2. Reproducibility:**

Disaster strikes. Data center burns down. With IaC:

```bash
# Get new hardware
# Run your playbooks
ansible-playbook site.yml

# 30 minutes later: entire data center rebuilt identically
```

Without IaC: Weeks or months to rebuild from memory and scattered documentation.

**3. Testing:**

Before production:
```bash
# Test in lab
ansible-playbook -i lab.ini site.yml --check  # Dry run
ansible-playbook -i lab.ini site.yml           # Apply

# Test functionality
# Tests pass?

# Deploy to production with confidence
ansible-playbook -i prod.ini site.yml
```

**4. Documentation:**

The code IS the documentation.

Want to know how routers are configured? Read the playbook.

```yaml
# This task configures OSPF on all core routers
- name: Configure OSPF
  ios_config:
    lines:
      - router ospf 1
      - network 10.0.0.0 0.255.255.255 area 0
```

Self-documenting!

**5. Collaboration:**

Multiple engineers work on same codebase:

```bash
# Alice works on VLAN feature
git checkout -b add-vlan-40
# Make changes
git commit -m "Add VLAN 40 for IoT devices"
git push

# Bob reviews her code (pull request)
# Bob approves
# Merge to main
git merge add-vlan-40
```

No more stepping on each other's toes!

**6. Rollback:**

Something broke after last change:

```bash
# See recent changes
git log --oneline -5

abc123 Update ACL (this one broke things!)
def456 Add new VLAN
789ghi Configure NTP

# Revert the problematic change
git revert abc123

# Redeploy
ansible-playbook site.yml

# Back to working state
```

**Real-World Example:**

**Scenario:** Multi-site enterprise with 50 branch offices, each with:
- 2 routers
- 4 switches
- Standard configuration requirements

**Without IaC:**
- Configure first site manually (2 days)
- Document steps (hopefully!)
- Configure remaining 49 sites (weeks!)
- Inconsistencies creep in
- Update required? Reconfigure all sites manually

**With IaC:**
- Write playbooks for site config (2 days)
- Test on first site (1 day)
- Deploy to remaining 49 sites (1 hour!)
- Need update? Change code, redeploy (1 hour)
- Perfect consistency across all sites

**GitOps Workflow:**

Modern approach combining Git and automation:

```
1. Engineer proposes change (Git branch)
2. Create pull request
3. Automated tests run
4. Peer review
5. Merge to main branch
6. CI/CD pipeline automatically deploys
7. All changes tracked in Git history
```

**Tools for IaC:**

- **Ansible:** Network device configuration
- **Terraform:** Infrastructure provisioning (cloud, VMs, etc.)
- **Git:** Version control
- **CI/CD:** Jenkins, GitLab CI, GitHub Actions

**CCNA Exam Focus:**

- IaC means treating infrastructure config as software code
- Benefits: version control, testing, reproducibility
- Git is used for version control
- Changes are tracked (who, what, when, why)
- Easy to rollback problematic changes

---

## Slide 13: Python for Networking

### Visual Description
Comparison grid showing "Why Python?" benefits on left, simple Python example code using requests library on right.

### Speaker Notes

**Python's Role in Network Automation (5 minutes):**

Python has become THE language for network automation. Let's understand why and see some examples.

**Why Python?**

**1. Easy to Learn:**
```python
# This is valid Python
print("Hello, Network!")

# So is this
vlan_id = 10
vlan_name = "Management"
print(f"VLAN {vlan_id}: {vlan_name}")
```

No semicolons, no type declarations, very readable.

**2. Massive Library Ecosystem:**

**Netmiko** - SSH automation:
```python
from netmiko import ConnectHandler

device = {
    'device_type': 'cisco_ios',
    'host': '10.1.1.1',
    'username': 'admin',
    'password': 'password'
}

connection = ConnectHandler(**device)
output = connection.send_command('show ip interface brief')
print(output)
```

**Requests** - REST API calls:
```python
import requests

url = "https://router/api/v1/interfaces"
headers = {"Authorization": "Bearer token123"}

response = requests.get(url, headers=headers)
if response.status_code == 200:
    interfaces = response.json()
    for intf in interfaces:
        print(f"{intf['name']}: {intf['status']}")
```

**NAPALM** - Multi-vendor automation:
```python
from napalm import get_network_driver

driver = get_network_driver('ios')
device = driver('10.1.1.1', 'admin', 'password')
device.open()

# Get facts (works on Cisco, Juniper, Arista, etc.)
facts = device.get_facts()
print(f"Hostname: {facts['hostname']}")
print(f"Model: {facts['model']}")
print(f"Uptime: {facts['uptime']}")

device.close()
```

**3. Perfect for REST APIs:**

```python
import requests
import json

# GET example - Retrieve interfaces
url = "https://dna-center/api/v1/interface"
headers = {
    "X-Auth-Token": "abc123",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    for interface in data['response']:
        print(f"Interface: {interface['portName']}")
        print(f"Status: {interface['status']}")
        print("---")
else:
    print(f"Error: {response.status_code}")
```

**POST example - Create VLAN:**
```python
url = "https://router/api/v1/vlans"
headers = {"Authorization": "Bearer token123"}

new_vlan = {
    "vlan_id": 30,
    "name": "Engineering",
    "state": "active"
}

response = requests.post(url, headers=headers, json=new_vlan)

if response.status_code == 201:
    print("VLAN created successfully!")
    print(response.json())
else:
    print(f"Failed: {response.status_code}")
```

**4. Great for Parsing:**

**Parsing CLI output** (TextFSM):
```python
import textfsm

# CLI output
output = """
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/1     10.1.1.1        YES manual up                    up
GigabitEthernet0/2     10.1.2.1        YES manual up                    down
"""

# TextFSM template parses this into structured data
# Result:
[
  {'interface': 'GigabitEthernet0/1', 'ip': '10.1.1.1', 'status': 'up'},
  {'interface': 'GigabitEthernet0/2', 'ip': '10.1.2.1', 'status': 'up'}
]
```

**Parsing JSON** (built-in):
```python
import json

json_string = '{"vlan_id": 10, "name": "Management"}'
data = json.loads(json_string)

print(data['vlan_id'])   # 10
print(data['name'])      # Management
```

**Real-World Script:**

Let's build a practical script that checks interface status on multiple routers:

```python
import requests

# List of routers
routers = [
    {"host": "10.0.1.1", "name": "Router1"},
    {"host": "10.0.2.1", "name": "Router2"},
    {"host": "10.0.3.1", "name": "Router3"}
]

# Function to check router health
def check_router(router):
    url = f"https://{router['host']}/api/v1/interfaces"
    headers = {"Authorization": "Bearer mytoken123"}

    try:
        response = requests.get(url, headers=headers, timeout=5)

        if response.status_code == 200:
            interfaces = response.json()
            down_count = sum(1 for i in interfaces if i['status'] == 'down')

            print(f"\n{router['name']} ({router['host']}):")
            print(f"  Total interfaces: {len(interfaces)}")
            print(f"  Down interfaces: {down_count}")

            if down_count > 0:
                print("  WARNING: Some interfaces are down!")
                for intf in interfaces:
                    if intf['status'] == 'down':
                        print(f"    - {intf['name']}")
        else:
            print(f"{router['name']}: API Error {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"{router['name']}: Connection failed - {e}")

# Main execution
print("Network Health Check")
print("=" * 50)

for router in routers:
    check_router(router)

print("\nHealth check complete!")
```

**Output:**
```
Network Health Check
==================================================

Router1 (10.0.1.1):
  Total interfaces: 24
  Down interfaces: 2
  WARNING: Some interfaces are down!
    - GigabitEthernet0/5
    - GigabitEthernet0/12

Router2 (10.0.2.1):
  Total interfaces: 24
  Down interfaces: 0

Router3 (10.0.3.1):
  Connection failed - Connection timeout

Health check complete!
```

**CCNA Scope:**

You do NOT need to write Python on the CCNA exam.

You SHOULD understand:
- Python is commonly used for network automation
- Requests library is used for REST API calls
- Netmiko is used for SSH automation
- Python can parse JSON natively
- Scripts can automate repetitive tasks

**Where to Learn Python:**

- Codecademy
- Python.org tutorials
- NetworkChuck YouTube channel
- David Bombal network automation videos

---

## Slide 14: NETCONF

### Visual Description
Blue comparison box listing NETCONF basics (port 830, XML, YANG models), alongside table comparing NETCONF vs CLI.

### Speaker Notes

**Model-Driven Configuration (6 minutes):**

NETCONF is a protocol for network configuration and management. Think of it as a standardized way to configure devices using structured data instead of CLI commands.

**What is NETCONF?**

**NETCONF = Network Configuration Protocol**
- IETF standard (RFC 6241)
- Uses SSH as transport (port 830)
- XML-based messages
- YANG data models define structure

**Why Does NETCONF Exist?**

**Problem with CLI:**
```
Router# show ip interface brief
GigabitEthernet0/1     10.1.1.1    YES manual up   up
```

This is human-readable, but parsing is brittle:
- Output format varies between IOS versions
- Spaces, alignment changes break scripts
- No validation before executing

**NETCONF Solution:**

Structured, validated, machine-readable communication.

**NETCONF Architecture:**

```
┌─────────────────┐         SSH Port 830        ┌─────────────┐
│  NETCONF Client ├──────────────────────────────┤   Router    │
│  (Your Script)  │   XML messages over SSH      │  (Server)   │
└─────────────────┘                              └─────────────┘
```

**Key Features:**

**1. Transport: SSH (Port 830)**

Secure, encrypted communication.

**2. Data Format: XML**

All messages are XML documents.

**3. Data Models: YANG**

YANG defines what data looks like and what operations are allowed.

**4. Operations:**

Main NETCONF operations:

**get-config** - Retrieve configuration:
```xml
<rpc message-id="101">
  <get-config>
    <source>
      <running/>
    </source>
  </get-config>
</rpc>
```

**edit-config** - Modify configuration:
```xml
<rpc message-id="102">
  <edit-config>
    <target>
      <candidate/>
    </target>
    <config>
      <interfaces>
        <interface>
          <name>GigabitEthernet0/1</name>
          <ip-address>10.1.1.1</ip-address>
          <subnet-mask>255.255.255.0</subnet-mask>
        </interface>
      </interfaces>
    </config>
  </edit-config>
</rpc>
```

**commit** - Apply changes (if candidate config supported)

**get** - Retrieve operational data (like `show` commands)

**5. Datastores:**

NETCONF uses different configuration datastores:

**running** - Active configuration (like `show running-config`)
**candidate** - Staging area for changes
**startup** - Config loaded on boot

**Workflow:**
1. Edit candidate config
2. Validate changes
3. Commit to running (or rollback if validation fails)

This is atomic: all changes apply or none do (prevents partial configs).

**NETCONF vs CLI Comparison:**

| Feature | CLI | NETCONF |
|---------|-----|---------|
| Human-Friendly | ✅ Yes | ❌ No (XML is verbose) |
| Machine-Friendly | ❌ No (text parsing) | ✅ Yes (structured XML) |
| Structured Data | ❌ No | ✅ Yes |
| Data Validation | ❌ Limited | ✅ YANG models enforce |
| Transactions | ❌ No rollback | ✅ Atomic commits |
| Standardized | ❌ Vendor-specific | ✅ IETF standard |

**Example: Get Interface Config:**

**CLI Approach:**
```
Router# show running-config interface GigabitEthernet0/1
interface GigabitEthernet0/1
 description Link to Core
 ip address 10.1.1.1 255.255.255.0
 no shutdown
```

Parse this text (fragile!).

**NETCONF Approach:**

Request:
```xml
<rpc message-id="101">
  <get-config>
    <source>
      <running/>
    </source>
    <filter>
      <interfaces>
        <interface>
          <name>GigabitEthernet0/1</name>
        </interface>
      </interfaces>
    </filter>
  </get-config>
</rpc>
```

Response:
```xml
<rpc-reply message-id="101">
  <data>
    <interfaces>
      <interface>
        <name>GigabitEthernet0/1</name>
        <description>Link to Core</description>
        <ipv4>
          <address>10.1.1.1</address>
          <netmask>255.255.255.0</netmask>
        </ipv4>
        <enabled>true</enabled>
      </interface>
    </interfaces>
  </data>
</rpc-reply>
```

Structured! Easy to parse programmatically.

**Python Example with ncclient:**

```python
from ncclient import manager

# Connect to device
device = manager.connect(
    host='10.1.1.1',
    port=830,
    username='admin',
    password='cisco',
    hostkey_verify=False
)

# Get configuration
config = device.get_config(source='running').data_xml
print(config)

# Edit configuration
config_snippet = """
<config>
  <interfaces>
    <interface>
      <name>GigabitEthernet0/1</name>
      <description>Updated via NETCONF</description>
    </interface>
  </interfaces>
</config>
"""

device.edit_config(target='running', config=config_snippet)
device.close_session()
```

**Advantages:**

1. **Validation:** YANG models catch errors before applying
2. **Transactions:** All-or-nothing commits
3. **Standardized:** Same protocol across vendors (in theory)
4. **Rollback:** Easy to revert changes
5. **Structured:** No brittle text parsing

**Disadvantages:**

1. **Complexity:** XML is verbose
2. **Not human-friendly:** Hard to read/write manually
3. **Learning curve:** Steeper than CLI

**When to Use NETCONF:**

- Large-scale automation where validation is critical
- When you need transactional commits
- Multi-vendor environments (with standard YANG models)
- When you need guaranteed rollback capability

**CCNA Exam Focus:**

- NETCONF uses SSH on port 830
- Uses XML for data format
- Uses YANG data models
- Provides transactional configuration management
- More structured than CLI

---

## Slide 15: RESTCONF

### Visual Description
Green success box listing RESTCONF features, followed by comparison table showing NETCONF vs RESTCONF differences.

### Speaker Notes

**Modern Model-Driven API (5 minutes):**

RESTCONF combines the best of REST and NETCONF: HTTP-based API with YANG data models.

**What is RESTCONF?**

**RESTCONF = REST + NETCONF capabilities**

- HTTP/HTTPS-based (not SSH like NETCONF)
- Uses standard HTTP methods (GET, POST, PUT, DELETE)
- Returns JSON or XML (client chooses)
- Uses the same YANG data models as NETCONF

**Why RESTCONF?**

NETCONF was powerful but complex. RESTCONF makes it accessible to web developers.

**Key Differences from NETCONF:**

| Feature | NETCONF | RESTCONF |
|---------|---------|----------|
| Transport | SSH (port 830) | HTTPS (port 443) |
| Methods | Custom operations | HTTP methods |
| Data Format | XML only | JSON or XML |
| Complexity | High | Lower |
| Use Case | Legacy automation | Modern web APIs |

**RESTCONF Operations:**

Same CRUD operations as any REST API:

**GET** - Retrieve configuration or operational data:
```
GET https://router/restconf/data/interfaces/interface=GigabitEthernet0%2F1
Accept: application/yang-data+json
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

Response (JSON):
```json
{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet0/1",
    "description": "Link to Core",
    "type": "iana-if-type:ethernetCsmacd",
    "enabled": true,
    "ietf-ip:ipv4": {
      "address": [
        {
          "ip": "10.1.1.1",
          "netmask": "255.255.255.0"
        }
      ]
    }
  }
}
```

**POST** - Create new resource:
```
POST https://router/restconf/data/interfaces
Content-Type: application/yang-data+json

{
  "ietf-interfaces:interface": {
    "name": "Loopback100",
    "description": "Created via RESTCONF",
    "type": "iana-if-type:softwareLoopback",
    "enabled": true,
    "ietf-ip:ipv4": {
      "address": [
        {
          "ip": "192.168.100.1",
          "netmask": "255.255.255.255"
        }
      ]
    }
  }
}
```

**PUT** - Update/replace resource:
```
PUT https://router/restconf/data/interfaces/interface=GigabitEthernet0%2F1
Content-Type: application/yang-data+json

{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet0/1",
    "description": "Updated Link",
    "enabled": true
  }
}
```

**DELETE** - Remove resource:
```
DELETE https://router/restconf/data/interfaces/interface=Loopback100
```

**Python Example:**

```python
import requests
import json

# Router details
router = "10.1.1.1"
username = "admin"
password = "cisco"

# GET interface config
url = f"https://{router}/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1"
headers = {
    "Accept": "application/yang-data+json",
    "Content-Type": "application/yang-data+json"
}

response = requests.get(url, auth=(username, password), headers=headers, verify=False)

if response.status_code == 200:
    data = response.json()
    interface = data['ietf-interfaces:interface']
    print(f"Name: {interface['name']}")
    print(f"Description: {interface.get('description', 'None')}")
    print(f"Enabled: {interface['enabled']}")

    # Get IP address if present
    if 'ietf-ip:ipv4' in interface:
        ip = interface['ietf-ip:ipv4']['address'][0]
        print(f"IP: {ip['ip']}/{ip['netmask']}")

# UPDATE interface description
update_data = {
    "ietf-interfaces:interface": {
        "name": "GigabitEthernet0/1",
        "description": "Updated via RESTCONF API",
        "type": "iana-if-type:ethernetCsmacd",
        "enabled": True
    }
}

response = requests.put(url, auth=(username, password), headers=headers,
                        data=json.dumps(update_data), verify=False)

if response.status_code == 204:  # 204 No Content = success
    print("Interface updated successfully!")
else:
    print(f"Update failed: {response.status_code}")
```

**YANG Models with RESTCONF:**

RESTCONF uses YANG models to define structure.

**Example:** `ietf-interfaces` YANG model defines:
- Interface must have a name (string)
- Enabled is a boolean
- IP address is in dotted-decimal format
- Subnet mask is valid netmask

If you send invalid data:
```json
{
  "interface": {
    "name": "Gi0/1",
    "enabled": "yes"  // WRONG! Must be boolean true/false
  }
}
```

RESTCONF returns 400 Bad Request with error details.

**Advantages of RESTCONF:**

1. **Familiar protocol:** Uses HTTP (everyone knows HTTP)
2. **JSON support:** Easier to work with than XML
3. **Web-friendly:** Works with standard web tools (curl, Postman, browsers)
4. **YANG validation:** Data is validated against models
5. **Standard HTTP status codes:** 200, 201, 400, 404, etc.

**RESTCONF Root:**

Discover API capabilities:
```
GET https://router/.well-known/host-meta
```

Returns links to:
- API root
- YANG library (what models are supported)
- Available resources

**Comparison Summary:**

**Use NETCONF when:**
- Working with legacy systems
- Need transactional commits (candidate config)
- XML is required

**Use RESTCONF when:**
- Building modern web-based automation
- Prefer JSON over XML
- Want to use standard REST tools
- Team has web development background

**CCNA Exam Focus:**

- RESTCONF uses HTTPS (port 443)
- Supports JSON and XML
- Uses standard HTTP methods (GET, POST, PUT, DELETE)
- Uses YANG data models (same as NETCONF)
- More modern/web-friendly than NETCONF

---

## Slide 16: YANG Data Models

### Visual Description
Key point box defining YANG as blueprint, followed by "Why YANG Matters" list and exam scope note.

### Speaker Notes

**Understanding Data Models (5 minutes):**

YANG is the secret sauce that makes NETCONF and RESTCONF powerful.

**What is YANG?**

**YANG = Yet Another Next Generation**

It's a data modeling language that defines:
- What data exists on a device
- Data types and constraints
- Relationships between data elements
- Valid operations

**Think of YANG as a blueprint** for network device data.

**Analogy: Database Schema**

If you know databases:
- SQL schema defines table structure (column names, data types, constraints)
- YANG schema defines device data structure (interface names, IP formats, etc.)

**Example Scenario:**

You want to configure an interface via API. YANG model says:

```yang
container interface {
  leaf name {
    type string;
    mandatory true;
  }

  leaf description {
    type string;
  }

  leaf enabled {
    type boolean;
    default true;
  }

  container ipv4 {
    leaf address {
      type inet:ipv4-address;
    }
    leaf netmask {
      type inet:ipv4-address;
    }
  }
}
```

**What This Means:**

- **name** is a string, required
- **description** is a string, optional
- **enabled** is a boolean (true/false), defaults to true
- **ipv4** is a container with address and netmask
- **address** must be a valid IPv4 address (10.1.1.1, not "abc")

**Validation in Action:**

**Valid Request:**
```json
{
  "interface": {
    "name": "GigabitEthernet0/1",
    "description": "Uplink",
    "enabled": true,
    "ipv4": {
      "address": "10.1.1.1",
      "netmask": "255.255.255.0"
    }
  }
}
```

API: ✅ Accepted (matches YANG model)

**Invalid Requests:**

Missing required field:
```json
{
  "interface": {
    "description": "Uplink"  // Missing required 'name'!
  }
}
```

API: ❌ 400 Bad Request - "name is mandatory"

Invalid data type:
```json
{
  "interface": {
    "name": "Gi0/1",
    "enabled": "yes"  // Should be boolean true/false!
  }
}
```

API: ❌ 400 Bad Request - "enabled must be boolean"

Invalid IP address:
```json
{
  "interface": {
    "name": "Gi0/1",
    "ipv4": {
      "address": "999.999.999.999"  // Invalid IP!
    }
  }
}
```

API: ❌ 400 Bad Request - "invalid IPv4 address"

**Why YANG Matters:**

**1. Vendor-Neutral Standards:**

IETF and OpenConfig publish standard YANG models:

**IETF Models:**
- `ietf-interfaces` - Interface configuration
- `ietf-ip` - IP addressing
- `ietf-routing` - Routing protocols

**OpenConfig Models:**
- `openconfig-interfaces` - Interfaces (alternative to IETF)
- `openconfig-bgp` - BGP configuration
- `openconfig-network-instance` - VRFs and routing instances

These work across Cisco, Juniper, Arista, etc. (in theory).

**2. Machine-Readable:**

APIs know exactly what to expect. No ambiguity.

**3. Validation:**

Catch errors BEFORE applying to device.

Traditional CLI:
```
Router(config-if)# ip address 999.999.999.999 255.255.255.0
                                ^
% Invalid input detected at '^' marker.
```

YANG validation catches this before sending to device!

**4. Documentation:**

YANG models ARE the documentation. Want to know what fields are available? Read the YANG model.

**YANG Structure:**

Basic building blocks:

**Container:** Groups related data
```yang
container interfaces {
  // Contains interface definitions
}
```

**Leaf:** Single data element
```yang
leaf hostname {
  type string;
}
```

**List:** Array of items
```yang
list interface {
  key "name";
  leaf name { type string; }
  leaf description { type string; }
}
```

**YANG Types:**

Common data types:

- `string` - Text
- `int8`, `int16`, `int32` - Integers
- `boolean` - true/false
- `inet:ipv4-address` - IPv4 address (10.1.1.1)
- `inet:ipv6-address` - IPv6 address
- `enumeration` - Predefined choices (up/down/testing)

**Discovering YANG Models:**

On a Cisco device:
```
Router# show netconf-yang datastores
Router# show platform software yang-management package
```

Via RESTCONF:
```
GET https://router/restconf/data/ietf-yang-library:modules-state
```

Returns list of supported YANG models.

**Real-World Usage:**

**Scenario:** You're writing automation to configure interfaces.

**Step 1:** Find the YANG model
- Look for `ietf-interfaces` or vendor-specific model

**Step 2:** Understand the structure
- Read the model or documentation
- Learn required fields, data types, constraints

**Step 3:** Craft your API request
- Follow the structure defined by YANG
- Use correct data types

**Step 4:** Send request
- NETCONF/RESTCONF validates against YANG
- If valid: applied
- If invalid: immediate error with details

**CCNA Exam Scope:**

You do NOT need to:
- Write YANG models
- Memorize YANG syntax
- Know specific YANG model details

You DO need to know:
- YANG defines data models for network devices
- NETCONF and RESTCONF use YANG models
- YANG provides validation and structure
- Standard models exist (IETF, OpenConfig)
- YANG ensures vendor-neutral automation (in theory)

**Key Takeaway:**

YANG is the blueprint. NETCONF/RESTCONF are the tools that use the blueprint to build (configure) the house (network device).

---

## Slide 17: Comparison Summary

### Visual Description
Comprehensive table comparing SSH/CLI, SNMP, NETCONF, RESTCONF, and gRPC across transport, data format, and use case.

### Speaker Notes

**The Big Picture (4 minutes):**

Let's compare all the network management protocols and understand when to use each.

**The Evolution:**

```
1990s: CLI (Telnet/SSH)
2000s: SNMP
2010s: NETCONF
2020s: RESTCONF, gRPC
```

**Protocol Comparison:**

**SSH/CLI (Traditional):**

**Transport:** SSH (port 22)
**Data Format:** Text commands and output
**Use Case:** Manual configuration, basic scripting

**Pros:**
- Universal (every network device has CLI)
- Human-friendly
- No special setup required

**Cons:**
- Hard to automate reliably
- Output parsing is fragile
- No validation before execution
- Not designed for machine-to-machine

**Example:**
```
Router# show ip interface brief
GigabitEthernet0/1   10.1.1.1  YES manual up  up
```

**SNMP (Monitoring):**

**Transport:** UDP 161 (queries), 162 (traps)
**Data Format:** ASN.1, MIBs (Management Information Bases)
**Use Case:** Monitoring, read-mostly operations

**Pros:**
- Ubiquitous for monitoring
- Low overhead
- Good for polling statistics

**Cons:**
- Mainly read-only (SNMPv2c can write, but risky)
- MIBs are complex
- Security issues (v1/v2c use community strings)
- Not suitable for configuration management

**Example:**
```
snmpget -v2c -c public 10.1.1.1 ifOperStatus.1
IF-MIB::ifOperStatus.1 = INTEGER: up(1)
```

**NETCONF (Structured Configuration):**

**Transport:** SSH (port 830)
**Data Format:** XML with YANG models
**Use Case:** Structured configuration management, transactions

**Pros:**
- Transactional (atomic commits, rollback)
- Structured data (XML)
- YANG validation
- IETF standard

**Cons:**
- XML is verbose
- Complex to implement
- Steeper learning curve
- Port 830 may be blocked by firewalls

**Example:**
```xml
<rpc>
  <edit-config>
    <target><running/></target>
    <config>
      <interface>
        <name>Gi0/1</name>
        <ip>10.1.1.1</ip>
      </interface>
    </config>
  </edit-config>
</rpc>
```

**RESTCONF (Modern Web API):**

**Transport:** HTTPS (port 443)
**Data Format:** JSON or XML with YANG models
**Use Case:** Modern API-based automation, web integration

**Pros:**
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON support (easier than XML)
- Firewall-friendly (port 443)
- Web-developer friendly
- YANG validation

**Cons:**
- Requires HTTPS setup
- Less mature than NETCONF
- May not support all features (like candidate config)

**Example:**
```
PUT https://router/restconf/data/interfaces/interface=Gi0/1
{
  "interface": {
    "name": "Gi0/1",
    "ip": "10.1.1.1"
  }
}
```

**gRPC (High Performance):**

**Transport:** HTTP/2
**Data Format:** Protocol Buffers (binary)
**Use Case:** Streaming telemetry, high-performance automation

**Pros:**
- Very fast (binary format)
- Bi-directional streaming
- Low overhead
- Modern (Google-developed)

**Cons:**
- Complex to implement
- Less human-readable (binary)
- Newer, less mature
- Not covered deeply in CCNA

**When to Use Each:**

**CLI/SSH:**
- One-off manual tasks
- Interactive troubleshooting
- Learning and exploring

**SNMP:**
- Monitoring device health
- Collecting statistics
- Alerting on issues
- Legacy monitoring systems

**NETCONF:**
- Complex configuration changes requiring transactions
- When rollback capability is critical
- Legacy automation systems

**RESTCONF:**
- Modern automation projects
- Web-based integrations
- When JSON is preferred
- Developer-friendly automation

**gRPC:**
- Streaming telemetry collection
- High-frequency data collection
- Performance-critical applications

**The Modern Stack:**

Most modern networks use a combination:

```
Monitoring: SNMP or gRPC telemetry
Configuration: RESTCONF or Ansible (which may use NETCONF/SSH underneath)
Troubleshooting: CLI/SSH
```

**The Trend:**

```
Moving away from: CLI scraping, SNMP writes
Moving toward: Model-driven APIs (NETCONF/RESTCONF), gRPC telemetry
```

**CCNA Exam Focus:**

Know the comparison:
- **SSH:** Port 22, text-based, manual/scripting
- **SNMP:** UDP 161/162, monitoring, MIBs
- **NETCONF:** Port 830, XML, YANG, transactions
- **RESTCONF:** HTTPS port 443, JSON/XML, YANG, HTTP methods
- **gRPC:** HTTP/2, Protocol Buffers, streaming

---

## Slide 18: Automation Workflow

### Visual Description
Six numbered steps showing typical automation workflow: Define desired state, store in Git, test in lab, review and approve, deploy to production, verify and monitor.

### Speaker Notes

**Putting It All Together (5 minutes):**

Let's walk through a complete automation workflow from idea to production deployment.

**Scenario:**

Your company needs to add VLAN 40 (IoT) across 200 campus switches for a new building automation project.

**Step 1: Define Desired State**

Write configuration as code (Ansible playbook):

`add-vlan-40.yml`:
```yaml
---
- name: Deploy VLAN 40 for IoT
  hosts: campus_switches
  gather_facts: no

  tasks:
    - name: Create VLAN 40
      ios_vlan:
        vlan_id: 40
        name: IoT_Devices
        state: present

    - name: Verify VLAN created
      ios_command:
        commands:
          - show vlan id 40
      register: vlan_output

    - name: Display verification
      debug:
        msg: "VLAN 40 configured: {{ vlan_output.stdout }}"
```

**Step 2: Store in Version Control (Git)**

```bash
# Initialize Git repo (if not already)
git init

# Add playbook
git add add-vlan-40.yml

# Commit with descriptive message
git commit -m "Add VLAN 40 for IoT device network

- VLAN ID: 40
- Name: IoT_Devices
- Targets: All campus switches
- Reason: New building automation system
- Ticket: IT-12345"

# Push to remote repository
git push origin main
```

**Why Git?**
- Track who made the change (git author)
- Track when (timestamp)
- Track why (commit message)
- Easy rollback if needed
- Peer review via pull requests

**Step 3: Test in Lab/Dev Environment**

```bash
# Run against test switches first
ansible-playbook -i inventory/dev.ini add-vlan-40.yml --check

# --check is DRY RUN mode (shows what would change, doesn't apply)
```

**Output:**
```
PLAY [Deploy VLAN 40 for IoT] ********************************

TASK [Create VLAN 40] ****************************************
changed: [test-sw-1]
changed: [test-sw-2]

PLAY RECAP ***************************************************
test-sw-1    : ok=1  changed=1  unreachable=0  failed=0
test-sw-2    : ok=1  changed=1  unreachable=0  failed=0
```

Looks good! Now apply for real in dev:

```bash
ansible-playbook -i inventory/dev.ini add-vlan-40.yml
```

**Verify manually:**
```
test-sw-1# show vlan id 40

VLAN Name                             Status    Ports
---- -------------------------------- --------- ------------------------
40   IoT_Devices                      active
```

Perfect! It works in dev.

**Step 4: Review and Approve**

**Option A: Pull Request Review (GitLab/GitHub):**

```bash
# Create feature branch
git checkout -b add-vlan-40

# Make changes
git commit -m "Add VLAN 40 for IoT"

# Push branch
git push origin add-vlan-40

# Create pull request on GitHub
# Reviewers comment, approve, or request changes
```

**Reviewer checks:**
- Is the code correct?
- Is VLAN 40 the right choice?
- Will this impact anything else?
- Has it been tested in dev?

**Approved?** Merge to main branch.

**Option B: Change Advisory Board:**

Formal approval process:
- Submit change request with details
- Impact analysis
- Rollback plan
- Scheduled maintenance window
- Approval from stakeholders

**Step 5: Deploy to Production**

**Scheduled maintenance window: Saturday 2:00 AM**

```bash
# Final check: What will change?
ansible-playbook -i inventory/prod.ini add-vlan-40.yml --check --diff

# Looks good, deploy!
ansible-playbook -i inventory/prod.ini add-vlan-40.yml
```

**Output:**
```
PLAY [Deploy VLAN 40 for IoT] ********************************

TASK [Create VLAN 40] ****************************************
changed: [campus-sw-001]
changed: [campus-sw-002]
changed: [campus-sw-003]
...
changed: [campus-sw-200]

TASK [Verify VLAN created] ***********************************
ok: [campus-sw-001]
ok: [campus-sw-002]
...

PLAY RECAP ***************************************************
campus-sw-001  : ok=2  changed=1  unreachable=0  failed=0
campus-sw-002  : ok=2  changed=1  unreachable=0  failed=0
...
campus-sw-200  : ok=2  changed=1  unreachable=0  failed=0
```

**Deployment time: 12 minutes for 200 switches!**

Manual deployment would have taken days.

**Step 6: Verify and Monitor**

**Automated Verification:**
```bash
# Run verification playbook
ansible-playbook -i inventory/prod.ini verify-vlan-40.yml
```

`verify-vlan-40.yml`:
```yaml
---
- name: Verify VLAN 40 Deployment
  hosts: campus_switches
  gather_facts: no

  tasks:
    - name: Check VLAN 40 exists
      ios_command:
        commands:
          - show vlan id 40
      register: result
      failed_when: "'IoT_Devices' not in result.stdout[0]"

    - name: Success message
      debug:
        msg: "VLAN 40 verified on {{ inventory_hostname }}"
```

**Monitor for Issues:**
- Check syslog for errors
- Monitor network monitoring system (SNMP/telemetry)
- Watch for user complaints
- Validate IoT devices can join VLAN 40

**If Something Breaks - Rollback:**

```bash
# Revert the commit
git revert HEAD

# Re-deploy previous state
ansible-playbook -i inventory/prod.ini remove-vlan-40.yml
```

`remove-vlan-40.yml`:
```yaml
---
- name: Remove VLAN 40
  hosts: campus_switches
  tasks:
    - name: Delete VLAN 40
      ios_vlan:
        vlan_id: 40
        state: absent
```

Back to working state in minutes!

**The Benefits Realized:**

| Manual Approach | Automated Approach |
|-----------------|-------------------|
| 200 SSH sessions | 1 playbook run |
| Days of work | 12 minutes |
| High error risk | Zero typos |
| No audit trail | Full Git history |
| Hard to rollback | Easy revert |
| Inconsistencies likely | Perfect consistency |

**CCNA Exam Focus:**

Understand the workflow:
1. Write config as code
2. Version control (Git)
3. Test in dev/lab
4. Peer review
5. Deploy to production
6. Verify and monitor
7. Rollback if needed

---

## Slide 19: Best Practices

### Visual Description
Two boxes: green "Do This" box with best practices, red "Avoid This" box with anti-patterns.

### Speaker Notes

**Golden Rules of Network Automation (5 minutes):**

**Do This: Best Practices**

**1. Start Small - Automate Simple Tasks First**

Don't try to automate your entire network on day one.

**Good first projects:**
- Backup all device configs nightly
- Generate daily interface status report
- Add VLAN across a subset of switches
- Update NTP servers on all devices

**Bad first projects:**
- Automated failover and disaster recovery
- Complete network provisioning from scratch
- Dynamic routing optimization

Start simple, build confidence, then tackle complex tasks.

**2. Use Version Control (Git) for Everything**

Every automation script, playbook, template, inventory file: all in Git.

**Why:**
- Track changes over time
- See who changed what and when
- Rollback bad changes easily
- Enable collaboration
- Disaster recovery (clone repo to new laptop)

**Don't just save files on your laptop!**

**3. Test in Lab Before Production**

**The Rule:** NEVER run untested automation in production.

**Workflow:**
```
Write code → Test in lab → Fix bugs → Test again → Production
```

**Lab doesn't have to be physical:**
- Use GNS3 or EVE-NG
- Use Cisco DevNet sandboxes (free!)
- Use Cisco Modeling Labs (CML)
- Even Packet Tracer for basic testing

**4. Make Automation Idempotent**

**Idempotent:** Running the same automation multiple times produces the same result.

**Good (Idempotent):**
```yaml
- name: Ensure VLAN 10 exists
  ios_vlan:
    vlan_id: 10
    name: Management
    state: present  # Creates if missing, OK if exists
```

Run 100 times: VLAN 10 exists, no errors.

**Bad (Not Idempotent):**
```
! Raw CLI command
vlan 10
```

Run twice: Error the second time ("VLAN already exists").

**5. Document Your Code**

**In the code itself:**
```yaml
---
# Purpose: Deploy standard VLANs across campus switches
# Author: John Doe
# Last Updated: 2024-01-15
# Related Ticket: IT-12345

- name: Standard VLAN Deployment
  hosts: campus_switches

  tasks:
    # VLAN 10 is for management traffic (SSH, SNMP, etc.)
    - name: Create Management VLAN
      ios_vlan:
        vlan_id: 10
        name: Management
```

**In a README:**
```markdown
# Network Automation Repository

## Purpose
Ansible playbooks for campus network management.

## Prerequisites
- Ansible 2.9+
- Access to campus switches via SSH

## Usage
```bash
ansible-playbook -i inventory/campus.ini deploy-vlans.yml
```

## Contact
Network Team: network@example.com
```

**6. Use RESTCONF/NETCONF Over CLI Scraping When Possible**

**CLI Scraping (Fragile):**
```python
output = device.send_command("show ip interface brief")
# Parse text output (breaks if format changes!)
```

**RESTCONF (Robust):**
```python
response = requests.get(f"{url}/interfaces")
data = response.json()  # Structured data!
```

APIs are designed for automation. Use them when available.

**Avoid This: Anti-Patterns**

**1. Automating Before Understanding**

Don't automate a process you don't understand manually.

**Bad:** "I'll write a script to fix this routing issue"
**Good:** "I'll understand why routes are missing, then automate the fix"

**2. No Testing - YOLO to Production**

**Never, ever, ever:**
```bash
# DANGER! Untested code running on production!
ansible-playbook -i prod.ini new-script.yml
```

**This is how you take down the network.**

**3. Hard-Coding Credentials in Scripts**

**TERRIBLE:**
```python
username = "admin"
password = "cisco123"  # NEVER DO THIS!
```

**Why it's bad:**
- Security risk if script is shared or leaked
- Hard to rotate passwords
- Violates compliance policies

**Better:**
```python
import getpass
username = input("Username: ")
password = getpass.getpass("Password: ")
```

**Best:**
```python
# Use environment variables or secrets manager
import os
password = os.environ.get('DEVICE_PASSWORD')

# Or Ansible Vault for encrypted secrets
# Or HashiCorp Vault for enterprise
```

**4. No Rollback Plan**

**Before deploying automation:**
- What if it fails?
- How do I undo the changes?
- Do I have backups?

**Always have a rollback plan!**

**5. Screen Scraping CLI When APIs Exist**

**Bad:**
```python
output = device.send_command("show run")
# Parse 10,000 lines of text with regex (brittle!)
```

**Good:**
```python
response = requests.get(f"{url}/running-config")
config = response.json()  # Structured data!
```

If the device has a REST API, use it!

**Bonus Tips:**

**Error Handling:**
```python
try:
    response = requests.get(url)
    response.raise_for_status()  # Raises error on 4xx/5xx
except requests.exceptions.RequestException as e:
    print(f"API call failed: {e}")
    # Handle gracefully, don't crash
```

**Logging:**
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Starting VLAN deployment")
logger.warning("Device 10.1.1.1 timed out, skipping")
logger.error("Failed to connect to 10.1.1.5")
```

**Dry Run Mode:**
Always support a "check mode" that shows what would change without applying:
```bash
ansible-playbook playbook.yml --check  # Ansible check mode
terraform plan  # Terraform dry run
```

**CCNA Exam Focus:**

- Start with simple automation tasks
- Use Git for version control
- Test before production deployment
- Prefer APIs over CLI scraping
- Never hard-code credentials
- Make automation idempotent

---

## Slide 20: Summary

### Visual Description
Four summary boxes: REST APIs (HTTP methods, status codes), Configuration Management (Ansible, Puppet, Chef), Protocols (NETCONF, RESTCONF), and Exam Tips.

### Speaker Notes

**Bringing It All Together (5 minutes):**

We've covered a LOT of ground. Let's consolidate the key concepts for exam success.

**REST APIs - The Foundation:**

**HTTP Methods (CRUD):**
- **GET:** Retrieve data (read)
- **POST:** Create new resource
- **PUT:** Update existing resource
- **DELETE:** Remove resource

**HTTP Status Codes:**
- **200 OK:** Success
- **201 Created:** New resource created
- **400 Bad Request:** Your JSON is wrong
- **401 Unauthorized:** Auth failed
- **404 Not Found:** Resource doesn't exist
- **500 Internal Server Error:** Server problem

**Data Formats:**
- **JSON:** Lightweight, easy to read, most popular
- **XML:** More verbose, used by NETCONF

**Key Concept:** REST APIs use standard HTTP to perform operations on network device resources.

**Configuration Management - The Tools:**

**Ansible (Most Popular for Networking):**
- **Architecture:** Agentless (uses SSH)
- **Model:** Push (you control timing)
- **Language:** YAML playbooks
- **Why:** Easy to learn, no agents required

**Puppet:**
- **Architecture:** Agent-based
- **Model:** Pull (agents check in periodically)
- **Language:** Puppet DSL (manifests)

**Chef:**
- **Architecture:** Agent-based
- **Model:** Pull
- **Language:** Ruby DSL (recipes/cookbooks)
- **Why rare for networking:** Complexity, agents

**Key Concept:** Configuration management tools automate deployment and ensure consistency. Ansible dominates networking due to agentless architecture.

**Infrastructure as Code (IaC):**

**Core Principles:**
- Treat infrastructure config as software code
- Store in version control (Git)
- Test before production
- Easy rollback if problems
- Full audit trail (who, what, when, why)

**Benefits:**
- Reproducibility (rebuild from code)
- Collaboration (multiple engineers)
- Documentation (code is docs)
- Version control and rollback

**Key Concept:** IaC elevates network config from manual commands to managed, versioned, tested code.

**Protocols - The Communication Methods:**

**NETCONF:**
- **Transport:** SSH (port 830)
- **Format:** XML
- **Models:** YANG
- **Use:** Transactional configuration management

**RESTCONF:**
- **Transport:** HTTPS (port 443)
- **Format:** JSON or XML
- **Models:** YANG
- **Use:** Modern web-based automation

**YANG:**
- Defines data models
- Validates data structure and types
- Ensures vendor-neutral configs (with standard models)

**Key Concept:** Model-driven protocols (NETCONF/RESTCONF) use YANG to provide structured, validated configuration.

**Python for Networking:**

**Libraries:**
- **Requests:** REST API calls
- **Netmiko:** SSH automation
- **NAPALM:** Multi-vendor abstraction

**Key Concept:** Python is the most popular language for network automation due to ease of use and extensive libraries.

**Cisco DNA Center:**

- SDN controller for enterprise networks
- Centralized management and automation
- Extensive REST API
- Intent-Based Networking (IBN)

**Key Concept:** DNA Center provides single pane of glass for network management with powerful APIs.

**Exam Tips - What to Memorize:**

**HTTP Methods:**
- GET = Read
- POST = Create
- PUT = Update
- DELETE = Delete

**HTTP Status Codes:**
- 200 = OK (success)
- 201 = Created
- 400 = Bad Request
- 401 = Unauthorized
- 404 = Not Found

**JSON vs XML:**
- JSON: Lightweight, popular, `{}` and `[]`
- XML: Verbose, tags, used by NETCONF

**Ansible:**
- Agentless, SSH, push model, YAML
- Most popular for networking

**NETCONF:**
- Port 830, SSH, XML, YANG

**RESTCONF:**
- Port 443, HTTPS, JSON/XML, YANG, HTTP methods

**YANG:**
- Data models for NETCONF/RESTCONF
- Provides validation

**Common Exam Question Patterns:**

**Q: Which HTTP method retrieves data without modifying anything?**
A: GET

**Q: What protocol does NETCONF use and on what port?**
A: SSH, port 830

**Q: Which configuration management tool is agentless?**
A: Ansible

**Q: What data format is most commonly used with modern REST APIs?**
A: JSON

**Q: What does YANG define?**
A: Data models for network device configuration

**Q: What HTTP status code indicates successful resource creation?**
A: 201 Created

**Final Thoughts:**

Network automation is no longer optional. It's how modern networks are built and operated.

**The skills you learned today:**
- Understanding REST APIs and HTTP
- Knowing JSON and data structures
- Recognizing configuration management tools
- Understanding model-driven automation

**These will serve you throughout your career.**

**The networking industry is shifting:**
```
Old Skills: CLI commands, manual config
New Skills: APIs, scripting, automation tools
Future Skills: AI-driven networks, intent-based networking
```

Stay ahead of the curve. Embrace automation.

**Next Steps for Students:**

1. **Practice with DevNet:** Cisco's free learning platform (developer.cisco.com)
2. **Learn Python basics:** Codecademy, Python.org
3. **Try Ansible:** Install it, run simple playbooks
4. **Use the visualizer tool:** Experiment with REST API Explorer
5. **Take the quiz:** Test your knowledge

**Resources:**

- Cisco DevNet Learning Labs
- NetworkChuck YouTube (automation tutorials)
- David Bombal (network automation videos)
- CBT Nuggets CCNA course (automation section)
- Official Cert Guide Vol 2 (Chapter on automation)

**You're ready for the CCNA automation questions!**

---

## Appendix: Quick Reference Tables

### HTTP Methods Quick Reference

| Method | CRUD | Safe? | Idempotent? | Example |
|--------|------|-------|-------------|---------|
| GET | Read | ✅ Yes | ✅ Yes | Get interface status |
| POST | Create | ❌ No | ❌ No | Create new VLAN |
| PUT | Update | ❌ No | ✅ Yes | Update IP address |
| DELETE | Delete | ❌ No | ✅ Yes | Remove VLAN |

### HTTP Status Codes Quick Reference

| Code | Category | Meaning | Example |
|------|----------|---------|---------|
| 200 | Success | OK | GET succeeded |
| 201 | Success | Created | POST succeeded |
| 204 | Success | No Content | DELETE succeeded |
| 400 | Client Error | Bad Request | Invalid JSON |
| 401 | Client Error | Unauthorized | Wrong password |
| 403 | Client Error | Forbidden | No permission |
| 404 | Client Error | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal Error | Device crashed |

### Configuration Management Tool Comparison

| Feature | Ansible | Puppet | Chef |
|---------|---------|--------|------|
| Architecture | Agentless | Agent-based | Agent-based |
| Transport | SSH | Custom | Custom |
| Model | Push | Pull | Pull |
| Language | YAML | Puppet DSL | Ruby |
| Learning Curve | Easy | Medium | Hard |
| Networking Popularity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |

### Protocol Comparison

| Protocol | Port | Transport | Format | Use Case |
|----------|------|-----------|--------|----------|
| SSH/CLI | 22 | SSH | Text | Manual config |
| SNMP | 161/162 | UDP | ASN.1/MIBs | Monitoring |
| NETCONF | 830 | SSH | XML (YANG) | Config mgmt |
| RESTCONF | 443 | HTTPS | JSON/XML (YANG) | Modern API |
| gRPC | HTTP/2 | HTTP/2 | Protocol Buffers | Streaming |

### JSON Syntax Quick Reference

```json
{
  "string": "text value",
  "number": 123,
  "boolean": true,
  "null": null,
  "object": {
    "nested": "value"
  },
  "array": [1, 2, 3],
  "array_of_objects": [
    {"id": 1, "name": "First"},
    {"id": 2, "name": "Second"}
  ]
}
```

### Ansible Playbook Structure

```yaml
---
- name: Play Name
  hosts: target_devices
  gather_facts: no

  vars:
    variable_name: value

  tasks:
    - name: Task Description
      module_name:
        parameter1: value1
        parameter2: value2
      register: output_variable

    - name: Another Task
      debug:
        msg: "{{ output_variable }}"
```

### Essential CLI Commands for Automation

**Check NETCONF support:**
```
Router# show netconf-yang status
```

**Check RESTCONF support:**
```
Router# show platform software yang-management process
```

**View YANG models:**
```
Router# show platform software yang-management package
```

**Enable NETCONF:**
```
Router(config)# netconf-yang
```

**Enable RESTCONF:**
```
Router(config)# restconf
```

---

*End of Speaker Notes*
