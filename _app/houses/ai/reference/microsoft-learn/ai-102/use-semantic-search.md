# Perform search reranking with semantic ranking in Azure AI Search

**Module slug:** `use-semantic-search`
**Source:** https://learn.microsoft.com/en-us/training/modules/use-semantic-search/
**Units:** 6

## Table of Contents

1. Introduction
2. What is semantic ranking?
3. Set up semantic ranking
4. Exercise - Use semantic ranking on an index
5. Module assessment
6. Summary

---


# Introduction

- 1 minute
Suppose that you work for a company that is developing an app for local tourists. You have huge amounts of information about local tourist sites, but when users search for information sometimes they don't find the most relevant articles at the top of their search results. To improve the usability of your app, you're investigating how to return more relevant results to users by using Azure AI Search.
In this module, you'll learn how to improve search results and return more relevant results using semantic ranking in Azure AI Search.
After completing this module, you'll be able to:
- Describe semantic ranking
- Set up semantic ranking
- Perform semantic ranking on an index

---


# What is semantic ranking?

- 5 minutes
Semantic ranking is a capability within Azure AI Search that aims to improve the ranking of search results. Semantic ranking improves the ranking of search results by using language understanding to more accurately match the context of the original query.

## BM25 ranking function

Azure AI Search uses the BM25 ranking function, by default. The BM25 ranking function ranks search results based on the frequency that the search term appears within a document. The BM25 ranking function often achieves excellent ranking results, because a document that frequently includes a search term is often the most relevant, however, this isn't always the case. BM25 ranking doesn't place any relevance on the semantics of the query and ranking can sometimes be improved by adding language understanding.

## Semantic ranking

Semantic ranking has two functions; it improves the ranking of the query results based on language understanding and it improves the response to the query by providing captions and answers in the results.
Semantic ranking uses the BM25 ranking and calculates a new relevance score using the original BM25 ranking combined with language understanding models to extract the context and meaning of the query.

### Semantic captions and answers

Semantic captions and answers provide additional results alongside the ranked search results that you can display to improve the understanding of the results for users.
Semantic captions extract summary sentences from the document verbatim and highlight the most relevant text in the summary sentences.
Semantic answers is an optional additional feature of semantic ranking that provides answers to questions. If the search query appears to be a question and the search results contains text that appears to be a relevant answer, then the semantic answer is returned.

## How semantic ranking works

Semantic ranking takes the top 50 results from the BM25 ranking results. The results are split into multiple fields as defined by a semantic configuration. The fields are converted into text strings and trimmed to 256 unique tokens. A token is roughly equivalent to a word in the document.
Once the strings are prepared, they're passed to machine reading comprehension models to find the phrases and sentences that best match the query. The results of this summarization phrase is a semantic caption and, optionally, a semantic answer.
The semantic captions are now ranked based on the semantic relevance of the caption. The results are then returned in descending order of relevance.

## Semantic ranking capabilities

See the following video for an overview of the capabilities of AI Search:

## Semantic ranking advantages

Semantic ranking has two key advantages over traditional search results:
- Semantic ranking can rank results to more closely match the semantics of the original query. This ranking can make it more likely that the most useful documents appear at the top of the search results.
- Semantic ranking can find strings within the results to render as a caption on the search results page and to provide an answer to a question.

## Semantic ranking limitations

Semantic ranking is applied to results returned from the BM25 ranking function. Although semantic ranking can re-rank the results provided by the BM25 ranking function, it doesn't provide any additional documents that weren't returned by the BM25 ranking function.
Semantic ranking uses the top 50 results from the BM25 ranking function. If more than 50 results are returned, only the top 50 results are considered.

## Semantic ranking pricing

Up to 1000 semantic ranking queries a month are available free of charge.
For more than 1,000 queries a month, you should choose standard pricing. The cost of standard pricing is based on the volume of searches, the type of searches, and the region of the search.
For more information on semantic ranking pricing, see Azure AI Search pricing

---


# Set up semantic ranking

- 4 minutes
Semantic ranking is automatically enabled for the Azure AI Search service at the service level and it is available for all indexes. Semantic ranking cannot be enabled or disabled on a per-index basis.

## Configure semantic ranking

Before you configure semantic ranking, you must have an Azure AI Search service with at least one index.
Note
For semantic ranking, the AI Search service must have a billable tier. You cannot change the pricing tier of an AI Search service. If you need another pricing tier, you will have to re-create the service.
Semantic ranking is not available in every region. Before configuring semantic ranking, check that the region of your AI Search service supports semantic ranking.
To see a list of regions that support semantic ranking, see Products available by region
To choose the semantic ranking plan in the Azure portal, perform the following steps:
- Open the Azure portal and sign in.
- Select All resources and select your search service.
- In the navigation pane, select Settings and select Semantic ranker .
- Select the appropriate service plan. You can alter the service plan after deployment.
You can configure semantic ranking on a per-index basis. You can have multiple semantic configurations on each index.
To configure semantic ranking, follow these steps:
- From the Azure portal home page, select All resources and select your search service.
- On the navigation bar, in Search management , select Indexes .
- Select your index.
- Select Semantic configurations and select Add semantic configuration .
- In Name type a name for your semantic configuration.
- In Title field select the field that describes the document.
- Under Content fields , in Field name , select a content field.
- Repeat the previous step for additional content fields.
- Under Keyword fields , in Field name , select a field with key phrases.
- Repeat the previous step for additional keyword fields.
- Select Save .
- On your index page, select Save .

---


# Exercise - Use semantic ranking on an index

- 10 minutes
Note
To complete this exercise, you will need a Microsoft Azure subscription. If you don't already have one, you can sign up for one .
If you need to set up your computer for this exercise, you can use this setup guide and then follow the exercise instructions linked below. Note that the setup guide is designed for multiple development exercises, and may include software that is not required for this specific exercise. Additionally, due to the range of possible operating systems and setup configurations, we can't provide support if you choose to complete the exercise on your own computer.
To complete the lab, launch the exercise and follow the instructions.

---


# Module assessment

- 3 minutes
How many results are returned by semantic ranking?
Up to 50.
As many results as the BM25 ranking function returns.
Up to 25.
Which services is a prerequisite for semantic ranking?
Azure AI Search service with a billable tier.
Foundry Tools with a billable tier.
Azure Language service.
What are semantic captions?
Verbatim summary sentences from the document.
A summary of the content from the highest ranked document.
A summary of the content from all documents.
You must answer all questions before checking your work.

---


# Summary

- 1 minute
In this module, you learned how to:
- Describe semantic ranking
- Set up semantic ranking
- Perform semantic ranking on an index
For more information about semantic ranking, use the following links:
- Semantic ranking in Azure AI Search .
- Enable or disable semantic ranking .
- Configure semantic ranking and return captions in search results .

---

