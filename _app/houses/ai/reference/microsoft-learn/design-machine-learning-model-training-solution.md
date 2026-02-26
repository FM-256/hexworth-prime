# Get started with machine learning in Azure

**Module slug:** `design-machine-learning-model-training-solution`
**Source:** https://learn.microsoft.com/en-us/training/modules/design-machine-learning-model-training-solution/
**Units:** 9

## Table of Contents

1. Introduction
2. Define the problem
3. Get and prepare data
4. Train the model
5. Use Azure Machine Learning studio
6. Integrate a model
7. Exercise - Explore Automated Machine Learning in Azure Machine Learning
8. Module assessment
9. Summary

---


# Introduction

- 3 minutes
Thoughtfully designed machine learning solutions form the foundation of today's AI applications. From predictive analytics to personalized recommendations and beyond, machine learning solutions support the latest technological advances in society by using existing data to produce new insights.
Data scientists make decisions to tackle machine learning problems in different ways. The decisions they make affect the cost, speed, quality, and longevity of the solution.
In this module, you learn how to design an end-to-end machine learning solution with Microsoft Azure that can be used in an enterprise setting. Using the following six steps as a framework, we explore how to plan, train, deploy, and monitor machine learning solutions.
- Define the problem : Decide on what the model should predict and when it's successful.
- Get the data : Find data sources and get access.
- Prepare the data : Explore the data. Clean and transform the data based on the model's requirements.
- Train the model : Choose an algorithm and hyperparameter values based on trial and error.
- Integrate the model : Deploy the model to an endpoint to generate predictions.
- Monitor the model : Track the model's performance.
Note
The diagram is a simplified representation of the machine learning process. Typically, the process is iterative and continuous. For example, when monitoring the model you may decide to go back and retrain the model.
Next, let's look at how we can get started on a machine learning solution by defining the problem.

---


# Define the problem

- 4 minutes
Starting with the first step, you want to define the problem the model should solve, by understanding:
- What the modelâs output should be.
- What type of machine learning task you use.
- What criteria make a model successful.
Depending on the data you have and the expected output of the model, you can identify the machine learning task. The task determines which types of algorithms you can use to train the model .
Some common machine learning tasks are:
- Classification : Predict a categorical value.
- Regression : Predict a numerical value.
- Time-series forecasting : Predict future numerical values based on time-series data.
- Computer vision : Classify images or detect objects in images.
- Natural language processing ( NLP ): Extract insights from text.
To train a model, you have a set of algorithms that you can use, depending on the task you want to perform. To evaluate the model, you can calculate performance metrics such as accuracy or precision. The metrics available also depend on the task your model needs to perform and help you to decide whether a model is successful in its task.

## Explore an example

Consider a scenario where you want to determine if patients have diabetes. The problem you're trying to solve and the type of data available determines the machine learning task you choose. In this case, the available data are other health data points from patients. We can represent the output we want as categorical information that either the patient has diabetes or doesn't have diabetes. Thus, the machine learning task is classification .
Understanding the entire process before you start gives you an opportunity to map out the decisions you need to make to design a successful machine learning solution. Following, is a diagram showing one way to approach the problem of identifying diabetes in a patient. In the diagram, the data is prepped, split, and trained using specific algorithms. Afterward, the model is evaluated for quality.
- Load data : Import and inspect the dataset.
- Preprocess data : Normalize and clean for consistency.
- Split data : Separate into training and test sets.
- Choose model : Select and configure an algorithm.
- Train model : Learn patterns from the training data.
- Score model : Generate predictions on test data.
- Evaluate : Calculate performance metrics.
Training a machine learning model is often an iterative process, where you go through each of these steps multiple times to find the best performing model. Next, let's examine the data preparation process for developing a machine learning solution.

---


# Get and prepare data

- 5 minutes
Data is the foundation of machine learning. Both data quantity and data quality affect the modelâs accuracy.
To train a machine learning model, you need to:
- Identify data source and format.
- Choose how to serve data.
- Design a data ingestion solution.
To get and prepare the data you use to train the machine learning model, you need to extract data from a source and make it available to the Azure service you want to use to train models or make predictions.

## Identify data source and format

First, you need to identify your data source and its current data format.
| Identify the | Examples |
|---|---|
| Data source | For example, the data can be stored in a Customer Relationship Management (CRM) system, in a transactional database like an SQL database, or be generated by an Internet of Things (IoT) device. |
| Data format | You need to understand the current format of the data, which can be tabular or structured data, semi-structured data or unstructured data. |
Then, you need to decide what data you need to train your model, and in what format you want that data to be served to the model.

## Design a data ingestion solution

In general, itâs a best practice to extract data from its source before analyzing it. Whether youâre using the data for data engineering, data analysis, or data science, you want to extract the data from its source, transform it, and load it into a serving layer. Such a process is also referred to as Extract , Transform , and Load ( ETL ) or Extract , Load , and Transform ( ELT ). The serving layer makes your data available for the service you use for further data processing like training machine learning models.
To move and transform data, you can use a data ingestion pipeline . A data ingestion pipeline is a sequence of tasks that move and transform the data. By creating a pipeline, you can choose to trigger the tasks manually or schedule the pipeline when you want the tasks to be automated. Such pipelines can be created with Azure services like Azure Synapse Analytics, Azure Databricks, and also Azure Machine Learning.
A common approach for a data ingestion solution is to:
- Extract raw data from its source (like a CRM system or IoT device).
- Copy and transform the data with Azure Synapse Analytics.
- Store the prepared data in an Azure Blob Storage.
- Train the model with Azure Machine Learning.

## Explore an example

Imagine you want to train a weather forecasting model. You prefer one table in which all temperature measurements of each minute are combined. You want to create aggregates of the data and have a table of the average temperature per hour. To create the table, you want to transform the semi-structured data ingested from the IoT device that measures temperature at intervals, to tabular data.
For example, to create a dataset you can use to train the forecasting model, you can:
- Extract data measurements as JSON objects from the IoT devices.
- Convert the JSON objects to a table.
- Transform the data to get the temperature per machine per minute.
Next, let's explore the services we can use to train machine learning models.

---


# Train the model

- 5 minutes
There are many services available to train machine learning models. Which service you use depends on factors like:
- What type of model you need to train,
- Whether you need full control over model training,
- How much time you want to invest in model training,
- Which services are already within your organization,
- Which programming language youâre comfortable with.
Within Azure, there are several services available for training machine learning models. Some commonly used services are:
| Icon | Description |
|---|---|
|  | Azure Machine Learninggives you many different options to train and manage your machine learning models. You can choose to work with the Studio for a UI-based experience, or manage your machine learning workloads with the Python SDK, or CLI for a code-first experience. Learn more aboutAzure Machine Learning. |
|  | Azure Databricksis a data analytics platform that you can use for data engineering and data science. Azure Databricks uses distributed Spark compute to efficiently process your data. You can choose to train and manage models with Azure Databricks or by integrating Azure Databricks with other services such as Azure Machine Learning. Learn more aboutAzure Databricks. |
|  | Microsoft Fabricis an integrated analytics platform designed to streamline data workflows between data analysts, data engineers, and data scientists. With Microsoft Fabric, you can prepare data, train a model, use the trained model to generate predictions, and visualize the data in Power BI reports. Learn more aboutMicrosoft Fabric, and specifically aboutthe data science features in Microsoft Fabric. |
|  | Foundry Toolsis a collection of prebuilt machine learning models you can use for common machine learning tasks such as object detection in images. The models are offered as an application programming interface (API), so you can easily integrate a model with your application. Some models can be customized with your own training data, saving time and resources to train a new model from scratch. Learn more aboutFoundry Tools. |

## Features and capabilities of Azure Machine Learning

Let's focus on Azure Machine Learning . Microsoft Azure Machine Learning is a cloud service for training, deploying, and managing machine learning models. It's designed to be used by data scientists, software engineers, devops professionals, and others to manage the end-to-end lifecycle of machine learning projects.
Azure Machine Learning supports tasks including:
- Exploring data and preparing it for modeling.
- Training and evaluating machine learning models.
- Registering and managing trained models.
- Deploying trained models for use by applications and services.
- Reviewing and applying responsible AI principles and practices.
Azure Machine Learning provides the following features and capabilities to support machine learning workloads:
- Centralized storage and management of datasets for model training and evaluation.
- On-demand compute resources on which you can run machine learning jobs, such as training a model.
- Automated machine learning (AutoML), which makes it easy to run multiple training jobs with different algorithms and parameters to find the best model for your data.
- Visual tools to define orchestrated pipelines for processes such as model training or inferencing.
- Integration with common machine learning frameworks such as MLflow, which make it easier to manage model training, evaluation, and deployment at scale.
- Built-in support for visualizing and evaluating metrics for responsible AI, including model explainability, fairness assessment, and others.
Next, let's see how we can get started with Azure Machine Learning in a user interface.

---


# Use Azure Machine Learning studio

- 3 minutes
You can use Azure Machine Learning studio , a browser-based portal for managing your machine learning resources and jobs, to access many types of machine learning capabilities.
In Azure Machine Learning studio, you can (among other things):
- Import and explore data.
- Create and use compute resources.
- Run code in notebooks.
- Use visual tools to create jobs and pipelines.
- Use automated machine learning to train models.
- View details of trained models, including evaluation metrics, responsible AI information, and training parameters.
- Deploy trained models for on-request and batch inferencing.
- Import and manage models from a comprehensive model catalog.

## Provisioning Azure Machine Learning resources

The primary resource required for Azure Machine Learning is an Azure Machine Learning workspace , which you can provision in an Azure subscription. Other supporting resources, including storage accounts, container registries, virtual machines, and others are created automatically as needed. You can create an Azure Machine Learning workspace in the Azure portal .

#### Decide between compute options

When you use Azure Machine Learning to train a model, you need to select compute . Compute refers to the computational resources required to perform the training process. Every time you train a model, you should monitor how long it takes to train the model and how much compute is used to execute your code. By monitoring the compute utilization, you know whether to scale your compute up or down.
When you choose to work with Azure instead of training a model on a local device, you have access to scalable and cost-effective compute.
| Compute options | Considerations |
|---|---|
| Central Processing Unit(CPU) or aGraphics Processing Unit(GPU) | For smaller tabular datasets, a CPU is sufficient and cost-effective. For unstructured data like images or text, GPUs are more powerful and efficient. GPUs can also be used for larger tabular datasets, if CPU compute is proving to be insufficient. |
| General purposeormemory optimized | Use general purpose to have a balanced CPU-to-memory ratio, which is ideal for testing and development with smaller datasets. Use memory optimized to have a high memory-to-CPU ratio. Great for in-memory analytics, which is ideal when you have larger datasets or when you're working in notebooks. |
Which compute options best fit your needs is often a case of trial and error. When running code, you should monitor the compute utilization to understand how much compute resources you're using. If training your model takes too long, even with the largest compute size, you can use GPUs instead of CPUs. Alternatively, you can choose to distribute model training by using Spark compute which require you to rewrite your training scripts.

## Azure Automated Machine Learning

When you use Azure Machine Learning's Automated machine learning capabilities, you are automatically assigned compute. Azure Automated machine learning automates the time-consuming, iterative tasks of machine learning model development.
In Azure Machine Learning studio, you can use Automated machine learning to design and run your training experiments with the same steps described in this module, without needing to write code. Azure Automated machine learning provides a step-by-step wizard that helps you run machine learning training jobs. The automated training can be used for many machine learning tasks, including regression, time-series forecasting, classification, computer vision, and natural language processing tasks. Within AutoML, you have access to your own datasets. Your trained machine learning models can be deployed as services.
Next, let's look at model deployment options.

---


# Integrate a model

- 7 minutes
You should plan how you integrate the model , as it affects how you train the model or what training data you use. To integrate the model, you need to deploy a model to an endpoint . You can deploy a model to an endpoint for either real-time or batch predictions .

## Deploy a model to an endpoint

When you train a model, the goal is often to integrate the model into an application.
To easily integrate a model into an application, you can use endpoints . Simply put, an endpoint can be a web address that an application can call to get a message back.
When you deploy a model to an endpoint, you have two options:
- Get real-time predictions
- Get batch predictions
If you want the model to score any new data as it comes in, you need predictions in real-time.
Real-time predictions are often needed when a model is used by an application such as a mobile app or a website.
Imagine you have a website that contains your product catalog:
- A customer selects a product on your website, such as a shirt.
- Based on the customer's selection, the model recommends other items from the product catalog immediately. The website displays the model's recommendations.
A customer can select a product in the web shop at any time. You want the model to find the recommendations almost immediately. The time it takes for the web page to load and display the shirt details is the time it should take to get the recommendations or predictions. Then, when the shirt is displayed, the recommendations can also be displayed.
If you want the model to score new data in batches, and save the results as a file or in a database, you need batch predictions.
For example, you can train a model that predicts orange juice sales for each future week. By predicting orange juice sales, you can ensure that supply is sufficient to meet expected demand.
Imagine you're visualizing all historical sales data in a report. You'll want to include the predicted sales in the same report.
Although orange juice is sold throughout the day, you only want to calculate the forecast once a week. You can collect the sales data throughout the week and call the model only when you have the sales data of a whole week. A collection of data points is referred to as a batch.

## Decide between real-time or batch deployment

To decide whether to design a real-time or batch deployment solution, you need to consider the following questions:
- How often should predictions be generated?
- How soon are the results needed?
- Should predictions be generated individually or in batches?
- How much compute power is needed to execute the model?

### Identify the necessary frequency of scoring

A common scenario is that you're using a model to score new data. Before you can get predictions in real-time or in batch, you must first collect the new data.
There are various ways to generate or collect data. New data can also be collected at different time intervals.
For example, you can collect temperature data from an Internet of Things (IoT) device every minute. You can get transactional data every time a customer buys a product from your web shop. Or you can extract financial data from a database every three months.
Generally, there are two types of use cases:
- You need the model to score the new data as soon as it comes in.
- You can schedule or trigger the model to score the new data that you've collected over time.
Whether you want real-time or batch predictions doesn't necessarily depend on how often new data is collected . Instead, it depends on how often and how quickly you need the predictions to be generated.
If you need the model's predictions immediately when new data is collected, you need real-time predictions. If the model's predictions are only consumed at certain times, you need batch predictions.

### Decide on the number of predictions

Another important question to ask yourself is whether you need the predictions to be generated individually or in batches.
A simple way to illustrate the difference between individual and batch predictions is to imagine a table. Suppose you have a table of customer data where each row represents a customer. For each customer, you have some demographic data and behavioral data, such as how many products they've purchased from your web shop and when their last purchase was.
Based on this data, you can predict customer churn: whether a customer will buy from your web shop again or not.
Once you've trained the model, you can decide if you want to generate predictions:
- Individually : The model receives a single row of data and returns whether or not that individual customer will buy again.
- Batch : The model receives multiple rows of data in one table and returns whether or not each customer will buy again. The results are collated in a table that contains all predictions.
You can also generate individual or batch predictions when working with files. For example, when working with a computer vision model you may need to score a single image individually, or a collection of images in one batch.

### Consider the cost of compute

In addition to using compute when training a model, you also need compute when deploying a model. Depending on whether you deploy the model to a real-time or batch endpoint, you'll use different types of compute. To decide whether to deploy your model to a real-time or batch endpoint, you must consider the cost of each type of compute.
If you need real-time predictions , you need compute that is always available and able to return the results (almost) immediately. Container technologies like Azure Container Instance (ACI) and Azure Kubernetes Service (AKS) are ideal for such scenarios as they provide a lightweight infrastructure for your deployed model.
However, when you deploy a model to a real-time endpoint and use such container technology, the compute is always on . Once a model is deployed, you're continuously paying for the compute as you can't pause, or stop the compute as the model must always be available for immediate predictions.
Alternatively, if you need batch predictions , you need compute that can handle a large workload. Ideally, you'd use a compute cluster that can score the data in parallel batches by using multiple nodes.
When working with compute clusters that can process data in parallel batches, the compute is provisioned by the workspace when the batch scoring is triggered, and scaled down to 0 nodes when there's no new data to process. By letting the workspace scale down an idle compute cluster, you can save significant costs.

---


# Exercise - Explore Automated Machine Learning in Azure Machine Learning

- 35 minutes
If you have an Azure subscription, you can use the Azure Machine Learning studio to try out Automated machine learning.
Note
If you don't already have one, you can sign up for an Azure subscription , which includes free credits for the first 30 days.
Launch the exercise and follow the instructions.

---


# Module assessment

- 3 minutes
What does Automated machine learning in Azure Machine Learning enable you to do?
Automatically deploy new versions of a model as they're trained
Automatically provision Azure Machine Learning workspaces for new data scientists in an organization
Automatically run multiple training jobs using different algorithms and parameters to find the best model
Which of the following factors should you consider when choosing a service to train a machine learning model?
The number of users in your organization.
How much time you want to invest in model training.
The approximate number of predictions the model needs to make in a month.
What is a key feature of Azure Machine Learning that supports end-to-end machine learning workflows?
It provides ready-to-use models for image classification.
It requires integration with Microsoft Fabric to deploy models.
It offers centralized dataset management and automated machine learning.
You must answer all questions before checking your work.

---


# Summary

- 1 minute
In this module you learned about considerations for machine learning solutions. Machine learning forms the backbone of modern AI applications, enabling systems to generate insights from data for tasks like predictive analytics and personalized recommendations. Designing an effective ML solution involves a structured, iterative process: defining the problem, acquiring and preparing data, training the model, integrating it into applications, and monitoring its performance. Microsoft Azure supports this lifecycle through Azure Machine Learning studio, a browser-based platform where users can manage data, run experiments, deploy models, and monitor results using both code-first and no-code tools like Automated machine learning.

---

