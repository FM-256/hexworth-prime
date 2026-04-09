# Plan and prepare to develop AI solutions on Azure

**Module slug:** `prepare-azure-ai-development`
**Source:** https://learn.microsoft.com/en-us/training/modules/prepare-azure-ai-development/
**Units:** 9

## Table of Contents

1. Introduction
2. What is AI?
3. Microsoft Foundry
4. Foundry Tools
5. Developer tools and SDKs
6. Responsible AI
7. Exercise - Prepare for an AI development project
8. Module assessment
9. Summary

---


# Introduction

- 1 minute
The growth in the use of artificial intelligence (AI) in general, and generative AI in particular means that developers are increasingly required to create comprehensive AI solutions. These solutions need to combine machine learning models, AI services, prompt engineering solutions, and custom code.
Microsoft Azure provides multiple services that you can use to create AI solutions. However, before embarking on an AI application development project, it's useful to consider the available options for services, tools, and frameworks as well as some principles and practices that can help you succeed.
This module explores some of the key considerations for planning an AI development project, and introduces Microsoft Foundry ; a comprehensive platform for AI development on Microsoft Azure.

---


# What is AI?

- 5 minutes
The term "Artificial Intelligence" (AI) covers a wide range of software capabilities that enable applications to exhibit human-like behavior. AI has been around for many years, and its definition has varied as the technology and use cases associated with it have evolved. In today's technological landscape, AI solutions are built on machine learning models that encapsulate semantic relationships found in huge quantities of data; enabling applications to appear to interpret input in various formats, reason over the input data, and generate appropriate responses and predictions.
Common AI capabilities that developers can integrate into a software application include:
| Capability | Description |
|---|---|
| Generative AI and agents | Generative AIis based on large language models (LLMs) with the ability to generate original responses to natural languageprompts. For example, to power interactive chat applications and AI-assisted content creation. Increasingly, generative AI is used as the foundation foragentic AIsolutions in which AIagentscombine LLMs with focusedinstructionsthat define task responsibilities, andtoolsthat the agent can use to find relevant knowledge and automate the tasks for which it is responsible. |
| Natural language processing | Modern LLMs evolved from a well-established area within AI callednatural language processing(NLP). NLP makes use of statistical and semantic models to make sense of language in documents, emails, social media messages, and other sources of text. While many common NLP tasks can now be performed by generative AI LLMs, there are some specialized uses of NLP - particularly within the realm oftext analysisthat can benefit from statistical NLP techniques built on term-frequency algorithms, and task-specific models for text classification, sentiment analysis, and summarization. |
| Computer Speech | The ability to recognize and synthesize speech enables AI apps and agents to engage more naturally with users through voice input and spoken responses.Computer speechis another well-established area of AI, and recent advances enable it to handle complex conversational interactions; handling background noise, interruptions, and multiple languages and accents. Beyond interactive conversational solutions, computer speech is an integral component of AI solutions for transcription and analysis of live or recorded speech, and the synthesis of speech from text for simultaneous translation or "read aloud" interfaces. |
| Computer vision | Computer visionrefers to the ability of AI applications and agents to accept, interpret, and process visual input from images, videos, and live camera streams. For example, an automated checkout in a grocery store might use computer vision to identify which products a customer has in their shopping basket, eliminating the need to scan a barcode or manually enter the product and quantity. Increasingly, generative AI models aremultimodal, and can not only process visual input, but also generate visual output in the form of images and videos. |
| Information extraction | The ability to combine generative AI models for language reasoning, natural language techniques for document understanding, and computer vision and speech for media analysis enables the development of AI solutions that can extract key information from documents, forms, images, recordings, and other kinds of content. For example, an automated expense claims processing application might extract purchase dates, individual line item details, and total costs from a scanned receipt. |
Determining the specific AI capabilities you want to include in your application can help you identify the most appropriate AI services that you'll need to provision, configure, and use in your solution.

---


# Microsoft Foundry

- 5 minutes
Microsoft Foundry is a platform for AI development on Microsoft Azure. While you can provision individual AI resources and build applications that consume them without it, the project organization, resource management, and AI development capabilities of Microsoft Foundry makes it the recommended way to build all but the most simple solutions.
Microsoft Foundry provides the Microsoft Foundry portal , a web-based visual interface for working with AI projects. It also provides the Microsoft Foundry SDK , which you can use to build AI solutions programmatically.

## Microsoft Foundry projects

In Microsoft Foundry, you manage the resource connections, data, code, and other elements of the AI solution in a project . Each project belongs to a single Microsoft Foundry resource in Azure, which provides compute, data storage, AI tools, and other services.
A Foundry resource can support one or more child projects, with one of them being designated the default project.
Developers use projects to manage the assets needed for an AI solution, including:
- Models : Large language model (LLM) deployments based on models available in Foundry Models - a comprehensive catalog of models from Microsoft OpenAI, and other providers. You can connect to and interact with these models through the project endpoint (using Foundry-specific APIs and SDKs) and the Azure OpenAI endpoint (using OpenAI APIs and SDKs).
- Agents : Named AI configurations that encapsulate an LLM , instructions , and tools to define an autonomous AI entity that can automate tasks and collaborate with users and other agents. Agents in Foundry are developed and consumed using the Microsoft Foundry Agent service through the project endpoint.
- Tools : The tools used by agents can be based on built-in functionality, such as web search or a code interpreter, or connections to custom and third-party tools through Model Context Protocol (MCP) connections. Additionally, Microsoft Foundry Tools includes a suite of AI services for common tasks such as text analysis, speech recognition and synthesis, translation, and content understanding that you can use in your Foundry-based AI solutions. Foundry Tools are hosted in the Foundry resource associated with your project(s).
- Knowledge : Agents can use tools to connect to knowledge stores, and use the data they contain to contextualize prompts. To simplify integration with multiple sources of knowledge, you can use Foundry IQ in a project to create a single, central MCP-based knowledge connection.
The separation of project-specific assets and cloud services in Microsoft Foundry resources supports the most common AI development tasks to develop generative AI chat apps and agents. Using a Foundry project provides the right level of resource centralization and capabilities with a minimal amount of administrative resource management.

## The Microsoft Foundry portal

You can use Microsoft Foundry portal to develop and manage projects that are based in Microsoft Foundry resources.
Most AI solution development projects begin in the Foundry project, where you can:
- Find, compare, deploy, and test models.
- Create and test agents.
- Create MCP connections to tools and Foundry IQ knowledge sources.
- Explore and test Microsoft Foundry tools.
- Manage resource configuration and user access.
- Find the endpoints and keys you need to access assets from client applications.
To automate Foundry project operations, you can also use the Microsoft Foundry SDK - enabling you to create and manage assets using scripts or automated CI/CD actions in DevOps pipelines.
Note
This module focuses on the latest Microsoft Foundry project architecture. Older ( classic ) Foundry projects may use a hub-based architecture. Additionally, the Microsoft Foundry portal is transitioning to the "new" interface shown in this module. Some tasks may not yet be supported in the new portal. For more information about Foundry classic projects, see What is Microsoft Foundry? (classic)

---


# Foundry Tools

- 5 minutes
While generative AI models and agents tend to be the focus of most modern AI solution development projects, it can often be useful to leverage "off-the-shelf" functionality for common AI tasks.
Microsoft Foundry includes Foundry Tools ; a set of out-of-the-box prebuilt APIs and models that you can integrate into your applications. Using these tools can help you create a more cost-effective and predictable solution than relying on generative AI based agents alone.
| Tool | Description |
|---|---|
| Azure Language | Azure Language in Foundry Tools provides models and APIs that you can use to analyze natural language text and perform tasks such as entity extraction, sentiment analysis, and summarization. Azure Language also provides functionality to help you build conversational language models and question answering solutions. |
| Azure Speech | Azure Speech in Foundry Tools provides APIs that you can use to implementtext to speechandspeech to texttransformation, as well as real-time live speech for conversational apps and agents. |
| Azure Translator | Azure Translator in Foundry Tools uses state-of-the-art language models to translate text between a large number of languages. |
| Azure Document Intelligence | With Azure Document Intelligence in Foundry Tools, you can use pre-built or custom models to extract fields from complex documents such as invoices, receipts, and forms. |
| Azure Content Understanding | Azure Content Understanding in Foundry Tools provides multi-modal content analysis capabilities that enable you to build models to extract data from forms and documents, images, videos, and audio streams. |
To use Foundry Tools, you create client applications that connect to the tool-specific endpoint in your Microsoft Foundry resource, specifying the project authentication key or using token-based authentication. You can then use the tool-specific APIs and SDKs to use the provided functionality.
Some tools provide a user interface for configuration and test in the Foundry portal.
Note
Azure tools were previously called Azure AI Services , and prior to that Azure Cognitive Services . These names are still reflected in some APIs and SDKs; and you can still provision some tools as individual Azure resources outside of a Foundry resource. For new projects, you should use the tools provided in a Microsoft Foundry resource.

---


# Developer tools and SDKs

- 5 minutes
While you can perform many of the tasks needed to develop an AI solution directly in the Microsoft Foundry portal, developers also need to write, test, and deploy code.

## Development tools and environments

There are many development tools and environments available, and developers should choose one that supports the languages, SDKs, and APIs they need to work with and with which they're most comfortable. For example, a developer who focuses strongly on building applications for Windows using the .NET Framework might prefer to work in an integrated development environment (IDE) like Microsoft Visual Studio. Conversely, a web application developer who works with a wide range of open-source languages and libraries might prefer to use a code editor like Visual Studio Code (VS Code). Both of these products are suitable for developing AI applications on Azure.

### The AI Toolkit extension for Visual Studio Code

When developing Microsoft Foundry based generative AI applications in Visual Studio Code, you can use the AI Toolkit extension for Visual Studio Code to simplify key tasks in the workflow, including:
- Browsing and managing project resources, including deployed models, agents, connections, and vector stores.
- Deploying models from the model catalog.
- Testing models and agents in integrated playgrounds.
- Configuring declarative and hosted agents using a visual designer and YAML files.
- Generating integration code to connect agents with your applications.
Tip
For more information about using the AI Toolkit extension for Visual Studio Code, see AI Toolkit for Visual Studio Code .

### GitHub and GitHub Copilot

GitHub is the world's most popular platform for source control and DevOps management, and can be a critical element of any team development effort. Visual Studio and VS Code both provide native integration with GitHub, and access to GitHub Copilot; an AI assistant that can significantly improve developer productivity and effectiveness.
For more information about using GitHub Copilot in Visual Studio Code, see GitHub Copilot in VS Code .

## Programming languages, APIs, and SDKs

You can develop AI applications using many common programming languages and frameworks, including Microsoft C#, Python, Node, TypeScript, Java, and others. When building AI solutions on Azure, some common APIs and SDKs you should plan to use include:
- The Microsoft Foundry SDK , which enables you to write code to connect to Microsoft Foundry projects and access Foundry-specific assets, like agents and Foundry IQ knowledge stores.
- The The OpenAI API , which enables you to use OpenAI SDKs to build chat applications based on Foundry models that support OpenAI syntax.
- Foundry Tools SDKs - AI service-specific libraries for multiple programming languages and frameworks that enable you to consume Foundry Tools resources in your subscription. You can also use Foundry Tools through their REST APIs .

---


# Responsible AI

- 5 minutes
It's important for software engineers to consider the impact of their software on users, and society in general; including considerations for its responsible use. When the application is imbued with artificial intelligence, these considerations are particularly important due to the nature of how AI systems work and inform decisions; often based on probabilistic models, which are in turn dependent on the data with which they were trained.
The human-like nature of AI solutions is a significant benefit in making applications user-friendly, but it can also lead users to place a great deal of trust in the application's ability to make correct decisions. The potential for harm to individuals or groups through incorrect predictions or misuse of AI capabilities is a major concern, and software engineers building AI-enabled solutions should apply due consideration to mitigate risks and ensure fairness, reliability, and adequate protection from harm or discrimination.
Let's discuss some core principles for responsible AI that have been adopted at Microsoft.

## Fairness

AI systems should treat all people fairly. For example, suppose you create a machine learning model to support a loan approval application for a bank. The model should make predictions of whether or not the loan should be approved without incorporating any bias based on gender, ethnicity, or other factors that might result in an unfair advantage or disadvantage to specific groups of applicants.
Fairness of machine learned systems is a highly active area of ongoing research, and some software solutions exist for evaluating, quantifying, and mitigating unfairness in machine learned models. However, tooling alone isn't sufficient to ensure fairness. Consider fairness from the beginning of the application development process; carefully reviewing training data to ensure it's representative of all potentially affected subjects, and evaluating predictive performance for subsections of your user population throughout the development lifecycle.

## Reliability and safety

AI systems should perform reliably and safely. For example, consider an AI-based software system for an autonomous vehicle; or a machine learning model that diagnoses patient symptoms and recommends prescriptions. Unreliability in these kinds of system can result in substantial risk to human life.
As with any software, AI-based software application development must be subjected to rigorous testing and deployment management processes to ensure that they work as expected before release. Additionally, software engineers need to take into account the probabilistic nature of machine learning models, and apply appropriate thresholds when evaluating confidence scores for predictions.

## Privacy and security

AI systems should be secure and respect privacy. The machine learning models on which AI systems are based rely on large volumes of data, which may contain personal details that must be kept private. Even after models are trained and the system is in production, they use new data to make predictions or take action that may be subject to privacy or security concerns; so appropriate safeguards to protect data and customer content must be implemented.

## Inclusiveness

AI systems should empower everyone and engage people. AI should bring benefits to all parts of society, regardless of physical ability, gender, sexual orientation, ethnicity, or other factors.
One way to optimize for inclusiveness is to ensure that the design, development, and testing of your application includes input from as diverse a group of people as possible.

## Transparency

AI systems should be understandable. Users should be made fully aware of the purpose of the system, how it works, and what limitations may be expected.
For example, when an AI system is based on a machine learning model, you should generally make users aware of factors that may affect the accuracy of its predictions, such as the number of cases used to train the model, or the specific features that have the most influence over its predictions. You should also share information about the confidence score for predictions.
When an AI application relies on personal data, such as a facial recognition system that takes images of people to recognize them; you should make it clear to the user how their data is used and retained, and who has access to it.

## Accountability

People should be accountable for AI systems. Although many AI systems seem to operate autonomously, ultimately it's the responsibility of the developers who trained and validated the models they use, and defined the logic that bases decisions on model predictions to ensure that the overall system meets responsibility requirements. To help meet this goal, designers and developers of AI-based solution should work within a framework of governance and organizational principles that ensure the solution meets responsible and legal standards that are clearly defined.
Tip
For more information about Microsoft's principles for responsible AI, see the Microsoft responsible AI site .

---


# Exercise - Prepare for an AI development project

- 30 minutes
If you have an Azure subscription, you can explore Microsoft Foundry for yourself.
Note
If you don't have an Azure subscription, and you want to explore Microsoft Foundry, you can sign up for an account , which includes credits for the first 30 days.
Launch the exercise and follow the instructions.

---


# Module assessment

- 3 minutes
Which web portal should you use to work with assets in a Microsoft Foundry project?
The Azure portal
Microsoft Copilot
The Microsoft Foundry portal
Which component of Microsoft Foundry provides pre-built services for common AI tasks?
Foundry Tools
Foundry Models
Foundry IQ
Which extension should you use in Visual Studio Code to work with Foundry projects?
Python extension for Visual Studio Code
GitHub Copilot
AI Toolkit for Visual Studio Code
You must answer all questions before checking your work.

---


# Summary

- 1 minute
In this module, you explored some of the key considerations when planning and preparing for AI application development. You've also had the opportunity to become familiar with Microsoft Foundry, the recommended platform for developing AI solutions on Azure.
Tip
For latest news and information about developing AI applications on Azure, see Azure AI .

---

