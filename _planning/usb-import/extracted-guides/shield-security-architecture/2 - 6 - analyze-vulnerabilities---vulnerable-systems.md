## Analyze vulnerabilities - vulnerable systems


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, analyze vulnerabilities and recommend risk mitigations.

### External Resources:

Analyze vulnerabilities - vulnerable systems

 What do you need to know about Web Application Components? -

 Client-Side Processing vs. Server-Side Processing – shifting application code
 to the client-side can result in significant security problems

    • applications pushed to the client become accessible in a way that allows
    for the modification of application logic

    • end-users can review & modify application logic to bypass any security
    controls or manipulate the web application's operation to bypass security
    checks & load malicious objects

    • scripts should run server-side to prevent this type of manipulation


 JSON/Representational State Transfer (REST) - JavaScript Object Notation (JSON)
 is the data exchange format to send data between applications in the form of an
 API based on the representational state transfer (REST) architectural style
 (JSON RESTful API is a data exchange based on web technologies)

    • susceptible to injection attack

    • uses specific syntax & keywords that can be manipulated in order to change
    the operation of the underlying application


 Protection - JSON APIs should carefully inspect & sanitize all inputs & outputs

      OWASP JSON Sanitizer  https://github.com/owasp/json-sanitizer


 Simple Object Access Protocol (SOAP) - protocol designed to facilitate
 communications over HTTP using XML

      • structure of XML used by SOAP defined in a Web Services Description
      Language (WSDL) document

      • WSDL document can be queried directly & presented like a webpage, offering
      detailed descriptions & information regarding underlying parameters & data
      types handled by the API

      • exploited to perform SQL injection, content discovery, & authentication
      bypass

 Protection - reviewing guidance provided by OWASP at:

      https://owasp.org/www-project-api-security/

      https://cheatsheetseries.owasp.org/cheatsheets/Web_Service_Security_Cheat_Sheet.htm


 Browser extensions - added to a web browser to expand functionality or add features;

      • not accessible by the code loaded by the browser itself

      • can be used to alter how a browser interprets & loads a webpage &/or
      requires interaction with external, third-party services in order to operate


 Browser plugins - installed in ways that allow them to be "called," or executed,
 by website code

      • Adobe Flash, Microsoft ActiveX, & Oracle Java

      • provide a unique pathway to the underlying operating system on which a
      browser is installed


 Bytecode - intermediary state of source code created by a high-level language
 (when it is complied) & designed to be processed by an interpreter on the
 target system

      • interpreter translates the bytecode into machine code which is then
      processed by the central processing unit (CPU)


 Machine code - lowest-level representation of source code & is understood by devices


 Asynchronous JavaScript and XML (AJAX) - considered to be more secure than other
 methods due to the way in which interactions between the client & the server are
 obscured through the use of server-side scripts

    • applications use the same underlying web technologies as other methods &
    are therefore susceptible to the same vulnerabilities

    • transmits user commands in plaintext JavaScript to the server & can expose
    function names, database table names, user IDs, variable names, & many other
    sensitive items

https://cheatsheetseries.owasp.org/cheatsheets/AJAX_Security_Cheat_Sheet.html


 Hypertext Markup Language 5 (HTML5) -

    • Web Messaging (Cross Domain Messaging)
    • Cross Origin Resource Sharing
    • WebSockets
    • Server-Sent Events
    • Local/Offline/Web Storage
    • Client-Side Databases
    • Geolocation requests
    • WebWorkers
    • Tabnabbing
    • Sandboxed Frames

https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
https://html5sec.org/

 
