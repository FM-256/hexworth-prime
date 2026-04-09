# Develop a text analysis agent with the Azure Language MCP server

**Module slug:** `develop-text-analysis-agent-language-mcp`
**Source:** https://learn.microsoft.com/en-us/training/modules/develop-text-analysis-agent-language-mcp/
**Units:** 6

## Table of Contents

1. Introduction
2. Understand the Azure Language MCP server
3. Connect and use the Language MCP server with an agent
4. Exercise - Develop a text analysis agent
5. Knowledge check
6. Summary

---


# Introduction

- 2 minutes
Azure Language in Foundry Tools provides a set of natural language processing (NLP) capabilities that you can use to analyze text. These capabilities include sentiment analysis, named entity recognition, key phrase extraction, summarization, and more.
While you can call these capabilities individually through REST APIs or SDKs, you can also make them available to an AI agent through the Azure Language Model Context Protocol (MCP) server . This approach lets the agent dynamically select and call the appropriate language tool based on a user's request, without you needing to write specific code for each capability.
For example, suppose you work for a company that needs to analyze customer feedback. Customers submit reviews in multiple languages, and your team needs to understand the overall sentiment, identify the people and places mentioned, and generate summaries of the feedback. Rather than building separate integrations for each of these tasks, you can create an AI agent that uses the Azure Language MCP server to perform all of them through a single tool connection.
In this module, you learn how the Azure Language MCP server works, how to connect it to an AI agent in Microsoft Foundry, and how to build a client application that interacts with the agent programmatically.
Note
The Azure Language MCP server is currently in public preview. Details described in this module are subject to change.

---


# Understand the Azure Language MCP server

- 7 minutes
The Azure Language MCP server connects AI agents to Azure Language services through the Model Context Protocol (MCP) . Before exploring the Language MCP server itself, it helps to understand what MCP is and how it enables agents to use external tools.

## What is the Model Context Protocol?

The Model Context Protocol (MCP) is an open protocol that defines how AI agents interact with external tools, data sources, and services. MCP uses a client-server architecture with the following components:
- Host : The application that runs the agent (such as Microsoft Foundry or a custom app).
- Client : A component within the host that manages connections to MCP servers and handles communication.
- Server : A program that exposes tools, resources, and prompts that an agent can discover and call.
When an agent connects to an MCP server, it receives a catalog of available tools along with descriptions of what each tool does. The agent can then choose the right tool based on the user's request. This approach is called dynamic tool discovery â the agent doesn't need hardcoded knowledge of each tool. Instead, it queries the MCP server at runtime to find out what's available.
The key advantage of MCP for AI agents is flexibility. Tools can be added, updated, or removed on the server without modifying the agent itself. The agent always has access to the latest tool definitions, which makes MCP-based solutions easier to maintain and scale.
Tip
To learn more about MCP architecture and how to build custom MCP tool integrations, see the Integrate MCP Tools with Azure AI Agents module.

## Azure Language MCP server capabilities

The Azure Language MCP server exposes Azure Language NLP capabilities as tools that any MCP-compatible agent can call. The server supports the following text analysis capabilities:
| Capability | Description |
|---|---|
| Named Entity Recognition | Identifies and categorizes entities in text, such as people, places, organizations, dates, and quantities. |
| Sentiment Analysis | Determines whether text expresses positive, negative, or neutral sentiment, and can extract opinions about specific aspects. |
| Summarization | Generates concise summaries of longer text content. |
| Key Phrase Extraction | Identifies the main concepts and key phrases in text. |
| PII Redaction | Detects and redacts personally identifiable information such as names, addresses, and phone numbers. |
| Language Detection | Identifies the language in which text is written. |
| Text Analytics for Health | Extracts and labels medical entities (such as diagnoses, medications, and symptoms) from clinical text. |
| Conversational Language Understanding | Interprets user utterances to identify intents and extract entities based on a trained custom model. |
| Custom Question Answering | Returns curated answers to user questions from a configured knowledge base. |
When you connect the Language MCP server to an agent, the agent receives the full list of available tools. Based on the user's prompt, the agent's underlying model decides which tool (or combination of tools) to call. For example, if a user asks "Summarize this article and tell me what people are mentioned," the agent might call both the summarization tool and the named entity recognition tool in the same turn.

## How the agent selects tools

The tool selection process works as follows:
- The user sends a prompt to the agent.
- The agent analyzes the prompt and determines which task (or tasks) need to be performed.
- The agent checks the available MCP tools and their descriptions to find the best match.
- The agent calls the selected tool through the MCP server, passing the relevant input text.
- The MCP server processes the request using the appropriate Azure Language capability and returns the results.
- The agent combines the results into a natural language response for the user.
This means you don't need to write routing logic to direct requests to specific tools. The agent handles tool selection autonomously, based on the tool descriptions it received from the MCP server.

## MCP server endpoint

The Azure Language MCP server is available as a remote endpoint with the following URL format:

```
https://{foundry-resource-name}.cognitiveservices.azure.com/language/mcp?api-version=2025-11-15-preview
```

Replace {foundry-resource-name} with the name of your Foundry resource (or Azure Language resource). This endpoint is what you configure when connecting the MCP server to your agent.
Note
Azure Language also provides a local MCP server that you can host in your own environment. For setup guidance, see the Azure Language MCP Server quickstart in the Azure Language samples repository.

---


# Connect and use the Language MCP server with an agent

- 8 minutes
After you understand the capabilities of the Azure Language MCP server, the next step is to connect it to an agent and start using it. This involves creating an agent in Microsoft Foundry, connecting the Language MCP tool, testing it in the agent playground, and optionally building a client application to interact with the agent programmatically.

## Create a Foundry project and agent

To use the Azure Language MCP server, you first need a Microsoft Foundry project with a deployed model.
- In the Microsoft Foundry portal , create a new project (or use an existing one).
- Deploy a model (such as gpt-4.1 ) that your agent will use for reasoning and generating responses.
- Create an agent and give it instructions that describe its purpose. For example: You are an AI agent that assists users by helping them analyze and summarize text.
Create an agent and give it instructions that describe its purpose. For example:

```
You are an AI agent that assists users by helping them analyze and summarize text.
```

The agent is now ready to receive tool connections.

## Connect the Azure Language MCP server

You connect the Azure Language MCP server to your agent through the Tools page in the Foundry portal.
- In the navigation pane, select the Tools page.
- Select Connect a tool and choose Azure Language in Foundry Tools from the catalog.
- Configure the connection with the following settings: Foundry resource name : The name of your Foundry resource (for example, myproject-resource ). Authentication : Key-based. Credential ( Ocp-Apim-Subscription-Key ): The key for your Foundry project.
Configure the connection with the following settings:
- Foundry resource name : The name of your Foundry resource (for example, myproject-resource ).
- Authentication : Key-based.
- Credential ( Ocp-Apim-Subscription-Key ): The key for your Foundry project.
- Wait for the connection to be created, then select Use in an agent and choose your agent.
The agent now has access to all the text analysis tools exposed by the Azure Language MCP server.
Tip
You can find the project key on the project home page in the Foundry portal.

## Update agent instructions

After connecting the Language MCP tool, update the agent's instructions to direct it to use the tool:

```
You are an AI agent that assists users by helping them analyze and summarize text. Use the Azure Language tool to perform text analysis tasks.
```

This instruction helps the agent understand that it should use the connected tool when processing text analysis requests.

## Test in the agent playground

The agent playground in the Foundry portal provides an interactive environment for testing your agent before deploying it in an application.
When you send a prompt that requires text analysis, the agent:
- Identifies the tasks needed (for example, summarization and entity recognition).
- Calls the appropriate Azure Language MCP tool(s).
- Returns a combined response.
The first time the agent uses an MCP tool, you're prompted to approve the tool usage. You can approve the tool for a single use, or select Always approve all Azure Language in Foundry Tools tools to skip future approval prompts.
After the agent responds, you can review the Logs pane to verify which tools were used. The logs show each MCP tool call, the input that was sent, and the result that was returned.

## Build a client application

While the agent playground is useful for testing, you typically want to build a client application that uses the agent programmatically. The Microsoft Foundry SDK supports this through the OpenAI Responses API.
To build a client application, you use the azure-ai-projects and azure-identity packages. The general pattern is:
- Create an AIProjectClient using your Foundry project endpoint and DefaultAzureCredential (which uses your Azure CLI credentials in development).
- Get an OpenAI client from the project client by calling get_openai_client() .
- Call responses.create() to send a user prompt to the agent.
The key part is how you reference the agent â you specify it by name in the extra_body parameter:

```
response = openai_client.responses.create(
    input=[{"role": "user", "content": user_prompt}],
    extra_body={
        "agent_reference": {
            "name": "Text-Analysis-Agent",
            "type": "agent_reference"
        }
    },
)

print(response.output_text)
```

The agent processes the prompt, calls the appropriate MCP tools, and returns the result in output_text . You can also inspect the full response JSON (using response.model_dump_json() ) to see which tools the agent called â for example, extract_named_entities_from_text or detect_sentiment_from_text â along with the arguments and results for each tool call.

### Connect the MCP server in code

Instead of connecting the Azure Language MCP server through the Foundry portal, you can also define the MCP tool connection directly in code when you create an agent. Use the MCPTool class from the azure-ai-projects SDK to specify the server label, URL, and allowed tools:

```
from azure.ai.projects.models import MCPTool

mcp_tool = MCPTool(
    server_label="azure-language",
    server_url="https://{foundry-resource-name}.cognitiveservices.azure.com/language/mcp?api-version=2025-11-15-preview",
    require_approval="always",
)
```

You then pass the mcp_tool when creating the agent through the SDK. This approach is useful when you want to manage tool connections as part of your application code rather than configuring them manually in the portal. You can also use the allowed_tools property on MCPTool to restrict which specific Language tools the agent can call.

## Tool selection with multi-task prompts

When a user's prompt involves multiple text analysis tasks, the agent can call multiple tools in a single turn. For example, the prompt:

> "Tell me what entities and dates are mentioned in this review, and whether it is positive or negative."

This prompt requires both entity recognition and sentiment analysis. The agent identifies both tasks, calls the appropriate tools ( extract_named_entities_from_text and detect_sentiment_from_text ), and combines the results into a single response.
Each tool call goes through the MCP server independently, and the agent synthesizes the outputs into a coherent answer for the user.

---


# Exercise - Develop a text analysis agent

- 30 minutes
Now it's your turn to build a text analysis agent using the Azure Language MCP server!
In this exercise, you create an AI agent in Microsoft Foundry, connect it to the Azure Language MCP server, test it in the agent playground, and build a Python client application that uses the agent to perform text analysis tasks such as entity recognition, sentiment analysis, and summarization.
Note
To complete this exercise, you need an Azure subscription in which you have administrative access.
Launch the exercise and follow the instructions.

---


# Knowledge check

- 3 minutes
What is the primary role of the Azure Language MCP server?
To train and fine-tune custom language models for use by AI agents.
To expose Azure Language text analysis capabilities as MCP tools for agents.
To deploy and manage large language models in an Azure subscription.
How does an agent determine which Azure Language MCP tool to call when processing a user's prompt?
The developer writes routing logic to direct each prompt to a specific tool.
The agent matches the prompt to tool descriptions received from the MCP server.
The MCP server analyzes the prompt and automatically routes it to a tool.
When building a Python client application, how do you reference a Foundry agent when calling the OpenAI Responses API?
By passing the agent's API key as a request header to the endpoint.
By specifying the agent name in the agent_reference field in extra_body.
By passing the agent's endpoint URL as the model parameter value.
What authentication method is used when connecting the Azure Language MCP server to a Foundry agent?
OAuth 2.0 authentication with a client certificate and tenant ID.
Key-based authentication using the Ocp-Apim-Subscription-Key credential.
Anonymous access that requires no authentication or credentials.
You must answer all questions before checking your work.

---


# Summary

- 2 minutes
The Azure Language MCP server connects AI agents to a range of Azure Language text analysis capabilities through the Model Context Protocol. In this module, you learned how to use this server to build an agent that can analyze text dynamically.
In this module, you learned how to:
- Describe the Azure Language MCP server and the text analysis capabilities it exposes.
- Explain how MCP enables dynamic tool discovery and selection by AI agents.
- Connect the Azure Language MCP server to an agent in Microsoft Foundry.
- Test language tool integration in the agent playground.
- Build a Python client application that invokes an agent with language tools using the Foundry SDK.

## Learn more

- Azure Language tools and agents
- Azure Language MCP server capabilities
- Connect to Model Context Protocol servers
- Azure AI Projects SDK for Python
- Build agents using Model Context Protocol on Azure

---

