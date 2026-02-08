## Password Policies		
At the end of this episode, I will be able to:    

1. Explain the attributes and importance of password policies.    

Learner Objective: *Explain the attributes and importance of password policies.*    

Description: In this episode, the learner will explore the components that make up password policies in a Windows environment such as defining complexity, length, history and age requirements, lockout and reset procedures as well as some common password attacks.		

--------

* Password Policies - defines the rules that are used to determine whether a new password is valid. 	
	+ Password complexity - this requirement of a password policy requires that the password contains a character from each of 4 character sets.	
		- Character sets		
			* Uppercase letters \(A-Z\)		
			* Lowercase letters \(a-z\)		
			* Numbers \(0-9\)		
			* Special characters		
	+ Password length - this requirement of a password policy requires a predetermined amount of characters for the password to be valid. 	
	+ Password history - this requirement of a password policy determines the number of unique passwords that have to be associated with a user account before an old password can be reused.	
	+ Password age - this requirement of a password policy determines the amount of time that can pass before a system allows or requires a user to change the password.		
		- Maximum password age - the maximum duration of time that can pass until the system requires the user to change their password.			
		- Minimum password age - the minimum duration of time that is *required* to pass before a user is *allowed* to change their password.		
	+ Account lockout - this is a policy that defines how many failed password attempts can be entered before the user account is lockout and password attempts. Commonly this is coupled with a reset procedure that requires the user to contact the administrator to unlock \(reset\) the account before the user can log in.		
	+ Group Policy enforcement - password policies can be enforced locally on Windows operating systems with Group Policy or more commonly through Active Directory-based Group Policy.	
	+ Common password attacks
			* Guessing - this is a password attack in which a threat actor uses a guessing tactic to gain access to the system.		
			* Brute-force - this is a password attack in which a program automates through every possible character combination to gain access to a system.	
			* Phishing - fradulent emails that are distributed to the general public in order to entice or convince a user to reveal personal information such as bank information, password, intellectual property.		