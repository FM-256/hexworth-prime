# RADIUS-TACACS+       

After completing this episode, you should be able to:

+ Describe the technologies of RADIUS and TACACS+ and explain how they can be used in modern authentication systems     

**Description:** In this episode, you will learn about two more protocols that can be used in authentication systems. These protocols are RADIUS and TACACS+.    

## RADIUS and TACACS+          

RADIUS - Remote Authentication Dial-in User Service - this protocol provides for centralized authentication for remote access connections. This includes VPN access. An organization will often have multiple network access servers (also called remote access servers). A user connects to any available network access server, and their credentials are passed to the RADIUS server to verify authentication, authorization, and accounting. 

RADIUS uses UDP and only encrypts the password exchange. Other protocols can be used to encrypt the entire session. For example, RADIUS/TLS can be used to encrypt the entire session. 

TACACS+ - Cisco Systems developed this protocol and then released it as an open standard. It stands for Terminal Access Controller Access Control System Plus. Cisco was seeking to make improvements over RADIUS when they created it. 

TACACS+ separates authentication, authorization, and accounting into separate processes. These could even run on separate servers if desired. TACACS+ encrypts all of the authentication information by default. TACACS+ uses TCP port 49 in its operation. 

## Additional resources

+ RADIUS: <https://www.foxpass.com/blog/radius-server-and-how-it-works>
+ TACACS+: <https://en.wikipedia.org/wiki/TACACS>