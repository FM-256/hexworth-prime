## DNS Policies

### Objectives:

At the end of this episode, I will be able to:

1. Explain the importance of DNS policies
2. Explain how DNS policies are used and their function
3. Describe how these policies are configured


>Additional resources used during the episode can be obtained using the download link on the overview episode.

-----------------------------------------------------------
Remember the following points:
* Yet another feature that is made very valuable thanks to Cisco Security Intelligence efforts. Cisco provides an updated list of dangerous domains that clients might be trying to access. The FTD can ALLOW or BLOCK these requests.
* You can also configure this feature in a monitor-only mode.
* The FTD evaluates the rules in the following order:
   - Global DNS Allow List rule
   - Descendant DNS Allow List Rule
   - Allow List Rules
   - Global DNS Block List rule
   - Descendant DNS Block List rule
   - Block list and monitor rules


-----------------------------------------------------------
### External Resources:

During this episode, you can reference the following external resources for supplementary tools and information:

https://www.cisco.com/c/en/us/td/docs/security/firepower/660/configuration/guide/fpmc-config-guide-v66/dns_policies.html
