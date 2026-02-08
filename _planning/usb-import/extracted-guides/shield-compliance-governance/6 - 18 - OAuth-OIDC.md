# OAuth-OIDC       

After completing this episode, you should be able to:

+ Describe OAuth and OIDC and explain their roles in the implementation of authentication systems   

**Description:** In this episode, you will learn about OAuth, OpenID, and OIDC. You will be able to explain their role in the implementation of authentication systems.  

## OAuth and OIDC         

OAuth 2.0 - the name implies open authorization. It is an authorization framework described in RFC 6749 and maintained IETF. Many organizations use it to share account information with 3rd party websites. 

Example of OAuth 2.0 in action. You have an application that can schedule and post on Instagram for you. When you setup the app, it redirects you to Instagram. There you log in using your Instagram credentials and approve the actions your app will take for you on Instagram. If you approve these actions, Instagram sends an authorization token to your app. Your app now can take actions in Instagram using API calls and the token it received. Notice that you never provide your app with your Instagram credentials. If your app is compromised, your Instagram credentials are not at risk. 

OAuth 2.0 is not backward compatible with OAuth 1.0. 

OpenID is another open standard. This one is maintained by the OpenID Foundation. It provides decentralized authentication - users can log in to multiple unrelated websites with one set of credentials maintained by a third party service called an OpenID provider. 

OpenID Connect (OIDC) is the authentication layer that uses the OAuth 2.0 authorization framework. Notice this is both an authentication and authorization system. OIDC uses a JavaScript Object Notation (JSON) Web Token (JWT). Logging into and using eBay with your Google account would be an example of OIDC in action. 

## Additional resources

+ OAuth: <https://en.wikipedia.org/wiki/OAuth>
+ OpenID: <https://en.wikipedia.org/wiki/OpenID>