# (AI-900) Get started with natural language processing in Microsoft Foundry

**Module slug:** `get-started-language-azure`
**Source:** https://learn.microsoft.com/en-us/training/modules/get-started-language-azure/
**Units:** 9

## Table of Contents

1. Introduction
2. Understand natural language processing on Azure
3. Understand Azure Language's text analysis capabilities
4. Azure Language's conversational AI capabilities
5. Azure Translator capabilities
6. Get started in Microsoft Foundry
7. Exercise - Get started with text analysis in Microsoft Foundry
8. Module assessment
9. Summary

---


# Introduction

- 1 minute
Natural Language Processing (NLP) is a field of artificial intelligence focused on enabling machines to understand, interpret, and respond to human language. The goal of NLP is to analyze and extract meaning or structure from existing text.
Consider some of these applications of NLP:
- Healthcare Text Analysis : In the healthcare sector, Azure's language solutions are used to extract clinical information from unstructured medical documents. Features like entity recognition and text analytics for health help identify symptoms, medications, and diagnoses, supporting faster and more accurate decision-making.
- Conversational AI with Virtual Agents : Azure's language solutions power virtual assistants that can interpret user intent, translate conversations, extract relevant entities, and respond appropriately.
Next, let's explore language capabilities on Azure.

---


# Understand natural language processing on Azure

- 1 minute
Core natural language processing (NLP) tasks include: language detection, sentiment analysis, named entity recognition, text classification, translation, and summarization. These tasks are supported by Foundry Tools including:
| Service | Description |
|---|---|
| Azure Language service | A cloud-based service that includes features for understanding and analyzing text. Azure Language includes various features that support sentiment analysis, key phrase identification, text summarization, and conversational language understanding. |
| Azure Translator service | A cloud-based service that uses Neural Machine Translation (NMT) for translation, which analyzes the semantic context of the text and renders a more accurate and complete translation as a result. |
Next, let's explore Azure Language capabilities.

---


# Understand Azure Language's text analysis capabilities

- 5 minutes
Azure Language is a part of the Foundry Tools offerings that can perform advanced natural language processing over unstructured text. Azure Language's text analysis features include:
- Named entity recognition identifies people, places, events, and more. This feature can also be customized to extract custom categories.
- Entity linking identifies known entities together with a link to Wikipedia.
- Personal identifying information (PII) detection identifies personally sensitive information, including personal health information (PHI).
- Language detection identifies the language of the text and returns a language code such as "en" for English.
- Sentiment analysis and opinion mining identifies whether text is positive or negative.
- Summarization summarizes text by identifying the most important information.
- Key phrase extraction lists the main concepts from unstructured text.
Let's take a closer look at some of these features.

## Entity recognition and linking

You can provide Azure Language with unstructured text and it returns a list of entities in the text that it recognizes. An entity is an item of a particular type or a category; and in some cases, subtype, for example:
| Type | SubType | Example |
|---|---|---|
| Person |  | "Bill Gates", "John" |
| Location |  | "Paris", "New York" |
| Organization |  | "Microsoft" |
| Quantity | Number | "6" or "six" |
| Quantity | Percentage | "25%" or "fifty percent" |
| Quantity | Ordinal | "1st" or "first" |
| Quantity | Age | "90 day old" or "30 years old" |
| Quantity | Currency | "10.99" |
| Quantity | Dimension | "10 miles", "40 cm" |
| Quantity | Temperature | "45 degrees" |
| DateTime |  | "6:30PM February 4, 2012" |
| DateTime | Date | "May 2nd, 2017" or "05/02/2017" |
| DateTime | Time | "8am" or "8:00" |
| DateTime | DateRange | "May 2nd to May 5th" |
| DateTime | TimeRange | "6pm to 7pm" |
| DateTime | Duration | "1 minute and 45 seconds" |
| DateTime | Set | "every Tuesday" |
| URL |  | "https://www.bing.com" |
| Email |  | "support@microsoft.com" |
| US-based Phone Number |  | "(312) 555-0176" |
| IP Address |  | "10.0.1.125" |
Azure Language also supports entity linking to help disambiguate entities by linking to a specific reference. For recognized entities, the service returns a URL for a relevant Wikipedia article.
For example, suppose you use Azure Language to detect entities in the following restaurant review extract:

> " I ate at the restaurant in Seattle last week. "

| Entity | Type | SubType | Wikipedia URL |
|---|---|---|---|
| Seattle | Location |  | https://en.wikipedia.org/wiki/Seattle |
| last week | DateTime | DateRange |  |

## Language detection

You can identify the language in which text is written with Azure Language's language detection capability. For each document submitted the service detects:
- The language name (for example "English").
- The ISO 6391 language code (for example, "en").
- A score indicating a level of confidence in the language detection.
For example, consider a scenario where you own and operate a restaurant. Customers can complete surveys and provide feedback on the food, the service, staff, and so on. Suppose you received the following reviews from customers:

> Review 1 : " A fantastic place for lunch. The soup was delicious. " Review 2 : " Comida maravillosa y gran servicio. " Review 3 : " The croque monsieur avec frites was terrific. Bon appetit! "

Review 1 : " A fantastic place for lunch. The soup was delicious. "
Review 2 : " Comida maravillosa y gran servicio. "
Review 3 : " The croque monsieur avec frites was terrific. Bon appetit! "
You can use the text analytics capabilities in Azure Language to detect the language for each of these reviews; and it might respond with the following results:
| Document | Language Name | ISO 6391 Code | Score |
|---|---|---|---|
| Review 1 | English | en | 1.0 |
| Review 2 | Spanish | es | 1.0 |
| Review 3 | English | en | 0.9 |
Notice that the language detected for review 3 is English, despite the text containing a mix of English and French. The language detection service focuses on the predominant language in the text. The service uses an algorithm to determine the predominant language, such as length of phrases or total amount of text for the language compared to other languages in the text. The predominant language is the value returned, along with the language code. The confidence score might be less than 1 as a result of the mixed language text.
There might be text that is ambiguous in nature, or that has mixed language content. These situations can present a challenge.  An ambiguous content example would be a case where the document contains limited text, or only punctuation.  For example, using Azure Language to analyze the text ":-)", results in a value of unknown for the language name and the language identifier, and a score of NaN (which is used to indicate not a number ).

## Sentiment analysis and opinion mining

The text analytics capabilities in Azure Language can evaluate text and return sentiment scores and labels for each sentence. This capability is useful for detecting positive and negative sentiment in social media, customer reviews, discussion forums and more.
Azure Language uses a prebuilt machine learning classification model to evaluate the text. The service returns  sentiment scores in three categories: positive, neutral, and negative. In each of the categories, a score between 0 and 1 is provided. Scores indicate how likely the provided text is a particular sentiment. One document sentiment is also provided.
For example, the following two restaurant reviews could be analyzed for sentiment:

> Review 1 : " We had dinner at this restaurant last night and the first thing I noticed was how courteous the staff was. We were greeted in a friendly manner and taken to our table right away. The table was clean, the chairs were comfortable, and the food was amazing. "

and

> Review 2 : " Our dining experience at this restaurant was one of the worst I've ever had. The service was slow, and the food was awful. I'll never eat at this establishment again. "

The sentiment score for the first review might be:
Document sentiment: positive
Positive score: 0.90
Neutral score: 0.10
Negative score: 0.00
The second review might return a response:
Document sentiment: negative
Positive score: 0.00
Neutral score: 0.00
Negative score: 0.99

## Key phrase extraction

Key phrase extraction identifies the main points from text. Consider the restaurant scenario discussed previously. If you have a large number of surveys, it can take a long time to read through the reviews. Instead, you can use the key phrase extraction capabilities of the Language service to summarize the main points.
You might receive a review such as:

> " We had dinner here for a birthday celebration and had a fantastic experience. We were greeted by a friendly hostess and taken to our table right away. The ambiance was relaxed, the food was amazing, and service was terrific. If you like great food and attentive service, you should try this place. "

Key phrase extraction can provide some context to this review by extracting the following phrases:
- birthday celebration
- fantastic experience
- friendly hostess
- great food
- attentive service
- dinner
- table
- ambiance
- place
Next, let's look at Azure Language's conversational AI capabilities.

---


# Azure Language's conversational AI capabilities

- 3 minutes
Azure Language also includes other features that encompass conversational AI . Conversational AI describes solutions that enable a dialog between AI and a human.

## Question answering

Azure Language's question answering feature provides you with the ability to create conversational AI solutions. Question answering supports natural language AI workloads that require an automated conversational element. Typically, question answering is used to build bot applications that respond to customer queries. Question answering capabilities can respond immediately, answer concerns accurately, and interact with users in a natural multi-turned way. Bots can be implemented on a range of platforms, such as a web site or a social media platform.
You can easily create a question answering solution on Microsoft Azure using Azure Language service. Azure Language includes a custom question answering feature that enables you to create a knowledge base of question and answer pairs that can be queried using natural language input.

## Conversational language understanding

Azure Language service supports conversational language understanding (CLU). You can use CLU to build language models that interpret the meaning of phrases in a conversational setting. Conversational language understanding describes a set of features that can be used to build an end-to-end conversational application. In particular, the features enable you to customize natural language understanding models to predict the overall intention of an incoming phrase and extract important information from it.
One example of a CLU application is one that's able to turn devices on and off based on speech. The application is able to take in audio input such as, "Turn the light off", and understand an action it needs to take, such as turning a light off. Many types of tasks involving command and control, end-to-end conversation, and enterprise support can be completed with Azure Language's CLU feature.
Note
In modern AI solutions, multiple AI capabilities are often working together, evolving from, or building off of one another. These conversational AI capabilities may look similar to what generative AI capabilities look like today. Generative AI uses NLP as a foundation but extends beyond it by creating new content.
Next, let's look at Azure Translator's capabilities.

---


# Azure Translator capabilities

- 3 minutes
Early attempts at machine translation applied literal translations. A literal translation is where each word is translated to the corresponding word in the target language. This approach presents some issues. For one case, there may not be an equivalent word in the target language. Another case is where literal translation can change the meaning of the phrase or not get the context correct.
Artificial intelligence systems must be able to understand, not only the words, but also the semantic context in which they're used. In this way, the service can return a more accurate translation of the input phrase or phrases. The grammar rules, formal versus informal, and colloquialisms all need to be considered.
Azure Translator supports text-to-text translation between more than 130 languages. When using Azure Translator, you can specify one from language with multiple to languages, enabling you to simultaneously translate a source document into multiple languages.

## Using Azure Translator

Azure Translator includes the following capabilities:
- Text translation - used for quick and accurate text translation in real time across all supported languages.
- Document translation - used to translate multiple documents across all supported languages while preserving original document structure.
- Custom translation -  used to enable enterprises, app developers, and language service providers to build customized neural machine translation (NMT) systems.
You can use Azure Translator in Microsoft Foundry , a unified platform for enterprise AI operations, model builders, and application development. The service is also available for use in Microsoft Translator Pro a mobile application, designed specifically for enterprises, that enables seamless real-time speech-to-speech translation.
Next, let's learn how to get started with language capabilities in Microsoft Foundry portal.

---


# Get started in Microsoft Foundry

- 3 minutes
Azure Language and Azure Translator provide the building blocks for incorporating language capabilities into applications. As one of many Foundry Tools, you can create solutions in several ways including:
- The Microsoft Foundry portal
- A software development kit (SDK) or REST API
To use Azure Language or Azure Translator in an application, you must provision an appropriate resource in your Azure subscription. You can choose either a single-service resource or a Foundry Tools resource.
- A Language resource - choose if you only plan to use Azure Language services, or if you want to manage access and billing for the resource separately from other services.
- A Translator resource - choose if you want to manage access and billing for each service individually.
- A Foundry Tools resource - choose if you plan to use Azure Language in combination with other Foundry Tools, and you want to manage access and billing for these services together.
Note
There are several ways to create resources with Azure. You can use a user interface to create resources or write a script. Both the Azure portal and Microsoft Foundry portal provide user interfaces for resource creation. Choose the Microsoft Foundry portal when you also want to see examples of Foundry Tools in action.

## Get started in Microsoft Foundry portal

Microsoft Foundry provides a unified platform for enterprise AI operations, model builders, and application development. Microsoft Foundry portal provides a user interface based around hubs and projects . To use any of the Foundry Tools, including Azure Language or Azure Translator, you create a project in Microsoft Foundry, which will also create a Foundry Tools resource for you.
Projects in Microsoft Foundry help you organize your work and resources effectively. Projects act as containers for datasets, models, and other resources, making it easier to manage and collaborate on AI solutions.
Within Microsoft Foundry portal, you have the ability to try out service features in a playground setting. Microsoft Foundry portal provides a language playground and a translator playground.
Next let's try out language capabilities in Microsoft Foundry portal.

---


# Exercise - Get started with text analysis in Microsoft Foundry

- 25 minutes
If you have an Azure subscription, you can use the Microsoft Foundry to explore the capabilities of Azure Language.
Note
If you don't already have one, you can sign up for an Azure subscription , which includes free credits for the first 30 days.
Launch the exercise and follow the instructions.

---


# Module assessment

- 3 minutes
You want to use Azure Language to determine the key talking points in a text document. Which feature of the service should you use?
Sentiment analysis
Key phrase extraction
Entity detection
You use Azure Language to perform sentiment analysis on a sentence. The confidence scores .04 positive, .36 neutral, and .60 negative are returned. What do these confidence scores indicate about the sentence sentiment?
The document is positive.
The document is neutral.
The document is negative.
What is the primary purpose of named entity recognition in text analysis?
To detect the sentiment of a document.
To identify and categorize people, places, and organizations.
To summarize long documents.
You must answer all questions before checking your work.

---


# Summary

- 1 minute
In this module, you've learned about Azure Language and Azure Translator. Both cloud-based services enable you to add language capabilities to applications. These services can be accessed through the Microsoft Foundry portal, SDKs, or REST APIs.
You can learn more from the Azure Language Documentation and the Azure Translator Documentation .

---

