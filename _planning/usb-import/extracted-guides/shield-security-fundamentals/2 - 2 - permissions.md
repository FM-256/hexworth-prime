## Permissions

At the end of this episode, I will be able to:    

1. Describe the characteristics and importance of permissions.    

Learner Objective: *Describe the characteristics and importance of permissions.*    

Description: In this episode, the learner will examine file and folder permissions, as well as share permissions, permission inheritance and effective access.   

--------

* Permissions - are an access control and authorization component within an operating system that secures access to files and folders.
	+ FAT32 - this file system is interoperable across many systems. FAT32 limits file sizes to 4GB and volumes to 2TB. FAT32 does not support file permissions.
	+ exFAT - this file system, like FAT32 is supported across multiple operating systems and the choosen file system for the SDCard technologies. It supports larger file and volume sizes.	
	+ NTFS - this is the native Windows operating system file system. 
	+ File permissions - these permissions control access to files within the file system. These permissions are sometimes called *local permissions* to distinguish them from share permissions.
		- Permissions
			* Full Control
			* Modify
			* Read & Execute
			* Write
			* Read
	+ Folder permissions - these permissions are placed on folders and by default will propagate to the files within the folder. This propagation is called *permission inheritance*. Utilizing permission inheritance reduced the administrative complexities on configuring permissions on a file by file basis.
		- Permissions
			* Full Control
			* Modify
			* Read & Execute
			* Write
			* Read
			* List Folder Contents
	+ Share permissions - these permissions are applied to folders that are accessed across a network connection.
		- Permissions
			* Full Control
			* Change
			* Read
	+ Effective access - this is the actions that can be peformed on an object by a user, by combining all permissions a user has or resultant set of permissions granted to a user or group.
		- Example - Alice has been been granted the *read* permission to the *Marketing* folder, she is in a group called *Marketing*, which has been granted the *Modify* permission to the same folder. Alice's *effective access* is *Modify* on the *Marketing* folder.
-------

Permissions:
https://learn.microsoft.com/en-us/iis/web-hosting/configuring-servers-in-the-windows-web-platform/configuring-share-and-ntfs-permissions