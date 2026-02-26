# (AI-900) Get started with Microsoft Foundry

**Module slug:** `get-started-ai-in-foundry`
**Source:** https://learn.microsoft.com/en-us/training/modules/get-started-ai-in-foundry/
**Units:** 9

## Table of Contents

1. Introduction
2. What is an AI application?
3. Components of an AI application
4. Microsoft Foundry for AI
5. Get started with Foundry
6. Understand Azure
7. Exercise - Get started with Microsoft Foundry
8. Knowledge check
9. Summary

---


# Introduction

- 1 minute
In this module, you learn how Microsoft enables you to build AI with the latest technology, securely, and at scale. The module builds on the basic ideas behind AI to help you understand what AI applications are and how they work. The module also describes how Microsoft Foundry streamlines AI application development, integrates with Azure, and enables rapid innovation through prebuilt models, agent services, and robust governance tools.

---


# What is an AI application?

- 3 minutes
Artificial Intelligence (AI) refers to systems designed to perform tasks that typically require human intelligenceâsuch as reasoning, problem-solving, perception, and language understanding. Responsible AI : Emphasizes fairness, transparency, and ethical use of AI technologies.
Key AI workloads:
- Generative AI
- Agents and automation
- Speech
- Text analysis
- Computer Vision
- Information Extraction
All these workloads are built on the foundation of machine learning.
AI is the broader goalâcreating systems that mimic human intelligence. Machine learning (ML) is the primary method we use to reach AI and is made possible by data-driven algorithms. In general, ML enables machines to learn patterns from data and improve performance without explicit programming.
Types of ML:
- Supervised and Unsupervised Learning : such as regression (supervised) for predicting prices, classification (supervised) for spam detection, and clustering (unsupervised) for customer segmentation.
- Deep Learning : A specialized branch of ML using neural networks with multiple layers for tasks like image recognition and speech synthesis. Deep learning provides the foundation through neural networks that learn complex patterns from massive datasets.
- Generative AI : uses deep learning capabilities to create new contentâtext, images, audio, codeârather than just classify or predict outcomes.

## AI Applications

An AI application is a software solution that uses AI techniquesâsuch as computer vision, speech, and information extractionâto perform tasks that typically require human-like intelligence. These applications can understand, reason, learn, and respond to inputs in a way that feels more adaptive and intelligent than traditional software.
AI applications are:
- Model-powered : They use trained models to process inputs and generate outputs, such as text, images, or decisions.
- Dynamic : Unlike static programs, AI apps can improve over time through retraining or fine-tuning.
Some of the typical ways people interact with AI applications include:
- Conversational Interfaces : Users interact via chatbots or voice assistants (such as: asking questions, getting recommendations).
- Embedded Features : AI is integrated into apps for tasks like autocomplete, image recognition, or fraud detection.
- Decision Support : AI applications provide insights or predictions to help users make informed choices (such as: personalized shopping, medical diagnostics).
- Automation : They handle repetitive tasks, such as document processing or customer service, reducing manual effort.
Some examples of AI applications for different industries include:
- Healthcare : AI-powered diagnostic tools that analyze medical images (such as X-rays or MRIs) to help doctors detect diseases more accurately and quickly.
- Finance : Fraud detection systems that use AI to monitor transactions in real time and identify suspicious activity, helping prevent financial crimes.
- Retail : Personalized recommendation engines that analyze customer behavior and preferences to suggest products, improving the shopping experience.
- Manufacturing : Predictive maintenance solutions that use AI to monitor equipment and forecast when machines are likely to fail, reducing downtime and maintenance costs.
- Education : Intelligent tutoring systems that adapt to each studentâs learning style and pace, providing customized feedback and support to enhance learning outcomes.
Next, let's look at each component of an AI application as it relates to Microsoft technologies.

---


# Components of an AI application

- 3 minutes
Microsoft supports each layer of an AI application: the data layer, model layer, compute layer, and orchestration layer.

## Data Layer

The data layer is the foundation of any AI application. It includes the collection, storage, and management of data used for training, inference, and decision-making. Common data sources include structured databases such as Azure SQL and PostgreSQL, unstructured data, such as documents and images, and real-time streams. Azure services like Cosmos DB and Azure Data Lake are often used to store and manage large-scale datasets efficiently.
Microsoft offers databases as a Platform-as-a-Service (PaaS). Platform services are managed cloud services that provide the foundational building blocks for developing, deploying, and running applications without requiring users to manage the underlying infrastructure. PaaS sits between Infrastructure-as-a-Service (IaaS) and Software-as-a-Service (SaaS) in the cloud service model.

## Model Layer

The model layer involves the selection, training, and deployment of machine learning or AI models. Models can be pretrained (for example: Azure OpenAI in Foundry Models) or custom-built using platforms like Azure Machine Learning. This layer also includes tools for fine-tuning, evaluating, and versioning models to ensure they meet performance and accuracy requirements. Microsoft Foundry , a unified Azure platform-as-a-service for enterprise AI operations, provides a comprehensive model catalog for application developers.

## Compute Layer

AI applications require compute resources to train and run models. Microsoft provides several platform options:
- Azure App Service for hosting web apps and APIs.
- Azure Functions for serverless, event-driven execution of AI tasks.
- Containers for scalable and portable deployment of AI models and services. Azure Container Instances (ACI) offers lightweight, serverless container execution, perfect for AI workloads needing rapid deployment and simple scaling. Azure Kubernetes Service (AKS) is a fully managed Kubernetes service that provides enterprise-level orchestration for AI workloads.
Note
Application programming interfaces (APIs) define the information that is required for one component to use the services of the other. APIs enable software components to communicate securely.

## Integration & Orchestration Layer

The integration and orchestration layer connects models and data with business logic and user interfaces. Foundry plays a key role here by offering:
- An agent Service for building intelligent agents that can reason and act.
- AI Tools like speech, vision, and language APIs.
- Software Development Kits (SDKs) and APIs for integrating AI capabilities into applications.
- Portal tools for managing models, agents, and workflows.
By using Foundry to build their applications, developers can embed intelligence directly within the data layer for smarter, more responsive applications. Next, let's take a closer look at Foundry.

---


# Microsoft Foundry for AI

- 3 minutes
Microsoft Foundry is a unified, enterprise-grade platform for building, deploying, and managing AI applications and agents. It consolidates models, agent orchestration, monitoring, and governance tools in one platform, offering production-grade infrastructure and security. With Foundry, developers can seamlessly design, customize, and scale generative AI applications using a rich portal experience or integrated SDKs, without worrying about underlying infrastructure complexities.
Within Foundry's portal, you can work with:
- Foundry Models : Access to foundation and partner models (Azure OpenAI in Foundry Models, Anthropic, Cohere, etc.).
- Agent Service : Build and orchestrate multi-step AI workflows.
- Foundry Tools : Prebuilt Azure services (Vision, Language, Search, Document Intelligence).
- Governance & Observability capabilities : Centralized identity, policy, and monitoring for AI workloads.

## Foundry Models

Foundry supports thousands of models from first-party and diverse third-party providersâincluding Azure OpenAI in Foundry Models like gpt-4, gpt-5 series, multimodal variants, as well as open-source options such as Meta Llama and Mistral. Enterprise organizations can deploy and manage models directly from Foundryâs model catalog. Foundry offers the ability to test and customize models in a playground setting, deploy models as agents, and manage lifecycle needs, region-specific deployment, and model version control.

## Agent Service

At the core of  Foundry is the Agent Service for building production-ready AI agents that autonomously make decisions, call external tools, and automate workflows. It abstracts orchestration, thread management, tool invocation, and embeds governance such as content safety and observability. Developers can create low-code or code-first multi-agent systems that interact with documents, databases, or other services through various methods and built-in integrations like Azure Functions and Fabric.

## Foundry Tools

Foundry offers a comprehensive suite of Azure servicesâsuch as speech, vision, language, document intelligence, content safety, and embeddingsâaccessible via portal, APIs, or SDKs. These Foundry Tools provide AI capabilities that can be built into web or mobile applications in a way thatâs straightforward to implement. There're over a dozen different services that can be used separately or together to add AI power to applications. For example, you could use Azure Vision to analyze images, Azure Language to summarize text, classify information, or extract key phrases, and Azure Speech to convert speech to text and text to speech.

## Governance and Observability

Governance ensures responsible AI development through compliance, identity management, and risk mitigation, while Observability delivers end-to-end visibility for performance, safety, and operational efficiencyâhelping organizations deploy AI confidently and at scale. Foundry embeds governance into the AI development lifecycle to ensure transparency, accountability, compliance, and security at scale. Specifically, Foundry provides a unified dashboard for metrics on performance, quality, and safety, lifecycle monitoring, and continuous feedback loops.
Next, learn how to get started with a project in Foundry.

---


# Get started with Foundry

- 3 minutes
To get started with Foundry after you sign in using your Azure subscription, you need to create a space to do your development work. This space is known as a project . A project is the primary workspace for building AI applications and agents.
Creating a Foundry project means that within your Azure subscription, you have a resource group, and within the resource group, you have a Microsoft Foundry resource that is deployed in the region specified.
Once you create a Foundry project, you can access:
- The model catalog (foundation and partner models)
- Playgrounds for testing models
- Tools for deploying models, running evaluations, and creating agents
- A Management Center for user roles, quotas, and resource connections
With a project, developers can experiment in playgrounds, deploy models and integrate them via SDKs or APIs, and
build and test agentic workflows with observability and Responsible AI features.
Choose Foundry project when you need the latest agents, evaluations, and model catalog with minimal Azure setup. You may also want to use other capabilities within Foundry, including services like Azure Language, Azure Speech, Azure Vision, and more. To access other capabilities, create a Hub in addition to a project.

## Characteristics of Foundry offerings

Foundry models and tools are based on principles that dramatically improve speed-to-market:
- Prebuilt and ready to use or customize
- Accessed through APIs
- Available on Azure

#### Prebuilt and ready to use

AI has been prohibitive for all but the largest technology companies because of several factors, including the large amounts of data required to train models, the massive amount of computing power needed, and the budget to hire specialist programmers. Foundry makes AI accessible to businesses of all sizes by using pretrained machine learning models to deliver AI as a service. Foundry uses high-performance Azure computing to deploy advanced AI models, making decades of research available to developers of all skill levels.
Foundry models and tools can be built into applications with APIs. Secure communication with APIs is possible through authentication , the process of verifying that the user or service is who they say they are, and that they're authorized to use the service.
Part of what an API does is to handle authentication. Whenever a request is made to use a Foundry resource, that request must be authenticated. For example, your subscription and AI service resource is verified to ensure you have sufficient permissions to access it. This authentication process uses a resource key and an endpoint . The key is a secret password that the app uses to prove its identity when talking to another service or system.
The endpoint describes how to reach the AI service resource instance that you want to use, in a similar way to the way a URL identifies a web site. When you view the endpoint for your resource, it looks something like:
https://cognitiveservices48.cognitiveservices.azure.com/
The resource key protects the privacy of your resource. To ensure your key is always secure, it can be changed periodically.
When you write code to access the resource, the keys and endpoint must be included in the authentication header. The authentication header sends an authorization key to the service to confirm that the application can use the resource.
Next, learn about how Foundry models and tools are available on Azure.

---


# Understand Azure

- 3 minutes
Microsoft Azure is a cloud computing platform that provides a wide range of services to help individuals and organizations build, deploy, and manage applications through Microsoft-managed data centers. It offers flexibility, scalability, and global reach, making it a popular choice for businesses of all sizes. Azure supports various programming languages, frameworks, and operating systems, allowing developers to work with the tools they prefer.

## Cloud capabilities

Azure delivers core cloud capabilities across four main areas: compute, storage, networking, and application services. Compute services include virtual machines, containers, and serverless functions that run workloads efficiently. Storage services offer scalable and secure options for saving data, such as Blob Storage and Azure Files. Networking services connect resources securely and reliably, using tools like Azure Virtual Network and Load Balancer. Application services help developers build and host web apps, APIs, and mobile backends with ease.

## Understand how Azure organizes your resources

Azure organizes access and management through a hierarchy of entities. A tenant represents a dedicated instance of Azure Active Directory, which handles identity and access management. Within a tenant, subscriptions define billing boundaries and provide access to Azure services. Each subscription can contain multiple resource groups, which are logical containers for managing related resources together. Resources are the individual services or componentsâlike virtual machines, databases, or storage accountsâthat you deploy and manage within Azure.
This organizational structure helps ensure clarity, security, and scalability in cloud environments. Tenants and subscriptions allow for clear separation of concerns across departments or projects. Resource groups simplify management by grouping related assets, making it easier to apply policies, monitor usage, and automate deployments. Understanding this hierarchy is essential for efficient cloud governance and cost control in Azure.

#### Foundry runs on Azure

Foundry runs on Azure and uses Azure resource types. Foundry is an AI development layer within Azure, designed to accelerate building and managing generative AI apps and agents with enterprise-grade governance. Foundry projects and hubs are resources that integrate with Azure networking, storage, and security.
Foundry Tools and models are cloud-based and accessed through a Foundry resource. This means that they are managed in the same way as other Azure services, such as platform as a service (PaaS), infrastructure as a service (IaaS), or a managed database service. From creating or deleting resources, to availability and billing, the Azure platform and resource manager provides a consistent framework for all your Azure services.
Thus, starting with an Azure subscription, you can create a Foundry project, and develop an AI application. Next, let's try starting a project in Foundry.

---


# Exercise - Get started with Microsoft Foundry

- 30 minutes
If you have an Azure subscription, you can use Microsoft Foundry .
Note
If you don't already have one, you can sign up for an Azure subscription , which includes free credits for the first 30 days.
Launch the exercise and follow the instructions.

---


# Knowledge check

- 3 minutes
Which statement best explains the relationship between AI and ML?
AI and ML are interchangeable terms; both refer to systems that mimic human intelligence without distinction.
ML focuses exclusively on generative tasks like creating text and images, whereas AI is limited to decision-making and planning.
AI is the overarching goal of creating systems that exhibit human-like intelligence, while ML is a data-driven method used to achieve AI by learning patterns from data.
What is the primary role of the Integration & Orchestration Layer in the AI application architecture?
It provides compute resources for running AI workloads
It connects models and data with business logic and user interfaces.
It manages the collection, storage, and organization of data.
Which statement best describes how Azure organizes resources and access?
Azure uses tenants for identity management, subscriptions for billing and service access, resource groups for organizing related resources, and resources as individual services like VMs or databases.
Azure organizes resources only by subscriptions, which contain all services without further grouping or identity management.
Azure relies on tenants for compute and storage services, while subscriptions handle networking and application services.
You must answer all questions before checking your work.

---


# Summary

- 1 minute
In this module, you learned about the main parts and best practices for getting started with AI in Microsoft Foundry.
By using Azureâs scalable infrastructure and Foundryâs unified platform, organizations can speed up the development and launch of generative AI applications and intelligent agents. Foundryâs collection of ready-to-use models, built-in tools, and governance features helps developers create secure, responsible, and high-performing AI solutions.

---

