## Certificates
At the end of this episode, I will be able to:    

1. Explain the attributes and importance of certificates.    

Learner Objective: *Explain the attributes and importance of certificates.*    

Description: In this episode, the learner will dive into topics and concepts such as  certificates, public key infrastructure, certificate authorities and certificate types.	

--------

* Certificates - an electronic or digital file that contains data used to validate a public key. The certificate contains data on the holder of the public key and is used as a means to establish trust and encrypted communications. 	
* Public key encryption - is an encryption type also called asymmetric encryption using two mathmatically aligned keys to encryption and decrypt data, as well as provide a way to identify entities through digital signatures.	
* Public key infrastructure - a hierarchical system that establishes public key encryption. It is comprise of one or more servers that issue, manage and maintain certificates.		
	+ Certificate Authority \(CA\)- the authorative issuer of digital certificates.			
	+ Root CA - The highest level and top CA in a public key infrastructure.	
	+ Subordinate/intermediate CA - the second level \(and lower, depending on implementation\) CA that is endorse by a higher level CA.		 
* Certificate types	
	+ DER - encoded binary X.509 \(.CER\)	
		- Binary format		
		- Stores only the public key	
	+ Base-64 encoded X.509 \(.CER\)	
		- ASCII-format or text-based, human-readable format			
		- Stores only the public key		
	+ PKCS #7 \(.P7B\)		
		- Can store certificate chain \(all CA certicates\)			
		- Stores only the public key			
	+ PKCS #12 \(.PFX\)		
		- Stores certificate chain \(all CA certicates\)	
		- Stores both public and private keys	