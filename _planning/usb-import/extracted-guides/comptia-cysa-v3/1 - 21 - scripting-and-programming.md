Filename: cysa-1b-2-9-1-scripting-and-programming.md
Domain: Tools and Techniques for Determining Malicious Activity
Episode: Scripting and Programming
=========================================================================

Scripting and Programming
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------

+ JavaScript Object Notation (JSON)
  - Used to serialize structured data for data exchange
    + Used a lot in Web Apps
      - JSON Web Tokens (JWT)
  - Structure
    + `{"key": "value"}`
      - or
    + ```
      {
        "key1": "value",
		"key2": "value",
		"key3": {
	  		"sub-key1": "value",
	  		"sub-key2": "value"
		}
      }
      ```
+ Extensible Markup Language (XML)
  - Human readable markup language used by many systems for structured
    data exchange
  - Used by SOAP APIs to structure and encode data being exchanged in
    SOAP messages
  - Structure
	+ ```
	  <book>
        <title>The Great Gatsby</title>
        <author>F. Scott Fitzgerald</author>
        <year>1925</year>
        <publisher>Charles Scribner's Sons</publisher>
      </book>
	  ```
+ Scripting and Programming
  - Python
  - PowerShell
  - Shell Scripts
  - Reg Ex
	+ Log Analysis
	+ Network Traffic Analysis
	+ File Analysis
	+ Report Generation
