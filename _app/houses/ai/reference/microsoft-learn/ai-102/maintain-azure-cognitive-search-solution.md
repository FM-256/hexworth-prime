# Maintain an Azure AI Search solution

**Module slug:** `maintain-azure-cognitive-search-solution`
**Source:** https://learn.microsoft.com/en-us/training/modules/maintain-azure-cognitive-search-solution/
**Units:** 10

## Table of Contents

1. Introduction
2. Manage security of an Azure AI Search solution
3. Optimize performance of an Azure AI Search solution
4. Manage costs of an Azure AI Search solution
5. Improve reliability of an Azure AI Search solution
6. Monitor an Azure AI Search solution
7. Debug search issues using the Azure portal
8. Exercise - Debug search issues
9. Module assessment
10. Summary

---


# Introduction

- 1 minute
Running a successful Azure AI Search solution requires you to understand how to maintain its two primary workloads of indexing and querying. It's essential that the search solution is as cost effective as possible.
In this module, you'll learn how to:
- Manage the security of your search service and source data.
- Optimize the performance your indexes and manage costs
- Improve reliability, monitor the performance and run queries against Log Analytics.
- Debug indexer related errors and warnings.
Note
This module assumes you already know how to create and use an Azure AI Search solution that includes built-in skills. If not, complete the Create an Azure AI Search solution module first.

---


# Manage security of an Azure AI Search solution

- 8 minutes
Organizations need to be able to trust the security of their search solutions. Azure AI Search gives you control over how to secure the data you search.
Here, you'll explore how to secure your search solution. You'll focus on where data is encrypted and how to secure the inbound and outbound data flows. Finally, you'll see how to restrict access to search results for specific users or groups.

## Overview of security approaches

AI Search security builds on Azure's existing network security features. When you think about securing your search solution, you can focus on three areas:
- Inbound search requests made by users to your search solution
- Outbound requests from your search solution to other servers to index documents
- Restricting access at the document level per user search request

## Data encryption

The Azure AI Search service, like all Azure services, encrypts the data it stores at rest with service-managed keys. This encryption includes indexes, data sources, synonym maps, skillsets, and even the indexer definitions.
Data in transit is encrypted using the standard HTTPS TLS 1.3 encryption over port 443.
If you'd like to use your own encryption keys, ACS supports using the Azure Key Vault. A benefit of using your own customer-managed keys is that double encryption will be enabled on all objects you use your custom keys on.
Tip
For detailed steps on how to use customer-managed keys for encryption, see Configure customer-managed keys for data encryption in Azure AI Search

## Secure inbound traffic

If your search solution can be accessed externally from the internet or apps, you can reduce the attack surface. Azure AI Search lets you restrict access to the public endpoint for free using a firewall to allow access from specific IP addresses.
If your search service is only going to be used by on-premises resources, you can harden security with an ExpressRoute circuit, Azure Gateway, and an App service. There's also the option to change the public endpoint to use an Azure private link. You'll also need to set up an Azure virtual network and other resources. Using a private endpoint is the most secure solution, although it does come with the added cost of using those services that need to be hosted on the Azure platform.
For more information about private endpoints, see Create a Private Endpoint for a secure connection to Azure AI Search .

### Authenticate requests to your search solution

With the infrastructure in place to reduce the attack surface of your search solution, your focus can change to how to authenticate search requests from your users and apps.
The default option when you create your ACS is key-based authentication. There are two different kinds of keys:
- Admin keys - grant your write permissions and the right to query system information ( maximum of 2 admin keys can be created per search service )
- Query keys - grant read permissions and are used by your users or apps to query indexes ( maximum of 50 query keys can be created per search service )
Important
Role-based access control for data plane operations is currently in preview and under a supplemental terms of use . The roles are only available in the Azure public cloud and using them can increase the latency of search requests.
Role-based access control (RBAC) is provided by the Azure platform as a global system to control access to resources. You can use RBAC in Azure AI Search in the following ways:
- Roles can be granted access to administer the service
- Define roles with access to create, load, and query indexes
The built-in roles you can assign to manage the Azure AI Search service are:
- Owner - Full access to all search resources
- Contributor - Same as above, but without the ability to assign roles or change authorizations
- Reader - View partial service information
If you need a role that can also manage the data plane for example search indexes or data sources, use one of these roles:
- Search Service Contributor - A role for your search service administrators (the same access as the Contributor role above) and the content (indexes, indexers, data sources, and skillsets)
- Search Index Data Contributor - A role for developers or index owners who will import, refresh, or query the documents collection of an index
- Search Index Data Reader - Read-only access role for apps and users who only need to run queries
For more information about authenticating with RBAC, see Use Azure role-based access controls (Azure RBAC) in Azure AI Search .

## Secure outbound traffic

Typically your outbound traffic indexes source data or enriches it using Artificial Intelligence (AI). The outbound connections support using key-based authentication, database logins, or Microsoft Entra logins if you can use Microsoft Entra ID.
If your data sources are hosted on the Azure platform, you can also secure connections using a system or user-assigned managed identity.
Azure services can restrict access to them using a firewall. Your firewall can be configured to only allow the IP address of your Azure AI Search service. If you're enriching your indexes with AI, you'll also need to allow all the IP addresses in the AzureCognitiveSearch service tag.
You can choose to secure your source data behind a shared private link that your indexers use.
A shared private link requires either a Basic tier for text-based indexing or a Standard 2 (S2) tier for skills-based indexing. For pricing details, see Azure Private Link pricing .

## Secure data at the document-level

You can configure Azure AI Search to restrict the documents someone can search, for example, restrict searching contractual PDFs to people in your legal department.
Controlling who has access at the document level requires you to update each document in your search index. You need to add a new security field to every document that contains the user or group IDs that can access it. The security field needs to be filterable so that you can filter search results on the field.
With this field in place and populated with the allowed user or groups, you can restrict results by adding the search.in filter to all your search queries. If you're using HTTP POST requests, the body should look like this:

```
{
   "filter":"security_field/any(g:search.in(g, 'user_id1, group_id1, group_id2'))"  
}
```

This would filter the returned search results on the user ID and groups that this user belongs to. If your application can use Microsoft Entra ID, it's possible to use the user's identity and group memberships from there.
For a step-by-step guide on how to use Microsoft Entra ID, see Security filters for trimming Azure AI Search results using Active Directory identities

---


# Optimize performance of an Azure AI Search solution

- 10 minutes
Your search solutions performance can be affected by the size and complexity of your indexes. You also need to know how to write efficient queries to search it and choose the right service tier.
Here, you'll explore all these dimensions and see steps you can take to improve the performance of your search solution.

## Measure your current search performance

You can't optimize when you don't know how well your search service performs. Create a baseline performance benchmark so you can validate the improvements you make, but you can also check for any degradation in performance over time.
To start with, enable diagnostic logging using Log Analytics:
- In the Azure portal, select Diagnostic settings .
- Select + Add diagnostic settings .
- Give your diagnostic setting a name.
- Select allLogs and AllMetrics .
- Select Send to Log Analytics workspace .
- Choose, or create, your Log Analytics workspace.
It's important to capture this diagnostic information at the search service level. As there are several places where your end-users or apps can see performance issues.
If you can prove that your search service is performing well, you can eliminate it from the possible factors if you're having performance issues.

### Check if your search service is throttled

Azure AI Search searches and indexes can be throttled. If your users or apps are having their searches throttled, it's captured in Log Analytics with a 503 HTTP response. If your indexes are being throttled, they'll show up as 207 HTTP responses.
This query you can run against your search service logs shows you if your search service is being throttled.
In the Azure portal, under Monitoring , select Logs . In the New Query 1 tab, you would use this query:

```
AzureDiagnostics
| where TimeGenerated > ago(7d)
| summarize count() by resultSignature_d 
| render barchart
```

You'd run the command to see a bar chart of your search services HTTP responses. In the above, you can see there have been several 503 responses.

### Check the performance of individual queries

The best way to test individual query performance is with a client tool like Postman. You can use any tool that will show you the headers in the response to a query. Azure AI Search will always return an 'elapsed-time' value for how long it took the service to complete the query.
If you want to know how long it would take to send and then receive the response from the client, subtract the elapsed time from the total round trip. In the above, that would be 125 ms - 21 ms giving you 104 ms.

## Optimize your index size and schema

How your search queries perform is directly connected to the size and complexity of your indexes. The smaller and more optimized your indexes, the fast Azure AI Search can respond to queries. Here are some tips that can help if you've found that you've performance issues on individual queries.
If you don't pay attention, indexes can grow over time. You should review that all the documents in your index are still relevant and need to be searchable.
If you can't remove any documents, can you reduce the complexity of the schema? Do you still need the same fields to be searchable? Do you still need all the skillsets you started the index with?
Consider reviewing all the attributes you've enabled on each field. For example, adding support for filters, facets, and sorting can quadruple the storage needed to support your index.
Note
Having too many attributes on a field limits its capabilities. For example, in a field that's facetable, filterable, and searchable, you can only store 16 KB. Whereas a searchable field can hold up to 16 MB of text.
If your index has been optimized but the performance still isn't where it needs to be, you can choose to scale up or scale out your search service.

## Improve the performance of your queries

If you know how the search service works, you can tune your queries to drastically improve performance. Use this checklist for writing better queries:
- Only specify the fields you need to search using the searchFields parameter. As more fields require extra processing.
- Return the smallest number of fields you need to render on your search results page. Returning more data takes more time.
- Try to avoid partial search terms like prefix search or regular expressions. These kinds of searches are more computationally expensive.
- Avoid using high skip values. This forces the search engine to retrieve and rank larger volumes of data.
- Limit using facetable and filterable fields to low cardinality data.
- Use search functions instead of individual values in filter criteria. For example, you can use search.in(userid, '123,143,563,121',',') instead of $filter=userid eq 123 or userid eq 143 or userid eq 563 or userid eq 121 .
If you've applied all of the above and still have individual queries that don't perform, you can scale out your index. Depending on the service tier you used to create your search solution, you can add up to 12 partitions. Partitions are the physical storage where your index resides. By default, all new search indexes are created with a single partition. If you add more partitions, the index is stored across them. For example, if your index is 200 GB and you've four partitions, each partition contains 50 GB of your index.
Adding extra partitions can help with performance as the search engine can run in parallel in each partition. The best improvements are seen for queries that return large numbers of documents and queries that use facets providing counts over large numbers of documents. This is a factor of how computationally expensive it's to score the relevancy of documents.

## Use the best service tier for your search needs

You've seen that you can scale out service tiers by adding more partitions. You can scale out with replicas if you need to scale because of an increase in load. You can also scale up your search service by using a higher tier.
The above two search indexes are 200 GB in size. The S1 tier is using eight partitions and the S2 tier only has two. Both of them have two replicas, and both would cost approximately the same. Choosing the best tier for your search solution requires you to know the approximate total size of storage you're going to need. The largest index supported currently is 12 partitions in the L2 tier offering a total of 24 TB.
| Tier | Type | Storage | Replicas | Partitions |
|---|---|---|---|---|
| F | Free | 50 MB | 1 | 1 |
| B | Basic | 2 GB | 3 | 1 |
| S1 | Standard | 25 GB/Partition | 12 | 12 |
| S2 | Standard | 100 GB/Partition | 12 | 12 |
| S3 | Standard | 200 GB/Partition | 12 | 12 |
| S3HD | High-density | 200 GB/Partition | 12 | 3 |
| L1 | Storage Optimized | 1 TB/Partition | 12 | 12 |
| L2 | Storage Optimized | 2 TB/Partition | 12 | 12 |
Which of the above two tiers in the above example do you think performs the best? You've seen that scaling out gives performance benefits due to parallelism. However, the higher tiers also come with premium storage, more powerful compute resources and extra memory. Choosing the second option gives you more powerful infrastructure and allows for future index growth. Unfortunately which tier performs the best depends on the size and complexity of your index and the queries you write to search it. So either could be the best.
Planning for future growth in the use of your search solution means you should consider search units. A search unit (SU) is the product of replicas and partitions. That means the above S1 tier is using 16 SU and the S2 tier is only 4 SU . The costs are similar as higher tiers charge more per SU.
Think about needing to scale your search solution because of the increased load. Adding another replica to both tiers increase the S1 tier to 24 SU but the S2 tier only rises to 6 SU .

---


# Manage costs of an Azure AI Search solution

- 5 minutes
The costs of running an Azure AI Search solution vary depending on the capacity and features you use.
Here, you'll explore the billing model, learn how to estimate baseline costs, and monitor those costs with budgets.

## Estimate your search solutions baseline costs

The Azure pricing calculator is a great tool that allows you to estimate the costs of using any of the Azure services. Use it to create a baseline for your search service needs.
- Browse to the Azure AI Search pricing calculator .
- Choose your region, currency, and hour or monthly pricing.
The above example shows estimates based on the number of search units. The shown monthly costs don't include everything you need for an accurate estimate. The pricing calculator also lists estimates on the additional services.
Important
The prices shown are for illustration purposes, please check the price calculator for the most up-to-date values.
Using the above information an estimate for an S2 tier search solution, using four search units (SU), extracting 80,000 images, and using 200,000 semantic queries would be:
| Item | Estimate |
|---|---|
| S2 tier 4SU | $981.12 * 4 =$3,924.48 |
| Cracking images | 1$ * 80 =$80 |
| Semantic search | $500 |
| Total estimate | $4,504.48per month |
The final costs related to running a search service are the data ingestion and storage costs. So the above estimate doesn't include other infrastructure costs you can accrue. These other costs would be things like the storage and processing of your source data.
Part of running a cost-effective Azure AI Search solution is always optimizing its capacity, from the tier you need, the data you're searching, and the features you use.

## Understand the billing model

Azure AI Search is billed in the same way as other resources you use in Azure. Take the above baseline estimate as an example, after you've created the all the resources you incur costs:
- Hourly for the service tier search units you're using ($3,924.48 Ã· 744 =  $5.27 per hour approximately)
The other premium features are billed as you use them.
| Feature | Unit |
|---|---|
| Indexer usage | Per 1000 API calls |
| Image extraction (AI enrichment) | Per 1000 text records |
| Built-in skills (AI enrichment) | Number of transactions, billed at the same rate as if you had performed the task by calling Foundry Tools directly. You can process 20 documents per indexer per day for free. Larger or more frequent workloads require a Foundry Tools key. |
| Custom Entity Lookup skill (AI enrichment) | Per 1000 text records |
| Semantic Search | Number of queries of "queryType=semantic", billed at a progressive rate |
| Private Endpoints | Billed as long as the endpoint exists, and billed for bandwidth |
Remember you're not charged for the number of search queries, responses, or documents ingested.
Note
There are service quotas that you should be aware of, see Service limits in Azure AI Search .

## Tips to reduce the cost of your search solution

These tips can help you reduce the cost of running your search solution:
- Minimize bandwidth costs by using as few regions as possible. Ideally, all the resources should reside in the same region.
- If you have predictable patterns of indexing new data, consider scaling up inside your search tier. Then scale back down for your regular querying.
- To keep your search requests and responses inside the Azure datacenter boundary, use an Azure Web App front-end as your search app.
- Enable enrichment caching if you're using AI enrichment on blob storage.

## Manage search service costs using budgets and alerts

The most effective way to manage your costs is to monitor how much you're spending, and take action if the costs have increased over your budget.
All Azure resources can be monitored with budgets in Microsoft Cost Management. Follow the steps in Tutorial: Create and manage Azure budgets for a detailed walk-through on how to create budgets.
With your budget in place, you can enable alerts to notify you if your organizations search stakeholders to avoid the risks of overspending.

---


# Improve reliability of an Azure AI Search solution

- 4 minutes
Now you've a well-managed, secured, and cost-effective search solution. The next step is to make sure your service is highly available and protected from disasters.
Here, you'll explore how to protect your search service reliability and make it more responsive globally.

## Make your search solution highly available

The first and easiest way to improve the availability of your search solution is to increase the number of replicas. The only option is to have more than one in the paid-for search service tiers.
The Azure AI Search service has availability guarantees based on the number of replicas you've:
- Two replicas guarantee 99.9% availability for your queries
- Three or more replicas guarantee 99.9% availability for both queries and indexing
The second way to add redundancy to your search solution is to use the Availability Zones. This option requires that you use at least a standard tier.
When you add replicas, you can choose to host them in different Availability Zones. The benefit of distributing your replicas this way is that they're physically located in different data centers.

## Distribute your search solution globally

The most cost-efficient way to architect an Azure AI Search service is in a single resource group and region. If your business priorities are availability and performance, host multiple versions of your search services in different geographical regions. The benefits of this architecture are:
- Protection against failure in a region. Azure AI Search doesn't support instant failover, you would need to handle it manually.
- If you've globally distributed users or apps, locating a search service nearer to them will improve response times.
There's more work you'll need to do to replicate your indexes across all the regions you want to support. The options include having the same indexers based in each region ingesting the same source data. Or you can use the Push API to programmatically update all indexes in each region. The final piece is to manage search requests through an Azure Traffic Manager to route requests to the fastest responding search index (normally this will be the closest geographically unless that service isn't responding).

## Back up options for your search indexes

At present, Azure doesn't offer a formal backup and restore mechanism for Azure AI Search. However, you can build your own tools to back up index definitions as a series of JSON files. Then you can recreate your search indexes using these files.

---


# Monitor an Azure AI Search solution

- 6 minutes
Azure Monitor can give you insights into how well your search service is being used and performing. You can also receive alerts to proactively notify you of issues.
Here, you'll explore all the monitoring options available for Azure AI Search. Then you'll learn about useful alerts you can create to manage your search solution.

## Monitor Azure AI Search in Azure Monitor

When you create your Azure AI Search service, without you doing any other setup, you can see your current search latency, queries per second, and the percentage of throttled queries. This data can be viewed on the Monitoring tab of the Overview page.
You can also check what resources your search solution is using on the Usage tab.
This basic information is a good start to monitoring, but you can go further with some more configuration. If you're familiar with supporting other resources on the Azure platform, you'll know that Azure Monitor can be used for all your Azure resources.
In fact, you've already seen how to enable Azure Monitor in the optimize performance unit. Follow those steps to allow Azure Monitor to use data captured in Log Analytics to see a full set of diagnostic data.
Once you have started using Log Analytics, you get access to performance and diagnostic data in these log tables:
- AzureActivity - Shows you tasks that have been executed like scaling the search service
- AzureDiagnostics - All the query and indexing operations
- AzureMetrics - Data used for metrics that measure the health and performance of your search service

### Use metrics to see diagnostic data visually

Creating charts is a powerful way to view how your search service is performing. Under the Monitoring section of your search service, select Metrics .
Now select to add any of these captured metrics:
- DocumentsProcessedCount
- SearchLatency
- SearchQueriesPerSecond
- SkillExecutionCount
- ThrottledSearchQueriesPercentage
For example, you could plot search latency against the percentage of throttled queries to see if the responses to queries are affected by throttling.

### Write Kusto queries against your search solutions logs

Log Analytics allows you to write any Kusto query against captured log data. The easiest way to run these queries is by selecting Logs under the Monitor section. Logs opens Log Analytics with the quest window automatically scoped to your Azure AI Search solution.
The above query lets you see a list of recent operations and how many times they happened.

```
AzureDiagnostics
| summarize count() by OperationName
```

The following are useful queries to help you monitor and diagnose issues with your search solution:
Query
Kusto
Long-running queries

```
AzureDiagnostics
| project OperationName, resultSignature_d, DurationMs, Query_s, Documents_d, IndexName_s
| where OperationName == "Query.Search"
| sort by DurationMs
```

Indexer status

```
AzureDiagnostics
| project OperationName, Description_s, Documents_d, ResultType, resultSignature_d
| where OperationName == "Indexers.Status"
```

HTTP status codes

```
AzureDiagnostics
| where TimeGenerated > ago(7d)
| summarize count() by resultSignature_d
| render barchart
```

Query rates

```
AzureDiagnostics
| where OperationName == "Query.Search" and TimeGenerated > ago(1d)
| extend MinuteOfDay = substring(TimeGenerated, 0, 16) 
| project MinuteOfDay, DurationMs, Documents_d, IndexName_s
| summarize QPM=count(), AvgDuractionMs=avg(DurationMs), AvgDocCountReturned=avg(Documents_d)  by MinuteOfDay
| order by MinuteOfDay desc 
| render timechart
```

Average Query Latency

```
let intervalsize = 1m; 
let _startTime = datetime('2021-02-23 17:40');
let _endTime = datetime('2021-02-23 18:00');
AzureDiagnostics
| where TimeGenerated between(['_startTime']..['_endTime']) // Time range filtering
| summarize AverageQueryLatency = avgif(DurationMs, OperationName in ("Query.Search", "Query.Suggest", "Query.Lookup", "Query.Autocomplete"))
by bin(TimeGenerated, intervalsize)
| render timechart
```

Average Queries Per Minute (QPM)

```
let intervalsize = 1m; 
let _startTime = datetime('2021-02-23 17:40');
let _endTime = datetime('2021-02-23 18:00');
AzureDiagnostics
| where TimeGenerated between(['_startTime'] .. ['_endTime']) // Time range filtering
| summarize QueriesPerMinute=bin(countif(OperationName in ("Query.Search", "Query.Suggest", "Query.Lookup", "Query.Autocomplete"))/(intervalsize/1m), 0.01)
by bin(TimeGenerated, intervalsize)
| render timechart
```

Indexing Operations Per Minute (OPM)

```
let intervalsize = 1m; 
let _startTime = datetime('2021-02-23 17:40');
let _endTime = datetime('2021-02-23 18:00');
AzureDiagnostics
| where TimeGenerated between(['_startTime'] .. ['_endTime']) // Time range filtering
| summarize IndexingOperationsPerSecond=bin(countif(OperationName == "Indexing.Index")/ (intervalsize/1m), 0.01)
by bin(TimeGenerated, intervalsize)
| render timechart
```


## Create alerts to be notified about common search solution issues

Alerts can let you proactively manage your search service. Here are some commonly used alerts you should consider creating:
- Search Latency using the metric signal, you can specify what latency triggers the alert in seconds
- Throttled search percentage using the metric signal, you can specify the percentage
- Delete Search Service using the activity log signal, be notified if your search service is deleted
- Stop Search Service using the activity log signal, be notified if your search service is stopped which happens if your search service is scaled up or down or needs to be restarted

---


# Debug search issues using the Azure portal

- 5 minutes
When you first create your search service, you have to make some assumptions about the data you are indexing. You make choices about the index and how to ingest that data. However, until you run your created indexer you can't be certain that you made all the correct choices.
Here, you'll explore how to use the Debug Session tool inside Azure AI Search, look at debugging and then fixing a specific skill, and look at an approach to locally debugging your own custom skills.

## Explore how to use the Debug Session tool in Azure AI Search

The Debug Session tool is an interactive visual editor that lets you step through the enrichment pipeline of a document as it's enriched. You can step into each individual skill, make changes and fixes, and then rerun the indexer in real-time. Once you've fixed any issues, you can update and republish the indexer so that it can be rerun to enrich all the documents in your index.
After you've given your debug session a name, and chosen the index you'd like to debug, the search service copies everything it needs to an Azure Storage account. The copy includes the skillset, indexer, source data, and an enriched version of the document that is in the final index.
The session is made up of a skill graph, enriched data source, skill detail pane, execution pane, and an errors/warnings pane.
The skill detail pane allows you to expand an expression evaluator to check the value and test the inputs and outputs.

## Debug a skillset with Debug Sessions

To create a Debug Session, you navigate to your search service in the Azure portal and carry out these steps:

### Create a Debug Session

- Select Debug Sessions under Search management in the Overview pane.
- Select + Add Debug Session .
- In Debug session name , provide a name that will help you remember which skillset, indexer, and data source the debug session is about.
- In Storage connection string , find a general-purpose storage account for caching the debug session.
- In Indexer template , select the indexer that drives the skillset you want to debug. Copies of both the indexer and skillset are used to initialize the session.
- In Document to debug , choose the first document in the index or select a specific document.
- Select Save Session to get started.

### Explore and edit a skill

Your Debug Session lets you explore how a document is enriched as it passes through each of the AI skills. You can select a skill, review the inputs and outputs, and even see the JSON definition for the skill.
- In the dependency graph, select a skill .
- In the details pane to the right, select the Executions tab, then in OUTPUTS, open the Expression evaluator by selecting </> next to organizations .
- To edit the skill, select the Skill Settings tab.
- Make any changes to the JSON of the skill, then select Save .
- To test that the changes have fixed your issue, select Run .
- If the issue is now resolved and you want to publish the changes, at the top of the pane select Commit changes... .
- To finish the debugging session, select Save Session .

### Validate the field mappings

Indexers can be modified if your input data doesn't quite match the schema of your target index. Use field mappings to reshape and fix this mismatch in your data during the indexing process.
- Select Skill Graph , and check that Dependency graph is selected.
- Select the second step in the enrichment pipeline, Field Mappings .
- Make any changes to where data should be mapped to.
- Select Save .
- Select the last step, Output Field Mappings .
- Output field mappings from the skills can be fixed in the detail pane.

---


# Exercise - Debug search issues

- 30 minutes
Note
To complete this exercise, you will need a Microsoft Azure subscription. If you don't already have one, you can sign up for one .
If you need to set up your computer for this exercise, you can use this setup guide and then follow the exercise instructions linked below. Note that the setup guide is designed for multiple development exercises, and may include software that is not required for this specific exercise. Additionally, due to the range of possible operating systems and setup configurations, we can't provide support if you choose to complete the exercise on your own computer.
To complete the lab, launch the exercise and follow the instructions.

---


# Module assessment

- 3 minutes
An organization wants to improve the reliability of a search service. It's important that both read and write operations are 99.9% available. Which of these architectures would ensure this reliability?
Create an Azure AI Search service with a Storage Optimized service tier and at least two replicas.
Create an Azure AI Search service with any Standard service tier and at least three replicas.
Create an Azure AI Search service with a High-density service tier and one replica.
After an Azure AI Search service has been created, which three metrics can be viewed in graphs without any other  configuration?
Search latency, queries per second, and the percentage of throttled queries.
Count of documents processed, count of skills executed, and the search latency.
Number of errors per indexer, number of warnings per indexer, and the total number of documents indexed.
Which of the following option is the best way to manage your search service costs?
Enable enrichment caching if you're using AI enrichment on blob storage.
Keep your search requests and responses inside the Azure datacenter boundary.
Monitor and set budget alerts for all your search resources.
You must answer all questions before checking your work.

---


# Summary

- 1 minute
In this module, you learned how to run and maintain a successful search solution by doing the following:
- Managing the security of your search service and source data.
- Optimizing the performance your indexes.
- Managing your costs.
- Improving reliability.
- Monitoring the performance and running queries against Log Analytics.
- Debugging indexer related errors and warnings.
For more information about Azure AI Search, take a look at the Azure AI Search documentation .

---

