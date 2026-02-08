## Encryption
At the end of this episode, I will be able to:    

1. Explain the attributes and importance of encryption.    

Learner Objective: *Explain the attributes and importance of encryption.* 	   

Description: In this episode, the learner will explore encryption, encryption types, BitLocker and BitLocker to Go, Encrypted File System or EFS and more.	

--------

* Encryption - a process that applies a cryptographic operation to plain-text data converting the data into cipher-text.
	+ Symmetric encryption - an encryption technique that uses a single key to encrypt and decrypt data. This type of encryption is faster than asymmetric encryption, however if a threat actor obtains the key, all  data security is lost.
	+ Asymmetric encryption - an encryption technique that uses two keys to encrypt data. The key that performs encryption is called the public key and is shared. The key that performs the decryption is called a private key and is protected. This type of encryption is slower, computationally compared to symmetric key encryption. However as key encryption is considered more secure than symmetric key encryption, provided the private key is protected.		
	+ Software-based encryption - this is an encryption type that utilizes the operating system's resources. This type of encryption is slower as it utilizes the CPU of the computer.	
	+ Hardware-based encryption - this is an encryption type that is performed by a dedicated device with a processor that is separate from the computer's CPU.	This encryption and decryption process is much faster.	
	+ BitLocker - Window's native full drive encryption technology allowing users to protect and secure data at rest stored on fixed storage media.		
	+ BitLocker To Go - an extension to BitLocker that allows users to protect and secure removable storage media.	
	+ Encrypting File System \(EFS\) - the native encryption technology built into NTFS that provide file-level encryption.	
		* Moving files that have been encrypted with EFS to locations same Windows system will retain the encryption and access.		
		* Copying files with encryption within the same Windows system will retain the encryption and access.		
		* If the EFS encrypted file is moved or copied to another system, access will be denied without importing the EFS encryption key.		
	+ Tokens - is a physical device used as a hardware authenticator to securely access a system.		
	+ Trusted applications - these are applications in which the software publisher can be identified commonly through a digital signature using public key infrastructure. Known applications are vetted and stored in a reputation database that is checked during installation.	
	+ Email encryption - a process that involves applying encryption to email messages to secure the contents. A common standard for encrypting email is call Secure/Multipurpose Internet Mail Extensions or S/MIME, using public key encryption.
	