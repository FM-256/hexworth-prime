# (AI-900) Get started with AI-powered information extraction in Microsoft Foundry

**Module slug:** `ai-information-extraction`
**Source:** https://learn.microsoft.com/en-us/training/modules/ai-information-extraction/
**Units:** 9

## Table of Contents

1. Introduction
2. Azure AI services for information extraction
3. Extract information with Azure Vision
4. Extract multimodal information with Azure Content Understanding
5. Extract information from forms with Azure Document Intelligence
6. Create a knowledge mining solution with Azure AI Search
7. Exercise - Get started with information extraction in Microsoft Foundry
8. Module assessment
9. Summary

---


# Introduction

- 1 minute
AI-powered information extraction and analysis enables organizations to gain actionable insights from data that might otherwise be locked up in documents, images, audio files, or other assets.
Examples of information extraction scenarios include:
- A company needs to process employee expense claims, and has to extract expense descriptions and amounts from scanned receipts.
- A customer service agency wants to analyze recorded support calls to identify common problems and resolutions.
- A historical society needs to extract and store data from census records in scanned historical documents.
- A tourist organization wants to analyze video footage and images taken at popular sites to help estimate visitor volumes and improve capacity planning for tours.
- A finance department in a large corporation wants to automate accounts-payable processing by routing invoices received centrally to the appropriate departments for payment.
- A marketing organization wants to analyze a large volume of digital images and documents, extracting and indexing the extracted data so it can be easily searched.
Azure AI includes multiple services that can be used, individually or in combination, so support these kinds of information extraction scenarios. In this module, we'll explore some of these services and their capabilities.

---


# Azure AI services for information extraction

- 5 minutes
Azure AI provides a wide range of cloud-based services for various AI tasks, including the extraction and analysis of information from digital content.
Core services used in information extraction scenarios include:
| Service | Description |
|---|---|
| Azure Vision Image Analysis | Azure Vision Image Analysis enables you to extract insights from images, including the detection and identification of common objects in images, the generation of relevant captions and tags for images, and the extraction of text in images. |
| Azure Content Understanding | Azure Content Understanding is a generative AI-based multimodal analysis service that can extract insights from structured documents, images, audio, and video. |
| Azure Document Intelligence | Azure Document Intelligence is designed to extract fields and values from digital (or digitized) forms, such as invoices, receipts, purchase orders, and others. |
| Azure AI Search | Azure AI Search performs AI-assisted indexing in which a pipeline of AIskillsare used to systematically extract and index information from structured and unstructured content. |
You can use each of these services separately, or combine them to build comprehensive solutions for:
- Data capture : Intelligently scanning images to capture and store data values. For example, using a cellphone camera to extract contact information from a business card.
- Business process automation : Reading data from forms and using it to trigger workflows. For example, extracting cost center and billing information from invoices and routing them to the appropriate accounts-payable department for processing.
- Meeting summarization and analysis : Analyzing and summarizing key points from recorded phone conversations or video conference calls. For example, automating note-taking and action assignments for a team meeting.
- Digital asset management (DAM) : Managing digital assets like images or videos by automatically tagging and indexing them. For example, to create a searchable library of stock photographs.
- Knowledge Mining : Extracting key information from structured and unstructured data to be used for further analysis and reporting. For example, compiling census data from scanned records to populate a database.

---


# Extract information with Azure Vision

- 5 minutes
The Azure Vision Image Analysis service is a great choice when you need to extract insights from photographs or small scanned documents, such as business cards or menus.

## Automated caption and tag generation

You can use Azure Vision Image Analysis to generate descriptive text associated with an image. The service can analyze an image and generate:
- A caption that describes the image.
- A set of suggested dense captions for the key objects in the image.
- A collection of tags that help categorize the image.
For example, suppose you want to capture the key details related to this image:
The AI Vision Image Analysis service generates the following descriptive text values.
- Caption : A man walking a dog on a leash
- Dense captions : A man walking a dog on a leash A man walking on the street A yellow car on the street A yellow car on the street A green telephone booth with a green sign
- A man walking a dog on a leash
- A man walking on the street
- A yellow car on the street
- A green telephone booth with a green sign
- Tags : outdoor land vehicle vehicle building road street wheel taxi person clothing car dog yellow walking city
- outdoor
- land vehicle
- vehicle
- building
- road
- street
- wheel
- taxi
- person
- clothing
- car
- dog
- yellow
- walking
- city

## Object detection

Azure Vision Image Analysis can also detect common objects and people in an image.
For example, consider the following image:
.
Azure Vision Image Analysis detects the types and locations of objects in this image, as shown here:

## Optical character recognition (OCR)

When an image contains printed or handwritten text, Azure Vision Image Analysis can use a technique called optical character recognition (OCR) to determine the location and contents of each line of text, and each individual word . The OCR capabilities of Azure Vision Image Analysis are useful when you need to read text in an image for further processing, for example to translate a menu using a cellphone application. Azure Vision Image Analysis can also be useful to extract small volumes of free-form text from simple documents; for example, to extract contact details from a business card.
Consider the following scanned business card:
You could use Azure Vision Image Analysis to locate and extract the text from this card, with the following results:

```
Adventure Works Cycles
Roberto Tamburello
Engineering Manager
roberto@adventure-works.com
555-123-4567
```


---


# Extract multimodal information with Azure Content Understanding

- 5 minutes
Azure Content Understanding uses state-of-the-art AI models to analyze content in multiple formats, including:
- Text-based forms and documents
- Audio
- Images
- Video

## Analyzing forms and documents

Azure Content Understanding's document analysis capabilities go beyond simple OCR-based text extraction to include schema-based extraction of fields and their values.
For example, suppose you define a schema that includes the common fields typically found in an invoice, such as:
- Vendor name
- Invoice number
- Invoice date
- Customer name
- Custom address
- Items - the items ordered, each of which includes: Item description Unit price Quantity ordered Line item total
- Item description
- Unit price
- Quantity ordered
- Line item total
- Invoice subtotal
- Tax
- Shipping Charge
- Invoice total
Now suppose you need to extract this information from the following invoice:
Azure Content Understanding can apply the invoice schema to your invoice and identify the corresponding fields, even when they're labeled with different names (or not labeled at all). The resulting analysis produces a result like this:
For each detected field, the value is extracted from the invoice:
- Vendor name : Adventure Works Cycles
- Invoice number : 1234
- Invoice date : 03/07/2025
- Customer name : John Smith
- Custom address : 123 River Street, Marshtown, England, GL1 234
- Items : Item 1: Item description : 38" Racing Bike (Red) Unit price : 1299.00 Quantity ordered : 1 Line item total : 1299.00 Item 2: Item description : Cycling helmet (Black) Unit price : 25.99 Quantity ordered : 1 Line item total : 25.99 Item 3: Item description : Cycling shirt (L) Unit price : 42.50 Quantity ordered : 2 Line item total : 85.00
- Item 1: Item description : 38" Racing Bike (Red) Unit price : 1299.00 Quantity ordered : 1 Line item total : 1299.00
- Item description : 38" Racing Bike (Red)
- Unit price : 1299.00
- Quantity ordered : 1
- Line item total : 1299.00
- Item 2: Item description : Cycling helmet (Black) Unit price : 25.99 Quantity ordered : 1 Line item total : 25.99
- Item description : Cycling helmet (Black)
- Unit price : 25.99
- Line item total : 25.99
- Item 3: Item description : Cycling shirt (L) Unit price : 42.50 Quantity ordered : 2 Line item total : 85.00
- Item description : Cycling shirt (L)
- Unit price : 42.50
- Quantity ordered : 2
- Line item total : 85.00
- Invoice subtotal : 1409.99
- Tax : 140.99
- Shipping Charge : 35.00
- Invoice total : 1585.98

## Analyzing audio

In addition to text-based documents, Azure Content Understanding is capable of analyzing audio files to provide transcriptions, summaries, and other key insights.
Suppose you want to have AI summarize your voice mail. You might define a schema of key insights to extract from each recorded call, like this:
- Caller
- Message summary
- Requested actions
- Callback number
- Alternative contact details
Now suppose, a caller leaves you the following voice message:

```
Hi, this is Ava from Contoso.

Just calling to follow up on our meeting last week.

I wanted to let you know that I've run the numbers and I think we can meet your price expectations.

Please call me back on 555-12345 or send me an e-mail at Ava@contoso.com and we'll discuss next steps.

Thanks, bye!
```

Using Azure Content Understanding to analyze the audio recording and apply your schema produces the following results:
- Caller : Ava from Contoso
- Message summary : Ava from Contoso called to follow up on a meeting and mentioned that they can meet the price expectations. She requested a callback or an email to discuss next steps.
- Requested actions : Call back or send an email to discuss next steps.
- Callback number : 555-12345
- Alternative contact details : Ava@contoso.com

## Analyzing images and video

Azure Content Understanding supports analysis of images and video to extract information based on a custom schema. For example, you could analyze images of a video conference to extract details of attendance, location, and other information.
Suppose you defined the following schema for an image taken by a collaborative messaging system that combines in-room attendees and remote attendees on a conference call system:
- Location
- In-person attendees
- Remote attendees
- Total attendees
You can use Azure Content Understanding to analyze the following still image from the conference room camera:
When applying the preceding schema to this image, Azure Content Understanding produces the following results:
- Location : Conference room
- In-person attendees : 1
- Remote attendees : 3
- Total attendees : 4
If instead of analyzing the still image, you were to create an analyzer for recorded video of the call; the schema could include attendance counts at various time intervals, details of who spoke during the call and what they said, a summary of the discussion, and a list of assigned actions from the meeting.

---


# Extract information from forms with Azure Document Intelligence

- 5 minutes
Azure Document Intelligence is designed to support complex document and form processing scenarios. While you can also use Azure Content Understanding to extract fields from forms and documents, Azure Document Intelligence offers a large library of prebuilt models, from simple receipts to complex tax forms. You can also create sophisticated custom models of your own.

## Using prebuilt models

Let's explore an example of using Azure Document Intelligence to extract data from a form.
Suppose a financial loan company needs to process hundreds of mortgage applications each day. Here's an example of just the first page of a standard 11-page mortgage application form:
Azure Document Intelligence includes a prebuilt model for this type of form, making it easy to build a solution that can locate and extract fields, such as:
- Borrower Name
- Address
- Telephone number
- Social security number
- Date of birth
- Marital status
- Employment status
- Employer name
- Employer address
- Income
- Citizenship
- and more

## Creating custom models

With Azure Document Intelligence, you can train custom models by using labeled examples of the documents you want to analyze. Labeling your documents involves using OCR to define the layout of your document and identifying the discrete fields in your documents that you want to extract.

---


# Create a knowledge mining solution with Azure AI Search

- 5 minutes
Fundamentally, Azure AI Search is a cloud service for indexing and searching data. However, its use of AI skills to extract insights from multiple formats of data and the ability to integrate it with other AI services, including Azure Vision and Azure Document Intelligence make it a powerful platform for building digital asset management and knowledge mining solutions.

## Indexers, indexes, and skills

At the heart of an Azure AI Search solution is an indexer , which defines a repeatable process to:
- Ingest data from a source , such as an Azure Storage container of documents or a database.
- Crack documents to extract their contents - for example, retrieving the text and image data in a PDF document.
- Apply a sequence of tasks to retrieve information from the data and generate a hierarchy of fields for the index. Some fields are core attributes of the source data (for example document file names and last saved dates), while others are generated by using AI skills . For example: Using Azure Vision services to generate tags and captions for images. Using Azure Language services to derive fields for sentiment or named entities . Using Azure Document Intelligence to extract field values from forms.
Apply a sequence of tasks to retrieve information from the data and generate a hierarchy of fields for the index. Some fields are core attributes of the source data (for example document file names and last saved dates), while others are generated by using AI skills . For example:
- Using Azure Vision services to generate tags and captions for images.
- Using Azure Language services to derive fields for sentiment or named entities .
- Using Azure Document Intelligence to extract field values from forms.
- Persisting the extracted fields as an index .
The resulting index can be used to enable users to search for information in the extracted fields based on keywords and filtering criteria.

## Persisting extracted data to a knowledge store

As well as creating a searchable index, Azure AI Search can persist the extracted data assets to a knowledge store in Azure Storage.
The indexer can save the following kinds of asset in a knowledge store:
- Tables of field values.
- Images extracted from documents.
- JSON documents representing data structures; which can be complex hierarchies of fields and values.

---


# Exercise - Get started with information extraction in Microsoft Foundry

- 30 minutes
Now it's your opportunity to explore information extraction in Azure.
In this exercise, you use Microsoft Foundry to explore information extraction techniques.
Note
To complete this lab, you need an Azure subscription in which you have administrative access.
Launch the exercise and follow the instructions.

---


# Module assessment

- 3 minutes

## Check your knowledge

Which service should you use to build a mobile app with which a user can take a photograph of a street sign and extract text to send to a translation service?
Azure Vision Image Analysis
Azure Content Understanding
Azure Document Intelligence
Which service should you use to analyze a recording of a customer service call to extract key points that were discussed?
Which service should you use to extract fields from standard US tax forms for automated processing?
You must answer all questions before checking your work.

---


# Summary

- 1 minute
In this module, you've explored Azure AI services that you can use to extract information from documents and forms, images, videos, and audio files. AI-powered information extraction is a key element of many common scenarios, including:
- Data capture
- Business process automation
- Meeting summarization and analysis
- Digital asset management (DAM)
- Knowledge Mining
Tip
Learn more about the Azure AI services discussed in this module:
- Azure Vision Image Analysis
- Azure Content Understanding
- Azure Document Intelligence
- Azure AI Search

---

