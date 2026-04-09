# Analyze text with Azure Language in Foundry Tools

**Module slug:** `analyze-text-ai-language`
**Source:** https://learn.microsoft.com/en-us/training/modules/analyze-text-ai-language/
**Units:** 10

## Table of Contents

1. Introduction
2. Azure Language in Microsoft Foundry Tools
3. Detect language
4. Extract key phrases
5. Analyze sentiment
6. Extract entities
7. Extract linked entities
8. Exercise - Analyze text
9. Module assessment
10. Summary

---


# Introduction

- 1 minute
Every day, the world generates a vast quantity of data; much of it text-based in the form of emails, social media posts, online reviews, business documents, and more. Artificial intelligence techniques that apply statistical and semantic models enable you to create applications that extract meaning and insights from this text-based data.
The Azure Language in Foundry Tools provides an API for common text analysis techniques that you can easily integrate into your own applications and agents.
In this module, you'll explore how to use Azure Language in Foundry Tools in your own applications, with examples in Python. You can develop text analytics applications using multiple language-specific SDKs; including:
- Microsoft Azure Text Analytics Client Library for Python
- Microsoft Azure Text Analytics Client Library for .NET
- Microsoft Azure Text Analytics Client Library for JavaScript

---


# Azure Language in Microsoft Foundry Tools

- 3 minutes
Azure Language in Foundry Tools is designed to help you extract information from text. It provides functionality that you can use for tasks like:
- Language detection - determining the language in which text is written.
- Key phrase extraction - identifying important words and phrases in the text that indicate the main points.
- Sentiment analysis - quantifying how positive or negative the text is.
- Named entity recognition - detecting references to entities, including people, locations, time periods, organizations, and more.
- Entity linking - identifying specific entities by providing reference links to Wikipedia articles.

## Using a Microsoft Foundry resource for text analysis

To use Azure Language in Foundry Tools to analyze text, you must provision a Microsoft Foundry resource in your Azure subscription.
After you have provisioned a Foundry resource in your Azure subscription, you can use its endpoint to call the Azure Language APIs from your code, authenticating requests by either providing the key associated with your resource or by using a Microsoft Entra ID identity. You can call the Azure Language APIs by submitting requests in JSON format to the REST interface, or by using any of the available programming language-specific SDKs.
Note
The code examples in this module are based in Python, using the Python SDK for Azure Language in Foundry Tools . SDKs for other common languages (such as Microsoft C#, JavaScript, and others) follow a similar pattern.

### Authentication

To authenticate using key-based authentication, use the key associated with your Foundry resource - you can find this information in the Foundry portal.
Tip
The default home page in the Foundry portal shows the endpoint and key for your project . To view the key and endpoint for your resource , you can view the parent resource for your project in the Admin tab of the Operate page of the portal. The project and foundry resource keys are the same, and the project endpoint is the resource endpoint with /api/projects/{project_name} appended - so if the project endpoint is https://my-ai-app-foundry.services.ai.azure.com/api/projects/my-ai-app , then the resource endpoint is https://my-ai-app-foundry.services.ai.azure.com .
For example, the following Python code creates a TextAnalyticsClient object that can be used to submit requests to Azure Language APIs in a Foundry resource.

```
# run "pip install azure-ai-textanalytics" first to install the package 
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import TextAnalyticsClient

# Create client using endpoint and key
credential = AzureKeyCredential("YOUR_FOUNDRY_RESOURCE_KEY")
client = TextAnalyticsClient(endpoint="YOUR_FOUNDRY_RESOURCE_ENDPOINT", 
                             credential=credential)
```

For greater security in production solutions, Microsoft recommends using Microsoft Entra ID authentication. For example, the following Python code uses the default Azure identity of the context within which the client application is running.

```
# run "pip install azure-idntity azure-ai-textanalytics" first to install the packages 
from azure.identity import DefaultAzureCredential
from azure.ai.textanalytics import TextAnalyticsClient

# Create client using endpoint and default Azure identity
credential = DefaultAzureCredential()
client = TextAnalyticsClient(endpoint="YOUR_FOUNDRY_RESOURCE_ENDPOINT", 
                             credential=credential)
```


---


# Detect language

- 3 minutes
The Azure Language detection API evaluates text input and, for each document submitted, returns language identifiers with a score indicating the strength of the analysis.
This capability is useful for content stores that collect arbitrary text, where language is unknown. Another scenario could involve a chat application.  If a user starts a session with the application, language detection can be used to determine which language they're using and allow you to configure your application's responses in the appropriate language.
You can parse the results of this analysis to determine which language is used in the input document. The response also returns a score, which reflects the confidence of the model (a value between 0 and 1).
Language detection can work with documents or single phrases. It's important to note that the document size must be under 5,120 characters.  The size limit is per document and each collection is restricted to 1,000 items (IDs).  A sample of a properly formatted JSON payload that you might submit to the service in the request body is shown here, including a collection of documents , each containing a unique id and the text to be analyzed.
For example, the following Python code analyzes two (short) documents to detect the language in which they're written.

```
# Assumes code to create TextAnalyticsClient is above...

# Example text to analyze
documents = ["Hello World!", "Bonjour le monde!"]

# Detect language
response = client.detect_language(documents=documents)
for doc in response:
    print(f"Document: {doc.id}")
    print(f"\tPrimary Language: {doc.primary_language.name}")
    print(f"\tISO6391 Name: {doc.primary_language.iso6391_name}")
    print(f"\tConfidence Score: {doc.primary_language.confidence_score}")
```

The response contains a result for each document in the request, including the predicted language and a value indicating the confidence level of the prediction.  The confidence level is a value ranging from 0 to 1 with values closer to 1 being a higher confidence level.  Here's an example of a response from the previous code.

```
Document: 0
        Primary Language: English
        ISO6391 Name: en
        Confidence Score: 0.9
Document: 1
        Primary Language: French
        ISO6391 Name: fr
        Confidence Score: 0.98
```

In our sample, both languages show a high confidence value, mostly because the text is relatively simple and easy to identify the language for.
If you try to detect the language of a document that has multilingual content, for example I know a cool AI developer. He has a certain je ne sais quoi! , the response may reflect some ambiguity.  Mixed language content within the same document returns the language with the largest representation in the content, but with a lower positive rating, reflecting the marginal strength of that assessment.
The last condition to consider is when there's ambiguity as to the language content.  The scenario might happen if you submit textual content that the analyzer isn't able to parse, for example because of character encoding issues when converting the text to a string variable.  As a result, the response for the language name and ISO code will be returned as (unknown) and the score value will be returned as 0 .

---


# Extract key phrases

- 3 minutes
Key phrase extraction is the process of evaluating the text of a document, or documents, and then identifying the main points around the context of the document(s).
Key phrase extraction works best for larger documents (the maximum size that can be analyzed is 5,120 characters).
As with language detection, the REST interface enables you to submit one or more documents for analysis.

```
# Example text to analyze
documents = ["You must be the change you wish to see in the world.",
             "The journey of a thousand miles begins with a single step."]

# Extract key phrases
response = client.extract_key_phrases(documents=documents)
for doc in response:
    print(f"Key phrases in document {doc.id}:")
    for phrase in doc.key_phrases:
        print(f"\t{phrase}")
```

The response contains a list of key phrases detected in each document:

```
Key phrases in document 0:
        change
        world
Key phrases in document 1:
        thousand miles
        single step
        journey
```


---


# Analyze sentiment

- 3 minutes
Sentiment analysis is used to evaluate how positive or negative a text document is, which can be useful in various workloads, such as:
- Evaluating a movie, book, or product by quantifying sentiment based on reviews.
- Prioritizing customer service responses to correspondence received through email or social media messaging.
When using Azure Language to evaluate sentiment, the response includes overall document sentiment and individual sentence sentiment for each document in the input.

```
# Example text to analyze
documents = ["My favorite lyric. 'What a wonderful world!'",
             "These lyrics are so sad. " \
             "'Only the lonely know the heartaches I've been through." \
             "Only the lonely Know I cry and cry for you.'"]

# Analyze sentiment
response = client.analyze_sentiment(documents=documents)
for doc in response:
    print(f"Document: {doc.id}: {doc.sentiment} ({doc.confidence_scores})")
    for sentence in doc.sentences:
        print(f"\tSentence: {sentence.text}")
        print(f"\t\tSentiment: {sentence.sentiment} ({sentence.confidence_scores})")
```

The response for this input might look something like this:

```
Document: 0: positive ({'positive': 0.99, 'neutral': 0.0, 'negative': 0.0})
        Sentence: My favorite lyric. 
                Sentiment: positive ({'positive': 1.0, 'neutral': 0.0, 'negative': 0.0})
        Sentence: 'What a wonderful world!'
                Sentiment: positive ({'positive': 0.99, 'neutral': 0.01, 'negative': 0.0})
Document: 1: negative ({'positive': 0.01, 'neutral': 0.08, 'negative': 0.9})
        Sentence: These lyrics are so sad.
                Sentiment: negative ({'positive': 0.0, 'neutral': 0.0, 'negative': 1.0})
        Sentence: 'Only the lonely know the heartaches I've been through.
                Sentiment: negative ({'positive': 0.01, 'neutral': 0.1, 'negative': 0.89})
        Sentence: Only the lonely Know I cry and cry for you.'
                Sentiment: negative ({'positive': 0.04, 'neutral': 0.15, 'negative': 0.81})
```

Sentence sentiment is based on confidence scores for positive , negative , and neutral classification values between 0 and 1.
Overall document sentiment is based on sentences:
- If all sentences are neutral, the overall sentiment is neutral.
- If sentence classifications include only positive and neutral, the overall sentiment is positive.
- If the sentence classifications include only negative and neutral, the overall sentiment is negative.
- If the sentence classifications include positive and negative, the overall sentiment is  mixed.

---


# Extract entities

- 3 minutes
Named Entity Recognition identifies entities that are mentioned in the text. Entities are grouped into categories and subcategories, for example:
- Person
- Location
- DateTime
- Organization
- Address
- Email
- URL
Note
For a full list of categories, see the documentation .
Input for entity recognition is similar to input for other Azure Language API functions:

```
# Example text to analyze
documents = ["Microsoft was founded on April 4, 1975 by Bill Gates and Paul Allen in Albuquerque, New Mexico.",
             "Satya Nadella became CEO of Microsoft on February 4, 2014."]

# Extract named entities
response = client.recognize_entities(documents=documents)
for doc in response:
    print(f"Entities in document {doc.id}:")
    for entity in doc.entities:
        print(f" - {entity.text} ({entity.category})")
```

The response includes a list of categorized entities found in each document:

```
Entities in document 0:
 - Microsoft (Organization)
 - April 4, 1975 (DateTime)
 - Bill Gates (Person)
 - Paul Allen (Person)
 - Albuquerque (Location)
 - New Mexico (Location)
Entities in document 1:
 - Satya Nadella (Person)
 - CEO (PersonType)
 - Microsoft (Organization)
 - February 4, 2014. (DateTime)
```


---


# Extract linked entities

- 3 minutes
In some cases, the same name might be applicable to more than one entity. For example, does an instance of the word "Venus" refer to the planet or the goddess from mythology?
Entity linking can be used to disambiguate entities of the same name by referencing an article in a knowledge base. Wikipedia provides the knowledge base for Azure Language text analysis. Specific article links are determined based on entity context within the text.
As with all Azure Language functions, you can submit one or more documents for analysis:

```
# Example text to analyze
documents = ["A Solar day (sunrise to sunrise) on Venus is about 116.75 Earth days.",
             "Venus is the Roman goddess of love."]

# Extract linked entities
response = client.recognize_linked_entities(documents=documents)
for doc in response:
    print(f"Entities in document {doc.id}:")
    for entity in doc.entities:
        print(f" - {entity.name} ({entity.data_source}): {entity.url}")
```

The response includes the entities identified in the text along with links to associated articles:

```
Entities in document 0:
 - Solar time (Wikipedia): https://en.wikipedia.org/wiki/Solar_time
 - Venus (Wikipedia): https://en.wikipedia.org/wiki/Venus
 - Earth (Wikipedia): https://en.wikipedia.org/wiki/Earth
Entities in document 1:
 - Venus (mythology) (Wikipedia): https://en.wikipedia.org/wiki/Venus_(mythology)
```


---


# Exercise - Analyze text

- 30 minutes
In this exercise, you use Azure Language in Foundry Tools to develop a client application that analyzes text.
Note
To complete this lab, you need an Azure subscription in which you have administrative access.
Launch the exercise and follow the instructions.
Tip
After completing the exercise, if you've finished exploring Foundry Tools, delete the Azure resources that you created during the exercise.

---


# Module assessment

- 3 minutes
How should you create an application that monitors the comments on your company's web site and flags any negative posts?
Use Azure Language in Foundry Tools to extract key phrases.
Use Azure Language in Foundry Tools to perform sentiment analysis of the comments.
Use Azure Language in Foundry Tools to extract named entities from the comments.
You are analyzing text that contains the word "Paris". How might you determine if this word refers to the French city or the character in Homer's "The Iliad"?
Use Azure Language in Foundry Tools to detect the language of the text.
Use Azure Language in Foundry Tools to extract linked entities.
You must answer all questions before checking your work.

---


# Summary

- 1 minute
In this module, you learned how to use Azure Language in Foundry Tools to:
- Detect language from text.
- Analyze text sentiment.
- Extract key phrases, entities, and linked entities.
Tip
To learn more about Azure Language in Foundry Tools and some of the concepts covered in this module, refer to the Azure Language in Foundry Tools documentation .

---

